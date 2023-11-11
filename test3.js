console.log('-------------------')


const modbus = require('jsmodbus');
const net = require('net');
const socket = new net.Socket();

let options = {
    'host': '192.168.50.252',
    'port': 502,
    'unitId': 1,
    'timeout': 62,
    'autoReconnect': true,
    'reconnectTimeout': 62,
    'logLabel' : 'solaredge Inverter',
    'logLevel': 'error',
    'logEnabled': true
}

let client = new modbus.client.TCP(socket)

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
                                 
        "SN":                       [10000,	8, 'STRING',"Inverter SN"],
        "Firmware":                 [10011,	2, 'UINT32', "Firmware Version"],
        "Inverter_Running_Status":  [10105, 1, 'UINT16', "Inverter_Running_Status"],
        "Equipment":                [10008,	1, 'UINT16', "Equipment Info"],

        "power_meter":              [11000, 2, 'INT32', "Total Power on Meter"],
        "grid_inject_meter":        [11002, 2, 'UINT32', "Total Grid-Injection Energy on Meter"],
        "purchase_gird_meter":      [11004, 2, 'UINT32', "Total Purchasing Energy from Grid on Meter"],

        "phasea_power":             [10994, 2, 'INT32', "Phase A power"],
        "phaseb_power":             [10996, 2, 'INT32', "Phase B power"],
        "phasec_power":             [10998, 2, 'INT32', "Phase C power"],


        "phasea_current":           [11010, 1, 'UINT16', "Phase A Current"],
        "phaseb_current":           [11012, 1, 'UINT16', "Phase B Current"],
        "phasec_current":           [11014, 1, 'UINT16', "Phase C Current"],
    
        "phasea_voltage":           [11009, 1, 'UINT16', "Phase A Voltage"],
        "phaseb_voltage":           [11011, 1, 'UINT16', "Phase B Voltage"],
        "phasec_voltage":           [11013, 1, 'UINT16', "Phase C Voltage"],

        "battery_voltage":           [30254, 1, 'UINT16', "Battery DC Voltage"],
        "battery_current":           [30255, 1, 'INT16',  "Battery DC Current"],
        "battery_mode":              [30256, 1, 'UINT16', "Battery mode"],
        "battery_power":             [30258, 2, 'INT32',  "Battery power"],

        "GridInjectionEnergyday[":    [31000, 1, 'UINT16', "Grid Injection Energy on that day"],
        "GridPurchasingEnergyday":    [31001, 1, 'UINT16', "Grid Purchasing Energy on that day"],
        "BackupOutputEnergyday":     [31002, 1, 'UINT16', "Backup Output Energy day"],
        "BatteryChargeEnergyday":    [31003, 1, 'UINT16', "Battery Charge Energy day"],
        "BatteryDischargeEnergyday": [31004, 1, 'UINT16', "Battery Discharge Energy day"],
        "PVGenerationEnergyday":     [31005, 1, 'UINT16', "PV Generation Energy day"],
        "LoadingEnergyday":          [31006, 1, 'UINT16', "Loading Energy day"],
        "EnergyPurchasedfromGridday":   [31008, 1, 'UINT16', "Energy Purchased from Grid day"],
        "TotalEnergyinjectedtogrid":    [31102, 2, 'UINT32', "Total Energy injected to grid"],
        "TotalEnergyPurchasedfromGrid": [31104, 2, 'UINT32', "Total Energy Purchased from Grid from Meter"],

        "TemperatureSensor1":           [11032, 1, 'INT16',  "Temperature Sensor 1"],
        "TemperatureSensor2":           [11033, 1, 'INT16',  "Temperature Sensor 2"],
        "TemperatureSensor3":           [11034, 1, 'INT16',  "Temperature Sensor 3"],
        "TemperatureSensor4":           [11035, 1, 'INT16',  "Temperature Sensor 4"],

        "TotalPVGenerationday":              [11018, 2, 'UINT32', "Total PV Generation on that day"],
        "TotalPVGenerationInstallation":     [11020, 2, 'UINT32', "Total PV Generation from Installation"],
        "TotalPVGenerationTimeInstallation": [11022, 2, 'UINT32', "Total PV Generation Time from Installation"],
        "PVInputTotalPower":                 [11028, 2, 'UINT32', "PV Input Total Power"],

        "PV1InputPower":                 [11028, 2, 'UINT32', "PV1 Input Power"],
        "PV2InputPower":                 [11028, 2, 'UINT32', "PV2 Input Power"],

        "BMSChargeImax":     [32005, 1, 'UINT16', "BMS Charge Imax"],
        "BMSDischargeImax":  [32006, 1, 'UINT16', "BMS Discharge Imax"],

        "SOC":          [33000, 1, 'UINT16', "SOC"],
        "SOH":          [33001, 1, 'UINT16', "SOH"],

        "BMSStatus":           [33002, 1, 'UINT16', "BMS Status"],
        "BMSPackTemperature":  [33003, 1, 'UINT16', "BMS Pack Temperature"],

        "MaxCellVoltage":      [33013, 1, 'UINT16', "Max Cell Voltage"],
        "MinCellVoltage":      [33015, 1, 'UINT16', "Min Cell Voltage"],

        "BMSERRORCODE": [33016, 2, 'UINT32', "BMS ERROR CODE"],
        "BMSWARNCODE":  [33018, 2, 'UINT32', "BMS WARN CODE"],
    }    


    for (const [key, value] of Object.entries(registers)) {
        // console.log(key, value);
        // start normale poll
        client.readHoldingRegisters(value[0],value[1])
        .then(function(resp) {
            // console.log(resp.response._body);
            if ( value[2] == 'UINT16') {
                console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readInt16BE());
            } else if  ( value[2] == 'UINT32') {    
                console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readUInt32BE());
            } else if  ( value[2] == 'ACC32') {
                console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readUInt32BE());
            } else if ( value[2] == 'FLOAT') {
                console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readFloatBE());
            } else if ( value[2] == 'STRING') {
                console.log(value[3] + ": " + Buffer.from(resp.response._body._valuesAsBuffer, 'hex').toString());
            } else if ( value[2] == 'INT16' || value[2] == 'SCALE') {
                console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readInt16BE());
            } else if ( value[2] == 'INT32') {
                console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readInt32BE());
            } else if ( value[2] == 'FLOAT32' ) {
                console.log(value[3] + ": " + Buffer.from(resp.response._body._valuesAsBuffer, 'hex').swap16().swap32().readFloatBE());
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
    }, 16000 );

})


//avoid all the crash reports
socket.on('error', (err) => {
    console.log(err);
    socket.end();
})
