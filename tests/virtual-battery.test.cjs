const assert = require('node:assert/strict');
const Module = require('node:module');
const {
  BatteryService, batteryService, sourceKey, solarEdgeBatteries, growattBatteries, publishBatteries,
} = require('../lib/battery-data');
const solarStatusDefinition = require(require('node:path').resolve('.homeycompose/capabilities/battstatus.json'));
const measurement = (value, scale = 0) => ({ value: String(value), scale: String(scale) });
const solar = (slot, power, soc) => ({
  [`batt${slot}-instantaneous_power`]: measurement(power),
  [`batt${slot}-soe`]: measurement(soc),
});
const growatt = {
  battCharge: measurement(20000, -1), battDischarge: measurement(0, -1),
  battsoc: measurement(0), bmshealth: measurement(96),
  battvoltage: measurement(5123, -2), batttemperature: measurement(40, -1),
  total_battery_intput_energy: measurement(123456, -1),
  total_battery_output_energy: measurement(23456, -1),
  today_battery_input_energy: measurement(9999, -1),
};

async function main() {
  for (const option of solarStatusDefinition.values) {
    const statusSource = solarEdgeBatteries({ ...solar(1, 0, 50), 'batt1-status': measurement(option.id) })[0];
    assert.equal(statusSource.values.battstatus, option.id);
    assert.equal(statusSource.values.battery_status_code, undefined);
  }
  const sources = solarEdgeBatteries({ ...solar(1, 2000, 0), ...solar(2, -900, 80),
    'batt1-soh': measurement(97), 'batt1-rated_energy': measurement(10000) });
  assert.equal(sources.length, 2);
  assert.equal(sources[0].values.measure_battery, 0, 'empty battery is valid');
  assert.equal(sources[0].values.measure_power, 2000);
  assert.equal(sources[1].values.measure_power, -900);
  assert.equal(sources[0].values.batteryratedcap, 10);
  assert.equal(sources[0].values.batterysoh, 97);
  assert.equal(sources[1].values.batterysoh, undefined, 'optional fields are per battery');
  assert.equal(sources[0].values['meter_power.charged'], undefined);
  for (const bad of ['xxx', '', 'NaN', 'Infinity', -1, 101]) {
    assert.equal(solarEdgeBatteries(solar(1, 0, bad)).length, 0, `reject SoC ${bad}`);
  }
  assert.equal(solarEdgeBatteries(solar(1, 'xxx', 50)).length, 0);
  for (const sentinel of [-3.4028234663852886e38, 3.4028234663852886e38]) {
    const invalidOptional = solarEdgeBatteries({ ...solar(1, 0, 50),
      'batt1-instantaneous_current': measurement(sentinel),
      'batt1-instantaneous_voltage': measurement(sentinel),
      'batt1-rated_energy': measurement(sentinel) })[0];
    assert.equal(invalidOptional.values.measure_current, undefined, 'omit invalid finite current');
    assert.equal(invalidOptional.values.measure_voltage, undefined, 'omit invalid finite voltage');
    assert.equal(invalidOptional.values.batteryratedcap, undefined, 'reject before Wh to kWh conversion');
    assert.equal(solarEdgeBatteries(solar(1, sentinel, 50)).length, 0, 'invalid power must not refresh the source');
  }
  assert.equal(solarEdgeBatteries({ ...solar(1, -500, 50),
    'batt1-instantaneous_current': measurement(-1.25) })[0].values.measure_current, -1.25,
  'preserve real negative current');
  const bank = growattBatteries(growatt)[0];
  assert.equal(bank.scope, 'bank');
  assert.equal(bank.values.measure_power, 2000);
  assert.ok(Math.abs(bank.values.measure_voltage - 51.23) < 1e-9);
  assert.equal(bank.values.measure_temperature, 4, 'cold readings are not multiplied by ten');
  assert.equal(bank.values['meter_power.charged'], 12345.6, 'use lifetime rather than daily energy');
  assert.equal(bank.values['meter_power.discharged'], 2345.6);
  assert.equal(growattBatteries({ ...growatt, battCharge: measurement(0), battDischarge: measurement(10000, -1) })[0].values.measure_power, -1000);
  assert.equal(growattBatteries({ ...growatt, battDischarge: measurement('xxx') }).length, 0);

  const bus = new BatteryService();
  bus.publish('one', sources[0]);
  let received;
  const unsubscribe = bus.subscribe('one', (value) => { received = value; });
  assert.equal(received, sources[0], 'replay cached data on subscribe');
  bus.publish('two', sources[1]);
  assert.equal(received, sources[0], 'isolate sources');
  bus.remove('one');
  assert.equal(received, null);
  unsubscribe();
  assert.equal(bus.events.listenerCount('one'), 0);

  // Exercise the actual driver and device with a minimal Homey SDK mock, without sockets.
  const originalLoad = Module._load;
  Module._load = function (name, ...args) {
    if (name === 'homey') return { Device: class {}, Driver: class {} };
    return originalLoad.call(this, name, ...args);
  };
  const VirtualDevice = require('../drivers/virtualbattery/device');
  const VirtualDriver = require('../drivers/virtualbattery/driver');
  Module._load = originalLoad;
  const masters = [];
  const intervals = new Set();
  const homey = {
    manifest: { capabilities: { battstatus: solarStatusDefinition } },
    drivers: { getDriver: (id) => ({ ready: async () => {}, getDevices: () => masters.filter((m) => m.driver.id === id) }) },
    setInterval: (fn) => { intervals.add(fn); return fn; },
    clearInterval: (fn) => intervals.delete(fn),
  };
  const master = (id, driverId = 'invertorwithbatt') => ({
    driver: { id: driverId }, homey, getData: () => ({ id }),
    getName: () => id, getSetting: () => 30,
  });
  masters.push(master('inverter-a'), master('inverter-b'));
  publishBatteries(masters[0], solar(1, 1200, 30), 'solaredge');
  publishBatteries(masters[1], solar(1, -500, 70), 'solaredge');
  const driver = new VirtualDriver();
  driver.homey = homey;
  driver.getDevices = () => [];
  let choices = await driver.onPairListDevices();
  assert.equal(choices.length, 2, 'two masters with battery slot one are distinct');
  assert.notEqual(choices[0].data.id, choices[1].data.id);
  publishBatteries(masters[0], { ...solar(1, 1200, 30), ...solar(2, 0, 90), 'batt1-status': measurement(6) }, 'solaredge');
  choices = await driver.onPairListDevices();
  assert.equal(choices.length, 3, 'also expose second slot on one master');
  driver.getDevices = () => [{ getData: () => choices[0].data }];
  assert.equal((await driver.onPairListDevices()).length, 2, 'prevent duplicate pairing');

  for (const driverId of ['growattwithbatt', 'growattwithbatt_tl', 'growattwithbatt_tls']) {
    const growattMaster = master(driverId, driverId);
    masters.push(growattMaster);
    publishBatteries(growattMaster, growatt, 'growatt');
    assert.equal(batteryService(homey).snapshots.get(sourceKey(driverId, driverId, 'bank:1')).values.measure_power, 2000);
  }
  assert.equal((await driver.onPairListDevices()).length, 5, 'all Growatt profiles can be paired');

  const device = new VirtualDevice();
  device.homey = homey;
  device.getData = () => choices[0].data;
  const values = { measure_power: null, measure_battery: null, battery_status_code: 6 };
  device.removeCapability = async (key) => { delete values[key]; };
  device.hasCapability = (key) => key in values;
  device.getCapabilities = () => Object.keys(values);
  device.addCapability = async (key) => { values[key] = null; };
  device.setCapabilityValue = async (key, value) => { values[key] = value; };
  let energy;
  device.getEnergy = () => energy;
  device.setEnergy = async (value) => { energy = value; };
  device.setAvailable = async () => { device.available = true; };
  device.setUnavailable = async () => { device.available = false; };
  device.error = (error) => { throw error; };
  await device.onInit();
  await device.updates;
  assert.equal(values.measure_power, 1200);
  assert.equal(device.available, true);
  assert.equal(energy.homeBattery, true);
  assert.equal(values.battstatus, '6', 'reuse enum Idle instead of numeric 6');
  assert.equal('battery_status_code' in values, false, 'migrate old SolarEdge numeric status');
  publishBatteries(masters[0], { ...solar(1, 0, 30), 'batt1-status': measurement(10) }, 'solaredge');
  await device.updates;
  assert.equal(values.battstatus, '10', 'use existing Sleep enum entry');
  publishBatteries(masters[0], { ...solar(1, 0, 30), 'batt1-status': measurement(99) }, 'solaredge');
  await device.updates;
  assert.equal(values.battstatus, null, 'unknown enum IDs clear the old status');
  assert.equal(device.available, true);
  publishBatteries(masters[0], { ...solar(1, -250, 0), 'batt1-soh': measurement(95) }, 'solaredge');
  await device.updates;
  assert.equal(values.measure_power, -250);
  assert.equal(values.measure_battery, 0);
  assert.equal(values.batterysoh, 95);
  publishBatteries(masters[0], { ...solar(1, 0, 0), 'batt1-instantaneous_current': measurement(1.25) }, 'solaredge');
  await device.updates;
  assert.equal(values.measure_current, 1.25);
  publishBatteries(masters[0], { ...solar(1, 0, 0), 'batt1-instantaneous_current': measurement(-3.4028234663852886e38) }, 'solaredge');
  await device.updates;
  assert.equal(values.measure_current, null, 'clear previously displayed current when the inverter reports invalid data');
  publishBatteries(masters[0], solar(1, 0, 0), 'solaredge');
  await device.updates;
  assert.equal(values.batterysoh, null, 'clear missing optional measurements');
  device.latest.updatedAt = Date.now() - 999999;
  for (const fn of intervals) fn();
  await device.updates;
  assert.equal(device.available, false, 'stale master data is unavailable');
  publishBatteries(masters[0], solar(1, 400, 2), 'solaredge');
  await device.updates;
  assert.equal(device.available, true, 'recover on the next master poll');
  masters.shift();
  for (const fn of intervals) fn();
  await device.updates;
  assert.equal(device.available, false, 'removed master is unavailable');
  await device.onDeleted();
  assert.equal(intervals.size, 0);
  assert.equal(batteryService(homey).events.listenerCount(sourceKey('invertorwithbatt', 'inverter-a', 'slot:1')), 0);
  const growattChoice = (await driver.onPairListDevices()).find((choice) => choice.data.masterDriverId === 'growattwithbatt');
  const growattDevice = new VirtualDevice();
  for (const key of ['hasCapability', 'getCapabilities', 'addCapability', 'setCapabilityValue', 'getEnergy', 'setEnergy', 'error']) {
    growattDevice[key] = device[key];
  }
  growattDevice.homey = homey;
  growattDevice.getData = () => growattChoice.data;
  growattDevice.setAvailable = async () => { growattDevice.available = true; };
  growattDevice.setUnavailable = async () => { growattDevice.available = false; };
  await growattDevice.onInit();
  await growattDevice.updates;
  assert.equal(values['meter_power.charged'], 12345.6);
  assert.equal(energy.meterPowerImportedCapability, 'meter_power.charged');
  assert.equal(energy.meterPowerExportedCapability, 'meter_power.discharged');
  await growattDevice.onUninit();
  assert.equal(intervals.size, 0);

  // Simulate a restart: an empty runtime service must wait for the master to publish.
  const restartedHomey = { ...homey };
  const restartedMaster = { ...masters.find((m) => m.driver.id === 'growattwithbatt'), homey: restartedHomey };
  const restarted = new VirtualDevice();
  for (const key of ['hasCapability', 'getCapabilities', 'addCapability', 'setCapabilityValue', 'getEnergy', 'setEnergy', 'error']) restarted[key] = device[key];
  restarted.homey = restartedHomey;
  restarted.getData = growattDevice.getData;
  restarted.setAvailable = async () => { restarted.available = true; };
  restarted.setUnavailable = async () => { restarted.available = false; };
  await restarted.onInit();
  assert.equal(restarted.available, false);
  publishBatteries(restartedMaster, growatt, 'growatt');
  await restarted.updates;
  assert.equal(restarted.available, true, 'subscribe before the master starts');
  await restarted.onUninit();

  console.log('Virtual battery adapters, pairing, data reuse and lifecycle scenarios passed');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
