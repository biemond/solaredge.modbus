console.log('-------------------')


const modbus = require('jsmodbus');
const net = require('net');
const socket = new net.Socket();

let options = {
    'host': '192.168.42.79',
    'port': 502,
    'unitId': 1,
    'timeout': 26,
    'autoReconnect': false,
    'reconnectTimeout': 26,
    'logLabel' : 'solax Inverter',
    'logLevel': 'error',
    'logEnabled': true
}

let client = new modbus.client.TCP(socket, 1, 1500);
socket.setKeepAlive(false); 
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
        "FeedinOnPower":             [0x0123, 1, 'UINT16', "Grid connected pull in power point"],


        "SolarChargerUseMode":       [0x008B, 1, 'UINT16', "SolarChargerUseMode"],
        "PowerLimitsPercent":        [0x0025, 1, 'UINT16', "output power limits precent 0~100"],
        "ManualMode":                [0x008C, 1, 'UINT16', "Manual mode"],

        // 0x008D wBattery1_Type R 0：Lead Acid 1：Lithium 1 uint16 1
        "wBattery1_Type":             [0x008D, 1, 'UINT16', "Battery1 Type"],

        // 0x008E Charge_floatVolt R Lead-acid battery charge_float voltage 0.1V
        "Charge_floatVolt":        [0x008E, 1, 'UINT16', "Charge_floatVolt"],
        // 0x008F Battery_DischargeCutVoltage R Lead-acid battery discharge cut-off
        "BusBattery_DischargeCutVoltageVolt":        [0x008F, 1, 'UINT16', "Battery_DischargeCutVoltage"],


        // 0x0090 Battery_ChargeMaxCurrent R
        // Lead-acid battery charge
        // maximum current
        // 0.1A uint16 1
        "Battery_ChargeMaxCurrent":        [0x0090, 1, 'UINT16', "Battery_ChargeMaxCurrent"],

        // 0x0091 Battery_DischargeMaxCurrent R
        // Lead-acid battery discharge
        // maximum Current
        // 0.1A uint16 1
        "Battery_DischargeMaxCurrent":        [0x0091, 1, 'UINT16', "Battery_DischargeMaxCurrent"],

        // 0x0092 absorpt_voltage R Lead-acid battery absorpt_voltage 0.1V uint16 1
        "absorpt_voltage":        [0x0092, 1, 'UINT16', "absorpt_voltage"],

        // 0x00B6 Export control user limit R Export_control user limit 1W uint16 1
        "Export_control_user_limit":        [0x00B6, 1, 'UINT16', "Export control user limit"],
        // 0x00F0 HardExportPower R HardExportPower
        // 1W(X1)
        // 10W(X3)
        // uint16 1
        "HardExportPower":        [0x00F0, 1, 'UINT16', "HardExportPower"],
    }    

    inputRegisters = {

        "GridPower":                [0x0002, 1, 'INT16', "Inverter Power"],
        // 0x0046
        // feedin_power R
        // Feedin power is obtained from
        // Meter or CT.
        // (Postive mean generate
        // power; Negative mean
        // consumed power）
        // (0x46:LSB,0x47:MSB)
        // 1W int32 2
        "feedin_power":          [0x0046, 2, 'INT32', "Feedin power is obtained from Meter or CT"],




        // "GridVoltage":              [0x0000, 1, 'UINT16', "Inverter Voltage"],
        // "GridCurrent":              [0x0001, 1, 'INT16', "Inverter Current"],


        // // def value_function_house_load(initval, descr, datadict):
        // return ( datadict.get('inverter_load', 0) - datadict.get('measured_power', 0) )
        // name = "Inverter Power",
        // register = 0x2,
        // name = "Measured Power",
        // register = 0x46,


        // 0x0007 GridFrequency(X1) R GridFrequency 0.01Hz uint16 1

        // "Temperature":             [0x0008, 1, 'INT16', "radiator temperature"],
        "Powerdc1":                [0x000A, 1, 'UINT16', "Powerdc1"],
        "Powerdc2":                [0x000B, 1, 'UINT16', "Powerdc2"],

        // // 0x0014 BatVoltage_Charge1 R BatVoltage_Charge1 0.1V int16 1
        // "BatVoltage_Charge1":      [0x0014, 1, 'INT16', "BatVoltage_Charge1"],
        // // 0x0015 BatCurrent_Charge1 R BatCurrent_Charge1 0.1A int16 1
        // "BatCurrent_Charge1":      [0x0015, 1, 'INT16', "BatCurrent_Charge1"],
        // 0x0016 Batpower_Charge1 R Batpower_Charge1 1W int16 1
        "Batpower_Charge1":        [0x0016, 1, 'INT16', "Batpower_Charge1"],

        // 0x0018 TemperatureBat R TemperatureBat 1℃ int16
        "TemperatureBat":          [0x0018, 1, 'INT16', "TemperatureBat"],
        // 0x001C Battery Capacity R Battery capacity 1% uint16 1
        "BatteryCapacity":         [0x001C, 1, 'UINT16', "Battery Capacity"],
        // 0x0020 OutputEnergy_Charge_today R OutputEnergy_Charge_today 0.1kWh uint16 1
        "OutputEnergy_Charge_today": [0x0020, 1, 'UINT16', "OutputEnergy_Charge_today"],
        // 0x0023 InputEnergy_Charge_today R InputEnergy_Charge_today 0.1kWh uint16 1
        "InputEnergy_Charge_today":  [0x0023, 1, 'UINT16', "InputEnergy_Charge_today"],



        // ~0x0099
        // feedin_energy_today
        // R
        // energy to the grid
        // (meter)
        // (0x98:LSB,0x99:MSB)
        // 0.01kWh uint32
        // 2
        "feedin_energy_today":  [0x0098, 2, 'UINT32', "energy today to the grid"],
        // ~0x009B
        // consum_energy_today
        // R
        // energy form the grid
        // (meter)
        // (0x9A:LSB,0x9B:MSB)
        // 0.01kWh uint16
        "consum_energy_today":  [0x009A, 2, 'UINT32', "energy today from the grid"],

        // // 0x0048
        // // feedin_energy_total(meter) R
        // // energy to the grid
        // // (0x48:LSB,0x49:MSB)
        // // 0.01kWh uint32 2
        "feedin_energy_total":  [0x0048, 2, 'UINT32', "energy to the grid"],
        // // 0x004A
        // // consum_energy_total(meter) R
        // // energy form the grid
        // // (0x4A:LSB,0x4B:MSB)
        // // 0.01kWh uint32 2
        "consum_energy_total":  [0x004A, 2, 'UINT32', "energy form the grid"],




        // 0x0050 Etoday_togrid R
        // Today Energy
        // (Inverter AC Port)
        // 0.1kWh uint16 1
        "Etoday_togrid":        [0x0050, 1, 'UINT16', "Today's Solar Energy"],

        // 0x0052
        // Etotal_togrid R
        // Total Energy
        // (Inverter AC Port)
        // (0x52:LSB,0x53:MSB)
        // 0.1kWh uint32 2

        "Etotal_togrid":  [0x0052, 2, 'UINT32', "Total Energy (Inverter AC Port)"],

        // // 0x006A GridVoltage_R(X3) R GridVoltage_R 0.1V uint16 1
        // "GridVoltage_R(X3)":        [0x006A, 1, 'UINT16', "GridVoltage_R(X3)"],
        // // 0x006B GridCurrent_R(X3) R GridCurrent_R 0.1A int16 1
        // "GridCurrent_R(X3)":        [0x006B, 1, 'INT16', "GridCurrent_R(X3)"],
        // // 0x006C GridPower_R(X3) R GridPower_R 1W int16 1
        // "GridPower_R(X3)":          [0x006C, 1, 'INT16', "GridPower_R(X3)"],
        // // 0x006E GridVoltage_S(X3) R GridVoltage_S 0.1V uint16 1
        // "GridVoltage_S(X3)":        [0x006E, 1, 'UINT16', "GridVoltage_S(X3)"],
        // // 0x006F GridCurrent_S(X3) R GridCurrent_S 0.1A int16 1
        // "GridCurrent_S(X3)":        [0x006F, 1, 'INT16', "GridCurrent_S(X3)"],
        // // 0x0070 GridPower_S(X3) R GridPower_S 1W int16 1
        // "GridPower_S(X3)":          [0x0070, 1, 'INT16', "GridPower_S(X3)"],
        // // 0x0072 GridVoltage_T(X3) R GridVoltage_T 0.1V uint16 1
        // "GridVoltage_T(X3)":        [0x0072, 1, 'UINT16', "GridVoltage_T(X3)"],
        // // 0x0073 GridCurrent_T(X3) R GridCurrent_T 0.1A int16 1
        // "GridCurrent_T(X3)":        [0x0073, 1, 'INT16', "GridCurrent_T(X3)"],
        // // 0x0074 GridPower_T(X3) R GridPower_T 1W int16 1
        // "GridPower_T(X3)":          [0x0074, 1, 'INT16', "GridPower_T(X3)"],

        // 0x0082
        // ~0x0083
        // FeedinPower_Rphase(X3)
        // R
        // FeedinPower_Rphase
        // (meter/CT)
        // (082:LSB,0x83:MSB)
        // 1W int32
        // 2
        // "FeedinPower_Rphase(X3)":          [0x0082, 2, 'INT32', "FeedinPower_Rphase(X3)"],
        // // ~0x0085
        // // FeedinPower_Sphase(X3)
        // // R
        // // FeedinPower_Sphase
        // // (meter/CT)
        // // (0x84:LSB,0x85:MSB)
        // // 1W int32
        // // 2
        // "FeedinPower_Sphase(X3)":          [0x0084, 2, 'INT32', "FeedinPower_Sphase(X3)"],
        // // ~0x0087
        // // FeedinPower_Tphase(X3)
        // // R
        // // FeedinPower_Tphas
        // // e
        // // (meter/CT)
        // // (0x86:LSB,0x87:MSB)
        // // 1W int32
        // // 2
        // "FeedinPower_Sphase(X3)":          [0x0086, 2, 'INT32', "FeedinPower_Tphase(X3)"],

        // 0x0091 EchargeToday
        // R
        // EchargeToday
        // (Inverter AC Port)
        // 0.1kWh uint16
        // 1
        "EchargeToday":        [0x0091, 1, 'UINT16', "EchargeToday"],
        // ~0x0093
        // EchargeTotal
        // R
        // EchargeTotal
        // (Inverter AC Port)
        // (0x92:LSB,0x93:MSB)
        // 0.1kWh uint32
        // 2
        "EchargeTotal":  [0x0092, 2, 'UINT32', "EchargeTotal"],
        // // ~0x0095
        // // SolarEnergyTotal
        // // R
        // // SolarEnergyTotal
        // // (0x94:LSB,0x95:MSB)
        // // 0.1kWh uint32
        // // 2
        "SolarEnergyTotal":  [0x0094, 2, 'UINT32', "SolarEnergyTotal"],
        // 0x0096 SolarEnergyToday
        // R SolarEnergyToday 0.1kWh uint16
        // 1
        // 0x0097 REV
        // R
        // -
        // - uint16
        // 1
        "SolarEnergyToday":        [0x0096, 1, 'UINT16', "SolarEnergyToday"],


        // // 2
        // // 0x00BE BMS_UserSOC R BMS_UserSOC 1% Uint16 1
        // "BMS_UserSOC":        [0x00BE, 1, 'UINT16', "BMS_UserSOC"],
        // // 0x00BF BMS_UserSOH R BMS_UserSOH 1% Uint16 1
        // "BMS_UserSOH":        [0x00BF, 1, 'UINT16', "BMS_UserSOH"],
        // // 0x0102
        // // ActivePowerTarget R ActivePowerTarget 1W int32 2
        "ActivePowerTarget":  [0x0102, 2, 'INT32', "ActivePowerTarget"],

        // 0x0114
        // Charge_Discharg_Power R
        // Charge_Discharg_Power
        // (0x114:LSB,0x115:MSB)
        // 1W int32 2
        "Charge_Discharg_Power":  [0x0114, 2, 'INT32', "Charge_Discharg_Power"],

        // // 0x011C SocUpper R SocUpper 1% uint16 1
        // "SocUpper":        [0x011C, 1, 'UINT16', "SocUpper"],
        // // 0x011D SocLower R SocLower 1% uint16 1
        // "SocLower":        [0x011D, 1, 'UINT16', "SocLower"],


        // // 0x00BC Cell_Voltage_High R Cell_Voltage_High 0.001V Uint16 1
        // "Cell_Voltage_High":       [0x00BC, 1, 'UINT16', "Cell_Voltage_High"],
        // // 0x00BD Cell_Voltage_Low R Cell_Voltage_Low 0.001V Uint16 1
        // "Cell_Voltage_Low":        [0x00BD, 1, 'UINT16', "Cell_Voltage_Low"],

        // // 0x004C Off-gridVoltage(X1) R Off-grid Voltage 0.1V uint16 1
        // "Off-gridVoltage(X1)":        [0x004C, 1, 'UINT16', "Off-gridVoltage(X1)"],
        // // 0x004D Off-gridCurrent(X1) R Off-grid Current 0.1A uint16 1
        // "Off-gridCurrent(X1)":        [0x004D, 1, 'UINT16', "Off-gridCurrent(X1)"],
        // // 0x004E Off-gridPower(X1) R Off-grid power 1VA uint16 1
        // "Off-gridPower(X1)":        [0x004E, 1, 'UINT16', "Off-gridPower(X1)"],

        // // 0x0066 BusVolt R BusVolt 0.1V uint16 1
        // "BusVolt":        [0x0066, 1, 'UINT16', "BusVolt"],



    }    

    // for (const [key, value] of Object.entries(registers)) {
    //     // console.log(key, value);
    //     // start normale poll

    //     client.readHoldingRegisters(value[0],value[1])
    //     .then(function(resp) {
    //         // console.log(resp.response._body);
    //         if ( value[2] == 'UINT16') {
    //             console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readUInt16BE());
    //         } else if ( value[2] == 'STRING') {
    //             console.log(value[3] + ": " + Buffer.from(resp.response._body._valuesAsBuffer, 'hex').toString());
    //         } else if ( value[2] == 'INT16' || value[2] == 'SCALE') {
    //             console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readInt16BE());
    //         } else if  ( value[2] == 'UINT32') {    
    //             console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readUInt32LE());
    //         } else if ( value[2] == 'INT32') {
    //             console.log(value[3] + ": " + resp.response._body._valuesAsBuffer.readInt32LE());
    //         } else {
    //             console.log(key + ": type not found " + value[2]);
    //         }  
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //     });
    // }

    for (const [key, value] of Object.entries(inputRegisters)) {
        // console.log(key, value);
        // start normale poll
        client.readInputRegisters(value[0],value[1])
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
    }, 16000 );

})


//avoid all the crash reports
socket.on('error', (err) => {
    console.log(err);
    socket.end();
})
