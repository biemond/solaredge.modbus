console.log('-------------------');

const modbus = require('jsmodbus');
const net = require('net');

const socket = new net.Socket();

const options = {
  host: '192.168.10.61',
  port: 502,
  timeout: 26,
  autoReconnect: false,
  reconnectTimeout: 7,
  logLabel: 'solis Inverter',
  logLevel: 'error',
  logEnabled: true,
};

const client = new modbus.client.TCP(socket, 1, 1000);

const clients = [
  client,
];

socket.setKeepAlive(false);
socket.connect(options);

socket.on('connect', () => {

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  sleep(500).then(async () => {
    console.log('Connected ...');

    registers = {

      solis_model: [3500, 1, 'UINT16', 'solis_model', 0],

    };

    holdingRegisters = {

      // "sigen_remote_ems_code": [40029, 1, 'UINT16', "Sigen Remote EMS code", 0],

    };

    for (const x in clients) {
      const wait = 100;

      await sleep(wait).then(async () => {

        console.log(`unitId: ${clients[x].unitId}`);
        const register = registers;

        for (const [key, value] of Object.entries(register)) {
          clients[x].readInputRegisters(value[0], value[1])
            .then((resp) => {
              // console.log(resp.response._body);
              if (value[2] == 'UINT16') {
                console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.readUInt16BE()}`);
              } else if (value[2] == 'STRING') {
                console.log(`${value[3]}: ${resp.response._body._valuesAsBuffer.toString()}`);
                // console.log(value[3] + ": " + Buffer.from(resp.response._body._valuesAsBuffer, 'hex').toString());
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
      });

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
