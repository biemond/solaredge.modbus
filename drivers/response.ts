import { decodeSolarEdgeUint64 } from '../lib/solaredge-counter';
import * as Modbus from 'jsmodbus';
import { Measurement } from './solaredge';

export async function checkRegister(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};
  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const { response } = actualRes;
      const measurement: Measurement = {
        value: 'xxx',
        scale: 'xxx',
        label: value[3],
      };
      let resultValue: string = 'xxx';
      switch (value[2]) {
        case 'UINT16':
          resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
          // console.log(key);
          // console.log( response.body);
          break;
        case 'UINT32':
          resultValue = response.body.valuesAsArray[0].toString();
          // console.log( response.body);
          break;
        case 'ACC32':
          resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
          break;
        case 'FLOAT':
          resultValue = response.body.valuesAsBuffer.readFloatBE().toString();
          break;
        case 'STRING':
          resultValue = response.body.valuesAsBuffer.toString();
          break;
        case 'INT16':
          resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
          break;
        case 'SCALE':
          resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
          // console.log(value[3] + ": " + resultValue);
          // console.log(key.replace('_scale', ''));
          if (resultValue) {
            result[key.replace('_scale', '')].scale = resultValue;
          }
          break;
        case 'FLOAT32':
          resultValue = response.body.valuesAsBuffer.swap16().swap32().readFloatBE().toString();
          break;
        default:
          console.log(`${key}: type not found ${value[2]}`);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log(`error with key: ${key}`);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkRegisterGrowatt(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readInputRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const { response } = actualRes;
      const measurement: Measurement = {
        value: 'xxx',
        scale: value[4],
        label: value[3],
      };
      let resultValue: string = 'xxx';
      switch (value[2]) {
        case 'UINT16':
          resultValue = response.body.valuesAsArray[0].toString();
          // console.log(key);
          break;
        case 'UINT32':
          resultValue = ((response.body.valuesAsArray[0] << 16) | response.body.valuesAsArray[1]).toString();
          // console.log(key);
          break;
        default:
          console.log(`${key}: type not found ${value[2]}`);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log(`error with key: ${key}`);
      // console.log(err);
    }
  }

  console.log('checkRegisterGrowatt result');
  return result;
}

