const assert = require('node:assert/strict');
const withErrorContext = require('../lib/error-context').default;
const Module = require('node:module');
let lastSocket;
let failure;
let readFailure;
let writes;
class FakeSocket {
  constructor() { this.handlers = {}; lastSocket = this; }
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
    constructor(socket) { this.socket = socket; }
    async writeSingleRegister(address, value) {
      writes.push([address, value]);
      if (failure) throw failure;
      return {};
    }
  } } };
  if (name === '../response' && /huawei[^/]*[/]device/.test(parent.filename)) {
    const read = async () => { if (readFailure) throw readFailure; return {}; };
    return { checkHoldingRegisterHuawei: read, checkHoldingRegisterHuaweiEmma: read };
  }
  return originalLoad.call(this, name, parent, ...args);
};
const drivers = {
  huawei: require('../drivers/huawei/device'),
  huaweiwithbatt: require('../drivers/huaweiwithbatt/device'),
  huaweidouble: require('../drivers/huaweidouble/device'),
  huaweiwithemma: require('../drivers/huaweiwithemma/device'),
};
Module._load = originalLoad;

function deviceFor(id) {
  const device = new drivers[id]();
  device.driver = { id };
  device.getData = () => ({ id: 'source-123' });
  device.getName = () => 'Test Inverter';
  const settings = { id: 1, id2: 2, address: '127.0.0.1', port: 502, has_battery: false, has_battery2: false };
  device.getSetting = (key) => settings[key];
  device.getSettings = () => settings;
  device.delay = async () => {};
  device.log = () => {};
  device.removeCapability = async () => {};
  device.hasCapability = () => true;
  device.processResult = async () => {};
  device.processResult2 = async () => {};
  device.processEmmaResult = async () => {};
  return device;
}

async function expectContext(task, driver, operation) {
  await assert.rejects(task, (error) => {
    assert.ok(error instanceof Error);
    assert.ok(error.message.includes(`driver=${driver}`));
    assert.ok(error.message.includes('device=source-123'));
    assert.ok(error.message.includes('Test Inverter'));
    assert.ok(error.message.includes(operation));
    assert.ok(error.message.includes('unit=1'));
    assert.ok(error.message.includes('Timeout'));
    assert.ok(error.message.includes('Req timed out'));
    assert.equal(error.cause, failure || readFailure);
    return true;
  });
}

async function main() {
  const circular = { err: 'ModbusException', message: 'Illegal address', request: { address: 47086 } };
  circular.self = circular;
  await assert.rejects(withErrorContext('test unit=1', async () => { throw circular; }), (error) => {
    assert.ok(error instanceof Error);
    assert.ok(error.message.includes('ModbusException'));
    assert.ok(error.message.includes('47086'));
    assert.ok(error.message.includes('Circular'));
    assert.equal(error.cause, circular);
    return true;
  });
  const original = new Error('native error');
  await assert.rejects(withErrorContext('test', async () => { throw original; }), (error) => {
    assert.ok(error.stack.includes(original.stack));
    assert.equal(error.cause, original);
    return true;
  });
  let completed = false;
  await withErrorContext('success', async () => { completed = true; })();
  assert.equal(completed, true);
  for (const id of Object.keys(drivers)) {
    failure = undefined;
    readFailure = { err: 'Timeout', message: 'Req timed out' };
    const device = deviceFor(id);
    await device.pollInvertor();
    await expectContext(() => lastSocket.handlers.connect(), id, 'poll');
  }
  readFailure = undefined;
  for (const id of ['huaweiwithbatt', 'huaweidouble', 'huaweiwithemma']) {
    const device = deviceFor(id);
    failure = { err: 'Timeout', message: 'Req timed out', request: { address: 47086 } };
    writes = [];
    const type = id === 'huaweiwithemma' ? 'battery_control' : 'storage_working_mode_settings';
    const start = async () => {
      if (id === 'huaweidouble') await device.updateControl(type, 1, 2, device);
      else await device.updateControl(type, 2, device);
    };
    await start();
    await expectContext(() => lastSocket.handlers.connect(), id, `write=${type}`);
    assert.equal(writes.length, 1);
    failure = undefined;
    writes = [];
    await start();
    await lastSocket.handlers.connect();
    assert.deepEqual(writes, [[id === 'huaweiwithemma' ? 40000 : 47086, 2]], 'preserve control address and value');
  }
  console.log('Huawei errors: all four poll paths, three write paths, circular objects, original stacks and successful writes passed');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
