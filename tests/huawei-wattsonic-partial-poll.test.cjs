const assert = require('node:assert/strict');
const Module = require('node:module');
let lastSocket;
let readResults;
class FakeSocket {
  constructor() { this.handlers = {}; lastSocket = this; }
  on(event, handler) { this.handlers[event] = handler; return this; }
  setKeepAlive() { return this; }
  connect() { return this; }
  end() {}
}
const originalLoad = Module._load;
Module._load = function (name, parent, ...args) {
  if (name === 'homey') return { Device: class {} };
  if (name === 'net') return { Socket: FakeSocket };
  if (name === 'jsmodbus') return { client: { TCP: class { constructor(socket) { this.socket = socket; } } } };
  if (name === '../response' && parent.filename.includes('huaweidouble')) {
    return { checkHoldingRegisterHuawei: async () => readResults.shift() };
  }
  return originalLoad.call(this, name, parent, ...args);
};
const HuaweiDouble = require('../drivers/huaweidouble/device');
const { Wattsonic } = require('../drivers/wattsonic');
Module._load = originalLoad;
const measurement = (value, scale = '0') => ({ value, scale, label: 'Test' });

async function huawei(first, second, expected) {
  const device = new HuaweiDouble();
  const values = { measure_power: 777 };
  const processed = [];
  const settings = { id: 1, id2: 2, has_battery: false, has_battery2: false };
  device.getSetting = (key) => settings[key];
  device.getSettings = () => settings;
  device.log = () => {};
  device.delay = async () => {};
  device.removeCapability = async () => {};
  device.hasCapability = () => true;
  device.addCapability = async () => {};
  device.setCapabilityValue = async (key, value) => {
    assert.ok(Number.isFinite(value));
    values[key] = value;
  };
  device.processResult = (result) => processed.push(result);
  device.processResult2 = (result) => processed.push(result);
  readResults = [first, second];
  await device.pollInvertor();
  await lastSocket.handlers.connect();
  assert.equal(processed.length, 2, 'individual inverter results still processed');
  assert.equal(readResults.length, 0, 'both inverters are polled exactly once');
  assert.equal(values.measure_power, expected, 'only publish complete, valid combined power');
}

function wattsonic(result, expectedPower) {
  const device = new Wattsonic();
  const values = { measure_power: 777 };
  device.hasCapability = () => true;
  device.addCapability = () => Promise.resolve();
  device.setCapabilityValue = (key, value) => {
    assert.ok(typeof value !== 'number' || Number.isFinite(value), `${key} must be finite`);
    values[key] = value;
    return Promise.resolve();
  };
  device.processResult({ ...result, bmsstatus: measurement('3') });
  assert.equal(values.measure_power, expectedPower);
  assert.equal(values.batterystatus, 3, 'later battery status processing continues');
  return values;
}

async function main() {
  const good = { inputPower: measurement('1000') };
  await huawei({}, good, 777);
  await huawei(good, {}, 777);
  await huawei({}, {}, 777);
  for (const bad of [measurement('xxx'), measurement('1000', 'xxx'), { value: '1000' }, measurement(''), measurement('NaN')]) {
    await huawei({ inputPower: bad }, good, 777);
    await huawei(good, { inputPower: bad }, 777);
  }
  await huawei(good, { inputPower: measurement('20000', '-1') }, 3000);
  await huawei({ inputPower: measurement('0') }, { inputPower: measurement('0') }, 0);
  await huawei({ inputPower: measurement('0') }, good, 1000);
  const base = { battery_power: measurement('200'), battery_mode: measurement('0'), inputPower: measurement('1000') };
  wattsonic({ battery_power: measurement('200'), inputPower: measurement('1000') }, 777);
  wattsonic({ battery_power: measurement('200'), battery_mode: measurement('0') }, 777);
  for (const key of ['battery_power', 'battery_mode', 'inputPower']) {
    for (const invalid of ['xxx', '', null, 'NaN']) wattsonic({ ...base, [key]: measurement(invalid) }, 777);
  }
  wattsonic({ ...base, battery_mode: measurement('65535') }, 777);
  wattsonic({ ...base, inputPower: measurement('1000', 'xxx') }, 777);
  wattsonic({ ...base, battery_power: { value: '200' } }, 777);
  const discharge = wattsonic(base, 1200);
  assert.equal(discharge['measure_power.batt_discharge'], 200);
  assert.equal(discharge['measure_power.batt_charge'], 0);
  const charge = wattsonic({ ...base, battery_power: measurement('-200'), battery_mode: measurement('1') }, 800);
  assert.equal(charge['measure_power.batt_charge'], 200);
  assert.equal(charge['measure_power.batt_discharge'], 0);
  wattsonic({ ...base, inputPower: measurement('0'), battery_power: measurement('0') }, 0);
  console.log('Huawei Double and Wattsonic partial polls: missing dependencies, invalid data, zero readings and normal power passed');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
