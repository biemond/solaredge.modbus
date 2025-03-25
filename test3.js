console.log('-------------------');

const modbus = require('jsmodbus');
const net = require('net');
const socket = new net.Socket();

let options = {
  host: '192.168.50.252',
  port: 502,
  unitId: 1,
  timeout: 500,
  autoReconnect: true,
  reconnectTimeout: 62,
  logLabel: 'wattsonic Inverter',
  logLevel: 'error',
  logEnabled: true,
};

let client = new modbus.client.TCP(socket, 1, 500);

socket.connect(options);

socket.on('connect', () => {
  var delay = (function () {
    var timer = 0;
    return function (callback, ms) {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  })();

  console.log('Connected ...');

  registers = {
    SN: [10000, 8, 'STRING', 'Inverter SN'],
    Firmware: [10011, 2, 'UINT32', 'Firmware Version'],
    Inverter_Running_Status: [10105, 1, 'UINT16', 'Inverter_Running_Status'],
    Equipment: [10008, 1, 'BYTE', 'Equipment Info'],

    // "power_meter":              [11000, 2, 'INT32', "Total Power on Meter"],
    // "grid_inject_meter":        [11002, 2, 'UINT32', "Total Grid-Injection Energy on Meter"],
    // "purchase_gird_meter":      [11004, 2, 'UINT32', "Total Purchasing Energy from Grid on Meter"],

    phasea_power: [10994, 2, 'INT32', 'Phase A power'],
    phaseb_power: [10996, 2, 'INT32', 'Phase B power'],
    phasec_power: [10998, 2, 'INT32', 'Phase C power'],

    // "phasea_power_meter":             [25105, 2, 'INT32', "Phase A power_meter"],
    // "phaseb_power_meter":             [25107, 2, 'INT32', "Phase B power_meter"],
    // "phasec_power_meter":             [25109, 2, 'INT32', "Phase C power_meter"],

    // "phasea_current":           [11010, 1, 'UINT16', "Phase A Current"],
    // "phaseb_current":           [11012, 1, 'UINT16', "Phase B Current"],
    // "phasec_current":           [11014, 1, 'UINT16', "Phase C Current"],

    // "phasea_voltage":           [11009, 1, 'UINT16', "Phase A Voltage"],
    // "phaseb_voltage":           [11011, 1, 'UINT16', "Phase B Voltage"],
    // "phasec_voltage":           [11013, 1, 'UINT16', "Phase C Voltage"],

    // "battery_voltage":           [30254, 1, 'UINT16', "Battery DC Voltage"],
    // "battery_current":           [30255, 1, 'INT16',  "Battery DC Current"],
    // "battery_mode":              [30256, 1, 'UINT16', "Battery mode"],
    // "battery_power":             [30258, 2, 'INT32',  "Battery power"],

    // "GridInjectionEnergyday[":    [31000, 1, 'UINT16', "Grid Injection Energy on that day"],
    // "GridPurchasingEnergyday":    [31001, 1, 'UINT16', "Grid Purchasing Energy on that day"],
    // "BackupOutputEnergyday":     [31002, 1, 'UINT16', "Backup Output Energy day"],
    // "BatteryChargeEnergyday":    [31003, 1, 'UINT16', "Battery Charge Energy day"],
    // "BatteryDischargeEnergyday": [31004, 1, 'UINT16', "Battery Discharge Energy day"],
    // "PVGenerationEnergyday":     [31005, 1, 'UINT16', "PV Generation Energy day"],
    // "LoadingEnergyday":          [31006, 1, 'UINT16', "Loading Energy day"],
    // "EnergyPurchasedfromGridday":   [31008, 1, 'UINT16', "Energy Purchased from Grid day"],
    TotalEnergyinjectedtogrid: [31102, 2, 'UINT32', 'Total Energy injected to grid'],
    TotalEnergyPurchasedfromGrid: [31104, 2, 'UINT32', 'Total Energy Purchased from Grid from Meter'],

    // "TemperatureSensor1":           [11032, 1, 'INT16',  "Temperature Sensor 1"],
    // "TemperatureSensor2":           [11033, 1, 'INT16',  "Temperature Sensor 2"],
    // "TemperatureSensor3":           [11034, 1, 'INT16',  "Temperature Sensor 3"],
    // "TemperatureSensor4":           [11035, 1, 'INT16',  "Temperature Sensor 4"],

    // "TotalPVGenerationday":              [11018, 2, 'UINT32', "Total PV Generation on that day"],
    // "TotalPVGenerationInstallation":     [11020, 2, 'UINT32', "Total PV Generation from Installation"],
    // "TotalPVGenerationTimeInstallation": [11022, 2, 'UINT32', "Total PV Generation Time from Installation"],
    // "PVInputTotalPower":                 [11028, 2, 'UINT32', "PV Input Total Power"],

    // "PV1InputPower":                 [11028, 2, 'UINT32', "PV1 Input Power"],
    // "PV2InputPower":                 [11028, 2, 'UINT32', "PV2 Input Power"],

    BMSChargeImax: [32005, 1, 'UINT16', 'BMS Charge Imax'],
    BMSDischargeImax: [32006, 1, 'UINT16', 'BMS Discharge Imax'],

    SOC: [33000, 1, 'UINT16', 'SOC'],
    SOH: [33001, 1, 'UINT16', 'SOH'],

    error: [10112, 2, 'UINT32', 'Error'],
    error2: [10114, 2, 'UINT32', 'Error2'],
    error3: [10120, 2, 'UINT32', 'Error3'],

    // "BMSStatus":           [33002, 1, 'UINT16', "BMS Status"],
    BMSPackTemperature: [33003, 1, 'UINT16', 'BMS Pack Temperature'],

    // "MaxCellVoltage":      [33013, 1, 'UINT16', "Max Cell Voltage"],
    // "MinCellVoltage":      [33015, 1, 'UINT16', "Min Cell Voltage"],

    // "BMSERRORCODE": [33016, 2, 'UINT32', "BMS ERROR CODE"],
    // "BMSWARNCODE":  [33018, 2, 'UINT32', "BMS WARN CODE"],

    // "BMSERRORCODE2": [53509, 2, 'UINT32', "BMS ERROR CODE 2"],
    // "BMSPROTECTIONCODE2": [53509, 2, 'UINT32', "BMS Protection CODE 2"],
    // "BMSALARMCODE":  [53513, 2, 'UINT32', "BMS ALARM CODE"],

    // "BMScontrol":  [53508, 1, 'BYTE', "BMS Control"],

    // "TotalACPower":  [50203, 1, 'INT16', "Total AC Power Setting"],

    HybridInverterWorkingMode: [50000, 1, 'BYTE', 'Hybrid Inverter Working Mode Setting'],

    'Battery Power Setting': [50207, 1, 'INT16', 'Battery Power Setting'],
    //	50207	1	Battery Power Setting	I16	kW	100
    'Max. AC Power Limit Setting': [50207, 1, 'INT16', 'Max. AC Power Limit Setting'],
    //	50208	1	Max. AC Power Limit Setting	I16	kW	100
    'Min. AC Power Limit Setting': [50209, 1, 'INT16', 'Min. AC Power Limit Setting'],
    //	50209	1	Min. AC Power Limit Setting	I16	kW	100
    PriorityPowerOutput: [50210, 1, 'UINT16', 'Priority Power Output Setting'],
    //	50210	1	Priority Power Output Setting	U16	NA	1	0：PV Output Priority 1：Battery Output Priority
    // "PV Power Setting":  [50211, 1, 'UINT16', "PV Power Setting"],
    //	50211	1	PV Power Setting	U16	kW	100

    scheduledChargeDischarge: [53006, 1, 'BITS', 'Scheduled Charge & Discharge'],
    // // 53006	1	Scheduled Charge&Discharge	U16	N/A	1	bit0- bit5 stands for period1-period6,
    // // bit7-bit15 Reserved;
    // // 0: disable
    // // 1: enable

    'period1Charge/Discharge': [53007, 1, 'UINT16', 'Period 1 Charge/Discharge Setting'],
    // // 35	53007	1	Charge/Discharge Setting	U16	N/A	1	Period1:
    // // 0:NONE
    // // 1:charge
    // // 2:discharge

    'Battery Charge By': [53008, 1, 'UINT16', 'Battery Charge By'],

    period1StartTime: [53012, 1, 'BYTE', 'Period 1 Start Time'],
    // // // 53012	1	Start Time	U16	N/A	1	Period1:
    // // // High 8bits(Hour):[0,23]
    // // // Low 8bits(Mins):[0,59]

    // "period6StartTime":  [53047, 1, 'BYTE', "Period 2 Start Time"],
  };

  for (const [key, value] of Object.entries(registers)) {
    // console.log(key, value);
    // start normale poll

    client
      .readHoldingRegisters(value[0], value[1])
      .then(function (resp) {
        // console.log(resp.response._body);
        if (value[2] == 'UINT16') {
          console.log(value[3] + ': ' + resp.response._body._valuesAsBuffer.readUInt16BE());
        } else if (value[2] == 'BYTE') {
          var value2 = resp.response._body._valuesAsBuffer.readUInt16BE();
          let lowVal = value2 & 0xff;
          let highval = (value2 >> 8) & 0xff;
          console.log(value[3] + ': ' + highval + ' ' + lowVal);
        } else if (value[2] == 'BITS') {
          var value2 = resp.response._body._valuesAsBuffer.readUInt16BE();
          let lowVal = value2 & 0xff;
          let highval = (value2 >> 8) & 0xff;

          console.log(value[3] + ': ' + lowVal);
        } else if (value[2] == 'UINT32') {
          console.log(value[3] + ': ' + resp.response._body._valuesAsBuffer.readUInt32BE());
        } else if (value[2] == 'ACC32') {
          console.log(value[3] + ': ' + resp.response._body._valuesAsBuffer.readUInt32BE());
        } else if (value[2] == 'FLOAT') {
          console.log(value[3] + ': ' + resp.response._body._valuesAsBuffer.readFloatBE());
        } else if (value[2] == 'STRING') {
          console.log(value[3] + ': ' + Buffer.from(resp.response._body._valuesAsBuffer, 'hex').toString());
        } else if (value[2] == 'INT16' || value[2] == 'SCALE') {
          console.log(value[3] + ': ' + resp.response._body._valuesAsBuffer.readInt16BE());
        } else if (value[2] == 'INT32') {
          console.log(value[3] + ': ' + resp.response._body._valuesAsBuffer.readInt32BE());
        } else if (value[2] == 'FLOAT32') {
          console.log(value[3] + ': ' + Buffer.from(resp.response._body._valuesAsBuffer, 'hex').swap16().swap32().readFloatBE());
        } else {
          console.log(key + ': type not found ' + value[2]);
        }
      })
      .catch((err) => {
        console.log(key);
        console.log(err);
      });
  }

  delay(function () {
    socket.end();
  }, 20000);
});

//avoid all the crash reports
socket.on('error', (err) => {
  console.log(err);
  socket.end();
});
