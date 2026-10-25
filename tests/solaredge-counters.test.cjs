const assert = require('node:assert/strict');
const { decodeSolarEdgeUint64, solarEdgeCounterKWh } = require('../lib/solaredge-counter');
const { checkBattery } = require('../drivers/response');

async function main() {
  // Literal wire bytes: 0x1122334455667788 as low word first, BE bytes per word.
  const wire = Buffer.from('7788556633441122', 'hex');
  assert.equal(decodeSolarEdgeUint64(wire), '1234605616436508552');
  assert.equal(wire.toString('hex'), '7788556633441122', 'do not mutate Modbus response');
  assert.equal(decodeSolarEdgeUint64(Buffer.from('0000000100000000', 'hex')), '65536');
  assert.equal(decodeSolarEdgeUint64(Buffer.from('0000000000010000', 'hex')), '4294967296');
  assert.equal(decodeSolarEdgeUint64(Buffer.alloc(8)), '0');
  assert.equal(decodeSolarEdgeUint64(Buffer.alloc(8, 255)), 'xxx');
  assert.equal(decodeSolarEdgeUint64(Buffer.alloc(6)), 'xxx');
  assert.equal(solarEdgeCounterKWh('12345678'), 12345.678);
  assert.equal(solarEdgeCounterKWh('4294967296'), 4294967.296);
  assert.equal(solarEdgeCounterKWh('0'), 0);
  for (const bad of ['xxx', '', 'NaN', '-1', '1.5', '18446744073709551615', '9007199254740992', null, undefined]) {
    assert.equal(solarEdgeCounterKWh(bad), undefined, `invalid total ${bad}`);
  }
  const values = new Map([
    [0xe17a, Buffer.from('614e00bc00000000', 'hex')], // 12345678 Wh
    [0xe176, Buffer.from('b43f009600000000', 'hex')], // 9876543 Wh
    [0xe27a, Buffer.from('0000000100000000', 'hex')],
    [0xe276, Buffer.alloc(8, 255)],
  ]);
  const reads = [];
  const client = {
    readHoldingRegisters: async (address, count) => {
      reads.push([address, count]);
      const buffer = values.get(address) || Buffer.from([0, 1]);
      return { response: { body: {
        valuesAsBuffer: buffer,
        valuesAsArray: Array.from({ length: buffer.length / 2 }, (_, i) => buffer.readUInt16BE(i * 2)),
      } } };
    },
  };
  const result = await checkBattery({ batt1: [0xe140, 1, 'UINT16', 0], batt2: [0xe240, 1, 'UINT16', 0x100] }, {
    lifetime_import_energy_counter: [0xe17a, 4, 'UINT64', 'Total Imported Energy'],
    lifetime_export_energy_counter: [0xe176, 4, 'UINT64', 'Total Exported Energy'],
  }, client);
  assert.equal(result['batt1-lifetime_import_energy_counter'].value, '12345678');
  assert.equal(result['batt1-lifetime_export_energy_counter'].value, '9876543');
  assert.equal(result['batt2-lifetime_import_energy_counter'].value, '65536');
  assert.equal(result['batt2-lifetime_export_energy_counter'].value, 'xxx');
  assert.deepEqual(reads, [[0xe140, 1], [0xe17a, 4], [0xe176, 4], [0xe240, 1], [0xe27a, 4], [0xe276, 4]]);
  console.log('SolarEdge 64-bit decoding, battery offsets, invalid totals and kWh conversion passed');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
