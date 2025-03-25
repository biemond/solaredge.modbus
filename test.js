console.log('-------------------');

const modbus = require('jsmodbus');
const net = require('net');

const socket = new net.Socket();

const options = {
  host: '192.168.107.25', // 25 36
  port: 1502,
  unitId: 1,
  timeout: 62,
  autoReconnect: true,
  reconnectTimeout: 62,
  logLabel: 'solaredge Inverter',
  logLevel: 'error',
  logEnabled: true,
};

// let client = new modbus.client.TCP(socket)
const client = new modbus.client.TCP(socket, 1, 2000);

socket.connect(options);

socket.on('connect', () => {
  const delay = (function() {
    let timer = 0;
    return function(callback, ms) {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  }());

  console.log('Connected ...');

  registers = {
    c_manufacturer: [0x9c44, 16, 'STRING', 'Manufacturer'],
    c_model: [0x9c54, 16, 'STRING', 'Model'],
    c_version: [0x9c6c, 8, 'STRING', 'Version'],
    c_serialnumber: [0x9c74, 16, 'STRING', 'Serial'],
    c_deviceaddress: [0x9c84, 1, 'UINT16', 'Modbus ID'],
    c_sunspec_did: [0x9c85, 1, 'UINT16', 'SunSpec DID'],

    // "current":              [0x9c87, 1, 'UINT16', "Current"],
    // "l1_current":           [0x9c88, 1, 'UINT16', "L1 Current"],
    // "l2_current":           [0x9c89, 1, 'UINT16', "L2 Current"],
    // "l3_current":           [0x9c8a, 1, 'UINT16', "L3 Current"],
    // "current_scale":        [0x9c8b, 1, 'SCALE', "Current Scale Factor"],

    // "l1_voltage":           [0x9c8c, 1, 'UINT16', "L1 Voltage"],
    // "l2_voltage":           [0x9c8d, 1, 'UINT16', "L2 Voltage"],
    // "l3_voltage":           [0x9c8e, 1, 'UINT16', "L3 Voltage"],
    // "l1n_voltage":          [0x9c8f, 1, 'UINT16', "L1-N Voltage"],
    // "l2n_voltage":          [0x9c90, 1, 'UINT16', "L2-N Voltage"],
    // "l3n_voltage":          [0x9c91, 1, 'UINT16', "L3-N Voltage"],
    // "voltage_scale":        [0x9c92, 1, 'SCALE', "Voltage Scale Factor"],

    // "power_ac":             [0x9c93, 1, 'INT16', "Power"],
    // "power_ac_scale":       [0x9c94, 1, 'SCALE', "Power Scale Factor"],

    // "frequency":            [0x9c95, 1, 'UINT16', "Frequency"],
    // "frequency_scale":      [0x9c96, 1, 'SCALE', "Frequency Scale Factor"],

    // "power_apparent":       [0x9c97, 1, 'INT16', "Power [Apparent]"],
    // "power_apparent_scale": [0x9c98, 1, 'SCALE', "Power [Apparent] Scale Factor"],
    // "power_reactive":       [0x9c99, 1, 'INT16', "Power [Reactive]"],
    // "power_reactive_scale": [0x9c9a, 1, 'SCALE', "Power [Reactive] Scale Factor"],
    // "power_factor":         [0x9c9b, 1, 'INT16', "Power Factor"],
    // "power_factor_scale":   [0x9c9c, 1, 'SCALE', "Power Factor Scale Factor"],

    // "energy_total":         [0x9c9d, 2, 'ACC32', "Total Energy"],
    // "energy_total_scale":   [0x9c9f, 1, 'SCALE', "Total Energy Scale Factor"],

    // "current_dc":           [0x9ca0, 1, 'UINT16', "DC Current"],
    // "current_dc_scale":     [0x9ca1, 1, 'SCALE', "DC Current Scale Factor"],

    // "voltage_dc":           [0x9ca2, 1, 'UINT16', "DC Voltage"],
    // "voltage_dc_scale":     [0x9ca3, 1, 'SCALE', "DC Voltage Scale Factor"],

    // "power_dc":             [0x9ca4, 1, 'INT16', "DC Power"],
    // "power_dc_scale":       [0x9ca5, 1, 'SCALE', "DC Power Scale Factor"],

    // "temperature":          [0x9ca7, 1, 'INT16', "Temperature"],
    // "temperature_scale":    [0x9caa, 1, 'SCALE', "Temperature Scale Factor"],

    // "status":               [0x9cab, 1, 'UINT16', "Status"],
    // "vendor_status":        [0x9cac, 1, 'UINT16', "Vendor Status"],

    // "rrcr_state":           [0xf000, 1, 'UINT16', "RRCR State"],
    // "active_power_limit":   [0xf001, 1, 'UINT16', "Active Power Limit"],
    // "cosphi":               [0xf002, 2, 'FLOAT32', "CosPhi"],

    storage_control_mode: [0xe004, 1, 'UINT16', 'Storage Control Mode'],
    storage_accharge_policy: [0xe005, 1, 'UINT16', 'Storage AC Charge Policy'],
    storage_accharge_Limit: [0xe006, 2, 'FLOAT32', 'Storage AC Charge Limit'],

    remote_control_command_mode: [0xe00d, 1, 'UINT16', 'Remote Control Command Mode'],
    remote_control_charge_limit: [0xe00e, 2, 'FLOAT32', 'Remote Control Charge Limit'],
    remote_control_command_discharge_limit: [0xe010, 2, 'FLOAT32', 'Remote Control Command Discharge Limit'],
    remote_control_command_timeout: [0xe00b, 2, 'UINT32', 'Remote Control Command Timeout'],
    remote_control_default_command_mode: [0xe00a, 1, 'UINT16', 'Storage Charge/Discharge Default Mode'],

    // "rrcr_state": [0xf000, 1, 'UINT16', "RRCR State"],
    active_power_limit: [0xf001, 1, 'UINT16', 'Active Power Limit'],
    // "cosphi": [0xf002, 2, 'FLOAT32', "CosPhi"],

    advancedpwrcontrolen: [0xf142, 2, 'UINT32', 'Advanced Power Control En'],
    reactivepwrconfig: [0xf102, 2, 'UINT32', 'Reactive Power Config'],
    export_control_mode: [0xe000, 1, 'UINT16', 'Export control Mode'],
    export_control_limit_mode: [0xe001, 1, 'UINT16', 'Export control limit Mode'],
    export_control_site: [0xe002, 2, 'FLOAT32', 'Export control site limit'],
    powerreduce: [0xf140, 2, 'FLOAT32', 'Power Reduce'],
    maxcurrent: [0xf18e, 2, 'FLOAT32', 'Max Current'],
  };

  storage_control_mode = ['Disabled', 'Maximize Self Consumption', 'Time of Use', 'Backup Only', 'Remote Control'];

  remote_control_mode = [
    'Off',
    'Charge excess PV power only',
    'Charge from PV first',
    'Charge from PV+AC according to the max battery power',
    'Maximize export',
    'Discharge to meet loads consumption',
    'NOT',
    'Maximize self-consumption',
  ];

  INVERTER_STATUS_MAP = ['Undefined', 'Off', 'Sleeping', 'Grid Monitoring', 'Producing', 'Producing (Throttled)', 'Shutting Down', 'Fault', 'Standby'];

  for (const [key, value] of Object.entries(registers)) {
    // console.log(key, value);
    // start normale poll

    client
      .readHoldingRegisters(value[0], value[1])
      .then((resp) => {
        // console.log(resp.response._body);
        if (value[2] == 'UINT16') {
          console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.readInt16BE()}`);
        } else if (value[2] == 'UINT32') {
          console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.readUInt32BE()}`);
        } else if (value[2] == 'ACC32') {
          console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.readUInt32BE()}`);
        } else if (value[2] == 'FLOAT') {
          console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.readFloatBE()}`);
        } else if (value[2] == 'STRING') {
          console.log(`${value[3]}: ${Buffer.from(resp.response._body._valuesAsBuffer, 'hex').toString()}`);
        } else if (value[2] == 'INT16' || value[2] == 'SCALE') {
          console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.readInt16BE()}`);
        } else if (value[2] == 'FLOAT32') {
          console.log(`${value[3]}: ${Buffer.from(resp.response._body._valuesAsBuffer, 'hex').swap16().swap32().readFloatBE()}`);
        } else {
          console.log(`${key}: type not found ${value[2]}`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  delay(() => {
    socket.end();
  }, 8000);
});

// avoid all the crash reports
socket.on('error', (err) => {
  console.log(err);
  socket.end();
});
