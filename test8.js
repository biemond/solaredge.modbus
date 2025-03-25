// License: Beerware! Do what ever you like with this, but I'm not liable for anything that you do with it.
// If you like this code, feel free to buy me a beer ...
// Have fun with it! der Kachel
// @ts-ignore
const modbusRTU = require('modbus-serial');

const client = new modbusRTU();

const modbusErrorMessages = [
  'Unknown error',
  'Illegal function (device does not support this read/write function)',
  'Illegal data address (register not supported by device)',
  'Illegal data value (value cannot be written to this register)',
  'Slave device failure (device reports internal error)',
  'Acknowledge (requested data will be available later)',
  'Slave device busy (retry request again later)',
];

// Enter your inverter modbus IP and port here:
const modbusHost = '000.000.000.000';
const modbusPort = 502;
// Enter the Modbus-IDs of your Sun2000 inverters here:
const modbusID = [1];
// On which Modbus-ID can we reach the power meter? (via Sun2000!)
const powerMeterID = 0;

// Connect to modbus client
ConnectModbus();

// These register spaces need to be read:
const registerSpacesToReadContinuously = [
  [37100, 114],
  [32000, 116],
];
let registerSpacesToReadContinuouslyPtr = 0;

const globalDataBuffer = new Array(1);
globalDataBuffer[0] = new Array(50000); // not optimized....

// ---------------------------------------------------------------
// Some helper functions:
function ReadUnsignedInt16(array) {
  const value = array[0];
  return value;
}

function ReadUnsignedInt32(array) {
  const value = array[0] * 256 * 256 + array[1];
  return value;
}

function ReadSignedInt16(array) {
  let value = 0;
  if (array[0] > 32767) value = array[0] - 65535;
  else value = array[0];

  return value;
}
function ReadSignedInt32(array) {
  let value = 0;
  for (let i = 0; i < 2; i++) {
    value = (value << 16) | array[i];
  }
  return value;
}
function GetU16(dataarray, index) {
  const value = ReadUnsignedInt16(dataarray.slice(index, index + 1));
  return value;
}

function GetU32(dataarray, index) {
  const value = ReadUnsignedInt32(dataarray.slice(index, index + 2));
  return value;
}

function GetI16(dataarray, index) {
  const value = ReadSignedInt16(dataarray.slice(index, index + 1));
  return value;
}

function GetI32(dataarray, index) {
  const value = ReadSignedInt32(dataarray.slice(index, index + 2));
  return value;
}

function GetString(dataarray, index, length) {
  const shortarray = dataarray.slice(index, index + length);
  const bytearray = [];
  for (let i = 0; i < length; i++) {
    bytearray.push(dataarray[index + i] >> 8);
    bytearray.push(dataarray[index + i] & 0xff);
  }
  const value = String.fromCharCode.apply(null, bytearray);
  return value;
}

function GetZeroTerminatedString(dataarray, index, length) {
  const shortarray = dataarray.slice(index, index + length);
  const bytearray = [];
  for (let i = 0; i < length; i++) {
    bytearray.push(dataarray[index + i] >> 8);
    bytearray.push(dataarray[index + i] & 0xff);
  }
  const value = String.fromCharCode.apply(null, bytearray);
  const value2 = new String(value).trim();
  return value2;
}

// Funktion zum Herstellen einer Modbus-Verbindung
function ConnectModbus() {
  console.log(`Init connection to: ${modbusHost}:${modbusPort}`);
  // set requests parameters
  client.setTimeout(10000);
  // try to connect
  client
    .connectTCP(modbusHost, { port: modbusPort })
    .then(() => {
      console.log('Connected, wait for reading...');
    })
    .catch((e) => {
      console.log(e);
    });
}

