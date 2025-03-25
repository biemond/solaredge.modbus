console.log('-------------------');

const modbus = require('jsmodbus');
const net = require('net');

const socket = new net.Socket();

const options = {
  host: '192.168.0.44', //  '192.168.0.214'
  port: 502,
  unitId: 1,
  timeout: 500,
  autoReconnect: true,
  reconnectTimeout: 62,
  logLabel: 'sun grow Inverter',
  logLevel: 'error',
  logEnabled: true,
};

const client = new modbus.client.TCP(socket, 1, 1000);

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

  holdingsRegisters = {
    Year: [4999, 1, 'UINT16', 'System clock: Year', 0],
    EMSmodeselection: [13049, 1, 'UINT16', 'EMS mode 0: Self-consumption mode, 2: Forced mode (charge/discharge/stop), 3: External EMS mode | ', 0],

    'Charge/discharge command': [13050, 1, 'UINT16', 'Charge/discharge command 170: Charge, 187: Discharge, 204: Stop | ', 0],
    'Charge/discharge power': [13051, 1, 'UINT16', 'Charge/discharge power', 0],
    'Max SOC ': [13057, 1, 'UINT16', 'Max SOC ', -1],
    'Min SOC': [13058, 1, 'UINT16', 'Min SOC', -1],

    'Export power': [13073, 1, 'UINT16', 'Export power', 0],
    'Export power limitation': [13086, 1, 'UINT16', 'Export power limitation 170: Enable, 85: Disable | ', 0],
  };

  for (const [key, value] of Object.entries(holdingsRegisters)) {
    // console.log(key, value);
    // start normale poll

    // U16: 16-bit unsigned integer, big-endian
    // S16: 16-bit signed integer, big-endian
    // U32: 32-bit unsigned integer; little-endian for double-word data. Big-endian for byte data
    // S32: 32-bit signed integer; little-endian for double-word data. Big-endian for byte data

    //     if current_register.data_type == "U16":
    //     value = response.registers[register_index]

    // elif current_register.data_type == "U32":
    //     value = (response.registers[register_index + 1] << 16) + response.registers[register_index]

    // elif current_register.data_type == "S16":
    //     value = int.from_bytes(response.registers[register_index].to_bytes(2, "little"), "little", signed=True)

    // elif current_register.data_type == "S32":
    //     value = int.from_bytes(((response.registers[register_index + 1] << 16) + response.registers[register_index]).to_bytes(4, "little"), "little", signed=True)

    client
      .readHoldingRegisters(value[0], value[1])
      .then((resp) => {
        // console.log(resp.response._body);
        if (value[2] == 'UINT16') {
          console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.readUInt16BE()}`);
        } else if (value[2] == 'INT16') {
          console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.readInt16BE()}`);
        } else if (value[2] == 'INT32') {
          resultValue = ((resp.response._body._valuesAsArray[1] << 16) | resp.response._body._valuesAsArray[0] | 0).toString();
          console.log(`${value[3]}: ${resultValue}`);
        } else if (value[2] == 'UINT32') {
          resultValue = ((resp.response._body._valuesAsArray[1] << 16) | resp.response._body._valuesAsArray[0]).toString();
          console.log(`${value[3]}: ${resultValue}`);
        } else if (value[2] == 'BITS') {
          const value2 = Number(resp.response._body._valuesAsArray[0].toString());
          const lowVal = value2 & 0xff;
          const highval = (value2 >> 8) & 0xff;
          const bit0 = lowVal & (1 << 0);
          const bit1 = lowVal & (1 << 1);
          const bit2 = lowVal & (1 << 2);
          const bit3 = lowVal & (1 << 3);
          const bit4 = lowVal & (1 << 4);
          const bit5 = lowVal & (1 << 5);
          const bit6 = lowVal & (1 << 6);
          const bit7 = lowVal & (1 << 7);

          console.log(`${value[3]}: ${lowVal}`);
          console.log(`${value[3]}: ${highval}`);
          console.log(`bit0 ${bit0}`);
          console.log(`bit1 ${bit1}`);
          console.log(`bit2 ${bit2}`);
          console.log(`bit3 ${bit3}`);
          console.log(`bit4 ${bit4}`);
          console.log(`bit5 ${bit5}`);
          console.log(`bit6 ${bit6}`);
          console.log(`bit7 ${bit7}`);

          console.log(`bit0 ${bit0}`);
          if (bit0 == 1) {
            console.log('status_power_generated_from_pv true');
          } else {
            console.log('status_power_generated_from_pv false');
          }
          console.log(`bit1 ${bit1}`);
          if (bit1 == 2) {
            console.log('status_charging true');
          } else {
            console.log('status_charging false');
          }
          console.log(`bit2 ${bit2}`);
          if (bit2 == 4) {
            console.log('status_discharging true');
          } else {
            console.log('status_discharging false');
          }
          console.log(`bit3 ${bit3}`);
          if (bit3 == 8) {
            console.log('status_load_is_active true');
          } else {
            console.log('status_load_is_active false');
          }
          console.log(`bit4 ${bit4}`);
          if (bit4 == 16) {
            console.log('status_exporting_power_to_grid true');
          } else {
            console.log('status_exporting_power_to_grid false');
          }
          console.log(`bit5 ${bit5}`);
          if (bit5 == 32) {
            console.log('status_importing_power_from_grid true');
          } else {
            console.log('status_importing_power_from_grid false');
          }
          console.log(`bit7 ${bit7}`);
          if (bit7 == 128) {
            console.log('status_power_generated_from_load true');
          } else {
            console.log('status_power_generated_from_load false');
          }
        } else {
          console.log(`${key}: type not found ${value[2]}`);
        }
      })
      .catch((err) => {
        console.log(key);
        console.log(err);
      });
  }

  delay(() => {
    socket.end();
  }, 20000);
});

// avoid all the crash reports
socket.on('error', (err) => {
  console.log(err);
  socket.end();
});
