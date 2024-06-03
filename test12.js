console.log('-------------------')

const modbus = require('jsmodbus');
const net = require('net');
const socket = new net.Socket();

let options = {
    'host': '192.168.178.180',
    'port': 502,
    'unitId': 1,
    'timeout': 26,
    'autoReconnect': false,
    'reconnectTimeout': 26,
    'logLabel' : 'huawei Inverter',
    'logLevel': 'error',
    'logEnabled': true
}

let client = new modbus.client.TCP(socket, 1, 5500);
socket.setKeepAlive(false); 
socket.connect(options);

socket.on('connect', () => {

    // const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

    var delay = ( function() {
        var timer = 0;
        return function(callback, ms) {
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
        };
    })();

    delay(() => (5000));
    console.log('Connected ...');

    registers = {
 
        "inputPower": [32064, 2, 'INT32', "Input Power", 0], //	kW	1000

        // rn.GRID_VOLTAGE: U16Register("V", 10, 32066, 1),
        "GRID_VOLTAGE": [32066, 1, 'UINT16', "GRID VOLTAGE", -1],    
  
        // rn.ACCUMULATED_YIELD_ENERGY: U32Register("kWh", 100, 32106, 2),
        "ACCUMULATED_YIELD_ENERGY": [32106, 2, 'UINT32', "ACCUMULATED YIELD ENERGY", -2],  
        // rn.DAY_ACTIVE_POWER_PEAK: I32Register("W", 1, 32078, 2),
        // "DAY_ACTIVE_POWER_PEAK": [32078, 2, 'INT32', "DAY_ACTIVE_POWER_PEAK", 0],   
 
        // rn.ACTIVE_POWER: I32Register("W", 1, 32080, 2),
        "ACTIVE_POWER": [32080, 2, 'INT32', "ACTIVE_POWER", 0],   
        // rn.GRID_FREQUENCY: U16Register("Hz", 100, 32085, 1),
        // "GRID_FREQUENCY": [32085, 1, 'UINT16', "GRID_FREQUENCY", -2], 
        // rn.INTERNAL_TEMPERATURE: I16Register("°C", 10, 32087, 1),
        "INTERNAL_TEMPERATURE": [32087, 1, 'INT16', "INTERNAL_TEMPERATURE", -1], 

        // rn.DEVICE_STATUS: U16Register(rv.DEVICE_STATUS_DEFINITIONS, 1, 32089, 1),
        "DEVICE_STATUS": [32089, 1, 'UINT16', "DEVICE_STATUS", 0], 
        // rn.DAILY_YIELD_ENERGY: U32Register("kWh", 100, 32114, 2),
        "DAILY_YIELD_ENERGY": [32114, 2, 'UINT32', "DAILY_YIELD_ENERGY", -2], 


        // rn.MODEL_NAME: StringRegister(30000, 15),
        "modelName": [30000, 15, 'STRING', "Model Name", 0],
        // rn.MODEL_ID: U16Register(None, 1, 30070, 1),
        // "modelId": [30070, 1, 'UINT16', "Model ID", 0], 

 
    }    


    for (const [key, value] of Object.entries(registers)) {
        delay(() => (750));
        // delay(250);
        // console.log(key, value);
        // start normale poll
        client.readHoldingRegisters(value[0],value[1])
        // client.readHoldingRegisters(value[0],value[1])
        .then(function(resp) {
            // console.log(resp.response._body);
            if ( value[2] == 'UINT16') {
                console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readUInt16BE());
            } else if ( value[2] == 'STRING') {
                console.log(value[3] + ": " + Buffer.from(resp.response._body._valuesAsBuffer, 'hex').toString());
            } else if ( value[2] == 'INT16' || value[2] == 'SCALE') {
                console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readInt16BE());
            } else if  ( value[2] == 'UINT32') {    
                // console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readUInt32LE());
                console.log(value[3] + ": " + (resp.response._body._valuesAsArray[1]  << 16 | resp.response._body._valuesAsArray[0]))
                console.log(resp.response._body._valuesAsArray[1]  << 16)
                console.log(resp.response._body._valuesAsArray[0])
            } else if ( value[2] == 'INT32') {
                // console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readInt32LE());
                console.log(value[3] + ": " +((resp.response._body._valuesAsArray[1]  << 16 | resp.response._body._valuesAsArray[0] ) | 0 ));
                console.log(resp.response._body._valuesAsArray[1] << 16)
                console.log(resp.response._body._valuesAsArray[0])
            } else {
                console.log(key + ": type not found " + value[2]);
            }  
        })
        .catch((err) => {
            console.log(err);
        });
    }

    delay(function(){
        socket.end();
    }, 26000 );

})


//avoid all the crash reports
socket.on('error', (err) => {
    console.log(err);
    socket.end();
})