// Funktion zum Anlegen und Beschreiben eines Datenpunkts
function ForceSetState(objectname, value, options) {
  if (!existsState(`javascript.0.${objectname}`)) createState(objectname, value, options);
  else setState(objectname, value);
}
// ---------------------------------------------------------------
// Functions to map registers into ioBreaker objects:
function ProcessPowerMeterStatus() {
  ForceSetState('Solarpower.Huawei.Meter.Status', GetU16(globalDataBuffer[powerMeterID], 37100), { name: '', unit: '' });
  ForceSetState('Solarpower.Huawei.Meter.VoltageL1', GetI32(globalDataBuffer[powerMeterID], 37101) / 10, { name: '', unit: 'V' });
  ForceSetState('Solarpower.Huawei.Meter.VoltageL2', GetI32(globalDataBuffer[powerMeterID], 37103) / 10, { name: '', unit: 'V' });
  ForceSetState('Solarpower.Huawei.Meter.VoltageL3', GetI32(globalDataBuffer[powerMeterID], 37105) / 10, { name: '', unit: 'V' });
  ForceSetState('Solarpower.Huawei.Meter.CurrentL1', GetI32(globalDataBuffer[powerMeterID], 37107) / 100, { name: '', unit: 'A' });
  ForceSetState('Solarpower.Huawei.Meter.CurrentL2', GetI32(globalDataBuffer[powerMeterID], 37109) / 100, { name: '', unit: 'A' });
  ForceSetState('Solarpower.Huawei.Meter.CurrentL3', GetI32(globalDataBuffer[powerMeterID], 37111) / 100, { name: '', unit: 'A' });
  ForceSetState('Solarpower.Huawei.Meter.ActivePower', GetI32(globalDataBuffer[powerMeterID], 37113) / 1, { name: '', unit: 'W' });
  ForceSetState('Solarpower.Huawei.Meter.ReactivePower', GetI32(globalDataBuffer[powerMeterID], 37115) / 1, { name: '', unit: 'Var' });
  ForceSetState('Solarpower.Huawei.Meter.PowerFactor', GetI16(globalDataBuffer[powerMeterID], 37117) / 1000, { name: '', unit: '' });
  ForceSetState('Solarpower.Huawei.Meter.GridFrequency', GetI16(globalDataBuffer[powerMeterID], 37118) / 100, { name: '', unit: 'Hz' });
  ForceSetState('Solarpower.Huawei.Meter.PositiveActiveEnergy', GetI32(globalDataBuffer[powerMeterID], 37119) / 100, { name: '', unit: 'kWh' });
  ForceSetState('Solarpower.Huawei.Meter.ReverseActiveEnergy', GetI32(globalDataBuffer[powerMeterID], 37121) / 100, { name: '', unit: 'kWh' });
  ForceSetState('Solarpower.Huawei.Meter.AccumulatedReactivePower', GetI32(globalDataBuffer[powerMeterID], 37123) / 100, { name: '', unit: 'kVarh' });
  // ForceSetState("Solarpower.Huawei.Meter.MeterType",                  GetU16(globalDataBuffer[powerMeterID], 37125),          {name: "", unit: ""});
  ForceSetState('Solarpower.Huawei.Meter.VoltageL1-L2', GetI32(globalDataBuffer[powerMeterID], 37126) / 10, { name: '', unit: 'V' });
  ForceSetState('Solarpower.Huawei.Meter.VoltageL2-L3', GetI32(globalDataBuffer[powerMeterID], 37128) / 10, { name: '', unit: 'V' });
  ForceSetState('Solarpower.Huawei.Meter.VoltageL3-L1', GetI32(globalDataBuffer[powerMeterID], 37130) / 10, { name: '', unit: 'V' });
  ForceSetState('Solarpower.Huawei.Meter.ActivePowerL1', GetI32(globalDataBuffer[powerMeterID], 37132) / 1, { name: '', unit: 'W' });
  ForceSetState('Solarpower.Huawei.Meter.ActivePowerL2', GetI32(globalDataBuffer[powerMeterID], 37134) / 1, { name: '', unit: 'W' });
  ForceSetState('Solarpower.Huawei.Meter.ActivePowerL3', GetI32(globalDataBuffer[powerMeterID], 37136) / 1, { name: '', unit: 'W' });
  // ForceSetState("Solarpower.Huawei.Meter.MeterModel",                 GetU16(globalDataBuffer[powerMeterID], 37138),          {name: "", unit: ""});
}

