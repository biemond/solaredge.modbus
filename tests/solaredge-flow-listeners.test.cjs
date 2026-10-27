const assert = require('node:assert/strict');
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (name, ...args) {
  if (name === 'homey') return { App: class {}, Device: class {} };
  return originalLoad.call(this, name, ...args);
};
const App = require('../app');
const Inverter = require('../drivers/invertor/device');
const BatteryInverter = require('../drivers/invertorwithbatt/device');
Module._load = originalLoad;

const actions = new Map();
const conditions = new Map();
const manifest = require('../app.json');
const card = (kind, listeners, id) => {
  assert.ok(manifest.flow[kind].some((definition) => definition.id === id), `existing ${kind} card ${id}`);
  return { registerRunListener(listener) {
    assert.equal(listeners.has(id), false, `${id} registered only once`);
    listeners.set(id, listener);
  } };
};
const homey = {
  flow: {
    getActionCard: (id) => card('actions', actions, id),
    getConditionCard: (id) => card('conditions', conditions, id),
  },
  setInterval: () => 1,
};

function makeDevice(Type, id) {
  const device = new Type();
  device.homey = homey;
  device.log = () => {};
  device.getData = () => ({ id });
  device.getName = () => id;
  device.getSettings = () => ({ pollinginterval: 30 });
  device.hasCapability = () => true;
  device.registerCapabilityListener = () => {};
  device.pollInvertor = () => {};
  device.calls = [];
  device.updateControl = async function (...args) { this.calls.push(args); };
  return device;
}

async function main() {
  const app = new App();
  app.homey = homey;
  app.log = () => {};
  await app.onInit();
  const devices = [makeDevice(Inverter, 'pv'), makeDevice(BatteryInverter, 'battery-1'), makeDevice(BatteryInverter, 'battery-2')];
  for (const device of devices) await device.onInit();
  await devices[1].onInit(); // Device reinitialization must not re-register cards.
  assert.equal(actions.size, 8);
  assert.equal(conditions.size, 11);

  const cases = [
    ['activepowerlimit', 'activepowerlimit', 'value'],
    ['powerreduce', 'powerreduce', 'value'],
    ['storagecontrolmode', 'storagecontrolmode', 'mode'],
    ['storagedefaultmode', 'storagedefaultmode', 'mode'],
    ['setcharging', 'chargelimit', 'chargepower'],
    ['setdischarging', 'dischargelimit', 'dischargepower'],
    ['limitcontrolmode', 'limitcontrolmode', 'mode'],
    ['exportlimit', 'exportlimit', 'exportlimit'],
  ];
  for (const [id, control, argument] of cases) {
    const selectedDevices = ['activepowerlimit', 'powerreduce'].includes(id) ? devices : devices.slice(1);
    for (const device of selectedDevices) {
      const counts = devices.map((d) => d.calls.length);
      await actions.get(id)({ device, [argument]: '42' });
      assert.deepEqual(device.calls.at(-1), [control, 42, device]);
      for (let i = 0; i < devices.length; i++) {
        assert.equal(devices[i].calls.length, counts[i] + Number(devices[i] === device), 'only selected inverter receives action');
      }
    }
  }
  const failed = new Error('write failed');
  await assert.rejects(actions.get('activepowerlimit')({ device: { updateControl: async () => { throw failed; } }, value: 10 }), (error) => error === failed);

  const status = {
    changedStatus: 'invertorstatus', changedBatteryStatus: 'battstatus',
    changedStoragedefaultmode: 'storagedefaultmode', changedStoragecontrolmode: 'storagecontrolmode',
  };
  const thresholds = {
    solarcharge: ['measure_power', 'charging'], batterylevel: ['measure_battery', 'charged'],
    batterycharge: ['measure_power.batt_charge', 'charging'], batterydischarge: ['measure_power.batt_discharge', 'discharging'],
    solarbattcharge: ['measure_power', 'charging'], gridimport: ['measure_power.import', 'import'], gridexport: ['measure_power.export', 'export'],
  };
  for (const [id, listener] of conditions) {
    const capability = status[id] || thresholds[id][0];
    const argument = status[id] ? 'argument_main' : thresholds[id][1];
    const device = { getCapabilityValue: (key) => { assert.equal(key, capability); return 42; } };
    assert.equal(await listener({ device, [argument]: '42' }), true);
    assert.equal(await listener({ device, [argument]: '43' }), false);
    if (!status[id]) assert.equal(await listener({ device, [argument]: '41' }), true);
  }
  console.log('SolarEdge Flow: register once across mixed/multiple devices and reinitialization; all actions dispatch to selected inverter; all conditions and failures preserved');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
