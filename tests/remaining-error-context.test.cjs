const assert = require('node:assert/strict');
const Module = require('node:module');
let socket;
let stage;
let failure;
let writes;
let readNumber;
class FakeSocket {
  constructor() { this.handlers = {}; socket = this; }
  on(event, callback) { this.handlers[event] = callback; return this; }
  connect() { return this; }
  setKeepAlive() { return this; }
  end() {}
}
const ids = ['invertor', 'invertorwithbatt', 'kostal', 'sigenergywithbatt',
  'solaxultrawithbatt', 'solaxwithbatt', 'sungrow', 'sungrowhybirdwithbatt',
  'wattsonic', 'wattsonicwithbatt'];
const originalLoad = Module._load;
Module._load = function (name, parent, ...args) {
  if (name === 'homey') return { Device: class {} };
  if (name === 'net') return { Socket: FakeSocket };
  if (name === 'jsmodbus') return { client: { TCP: class {
    constructor(s) { this.socket = s; }
    async writeSingleRegister(address, value) {
      writes.push([address, value]);
      if (stage === 'write') throw failure;
      return {};
    }
    async writeMultipleRegisters(address, value) {
      return this.writeSingleRegister(address, value);
    }
  } } };
  if (name === '../response') return new Proxy({}, { get: () => async () => {
    readNumber += 1;
    if (stage === `read${readNumber}`) throw failure;
    return {};
  } });
  return originalLoad.call(this, name, parent, ...args);
};
const drivers = Object.fromEntries(ids.map((id) => [id, require(`../drivers/${id}/device`)]));
Module._load = originalLoad;

function deviceFor(id, errors) {
  const device = new drivers[id]();
  device.driver = { id };
  device.getData = () => ({ id: 'source-123' });
  device.getName = () => 'Test Inverter';
  const settings = { id: 7, address: '127.0.0.1', port: 502, pollinginterval: 30, maxpeakpower: 5000 };
  device.getSetting = (key) => settings[key];
  device.getSettings = () => settings;
  device.delay = async () => {};
  device.log = () => {};
  device.error = (error) => errors.push(error);
  device.processResult = device.processResultPlain = async () => {
    if (stage === 'process') throw failure;
  };
  return device;
}

async function run(id, operation, start, failAt, expectedWrites) {
  const errors = [];
  const device = deviceFor(id, errors);
  stage = failAt;
  failure = { err: 'Timeout', message: 'Req timed out', request: { address: 12345 } };
  writes = [];
  readNumber = 0;
  await start(device);
  socket.handlers.connect(); // EventEmitter ignores callback promises.
  await new Promise((resolve) => setImmediate(resolve));
  if (failAt) {
    assert.equal(errors.length, 1, `${id} ${operation} ${failAt}: exactly one caught error`);
    const error = errors[0];
    assert.ok(error instanceof Error);
    for (const text of [`driver=${id}`, 'device=source-123', 'name=Test Inverter', operation,
      id === 'sigenergywithbatt' && operation.startsWith('write=') ? 'unit=247' : 'unit=7', 'Timeout', 'Req timed out', '12345']) {
      assert.ok(error.message.includes(text), `${id}: missing ${text}`);
    }
    assert.equal(error.cause, failure);
    if (failAt === 'write') assert.equal(writes.length, 1, 'failed write is not retried');
  } else {
    assert.deepEqual(errors, []);
    if (expectedWrites) assert.deepEqual(writes, expectedWrites, 'successful writes retain address and value');
  }
}

async function main() {
  const readCounts = { invertor: 1, invertorwithbatt: 3, kostal: 1, sigenergywithbatt: 3,
    solaxultrawithbatt: 2, solaxwithbatt: 2, sungrow: 2, sungrowhybirdwithbatt: 2,
    wattsonic: 1, wattsonicwithbatt: 1 };
  for (const id of ids) {
    for (let n = 1; n <= readCounts[id]; n += 1) {
      await run(id, 'poll', (d) => d.pollInvertor(), `read${n}`);
    }
    await run(id, 'poll', (d) => d.pollInvertor(), 'process');
    await run(id, 'poll', (d) => d.pollInvertor());
  }
  const controls = [
    ['invertor', 'activepowerlimit', 1, 0xf001],
    ['invertorwithbatt', 'activepowerlimit', 1, 0xf001],
    ['sigenergywithbatt', 'sigen_remote_ems_code', 1, 40029],
    ['solaxwithbatt', 'solarcharger_use_mode', 1, 0x1f],
    ['solaxultrawithbatt', 'solarcharger_use_mode', 1, 0x1f],
    ['sungrow', 'power_limitation_switch', 85, 5006],
    ['sungrowhybirdwithbatt', 'power_limitation_switch', 85, 5006],
    ['wattsonicwithbatt', 'hybridinvertermode', '11', 50000, 257],
  ];
  for (const [id, type, value, address, encoded = value] of controls) {
    const start = (d) => d.updateControl(type, value, d);
    await run(id, `write=${type}`, start, 'write');
    await run(id, `write=${type}`, start, undefined, [[address, encoded]]);
  }
  const start = (d) => d.updateControl2('charge', 1, 500, d);
  await run('sungrowhybirdwithbatt', 'write=charge command=1', start, 'write');
  await run('sungrowhybirdwithbatt', 'write=charge command=1', start, undefined, [[13050, 1], [13051, 500]]);
  console.log('Remaining drivers: 10 poll paths, every read stage, async processing, 9 write paths, caught object errors and successful operations passed');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