function ProcessInverterStatus(id) {
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.State1`, GetU16(globalDataBuffer[id - 1], 32000), { name: '', unit: '' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.State2`, GetU16(globalDataBuffer[id - 1], 32002), { name: '', unit: '' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.State3`, GetU32(globalDataBuffer[id - 1], 32003), { name: '', unit: '' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.Alarm1`, GetU16(globalDataBuffer[id - 1], 32008), { name: '', unit: '' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.Alarm2`, GetU16(globalDataBuffer[id - 1], 32009), { name: '', unit: '' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.Alarm3`, GetU16(globalDataBuffer[id - 1], 32010), { name: '', unit: '' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.String.1_Voltage`, GetI16(globalDataBuffer[id - 1], 32016) / 10, { name: '', unit: 'V' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.String.1_Current`, GetI16(globalDataBuffer[id - 1], 32017) / 100, { name: '', unit: 'A' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.String.2_Voltage`, GetI16(globalDataBuffer[id - 1], 32018) / 10, { name: '', unit: 'V' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.String.2_Current`, GetI16(globalDataBuffer[id - 1], 32019) / 100, { name: '', unit: 'A' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.String.3_Voltage`, GetI16(globalDataBuffer[id - 1], 32020) / 10, { name: '', unit: 'V' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.String.3_Current`, GetI16(globalDataBuffer[id - 1], 32021) / 100, { name: '', unit: 'A' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.String.4_Voltage`, GetI16(globalDataBuffer[id - 1], 32022) / 10, { name: '', unit: 'V' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.String.4_Current`, GetI16(globalDataBuffer[id - 1], 32023) / 100, { name: '', unit: 'A' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.InputPower`, GetI32(globalDataBuffer[id - 1], 32064) / 1000, { name: '', unit: 'kW' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.Grid.L1-L2_Voltage`, GetU16(globalDataBuffer[id - 1], 32066) / 10, { name: '', unit: 'V' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.Grid.L2-L3_Voltage`, GetU16(globalDataBuffer[id - 1], 32067) / 10, { name: '', unit: 'V' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.Grid.L3-L1_Voltage`, GetU16(globalDataBuffer[id - 1], 32068) / 10, { name: '', unit: 'V' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.Grid.L1_Voltage`, GetU16(globalDataBuffer[id - 1], 32069) / 10, { name: '', unit: 'V' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.Grid.L2_Voltage`, GetU16(globalDataBuffer[id - 1], 32070) / 10, { name: '', unit: 'V' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.Grid.L3_Voltage`, GetU16(globalDataBuffer[id - 1], 32071) / 10, { name: '', unit: 'V' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.Grid.L1_Current`, GetI32(globalDataBuffer[id - 1], 32072) / 1000, { name: '', unit: 'A' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.Grid.L2_Current`, GetI32(globalDataBuffer[id - 1], 32074) / 1000, { name: '', unit: 'A' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.Grid.L3_Current`, GetI32(globalDataBuffer[id - 1], 32076) / 1000, { name: '', unit: 'A' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.PeakActivePowerDay`, GetI32(globalDataBuffer[id - 1], 32078) / 1000, { name: '', unit: 'kW' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.ActivePower`, GetI32(globalDataBuffer[id - 1], 32080) / 1000, { name: '', unit: 'kW' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.ReactivePower`, GetI32(globalDataBuffer[id - 1], 32082) / 1000, { name: '', unit: 'kVar' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.PowerFactor`, GetI16(globalDataBuffer[id - 1], 32084) / 1000, { name: '', unit: '' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.GridFrequency`, GetU16(globalDataBuffer[id - 1], 32085) / 100, { name: '', unit: 'Hz' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.Efficiency`, GetU16(globalDataBuffer[id - 1], 32086) / 100, { name: '', unit: '%' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.InternalTemperature`, GetI16(globalDataBuffer[id - 1], 32087) / 10, { name: '', unit: '°C' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.InsulationResistance`, GetU16(globalDataBuffer[id - 1], 32088) / 1000, { name: '', unit: 'MOhm' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.DeviceStatus`, GetU16(globalDataBuffer[id - 1], 32089), { name: '', unit: '' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.FaultCode`, GetU16(globalDataBuffer[id - 1], 32090), { name: '', unit: '' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.StartupTime`, String(new Date(GetU32(globalDataBuffer[id - 1], 32091) * 1000)), { name: '', unit: '' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.ShutdownTime`, String(new Date(GetU32(globalDataBuffer[id - 1], 32093) * 1000)), { name: '', unit: '' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.AccomulatedEnergyYield`, GetU32(globalDataBuffer[id - 1], 32106), { name: '', unit: 'kWh' });
  ForceSetState(`Solarpower.Huawei.Inverter.${id}.DailyEnergyYield`, GetU32(globalDataBuffer[id - 1], 32114), { name: '', unit: 'kWh' });
}

function ReadRegisterSpace(id, address, length) {
  client.setID(modbusID[id - 1]);
  client.readHoldingRegisters(address, length, (err, data) => {
    if (err) {
      console.warn(`Error received reading address ${address} from id: ${modbusID[id - 1]} with error: ${modbusErrorMessages[err.modbusCode]}`);
    } else {
      console.debug(`Read data from id/address ${modbusID[id - 1]}/${address}\nData is: ${data.data}`);
      for (let i = 0; i < length; i++) {
        globalDataBuffer[id - 1][address + i] = data.data[i];
      }
    }
  });
}

function ProcessData() {
  // console.log("Processing new data...");
  for (let i = 1; i <= modbusID.length; i++) {
    // ProcessDeviceInfo(i);
    ProcessInverterStatus(i);
    // processBattery(i);
    // processInverterPowerAdjustments(i);
    // processOptimizers(i);
  }
  ProcessPowerMeterStatus();
  // console.log("Processing done!");
}

// -------------------------------------------------------------------
// This is the main function triggering a  read via modbus-tcp every two seconds.
// Processing of data is triggered as soon as one complete set of registers is copied.
let triggerprocessing = 0;
let currentinverter = 1;

setInterval(() => {
  if (!client.isOpen) {
    ConnectModbus();
  }
  if (triggerprocessing == 1) {
    triggerprocessing = 0;
    ProcessData();
  }

  // console.log("Triggering read of inverter " + currentinverter + " at address " + registerSpacesToReadContinuously[registerSpacesToReadContinuouslyPtr][0] + " with length " +  registerSpacesToReadContinuously[registerSpacesToReadContinuouslyPtr][1]);
  ReadRegisterSpace(
    currentinverter,
    registerSpacesToReadContinuously[registerSpacesToReadContinuouslyPtr][0],
    registerSpacesToReadContinuously[registerSpacesToReadContinuouslyPtr][1],
  );
  registerSpacesToReadContinuouslyPtr++;
  if (registerSpacesToReadContinuouslyPtr >= registerSpacesToReadContinuously.length) {
    registerSpacesToReadContinuouslyPtr = 0;
    currentinverter++;
    if (currentinverter > modbusID.length) {
      currentinverter = 1;
      triggerprocessing = 1;
    }
  }
}, 3000);
