const assert = require('node:assert/strict');
const Module = require('node:module');
let socket;
let failure;
let failAt;
let writes;
class FakeSocket {
  constructor() { this.handlers = {}; socket = this; }
  on(event, callback) { this.handlers[event] = callback; return this; }
  connect() { return this; }
  setKeepAlive() { return this; }
  end() {}
}
const originalLoad = Module._load;
Module._load = function (name, parent, ...args) {
  if (name === 'homey') return { Device: class {} };
  if (name === 'net') return { Socket: FakeSocket };
  if (name === 'jsmodbus') return { client: { TCP: class {
    constructor(s) { this.socket = s; }
    async writeSingleRegister(address, value) {
      writes.push([address, value]);
      if (failAt === 'write') throw failure;
      return {};
    }
    async writeMultipleRegisters(address, values) {
      writes.push([address, values]);
      if (failAt === 'write') throw failure;
      return {};
    }
  } } };
  if (name === '../response' && /growatt[^/]*[/]device/.test(parent.filename)) {
    return {
      checkRegisterGrowatt: async () => { if (failAt === 'input') throw failure; return {}; },
      checkHoldingRegisterGrowatt: async () => { if (failAt === 'holding') throw failure; return {}; },
    };
  }
  return originalLoad.call(this, name, parent, ...args);
};
const drivers = Object.fromEntries([
  'growatt', 'growatt_tls', 'growattwithbatt', 'growattwithbatt_tl', 'growattwithbatt_tls',
].map((id) => [id, require(`../drivers/${id}/device`)]));
Module._load = originalLoad;

function deviceFor(id, errors) {
  const device = new drivers[id]();
  device.driver = { id };
  device.getData = () => ({ id: 'growatt-123' });
  device.getName = () => 'Test Growatt';
  const settings = { id: 7, address: '127.0.0.1', port: 502, pollinginterval: 30, maxpeakpower: 5000 };
  device.getSetting = (key) => settings[key];
  device.homey = { clock: { getTimezone: () => 'Europe/Amsterdam' } };
  device.log = () => {};
  device.error = (error) => errors.push(error);
  device.processResult = async () => { if (failAt === 'process') throw failure; };
  device.setCapabilityValue = async () => {};
  device.unsetWarning = async () => {};
  device.getCapabilityValue = () => 0;
  device.getRegisterAddressForCapability = () => 0;
  device.processRegisterValue = (type, value) => value;
  device.castToCapabilityType = (type, value) => value;
  device.holdingRegisters = { gridfirst1starttime: [1100], gridfirstrate: [1100] };
  return device;
}

async function run(id, operation, start, stage) {
  const errors = [];
  const device = deviceFor(id, errors);
  failAt = stage;
  failure = { err: 'Offline', message: 'no connection to modbus server', request: { address: 1100 } };
  writes = [];
  await start(device);
  socket.handlers.connect();
  await new Promise((resolve) => setImmediate(resolve));
  if (stage) {
    assert.equal(errors.length, 1, `${id} ${operation} logs one caught error`);
    const error = errors[0];
    assert.ok(error instanceof Error);
    for (const detail of [`driver=${id}`, 'device=growatt-123', 'name=Test Growatt', operation, 'unit=7', 'Offline', 'no connection to modbus server', '1100']) {
      assert.ok(error.message.includes(detail), `${id}: missing ${detail}`);
    }
    assert.equal(error.cause, failure);
    if (stage === 'write') assert.equal(writes.length, 1, 'no additional write attempt');
  } else {
    assert.deepEqual(errors, []);
    assert.deepEqual(writes, [[0, 1]], 'preserve successful control write');
  }
}

async function main() {
  for (const id of Object.keys(drivers)) {
    for (const stage of ['input', 'holding', 'process']) {
      await run(id, 'poll', (d) => d.pollInvertor(), stage);
    }
    await run(id, 'write=growatt_onoff', (d) => d.updateControl('growatt_onoff', 1), 'write');
    await run(id, 'write=growatt_onoff', (d) => d.updateControl('growatt_onoff', 1));
  }
  await run('growattwithbatt', 'write-profile=gridfirst1', (d) => d.updateControlProfile('gridfirst1', '10:00', '11:00', 1), 'write');
  await run('growattwithbatt_tl', 'write-profile=period1', (d) => d.updateControlProfile('period1', 10, 0, 11, 0, 0, 1), 'write');
  await run('growattwithbatt', 'write-priority=gridfirstrate', (d) => d.updateControlPrio('gridfirstrate', 1, 50, 20, 0), 'write');
  console.log('Growatt errors: five drivers, input/holding reads, async processing, control/profile/priority writes and successful writes passed');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
