console.log('-------------------')


const modbus = require('jsmodbus');
const net = require('net');
const socket = new net.Socket();

let options = {
    'host': '192.168.5.201',
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

        "period1start": [3038, 1, 'BITS', "period1start", 0],
        "period1stop": [3039, 1, 'BITS', "period1stop", 0]
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

                var value2 = Number(resp.response._body._valuesAsArray[0].toString());
                let lowVal = value2 & 0xFF;
                let highval = (value2 >> 8) & 0xFF;
                let bit0 = (highval & (1<<0)); 
                let bit1 = (highval & (1<<1));                                 
                let bit2 = (highval & (1<<2)); 
                let bit3 = (highval & (1<<3)); 
                let bit4 = (highval & (1<<4));                                 
                let bit5 = (highval & (1<<5)); 
                let bit6 = (highval & (1<<6));                                 
                let bit7 = (highval & (1<<7)); 

                console.log(value[3] + ": "+ lowVal );
                console.log(value[3] + ": "+ highval);
                console.log('bit0 ' + bit0 );
                console.log('bit1 ' + bit1 );
                console.log('bit2 ' + bit2 );
                console.log('bit3 ' + bit3 );
                console.log('bit4 ' + bit4 );
                console.log('bit5 ' + bit5 );
                console.log('bit6 ' + bit6 );
                console.log('bit7 ' + bit7 );

                let priorityPeriod1 = "";
                if ((bit5 + bit6) == 0) {
                    priorityPeriod1 = "load";
                } else if ((bit5 + bit6) == 32) {
                    priorityPeriod1 = "battery";
                } else if ((bit5 + bit6) == 64) {
                    priorityPeriod1 = "grid";
                }
                console.log('priorityPeriod1 ' + priorityPeriod1 );   

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
