console.log('-------------------')


const modbus = require('jsmodbus');
const net = require('net');
const socket = new net.Socket();

let options = {
    'host': '192.168.0.44', //  '192.168.0.214'
    'port': 502,
    'unitId': 1,
    'timeout': 500,
    'autoReconnect': true,
    'reconnectTimeout': 62,
    'logLabel' : 'sun grow Inverter',
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
                                 
         "devicetypecode": [4999, 1, 'UINT16', "device type code", 0],

        "DailyPVGeneration":  [13001, 1, 'UINT16', "Daily PV Generation", -1],

        "TotalOutputEnergy":  [5003, 2, 'UINT32', "Total Output Energy pv & battery discharge", 0],
        "TotalPVGeneration":  [13002, 2, 'UINT32', "Total PV Generation", 0],


        "TotalDCpower":  [5016, 2, 'UINT32', "Total DC power", 0],
        "battery_power":  [13021, 1, 'UINT16', "battery_power",0],


        "Load power":  [13007, 2, 'INT32', "Load power", 0],
        "Export power":  [13009, 2, 'INT32', "Export power", 0],

        "Reactive power":  [5032, 2, 'INT32', "Reactive power", 0],
        "Meter Reactive power":  [5600, 2, 'INT32', "Meter Reactive power", 0],



        "Total active power":  [13033, 2, 'INT32', "Total active power", 0],


        "Nominalactivepower":  [5000, 1, 'UINT16', "Nominal active power", -1],        
        "Output type":  [5001, 1, 'UINT16', "Output type 0-Single phase; 1-3P4L; 2-3P3L", 0],


        "DailyOutputEnergy":  [5002, 1, 'UINT16', "Daily Output Energy pv + batt discharge", 0],




        "DailyexportpowerfromPV":  [13004, 1, 'UINT16', "Daily export power from PV", -1],
        "TotalexportpowerfromPV":  [13005, 2, 'UINT32', "Total export power from PV", -1],




        "temperature":  [5007, 1, 'UINT16', "temperature",-1],

        "MPPT 1 Voltage":  [5010, 1, 'UINT16', "MPPT 1 Voltage",-1],
        "MPPT 2 Voltage":  [5012, 1, 'UINT16', "MPPT 2 Voltage",-1],
        "MPPT 1 Current":  [5011, 1, 'UINT16', "MPPT 1 Current",-1],
        "MPPT 2 Current":  [5013, 1, 'UINT16', "MPPT 2 Current",-1],




        "A-Blinevoltage":  [5018, 1, 'UINT16', "A-B line voltage",-1],
        "B-Clinevoltage":  [5019, 1, 'UINT16', "B-C line voltage",-1],
        "C-Alinevoltage":  [5020, 1, 'UINT16', "C-A line voltage",-1],    
        
        "Gridfrequency":  [5035, 1, 'UINT16', "Grid frequency",-1], 

        // "Workstate":  [5037, 1, 'UINT16', "Work state",0],
        // DEVICE_WORK_STATE_1_CODES = {
        //     0x0:    "Run",
        //     0x8000: "Stopped",
        //     0x1300: "Key stop",
        //     0x1500: "Emergency stop",
        //     0x1400: "Standby",
        //     0x1200: "Initial standby",
        //     0x1600: "Starting",
        //     0x9100: "Alarm run",
        //     0x8100: "Derating run",
        //     0x8200: "Dispatch run",
        //     0x5500: "Fault",
        // }

        "Systemstate":  [12999, 1, 'UINT16', "System state",0],

        // SYSTEM_STATE_CODES = {
        //     0x2: "Stop",
        //     0x8: "Standby",
        //     0x10: "Initial Standby",
        //     0x20: "Startup",
        //     0x40: "Running",
        //     0x100: "Falt",
        //     0x400: "Running in maintain mode",
        //     0x800: "Running in forced mode",
        //     0x1000: "Running in off-grid mode",
        //     0x2501: "Restarting",
        //     0x4000: "Running in external EMS mode",
        // }

         "Runningstate":  [13000, 1, 'BITS', "Running state",0],
        // RUNNING_STATE_BITS = {
        //     0b00000001: "status_power_generated_from_pv",
        //     0b00000010: "status_charging",
        //     0b00000100: "status_discharging",
        //     0b00001000: "status_load_is_active",
        //     0b00010000: "status_exporting_power_to_grid",
        //     0b00100000: "status_importing_power_from_grid",
        //     0b10000000: "status_power_generated_from_load",
        // }


        // Load power  13008 - 13009 S32 1W
        // Export power 13010 - 13011 S32
        // Self-consumpti on of today 13029 U160.1%


        "battery_Capacity":  [13038, 1, 'UINT16', "battery_Capacity",-1],
        "battery_level":  [13022, 1, 'UINT16', "battery_level",0],
        "CycleCount":  [13110, 1, 'UINT16', "Cycle Count",0],
        
        "battery_state_of_health":  [13023, 1, 'UINT16', "battery_state_of_health",0],
        "battery_temperature":  [13024, 1, 'INT16', "battery_temperature",-1],
        "battery_voltage":  [13019, 1, 'UINT16', "battery_voltage",0],

        "Daily import energy":  [13035, 1, 'UINT16', "Daily import energy",-1],
        "Total import energy":  [13036, 2, 'UINT32', "Total import energy",-1],

        "Daily export energy":  [13044, 1, 'UINT16', "Daily export energy",-1],
        "Total export energy":  [13045, 2, 'UINT32', "Total export energy",-1],

        "Daily battery charge energy from PV":  [13011, 1, 'UINT16', "Daily battery charge energy from PV",-1],
        "Total battery charge energy from PV":  [13012, 2, 'UINT32', "Total battery charge energy from PV",-1],

        "Daily battery discharge energy":  [13025, 1, 'UINT16', "Daily battery discharge energy",-1],
        "Total battery discharge energy":  [13026, 2, 'UINT32', "Total battery discharge energy",-1],

        "Daily battery charge energy":  [13039, 1, 'UINT16', "Daily battery charge energy",-1],
        "Total battery charge energy":  [13040, 2, 'UINT32', "Total battery charge energy",-1],

        // "Charge/discharge":  [13050, 1, 'UINT16', "Charge/discharge",0],
        // "Charge/discharge_power":  [13051, 1, 'UINT16', "Charge/discharge power",0],
        // "Max. discharge current":  [13065, 1, 'UINT16', "Max. discharge current",0],
        // "Max. charge current":  [13066, 1, 'UINT16', "Max. charge current",0],

    }    




    for (const [key, value] of Object.entries(registers)) {
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



        client.readInputRegisters(value[0],value[1])
        .then(function(resp) {
            // console.log(resp.response._body);
            if ( value[2] == 'UINT16') {
                console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readUInt16BE());
            }  else if ( value[2] == 'INT16') {
                console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readInt16BE());    
            }  else if  ( value[2] == 'INT32') {  
                resultValue = ((resp.response._body._valuesAsArray[1]  << 16 | resp.response._body._valuesAsArray[0] ) | 0 ).toString();
                console.log(value[3] + ": " + resultValue);
            }  else if  ( value[2] == 'UINT32') {
                resultValue = (resp.response._body._valuesAsArray[1]  << 16 | resp.response._body._valuesAsArray[0]   ).toString();
                console.log(value[3] + ": " + resultValue);
            } else if ( value[2] == 'BITS') {

                var value2 = Number(resp.response._body._valuesAsArray[0].toString());
                let lowVal = value2 & 0xFF;
                let highval = (value2 >> 8) & 0xFF;
                let bit0 = (lowVal & (1<<0)); 
                let bit1 = (lowVal & (1<<1));                                 
                let bit2 = (lowVal & (1<<2)); 
                let bit3 = (lowVal & (1<<3)); 
                let bit4 = (lowVal & (1<<4));                                 
                let bit5 = (lowVal & (1<<5)); 
                let bit6 = (lowVal & (1<<6));                                 
                let bit7 = (lowVal & (1<<7)); 

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
