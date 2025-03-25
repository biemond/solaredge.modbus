console.log('-------------------');

const modbus = require('jsmodbus');
const net = require('net');

const socket = new net.Socket();

const options = {
  host: '192.168.0.59',
  port: 502,
  unitId: 0,
  timeout: 26,
  autoReconnect: false,
  reconnectTimeout: 7,
  logLabel: 'emma Inverter',
  logLevel: 'error',
  logEnabled: true,
};

const client = new modbus.client.TCP(socket, 0, 1000);
socket.setKeepAlive(false);
socket.connect(options);

socket.on('connect', () => {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  sleep(2500).then(() => {
    console.log('Connected ...');

    registers = {
      // "offering_name": [30000, 16, 'STRING', "Offering Name", 0],
      sn: [30015, 10, 'STRING', 'sn', 0],
      software_version: [30035, 15, 'STRING', 'software version', 0],

      // Model  RO STR N/A N/A 30222 20
      model: [30222, 20, 'STRING', 'Model Name', 0],
      // Energy charged today RO U32 kWh 100 30306  2
      energy_charged_today: [30306, 2, 'UINT32', 'Energy charged today', -2],
      energy_discharged_today: [30312, 2, 'UINT32', 'Energy discharged today', -2],
      consumption_today: [30324, 2, 'UINT32', 'Consumption today', -2],
      feedin_to_grid_today: [30330, 2, 'UINT32', 'Feed-in to grid today', -2],

      supply_from_grid_today: [30336, 2, 'UINT32', 'Supply from grid today', -2],
      supply_from_grid_today: [30336, 2, 'UINT32', 'Supply from grid today', -2],
      inverter_energy_yield_today: [30342, 2, 'UINT32', 'Inverter energy yield today', -2],

      pv_yield_today: [30346, 2, 'UINT32', 'PV yield today', -2],
      total_pv_energy_yield: [30348, 4, 'UINT64', 'Total PV energy yield', -2],

      pv_output_power: [30354, 2, 'UINT32', 'PV output power', -3],
      load_power: [30356, 2, 'UINT32', 'Load power', -3],
      feedin_power: [30358, 2, 'UINT32', 'Feed-in power', -3],
      battery_charge_discharge_power: [30360, 2, 'INT32', 'Battery charge/ discharge power', -3],
      inverter_rated_power: [30362, 2, 'UINT32', 'Inverter rated power', -3],
      inverter_active_power: [30364, 2, 'INT32', 'Inverter active power', -3],

      // SOC RO U16 % 100  30368  1
      soc: [30368, 1, 'UINT16', 'soc', -2],

      // Yield this month  RO U32 kWh 100 30380 2
      yield_this_month: [30380, 2, 'UINT32', 'Yield this month', -2],

      // Local time RO U32 31003 2
      time: [31003, 2, 'UINT32', 'local time', 0],

      // Battery control ESS control mode RW ENUM16 40000 1
      // 1: reserved
      // 2: maximum self-consumption
      // 3: reserved
      // 4: fully fed to grid
      // 5: time of use
      // 6: Third- party dispatch
      battery_control: [40000, 1, 'INT16', 'Battery control ESS control mode', 0],
      preferred_use_of_surplus_PV: [40001, 1, 'INT16', '[Time of Use mode] Preferred use of surplus PV power', 0],
      maximum_power_for_charging_from_grid: [40002, 2, 'UINT32', '[Time of Use mode] Maximum power for charging batteries from grid', -3],
      power_control_mode_at_grid: [40100, 1, 'INT16', 'Power control mode at grid connection', 0],
      power_control_mode_at_grid: [40101, 1, 'INT16', 'Limitation mode', 0],
      maximum_grid_feedin_power: [40107, 2, 'INT32', 'Maximum grid feed-in power (kW)', -3],
      pv_output_power: [40109, 1, 'UINT16', 'Maximum grid feed-in power (%)', -1],

      phase_a_voltage: [31639, 2, 'UINT32', 'Phase A voltage', -2],
      phase_b_voltage: [31641, 2, 'UINT32', 'Phase B voltage', -2],
      phase_c_voltage: [31643, 2, 'UINT32', 'Phase C voltage', -2],
      phase_a_current: [31651, 2, 'INT32', 'Phase A current', -1],
      phase_b_current: [31653, 2, 'INT32', 'Phase B current', -1],
      phase_c_current: [31655, 2, 'INT32', 'Phase C current', -1],
      phase_a_power: [31663, 2, 'INT32', 'Phase A power', -3],
      phase_b_power: [31665, 2, 'INT32', 'Phase B power', -3],
      phase_c_power: [31667, 2, 'INT32', 'Phase C power', -3],
    };

    for (const [key, value] of Object.entries(registers)) {
      // sleep(2000).then(() => {

      // console.log(key, value);
      // start normale poll

      // client.readInputRegisters(value[0],value[1])
      client
        .readHoldingRegisters(value[0], value[1])
        .then((resp) => {
          // console.log(resp.response._body);
          if (value[2] == 'UINT16') {
            console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.readUInt16BE()}`);
          } else if (value[2] == 'STRING') {
            console.log(`${value[3]}: ${Buffer.from(resp.response._body._valuesAsBuffer, 'hex').toString()}`);
          } else if (value[2] == 'INT16' || value[2] == 'SCALE') {
            console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.readInt16BE()}`);
          } else if (value[2] == 'UINT32') {
            console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.readUInt32BE()}`);
          } else if (value[2] == 'INT32') {
            console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.readInt32BE()}`);
          } else if (value[2] == 'UINT64') {
            console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.readBigUint64BE()}`);
          } else {
            console.log(`${key}: type not found ${value[2]}`);
          }
        })
        .catch((err) => {
          console.log(err);
        });
      // });
    }

    delay(() => {
      socket.end();
    }, 6000);
  });
});

var delay = (function() {
  let timer = 0;
  return function(callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
}());

// avoid all the crash reports
socket.on('error', (err) => {
  console.log(err);
  socket.end();
});
