console.log('-------------------');

const modbus = require('jsmodbus');
const net = require('net');
const socket = new net.Socket();

let options = {
  host: '11.13.11.154',
  port: 502,
  timeout: 26,
  autoReconnect: false,
  reconnectTimeout: 7,
  logLabel: 'huawei Inverter',
  logLevel: 'error',
  logEnabled: true,
};

const client = new modbus.client.TCP(socket, 1, 5000);
const client2 = new modbus.client.TCP(socket, 3, 5000);

const clients = [client, client2];

socket.setKeepAlive(true);
socket.connect(options);

socket.on('connect', () => {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  sleep(5000).then(async () => {
    console.log('Connected ...');

    registers = {
      inputPower: [32064, 2, 'INT32', 'Input Power', 0], //	kW	1000

      // rn.GRID_VOLTAGE: U16Register("V", 10, 32066, 1),
      GRID_VOLTAGE: [32066, 1, 'UINT16', 'GRID VOLTAGE', -1],
      // rn.PHASE_A_VOLTAGE: U16Register("V", 10, 32069, 1),
      PHASE_A_VOLTAGE: [32069, 1, 'UINT16', 'GRID PHASE_A_VOLTAGE', -1],
      // rn.PHASE_B_VOLTAGE: U16Register("V", 10, 32070, 1),
      PHASE_B_VOLTAGE: [32070, 1, 'UINT16', 'GRID PHASE_B_VOLTAGE', -1],
      // rn.PHASE_C_VOLTAGE: U16Register("V", 10, 32071, 1),
      PHASE_C_VOLTAGE: [32071, 1, 'UINT16', 'GRID PHASE_C_VOLTAGE', -1],

      // rn.PHASE_A_CURRENT: I32Register("A", 1000, 32072, 2),
      PHASE_A_CURRENT: [32072, 2, 'INT32', 'GRID PHASE_A_CURRENT', -3],
      // rn.PHASE_B_CURRENT: I32Register("A", 1000, 32074, 2),
      PHASE_B_CURRENT: [32074, 2, 'INT32', 'GRID PHASE_B_CURRENT', -3],
      // rn.PHASE_C_CURRENT: I32Register("A", 1000, 32076, 2),
      PHASE_C_CURRENT: [32076, 2, 'INT32', 'GRID PHASE_C_CURRENT', -3],

      // rn.ACCUMULATED_YIELD_ENERGY: U32Register("kWh", 100, 32106, 2),
      ACCUMULATED_YIELD_ENERGY: [32106, 2, 'UINT32', 'ACCUMULATED YIELD ENERGY', -2],
      // rn.DAY_ACTIVE_POWER_PEAK: I32Register("W", 1, 32078, 2),
      // "DAY_ACTIVE_POWER_PEAK": [32078, 2, 'INT32', "DAY_ACTIVE_POWER_PEAK", 0],

      // rn.ACTIVE_POWER: I32Register("W", 1, 32080, 2),
      ACTIVE_POWER: [32080, 2, 'INT32', 'ACTIVE_POWER', 0],
      // rn.GRID_FREQUENCY: U16Register("Hz", 100, 32085, 1),
      // "GRID_FREQUENCY": [32085, 1, 'UINT16', "GRID_FREQUENCY", -2],
      // rn.INTERNAL_TEMPERATURE: I16Register("°C", 10, 32087, 1),
      INTERNAL_TEMPERATURE: [32087, 1, 'INT16', 'INTERNAL_TEMPERATURE', -1],

      // rn.DEVICE_STATUS: U16Register(rv.DEVICE_STATUS_DEFINITIONS, 1, 32089, 1),
      DEVICE_STATUS: [32089, 1, 'UINT16', 'DEVICE_STATUS', 0],
      // rn.DAILY_YIELD_ENERGY: U32Register("kWh", 100, 32114, 2),
      DAILY_YIELD_ENERGY: [32114, 2, 'UINT32', 'DAILY_YIELD_ENERGY', -2],

      // Electricity generated in current month
      // U 32
      // kWh
      // 100
      // 32116
      // 2

      // Electricity generated in the current year
      // U 32
      // kWh
      // 100
      // 32118
      // 2

      // rn.MODEL_NAME: StringRegister(30000, 15),
      modelName: [30000, 15, 'STRING', 'Model Name', 0],
      // rn.MODEL_ID: U16Register(None, 1, 30070, 1),
      // "modelId": [30070, 1, 'UINT16', "Model ID", 0],

      // "Number of PV strings"	RO	U16	N/A	1	30071	1
      // "TotalPVstrings": [30071, 1, 'UINT16', "Number of PV strings", 0],
      // PV1 voltage	RO	I16	V	10	32016
      PV1voltage: [32016, 1, 'INT16', 'PV1 voltage', -1],
      // PV1 current	RO	I16	A	100	32017
      PV1current: [32017, 1, 'INT16', 'PV1 current', -2],
      // PV2 voltage	RO	I16	V	10	32018
      PV2voltage: [32018, 1, 'INT16', 'PV2 voltage', -1],
      // PV2 current	RO	I16	A	100	32019
      PV2current: [32019, 1, 'INT16', 'PV2 current', -2],
    };

    registers_batt = {
      inputPower: [32064, 2, 'INT32', 'Input Power', 0], //	kW	1000

      // rn.GRID_VOLTAGE: U16Register("V", 10, 32066, 1),
      GRID_VOLTAGE: [32066, 1, 'UINT16', 'GRID VOLTAGE', -1],
      // rn.PHASE_A_VOLTAGE: U16Register("V", 10, 32069, 1),
      PHASE_A_VOLTAGE: [32069, 1, 'UINT16', 'GRID PHASE_A_VOLTAGE', -1],
      // rn.PHASE_B_VOLTAGE: U16Register("V", 10, 32070, 1),
      PHASE_B_VOLTAGE: [32070, 1, 'UINT16', 'GRID PHASE_B_VOLTAGE', -1],
      // rn.PHASE_C_VOLTAGE: U16Register("V", 10, 32071, 1),
      PHASE_C_VOLTAGE: [32071, 1, 'UINT16', 'GRID PHASE_C_VOLTAGE', -1],

      // rn.PHASE_A_CURRENT: I32Register("A", 1000, 32072, 2),
      PHASE_A_CURRENT: [32072, 2, 'INT32', 'GRID PHASE_A_CURRENT', -3],
      // rn.PHASE_B_CURRENT: I32Register("A", 1000, 32074, 2),
      PHASE_B_CURRENT: [32074, 2, 'INT32', 'GRID PHASE_B_CURRENT', -3],
      // rn.PHASE_C_CURRENT: I32Register("A", 1000, 32076, 2),
      PHASE_C_CURRENT: [32076, 2, 'INT32', 'GRID PHASE_C_CURRENT', -3],

      // rn.ACCUMULATED_YIELD_ENERGY: U32Register("kWh", 100, 32106, 2),
      ACCUMULATED_YIELD_ENERGY: [32106, 2, 'UINT32', 'ACCUMULATED YIELD ENERGY', -2],
      // rn.DAY_ACTIVE_POWER_PEAK: I32Register("W", 1, 32078, 2),
      // "DAY_ACTIVE_POWER_PEAK": [32078, 2, 'INT32', "DAY_ACTIVE_POWER_PEAK", 0],

      // rn.ACTIVE_POWER: I32Register("W", 1, 32080, 2),
      ACTIVE_POWER: [32080, 2, 'INT32', 'ACTIVE_POWER', 0],
      // rn.GRID_FREQUENCY: U16Register("Hz", 100, 32085, 1),
      // "GRID_FREQUENCY": [32085, 1, 'UINT16', "GRID_FREQUENCY", -2],
      // rn.INTERNAL_TEMPERATURE: I16Register("°C", 10, 32087, 1),
      INTERNAL_TEMPERATURE: [32087, 1, 'INT16', 'INTERNAL_TEMPERATURE', -1],

      // rn.DEVICE_STATUS: U16Register(rv.DEVICE_STATUS_DEFINITIONS, 1, 32089, 1),
      DEVICE_STATUS: [32089, 1, 'UINT16', 'DEVICE_STATUS', 0],
      // rn.DAILY_YIELD_ENERGY: U32Register("kWh", 100, 32114, 2),
      DAILY_YIELD_ENERGY: [32114, 2, 'UINT32', 'DAILY_YIELD_ENERGY', -2],

      // Electricity generated in current month
      // U 32
      // kWh
      // 100
      // 32116
      // 2

      // Electricity generated in the current year
      // U 32
      // kWh
      // 100
      // 32118
      // 2

      // rn.MODEL_NAME: StringRegister(30000, 15),
      modelName: [30000, 15, 'STRING', 'Model Name', 0],
      // rn.MODEL_ID: U16Register(None, 1, 30070, 1),
      // "modelId": [30070, 1, 'UINT16', "Model ID", 0],

      // "Number of PV strings"	RO	U16	N/A	1	30071	1
      // "TotalPVstrings": [30071, 1, 'UINT16', "Number of PV strings", 0],
      // PV1 voltage	RO	I16	V	10	32016
      PV1voltage: [32016, 1, 'INT16', 'PV1 voltage', -1],
      // PV1 current	RO	I16	A	100	32017
      PV1current: [32017, 1, 'INT16', 'PV1 current', -2],
      // PV2 voltage	RO	I16	V	10	32018
      PV2voltage: [32018, 1, 'INT16', 'PV2 voltage', -1],
      // PV2 current	RO	I16	A	100	32019
      PV2current: [32019, 1, 'INT16', 'PV2 current', -2],

      STORAGE_CHARGE_DISCHARGE_POWER: [37765, 2, 'INT32', 'CHARGE_DISCHARGE POWER', 0],
      STORAGE_STATE_OF_CAPACITY: [37760, 1, 'UINT16', 'STORAGE_STATE_OF_CAPACITY', -1],
    };

    for (const x in clients) {
      let wait = 10000;
      if (x == 0) {
        wait = 1000;
      }
      await sleep(wait).then(async () => {
        console.log('unitId: ' + clients[x].unitId);
        let register = registers;
        if (x == 1) {
          register = registers_batt;
        }
        for (const [key, value] of Object.entries(register)) {
          await sleep(1000).then(() => {
            // console.log(key, value);
            // start normale poll
            // console.log("slaveId: " + clients[x].slaveId);
            // console.log("unitId: " + clients[x].unitId);

            clients[x]
              .readHoldingRegisters(value[0], value[1])
              .then(function (resp) {
                // console.log(resp.response._body);
                if (value[2] == 'UINT16') {
                  console.log(value[3] + ': ' + resp.response._body._valuesAsBuffer.readUInt16BE());
                } else if (value[2] == 'STRING') {
                  console.log(value[3] + ': ' + Buffer.from(resp.response._body._valuesAsBuffer, 'hex').toString());
                } else if (value[2] == 'INT16' || value[2] == 'SCALE') {
                  console.log(value[3] + ': ' + resp.response._body._valuesAsBuffer.readInt16BE());
                } else if (value[2] == 'UINT32') {
                  // response.body.valuesAsBuffer.readUInt32BE().toString();
                  console.log(value[3] + ': ' + resp.response._body._valuesAsBuffer.readUInt32BE());
                  // console.log(value[3] + ": " + (resp.response._body._valuesAsArray[1] << 16 | resp.response._body._valuesAsArray[0]))
                  //   console.log(resp.response._body._valuesAsArray[1] << 16)
                  //  console.log(resp.response._body._valuesAsArray[0])
                } else if (value[2] == 'INT32') {
                  console.log(value[3] + ': ' + resp.response._body._valuesAsBuffer.readInt32BE());
                  // console.log(value[3] + ": " + ((resp.response._body._valuesAsArray[1] << 16 | resp.response._body._valuesAsArray[0]) | 0));
                  // console.log(resp.response._body._valuesAsArray[1] << 16)
                  // console.log(resp.response._body._valuesAsArray[0])
                } else {
                  console.log(key + ': type not found ' + value[2]);
                }
                // console.log(new Date());
              })
              .catch((err) => {
                console.log(err);
              });
          });
        }
      });
    }

    delay(function () {
      socket.end();
    }, 25000);
  });
});

var delay = (function () {
  var timer = 0;
  return function (callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();

//avoid all the crash reports
socket.on('error', (err) => {
  console.log(err);
  socket.end();
});