export async function checkholdingRegisterKostal(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const { response } = actualRes;
      const measurement: Measurement = {
        value: 'xxx',
        scale: value[4],
        label: value[3],
      };
      let resultValue: string = 'xxx';
      switch (value[2]) {
        case 'UINT16':
          resultValue = response.body.valuesAsBuffer.readUInt16BE().toString();
          break;
        case 'INT16':
          resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
          break;
        case 'UINT32':
          resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
          break;
        case 'FLOAT':
          resultValue = response.body.valuesAsBuffer.readFloatBE().toString();
          break;
        case 'FLOAT32':
          resultValue = response.body.valuesAsBuffer.swap16().swap32().readFloatBE().toString();
          break;
        default:
          console.log(`${key}: type not found ${value[2]}`);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log(`error with key: ${key}`);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkholdingRegisterSolax(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const { response } = actualRes;
      const measurement: Measurement = {
        value: 'xxx',
        scale: value[4],
        label: value[3],
      };
      let resultValue: string = 'xxx';
      switch (value[2]) {
        case 'UINT16':
          resultValue = response.body.valuesAsBuffer.readUInt16BE().toString();
          break;
        case 'UINT32':
          resultValue = ((response.body.valuesAsArray[1] << 16) | response.body.valuesAsArray[0]).toString();
          // resultValue = response.body.valuesAsBuffer.readUInt32LE().toString();
          break;
        case 'STRING':
          resultValue = response.body.valuesAsBuffer.toString();
          break;
        case 'INT16':
          resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
          break;
        case 'INT32':
          resultValue = ((response.body.valuesAsArray[1] << 16) | response.body.valuesAsArray[0] | 0).toString();
          // resultValue = response.body.valuesAsBuffer.readInt32LE().toString();
          break;
        default:
          console.log(`${key}: type not found ${value[2]}`);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log(`error with key: ${key}`);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkinputRegisterSolax(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readInputRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const { response } = actualRes;
      const measurement: Measurement = {
        value: 'xxx',
        scale: value[4],
        label: value[3],
      };
      let resultValue: string = 'xxx';
      switch (value[2]) {
        case 'UINT16':
          resultValue = response.body.valuesAsBuffer.readUInt16BE().toString();
          break;
        case 'UINT32':
          resultValue = ((response.body.valuesAsArray[1] << 16) | response.body.valuesAsArray[0]).toString();
          // resultValue = response.body.valuesAsBuffer.readUInt32LE().toString();
          break;
        case 'STRING':
          resultValue = response.body.valuesAsBuffer.toString();
          break;
        case 'INT16':
          resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
          break;
        case 'INT32':
          resultValue = ((response.body.valuesAsArray[1] << 16) | response.body.valuesAsArray[0] | 0).toString();
          // resultValue = response.body.valuesAsBuffer.readInt32LE().toString();
          break;
        default:
          console.log(`${key}: type not found ${value[2]}`);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log(`error with key: ${key}`);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkHoldingRegisterWattsonic(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const { response } = actualRes;
      const measurement: Measurement = {
        value: 'xxx',
        scale: value[4],
        label: value[3],
      };
      let resultValue: string = 'xxx';
      switch (value[2]) {
        case 'UINT16':
          resultValue = response.body.valuesAsBuffer.readUInt16BE().toString();
          break;
        case 'UINT32':
          resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
          break;
        case 'ACC32':
          resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
          break;
        case 'FLOAT':
          resultValue = response.body.valuesAsBuffer.readFloatBE().toString();
          break;
        case 'STRING':
          resultValue = response.body.valuesAsBuffer.toString();
          break;
        case 'INT16':
          resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
          break;
        case 'INT32':
          resultValue = response.body.valuesAsBuffer.readInt32BE().toString();
          break;
        case 'FLOAT32':
          resultValue = response.body.valuesAsBuffer.swap16().swap32().readFloatBE().toString();
          break;
        default:
          console.log(`${key}: type not found ${value[2]}`);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log(`error with key: ${key}`);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

function delay(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function checkHoldingRegisterHuawei(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    await delay(250);
    try {
      // console.log(key, value);
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const { response } = actualRes;
      const measurement: Measurement = {
        value: 'xxx',
        scale: value[4],
        label: value[3],
      };
      let resultValue: string = 'xxx';
      switch (value[2]) {
        case 'STRING':
          resultValue = response.body.valuesAsBuffer.toString();
          break;
        case 'UINT16':
          resultValue = response.body.valuesAsBuffer.readUInt16BE().toString();
          break;
        case 'UINT32':
          resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
          break;
        case 'ACC32':
          resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
          break;
        case 'FLOAT':
          resultValue = response.body.valuesAsBuffer.readFloatBE().toString();
          break;
        case 'STRING':
          resultValue = response.body.valuesAsBuffer.toString();
          break;
        case 'INT16':
          resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
          break;
        case 'INT32':
          resultValue = response.body.valuesAsBuffer.readInt32BE().toString();
          break;
        case 'FLOAT32':
          resultValue = response.body.valuesAsBuffer.swap16().swap32().readFloatBE().toString();
          break;
        default:
          console.log(`${key}: type not found ${value[2]}`);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log(`error with key: ${key}`);
      console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkHoldingRegisterHuaweiEmma(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    await delay(100);
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const { response } = actualRes;
      const measurement: Measurement = {
        value: 'xxx',
        scale: value[4],
        label: value[3],
      };
      let resultValue: string = 'xxx';
      switch (value[2]) {
        case 'STRING':
          resultValue = response.body.valuesAsBuffer.toString();
          break;
        case 'UINT16':
          resultValue = response.body.valuesAsBuffer.readUInt16BE().toString();
          break;
        case 'UINT32':
          resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
          break;
        case 'UINT64':
          resultValue = response.body.valuesAsBuffer.readBigUint64BE().toString();
          break;
        case 'ACC32':
          resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
          break;
        case 'FLOAT':
          resultValue = response.body.valuesAsBuffer.readFloatBE().toString();
          break;
        case 'STRING':
          resultValue = response.body.valuesAsBuffer.toString();
          break;
        case 'INT16':
          resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
          break;
        case 'INT32':
          resultValue = response.body.valuesAsBuffer.readInt32BE().toString();
          break;
        case 'FLOAT32':
          resultValue = response.body.valuesAsBuffer.swap16().swap32().readFloatBE().toString();
          break;
        default:
          console.log(`${key}: type not found ${value[2]}`);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log(`error with key: ${key}`);
      console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkHoldingRegisterGrowatt(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const { response } = actualRes;
      const measurement: Measurement = {
        value: 'xxx',
        scale: value[4],
        label: value[3],
      };
      let resultValue: string = 'xxx';
      switch (value[2]) {
        case 'UINT16':
          resultValue = response.body.valuesAsArray[0].toString();
          // console.log(key);
          break;
        case 'UINT32':
          resultValue = ((response.body.valuesAsArray[0] << 16) | response.body.valuesAsArray[1]).toString();
          // console.log(key);
          break;
        default:
          console.log(`${key}: type not found ${value[2]}`);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log(`error with key: ${key}`);
      // console.log(err);
    }
  }

  console.log('checkHoldingRegisterGrowatt result');
  return result;
}

// Max registers per block read (Modbus allows 125, 100 is what other Growatt integrations use)
const GROWATT_MAX_BLOCK = 100;

// Same result as checkRegisterGrowatt / checkHoldingRegisterGrowatt, but reads contiguous blocks
// instead of one request per register. Some dataloggers (e.g. ShineWiLan-X2) stall when they get
// ~50 separate requests per poll. A block that returns a Modbus exception is read per register.
export async function checkRegisterGrowattBlocks(
  registers: Object,
  client: InstanceType<typeof Modbus.client.TCP>,
  type: 'input' | 'holding',
) {
  const result: Record<string, Measurement> = {};
  const read = (start: number, count: number) => (type === 'input' ? client.readInputRegisters(start, count) : client.readHoldingRegisters(start, count));

  const entries = Object.entries(registers).sort((a, b) => a[1][0] - b[1][0]);
  const blocks: { start: number; end: number; entries: [string, any][] }[] = [];
  for (const entry of entries) {
    const start = entry[1][0];
    const end = start + entry[1][1];
    const last = blocks[blocks.length - 1];
    if (last && end - last.start <= GROWATT_MAX_BLOCK) {
      last.end = Math.max(last.end, end);
      last.entries.push(entry);
    } else {
      blocks.push({ start, end, entries: [entry] });
    }
  }

  const decode = (key: string, value: any, values: number[], offset: number) => {
    let resultValue: string = 'xxx';
    switch (value[2]) {
      case 'UINT16':
        resultValue = values[offset].toString();
        break;
      case 'UINT32':
        resultValue = ((values[offset] << 16) | values[offset + 1]).toString();
        break;
      default:
        console.log(`${key}: type not found ${value[2]}`);
        break;
    }
    result[key] = { value: resultValue, scale: value[4], label: value[3] };
  };

  for (const block of blocks) {
    try {
      const { response } = await read(block.start, block.end - block.start);
      const values = response.body.valuesAsArray as number[];
      for (const [key, value] of block.entries) {
        decode(key, value, values, value[0] - block.start);
      }
    } catch (err: any) {
      console.log(`error with block ${block.start}-${block.end - 1}`);
      // An unsupported address inside the block: fall back to one request per register.
      // On a timeout, don't: the datalogger isn't answering anyway.
      if (err?.err !== 'ModbusException') continue;
      for (const [key, value] of block.entries) {
        try {
          const { response } = await read(value[0], value[1]);
          decode(key, value, response.body.valuesAsArray as number[], 0);
        } catch (e) {
          console.log(`error with key: ${key}`);
        }
      }
    }
  }

  console.log(`checkRegisterGrowattBlocks ${type} result (${blocks.length} blocks)`);
  return result;
}

export async function checkRegisterSungrow(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readInputRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const { response } = actualRes;
      const measurement: Measurement = {
        value: 'xxx',
        scale: value[4],
        label: value[3],
      };
      let resultValue: string = 'xxx';
      switch (value[2]) {
        case 'UINT16':
          resultValue = response.body.valuesAsBuffer.readUInt16BE().toString();
          break;
        case 'UINT32':
          resultValue = ((response.body.valuesAsArray[1] << 16) | response.body.valuesAsArray[0]).toString();
          break;
        case 'STRING':
          resultValue = response.body.valuesAsBuffer.toString();
          break;
        case 'INT16':
          resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
          break;
        case 'INT32':
          resultValue = ((response.body.valuesAsArray[1] << 16) | response.body.valuesAsArray[0] | 0).toString();
          break;
        default:
          console.log(`${key}: type not found ${value[2]}`);
          break;
      }

      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log(`error with key: ${key}`);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkRegisterSigenergy(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readInputRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const { response } = actualRes;
      const measurement: Measurement = {
        value: 'xxx',
        scale: value[4],
        label: value[3],
      };
      let resultValue: string = 'xxx';
      switch (value[2]) {
        case 'UINT16':
          resultValue = response.body.valuesAsBuffer.readUInt16BE().toString();
          break;
        case 'UINT32':
          resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
          break;
        case 'STRING':
          resultValue = response.body.valuesAsBuffer.toString();
          break;
        case 'INT16':
          resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
          break;
        case 'INT32':
          resultValue = response.body.valuesAsBuffer.readInt32BE().toString();
          break;
        case 'UINT64':
          resultValue = response.body.valuesAsBuffer.readBigUint64BE().toString();
          break;
        default:
          console.log(`${key}: type not found ${value[2]}`);
          break;
      }

      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log(`error with key: ${key}`);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkHoldingRegisterSigenergy(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const { response } = actualRes;
      const measurement: Measurement = {
        value: 'xxx',
        scale: value[4],
        label: value[3],
      };
      let resultValue: string = 'xxx';
      switch (value[2]) {
        case 'UINT16':
          resultValue = response.body.valuesAsBuffer.readUInt16BE().toString();
          break;
        case 'UINT32':
          resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
          break;
        case 'STRING':
          resultValue = response.body.valuesAsBuffer.toString();
          break;
        case 'INT16':
          resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
          break;
        case 'INT32':
          resultValue = response.body.valuesAsBuffer.readInt32BE().toString();
          break;
        case 'UINT64':
          resultValue = response.body.valuesAsBuffer.readBigUint64BE().toString();
          break;
        default:
          console.log(`${key}: type not found ${value[2]}`);
          break;
      }

      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log(`error with key: ${key}`);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkHoldingRegisterSungrow(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const { response } = actualRes;
      const measurement: Measurement = {
        value: 'xxx',
        scale: value[4],
        label: value[3],
      };
      let resultValue: string = 'xxx';
      switch (value[2]) {
        case 'UINT16':
          resultValue = response.body.valuesAsBuffer.readUInt16BE().toString();
          break;
        case 'UINT32':
          resultValue = ((response.body.valuesAsArray[1] << 16) | response.body.valuesAsArray[0]).toString();
          break;
        case 'STRING':
          resultValue = response.body.valuesAsBuffer.toString();
          break;
        case 'INT16':
          resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
          break;
        case 'INT32':
          resultValue = ((response.body.valuesAsArray[1] << 16) | response.body.valuesAsArray[0] | 0).toString();
          break;
        default:
          console.log(`${key}: type not found ${value[2]}`);
          break;
      }

      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log(`error with key: ${key}`);
      // console.log(err);
    }
  }

  console.log('checkHoldingRegister result');
  return result;
}

export async function checkMeter(meter_dids: Object, meter_registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};
  for (const [key, value] of Object.entries(meter_dids)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes?.metrics;
      // const request = actualRes?.request;
      // const response = actualRes?.response;

      if (value[2] == 'UINT16') {
        for (const [key2, value2] of Object.entries(meter_registers)) {
          try {
            const innerRes = client.readHoldingRegisters(value2[0] + value[3], value2[1]);
            const actualRes = await innerRes;
            // const metrics = actualRes.metrics;
            // const request = actualRes.request;
            const { response } = actualRes;

            const measurement: Measurement = {
              value: 'xxx',
              scale: 'xxx',
              label: value2[3],
            };
            let resultValue: string = 'xxx';
            switch (value2[2]) {
              case 'UINT16':
                resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
                break;
              case 'UINT32':
                resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
                break;
              case 'SEFLOAT':
                resultValue = response.body.valuesAsBuffer.swap16().swap32().readFloatBE().toString();
                break;
              case 'STRING':
                resultValue = response.body.valuesAsBuffer.toString();
                break;
              case 'UINT64':
                resultValue = response.body.valuesAsBuffer.readBigUInt64LE().toString();
                break;
              case 'INT16':
                resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
                break;
              case 'SCALE':
                resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
                if (resultValue) {
                  result[`${key}-${key2.replace('_scale', '')}`].scale = resultValue;
                }
                break;
              default:
                console.log(`${key2}: type not found ${value2[2]}`);
                break;
            }
            if (resultValue) {
              measurement.value = resultValue;
            }
            result[`${key}-${key2}`] = measurement;
          } catch (e) {
            console.log(`error with key: ${key} key2: ${key2}`);
            // console.log(e);
          }
        }
      }
    } catch (e) {
      console.log(`error with key: ${key}`);
      // console.log(e);
    }
  }
  console.log('checkMeter result');
  return result;
}

export async function checkBattery(battery_dids: Object, batt_registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  const result: Record<string, Measurement> = {};
  try {
    for (const [key, value] of Object.entries(battery_dids)) {
      try {
        const res = client.readHoldingRegisters(value[0], value[1]);
        const actualRes = await res;
        // const metrics = actualRes.metrics;
        // const request = actualRes.request;
        const { response } = actualRes;

        if (value[2] == 'UINT16') {
          if (response.body.valuesAsBuffer.readUInt16BE() != 255) {
            // console.log(key + ": " + response.body.valuesAsBuffer.readUInt16BE());
            const offset = 0x0;
            for (const [key2, value2] of Object.entries(batt_registers)) {
              try {
                const res = client.readHoldingRegisters(value2[0] + value[3], value2[1]);
                const actualRes = await res;
                // const metrics = actualRes.metrics;
                // const request = actualRes.request;
                const { response } = actualRes;
                // console.log(resp.response._body);
                const measurement: Measurement = {
                  value: 'xxx',
                  scale: 'xxx',
                  label: value2[3],
                };
                let resultValue: string = 'xxx';
                switch (value2[2]) {
                  case 'SEFLOAT':
                    resultValue = response.body.valuesAsBuffer.swap16().swap32().readFloatBE().toString();
                    break;
                  case 'STRING':
                    resultValue = response.body.valuesAsBuffer.toString();
                    break;
                  case 'UINT16':
                    resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
                    break;
                  case 'UINT32':
                    resultValue = response.body.valuesAsArray[0].toString();
                    break;
                  case 'UINT64':
                    resultValue = decodeSolarEdgeUint64(response.body.valuesAsBuffer);
                    // Temporary diagnostics: reuse the response already retrieved by this poll.
                    console.log('SolarEdge battery UINT64', JSON.stringify({
                      battery: key,
                      manufacturer: result[`${key}-c_manufacturer`]?.value,
                      model: result[`${key}-c_model`]?.value,
                      counter: key2,
                      register: `0x${(value2[0] + value[3]).toString(16)}`,
                      words: response.body.valuesAsArray,
                      rawHex: response.body.valuesAsBuffer.toString('hex'),
                      decodedWh: resultValue,
                    }));
                    break;
                  default:
                    console.log(`${key2}: type not found ${value2[2]}`);
                    break;
                }
                if (resultValue) {
                  measurement.value = resultValue;
                }
                result[`${key}-${key2}`] = measurement;
              } catch (e) {
                console.log(`error with key: ${key} key2: ${key2}`);
                console.log(e);
              }
            }
          }
        }
      } catch (e) {
        console.log(`error with key: ${key}`);
        console.log(e);
      }
    }
    console.log('checkBattery result');
    return result;
  } catch (err) {
    console.log(err);
  }
}
