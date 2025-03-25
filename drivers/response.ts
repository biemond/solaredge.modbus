import * as Modbus from 'jsmodbus';
import { Measurement } from './solaredge';

export async function checkRegister(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};
  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const response = actualRes.response;
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
          console.log(key + ': type not found ' + value[2]);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log('error with key: ' + key);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkRegisterGrowatt(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readInputRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const response = actualRes.response;
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
          console.log(key + ': type not found ' + value[2]);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log('error with key: ' + key);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkholdingRegisterKostal(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const response = actualRes.response;
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
          console.log(key + ': type not found ' + value[2]);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log('error with key: ' + key);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkholdingRegisterSolax(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const response = actualRes.response;
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
          console.log(key + ': type not found ' + value[2]);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log('error with key: ' + key);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkinputRegisterSolax(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readInputRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const response = actualRes.response;
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
          console.log(key + ': type not found ' + value[2]);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log('error with key: ' + key);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkHoldingRegisterWattsonic(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const response = actualRes.response;
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
          console.log(key + ': type not found ' + value[2]);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log('error with key: ' + key);
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
  let result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    await delay(250);
    try {
      // console.log(key, value);
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const response = actualRes.response;
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
          console.log(key + ': type not found ' + value[2]);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log('error with key: ' + key);
      console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkHoldingRegisterHuaweiEmma(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    await delay(100);
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const response = actualRes.response;
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
          console.log(key + ': type not found ' + value[2]);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log('error with key: ' + key);
      console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkHoldingRegisterGrowatt(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const response = actualRes.response;
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
          console.log(key + ': type not found ' + value[2]);
          break;
      }
      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log('error with key: ' + key);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkRegisterSungrow(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readInputRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const response = actualRes.response;
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
          console.log(key + ': type not found ' + value[2]);
          break;
      }

      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log('error with key: ' + key);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkRegisterSigenergy(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readInputRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const response = actualRes.response;
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
          console.log(key + ': type not found ' + value[2]);
          break;
      }

      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log('error with key: ' + key);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkHoldingRegisterSigenergy(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const response = actualRes.response;
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
          console.log(key + ': type not found ' + value[2]);
          break;
      }

      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log('error with key: ' + key);
      // console.log(err);
    }
  }

  console.log('checkRegister result');
  return result;
}

export async function checkHoldingRegisterSungrow(registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};

  for (const [key, value] of Object.entries(registers)) {
    try {
      const res = client.readHoldingRegisters(value[0], value[1]);
      const actualRes = await res;
      // const metrics = actualRes.metrics;
      // const request = actualRes.request;
      const response = actualRes.response;
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
          console.log(key + ': type not found ' + value[2]);
          break;
      }

      if (resultValue && resultValue !== undefined) {
        measurement.value = resultValue;
      }
      result[key] = measurement;
    } catch (err) {
      console.log('error with key: ' + key);
      // console.log(err);
    }
  }

  console.log('checkHoldingRegister result');
  return result;
}

export async function checkMeter(meter_dids: Object, meter_registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};
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
            const response = actualRes.response;

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
                  result[key + '-' + key2.replace('_scale', '')].scale = resultValue;
                }
                break;
              default:
                console.log(key2 + ': type not found ' + value2[2]);
                break;
            }
            if (resultValue) {
              measurement.value = resultValue;
            }
            result[key + '-' + key2] = measurement;
          } catch (e) {
            console.log('error with key: ' + key + ' key2: ' + key2);
            // console.log(e);
          }
        }
      }
    } catch (e) {
      console.log('error with key: ' + key);
      // console.log(e);
    }
  }
  console.log('checkMeter result');
  return result;
}

export async function checkBattery(battery_dids: Object, batt_registers: Object, client: InstanceType<typeof Modbus.client.TCP>) {
  let result: Record<string, Measurement> = {};
  try {
    for (const [key, value] of Object.entries(battery_dids)) {
      try {
        const res = client.readHoldingRegisters(value[0], value[1]);
        const actualRes = await res;
        // const metrics = actualRes.metrics;
        // const request = actualRes.request;
        const response = actualRes.response;

        if (value[2] == 'UINT16') {
          if (response.body.valuesAsBuffer.readUInt16BE() != 255) {
            // console.log(key + ": " + response.body.valuesAsBuffer.readUInt16BE());
            let offset = 0x0;
            for (const [key2, value2] of Object.entries(batt_registers)) {
              try {
                const res = client.readHoldingRegisters(value2[0] + value[3], value2[1]);
                const actualRes = await res;
                //const metrics = actualRes.metrics;
                //const request = actualRes.request;
                const response = actualRes.response;
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
                    resultValue = response.body.valuesAsArray[0].toString();
                    // resultValue = response.body.valuesAsBuffer.readBigUInt64LE().toString();
                    break;
                  default:
                    console.log(key2 + ': type not found ' + value2[2]);
                    break;
                }
                if (resultValue) {
                  measurement.value = resultValue;
                }
                result[key + '-' + key2] = measurement;
              } catch (e) {
                console.log('error with key: ' + key + ' key2: ' + key2);
                console.log(e);
              }
            }
          }
        }
      } catch (e) {
        console.log('error with key: ' + key);
        console.log(e);
      }
    }
    console.log('checkBattery result');
    return result;
  } catch (err) {
    console.log(err);
  }
}
