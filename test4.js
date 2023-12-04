console.log('-------------------')



const {Bitstring} = require( '@transmute/compressable-bitstring');
const modbus = require('jsmodbus');
const net = require('net');
const socket = new net.Socket();

let options = {
    'host': '10.10.100.122',
    'port': 502,
    'unitId': 1,
    'timeout': 500,
    'autoReconnect': true,
    'reconnectTimeout': 62,
    'logLabel' : 'growatt Inverter',
    'logLevel': 'error',
    'logEnabled': true
}

let client = new modbus.client.TCP(socket, 1, 1000)


socket.connect(options);

socket.on('connect', () => {

    var delay = ( function() {
        var timer = 0;
        return function(callback, ms) {
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
        };
    })();

    console.log('Connected ...');

    registers = {
                                 

        "exportlimitenabled": [122, 1, 'UINT16', "Export Limit enable", 0],
        "exportlimitpowerrate": [123, 1, 'UINT16', "Export Limit Power Rate", -1],
        "gridfirststopsoc": [3037, 1, 'UINT16', "GridFirst stop SOC", 0],
        "batfirststopsoc": [3048, 1, 'UINT16', "BatFirst stop SOC", 0],

    }    


    for (const [key, value] of Object.entries(registers)) {
        // console.log(key, value);
        // start normale poll

        client.readHoldingRegisters(value[0],value[1])
        .then(function(resp) {
            // console.log(resp.response._body);

            // case 'UINT16':
            //     resultValue = response.body.valuesAsArray[0].toString();
            //     // console.log(key);
            //     break;
            // case 'UINT32':
            //     resultValue = (response.body.valuesAsArray[0]  << 16 | response.body.valuesAsArray[1]).toString();
            //     // console.log(key);
            //     break;
            // default:
            //     console.log(key + ": type not found " + value[2]);
            //     break;

            if ( value[2] == 'UINT16') {
                console.log(value[3] + ": " + resp.response._body._valuesAsArray[0].toString());
            } else if ( value[2] == 'BYTE') {
                var value2 = resp.response._body._valuesAsBuffer.readUInt16BE();
                let lowVal = value2 & 0xFF;
                let highval = (value2 >> 8) & 0xFF;
                console.log(value[3] + ": " + highval + " " + lowVal );
            } else if ( value[2] == 'BITS') {

                var value2 = resp.response._body._valuesAsBuffer.readUInt16BE();
                let lowVal = value2 & 0xFF;
                let highval = (value2 >> 8) & 0xFF;
                // const bitstring = new Bitstring({ length: 8 });
                // bitstring.set(4, true);
                const buffer = Uint8Array.from([lowVal]);
                const bitstring = new Bitstring({buffer});

                // const buffer = Uint8Array.from([255]);
                // const Bitstring = new Bitstring(value2);
                console.log(value[3] + ": "+ lowVal + " " + bitstring.get(0) +  bitstring.get(3) +  bitstring.get(4));
            } else if  ( value[2] == 'UINT32') {    
                resultValue = (resp.response._body._valuesAsArray[0]  << 16 | resp.response._body._valuesAsArray[1]).toString();
                console.log(value[3] + ": " + resultValue);
            } else {
                console.log(key + ": type not found " + value[2]);
            }  
        })
        .catch((err) => {
            console.log(key);
            console.log(err);
        });
    }


    delay(function(){
        socket.end();
    }, 20000 );

})


//avoid all the crash reports
socket.on('error', (err) => {
    console.log(err);
    socket.end();
})
