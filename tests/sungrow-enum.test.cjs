const assert = require('node:assert/strict');
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (name, ...args) {
  if (name === 'homey') return { Device: class {} };
  return originalLoad.call(this, name, ...args);
};
const { Sungrow } = require('../drivers/sungrow');
Module._load = originalLoad;
const definition = require(require('node:path').resolve('.homeycompose/capabilities/power_limitation_switch.json'));
const allowed = new Set(definition.values.map(({ id }) => id));
const measurement = (value, scale = '0') => ({ value, scale, label: 'Test' });

for (const method of ['processResult', 'processResultPlain']) {
  const device = new Sungrow();
  const values = {};
  const added = [];
  device.hasCapability = () => true;
  device.getCapabilityValue = (key) => values[key];
  device.addCapability = (key) => { added.push(key); return Promise.resolve(); };
  device.setCapabilityValue = (key, value) => {
    if (key === 'power_limitation_switch') assert.ok(allowed.has(value), `Invalid enum value ${value}`);
    values[key] = value;
    return Promise.resolve();
  };
  device.homey = { flow: { getDeviceTriggerCard: () => ({ trigger: () => Promise.resolve() }) } };
  for (const invalid of ['65535', 'xxx', '0', '255', '171', '', null, undefined, 65535]) {
    device[method]({
      power_limitation_switch: measurement(invalid),
      power_limitation_setting: measurement('500', '-1'),
    });
    assert.equal(values.power_limitation_switch, undefined, `${method} ignores invalid reading ${invalid}`);
    assert.equal(values.power_limitation_setting, 50, 'other register processing continues');
  }
  assert.equal(added.includes('power_limitation_switch'), false, 'invalid data does not add a capability');
  device[method]({ power_limitation_setting: measurement('250', '-1') });
  assert.equal(values.power_limitation_switch, undefined, 'missing register is ignored');
  for (const valid of ['85', '170', 85, 170]) {
    device[method]({ power_limitation_switch: measurement(valid) });
    assert.equal(values.power_limitation_switch, String(valid), `${method} accepts valid enum ID`);
  }
  device[method]({ power_limitation_switch: measurement('85') });
  device[method]({ power_limitation_switch: measurement('65535'), pvTotalEnergy: measurement('123') });
  assert.equal(values.power_limitation_switch, '85', 'retain the last valid state');
  assert.equal(values.meter_power, 123, 'subsequent data still updates');
}
console.log('Sungrow standard and hybrid enum validation: valid IDs, invalid/missing readings and recovery passed');
