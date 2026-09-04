const assert = require('node:assert/strict');
const calculateSolarPanelPower = require('../drivers/solar-power').default;

const cases = [
  {
    name: 'reports inverter DC power while the battery is idle',
    dc: 3000,
    ac: 2940,
    batteries: [0],
    expected: 3000,
  },
  {
    name: 'includes PV routed directly into a charging battery',
    dc: 0,
    ac: 0,
    batteries: [2000],
    expected: 2000,
  },
  {
    name: 'removes battery discharge from the inverter DC power',
    dc: 2500,
    ac: 2400,
    batteries: [-2000],
    expected: 500,
  },
  {
    name: 'reports zero while only the battery supplies the inverter',
    dc: 2000,
    ac: 1900,
    batteries: [-2000],
    expected: 0,
  },
  {
    name: 'removes grid power used to charge the battery',
    dc: -1500,
    ac: -1400,
    batteries: [3000],
    expected: 1500,
  },
  {
    name: 'uses AC fallback when reverse DC power is not reported',
    dc: 0,
    ac: -1500,
    batteries: [3000],
    expected: 1500,
  },
  {
    name: 'does not report grid-only battery charging as solar power',
    dc: 0,
    ac: -3100,
    batteries: [3000],
    expected: 0,
  },
  {
    name: 'supports two charging batteries',
    dc: 1000,
    ac: 980,
    batteries: [1200, 800],
    expected: 3000,
  },
  {
    name: 'clamps conversion-loss differences to zero',
    dc: 1950,
    ac: 1900,
    batteries: [-2000],
    expected: 0,
  },
];

for (const testCase of cases) {
  const actual = calculateSolarPanelPower(testCase.dc, testCase.ac, testCase.batteries);
  assert.equal(actual, testCase.expected, testCase.name);
}

console.log(`Solar power calculation: ${cases.length} scenarios passed`);
