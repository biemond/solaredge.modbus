const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const originalLoad = Module._load;
Module._load = function (name, ...args) {
  if (name === 'homey') return { Device: class {} };
  return originalLoad.call(this, name, ...args);
};
const { Huawei } = require('../drivers/huawei');
Module._load = originalLoad;
const capabilities = {};
for (const name of fs.readdirSync(path.resolve('.homeycompose/capabilities'))) {
  if (name.endsWith('.json')) capabilities[name.slice(0, -5)] = JSON.parse(fs.readFileSync(path.resolve('.homeycompose/capabilities', name)));
}
const measurement = (value, scale = '0') => ({ value, scale, label: 'Test' });
function makeDevice() {
  const device = new Huawei();
  const values = {};
  device.homey = { manifest: { capabilities } };
  device.hasCapability = () => true;
  device.addCapability = () => Promise.resolve();
  device.log = () => {};
  device.setCapabilityValue = (key, value) => {
    const definition = capabilities[key];
    if (definition?.type === 'enum') {
      assert.equal(typeof value, 'string', key);
      assert.ok(definition.values.some(({ id }) => id === value), `${key}: invalid enum ${value}`);
    }
    if (key === 'huawei_status' || key === 'huawei_status_2') assert.equal(typeof value, 'string');
    assert.notEqual(value, undefined, key);
    values[key] = value;
    return Promise.resolve();
  };
  return { device, values };
}
const base = [
  ['ACTIVE_POWER_CONTROL_MODE', 'activepower_controlmode'],
  ['STORAGE_FORCIBLE_CHARGE_DISCHARGE_WRITE', 'storage_force_charge_discharge'],
  ['STORAGE_EXCESS_PV_ENERGY_USE_IN_TOU', 'storage_excess_pv_energy_use_in_tou'],
  ['REMOTE_CHARGE_DISCHARGE_CONTROL_MODE', 'remote_charge_discharge_control_mode'],
  ['STORAGE_WORKING_MODE_SETTINGS', 'storage_working_mode_settings'],
];
function exerciseEnums(method, mappings) {
  for (const [register, capability] of mappings) {
    const { device, values } = makeDevice();
    for (const { id } of capabilities[capability].values) {
      device[method]({ [register]: measurement(id) });
      assert.equal(values[capability], id);
      device[method]({ [register]: measurement(Number(id)) });
      assert.equal(values[capability], id, 'normalize valid values to enum strings');
    }
    const previous = values[capability];
    for (const invalid of ['512', '58380', '900', '65535', 'xxx', '', null, undefined, 'NaN']) {
      device[method]({ [register]: measurement(invalid) });
      assert.equal(values[capability], previous, 'keep last valid control state');
    }
    device[method]({});
    assert.equal(values[capability], previous);
  }
}
for (const [method, statusCapability] of [['processResult', 'huawei_status'], ['processResult2', 'huawei_status_2']]) {
  const { device, values } = makeDevice();
  device[method]({ DEVICE_STATUS: measurement('512') });
  assert.equal(values[statusCapability], 'On-grid');
  device[method]({ DEVICE_STATUS: measurement('12345') });
  assert.equal(values[statusCapability], 'Unknown (12345)');
  device[method]({ DEVICE_STATUS: measurement(0) });
  assert.equal(values[statusCapability], 'Standby: initializing');
  for (const invalid of ['xxx', '', null, undefined, 'NaN']) {
    device[method]({ DEVICE_STATUS: measurement(invalid) });
    assert.equal(values[statusCapability], 'Standby: initializing');
  }
}
exerciseEnums('processResult', base);
exerciseEnums('processResult2', base.map(([key, cap]) => [key, cap === 'storage_force_charge_discharge' ? `${cap}3` : `${cap}2`]));
exerciseEnums('processEmmaResult', [['battery_control', 'battery_control'], ['power_control_mode_at_grid', 'power_control_mode_at_grid']]);
// Reproduce the reported invalid values together and verify later battery data still updates.
const { device, values } = makeDevice();
device.processResult({ ACTIVE_POWER_CONTROL_MODE: measurement('512'),
  STORAGE_WORKING_MODE_SETTINGS: measurement('58380'), STORAGE_EXCESS_PV_ENERGY_USE_IN_TOU: measurement('900'),
  STORAGE_MAXIMUM_DISCHARGE_POWER: measurement('3500') });
assert.equal(values['measure_power.dischargesetting'], 3500);
console.log('Huawei status and enums: unknown status codes, all supported mode IDs, reported invalid readings, second inverter and EMMA passed');
