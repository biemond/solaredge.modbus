const assert = require('node:assert/strict');
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (name, ...args) {
  if (name === 'homey') return { Device: class {} };
  return originalLoad.call(this, name, ...args);
};
const { Solaredge } = require('../drivers/solaredge');
Module._load = originalLoad;
const measurement = (value, scale = '0') => ({ value: String(value), scale, label: 'Test' });

async function run(result) {
  const device = new Solaredge();
  const values = {};
  const triggers = [];
  device.homey = { clock: { getTimezone: () => 'UTC' }, i18n: { getLanguage: () => 'en' }, flow: { getDeviceTriggerCard: (id) => ({
    trigger: async (_device, tokens) => { triggers.push({ id, tokens }); },
  }) } };
  device.driver = { id: 'invertorwithbatt' };
  device.getData = () => ({ id: 'partial-poll-test' });
  device.getSetting = () => 30;
  device.hasCapability = () => true;
  device.setCapabilityValue = async (capability, value) => {
    values[capability] = value;
  };
  await device.processResult(result, 10000);
  return { values, triggers };
}

async function main() {
  const partial = {
    'meter1-power': measurement(300),
    'batt1-instantaneous_power': measurement(0, 'xxx'),
  };
  for (const ac of [undefined, measurement('xxx'), measurement(1000, 'xxx'), { value: '1000', label: 'Missing scale' }, measurement('NaN')]) {
    const result = { ...partial };
    if (ac !== undefined) result.power_ac = ac;
    const { values, triggers } = await run(result);
    assert.equal(values.ownconsumption, undefined, 'skip calculation when AC power is missing or invalid');
    assert.equal(values['measure_power.batt_charge'], 0, 'continue processing battery registers');
    assert.equal(values['measure_power.batt_discharge'], 0);
    assert.equal(triggers.some(({ id }) => id === 'changedConsumption'), false);
  }
  const valid = await run({ ...partial, power_ac: measurement(1000) });
  assert.equal(valid.values.ownconsumption, 700);
  assert.equal(valid.values['measure_power.export'], 300);
  assert.equal(valid.values['measure_power.import'], 0);
  assert.ok(valid.triggers.some(({ id }) => id === 'changedConsumption'));
  const zero = await run({ 'meter1-power': measurement(-100), power_ac: measurement(0) });
  assert.equal(zero.values.ownconsumption, 100);
  assert.equal(zero.values['measure_power.import'], 100);
  const noMeter = await run({ power_ac: measurement(1000) });
  assert.equal(noMeter.values.measure_power, 1000);
  assert.equal(noMeter.values.ownconsumption, undefined);
  console.log('SolarEdge partial polls: missing/invalid AC power, later battery processing, normal and zero-power cases passed');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
