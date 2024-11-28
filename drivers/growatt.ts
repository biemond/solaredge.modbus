import Homey, { Device } from 'homey';

export interface Measurement {
    value: string;
    scale: string;
    label: string;
}

export class Growatt extends Homey.Device {

    holdingRegisters: Object = {
        "exportlimitenabled": [122, 1, 'UINT16', "Export Limit enable", 0],
        "exportlimitpowerrate": [123, 1, 'UINT16', "Export Limit Power Rate", -1],
        "prioritychange": [1044, 1, 'UINT16', "Priority", 0],
        "gridfirststopsoc": [1071, 1, 'UINT16', "GridFirst stop SOC", 0],
        "batfirststopsoc": [1091, 1, 'UINT16', "BatFirst stop SOC", 0],

        "acchargeswitch": [1092, 1, 'UINT16', "Batt AC charge switch", 0],

        "gridfirststarttime1": [1080, 1, 'UINT16', "Grid First Start Time", 0],
        "gridfirststoptime1": [1081, 1, 'UINT16', "Grid First Stop Time", 0],
        "gridfirststopswitch1": [1082, 1, 'UINT16', "Grid First Stop Switch 1", 0],

        "battfirststarttime1": [1100, 1, 'UINT16', "Battery First Start Time", 0],
        "battfirststoptime1": [1101, 1, 'UINT16', "Battery First Stop Time", 0],
        "battfirststopswitch1": [1102, 1, 'UINT16', "Battery First Stop Switch 1", 0],

        "loadfirststarttime1": [1110, 1, 'UINT16', "Load First Start Time", 0],
        "loadfirststoptime1": [1111, 1, 'UINT16', "Load First Stop Time", 0],
        "loadfirststopswitch1": [1112, 1, 'UINT16', "Load First Stop Switch 1", 0]


    }

    holdingRegistersTL: Object = {
        "exportlimitenabled": [122, 1, 'UINT16', "Export Limit enable", 0],
        "exportlimitpowerrate": [123, 1, 'UINT16', "Export Limit Power Rate", -1],
        "gridfirststopsoc": [3037, 1, 'UINT16', "GridFirst stop SOC", 0],
        "batfirststopsoc": [3048, 1, 'UINT16', "BatFirst stop SOC", 0],

        "acchargeswitch": [3049, 1, 'UINT16', "Batt AC charge switch", 0],

        "period1start": [3038, 1, 'UINT16', "period1start", 0],
        "period1stop":  [3039, 1, 'UINT16', "period1stop", 0],
        "period2start": [3040, 1, 'UINT16', "period2start", 0],
        "period2stop":  [3041, 1, 'UINT16', "period2stop", 0],
        "period3start": [3042, 1, 'UINT16', "period3start", 0],
        "period3stop":  [3043, 1, 'UINT16', "period3stop", 0],
        "period4start": [3044, 1, 'UINT16', "period4start", 0],
        "period4stop":  [3045, 1, 'UINT16', "period4stop", 0],                         
        // "gridfirststarttime1": [1080, 1, 'UINT16', "Grid First Start Time", 0],
        // "gridfirststoptime1": [1081, 1, 'UINT16', "Grid First Stop Time", 0],
        // "gridfirststopswitch1": [1082, 1, 'UINT16', "Grid First Stop Switch 1", 0],

        // "battfirststarttime1": [1100, 1, 'UINT16', "Battery First Start Time", 0],
        // "battfirststoptime1": [1101, 1, 'UINT16', "Battery First Stop Time", 0],
        // "battfirststopswitch1": [1102, 1, 'UINT16', "Battery First Stop Switch 1", 0],

        // "loadfirststarttime1": [1110, 1, 'UINT16', "Load First Start Time", 0],
        // "loadfirststoptime1": [1111, 1, 'UINT16', "Load First Stop Time", 0],
        // "loadfirststopswitch1": [1112, 1, 'UINT16', "Load First Stop Switch 1", 0]

             
    }

    registers: Object = {

        "l1_current": [39, 1, 'UINT16', "L1 Current", -1],
        "l2_current": [43, 1, 'UINT16', "L2 Current", -1],
        "l3_current": [47, 1, 'UINT16', "L3 Current", -1],

        "temperature": [93, 1, 'UINT16', "Temperature", -1],

        "status": [0, 1, 'UINT16', "Status", 0],
        "inputPower": [1, 2, 'UINT32', "Input Power", -1],
        "outputPower": [35, 2, 'UINT32', "Output Power", -1],

        "pv1Voltage": [3, 1, 'UINT16', "pv1 Voltage", -1],
        "pv2Voltage": [7, 1, 'UINT16', "pv2 Voltage", -1],


        "gridFrequency": [37, 1, 'UINT16', "Grid Frequency", -2],
        "gridVoltage": [38, 1, 'UINT16', "Grid Voltage", -1],
        "gridOutputCurrent": [39, 1, 'UINT16', "Grid Output Current", -1],
        "gridOutputPower": [40, 2, 'UINT32', "Grid Output Power", -1],
        "todayEnergy": [53, 2, 'UINT32', "Today Energy", -1],
        "totalEnergy": [55, 2, 'UINT32', "Total Energy", -1],


        // pv1Current: data[4] / 10.0, //A
        "pv1InputPower": [5, 2, 'UINT32', "pv1 Power", -1],
        // pv2Voltage: data[7] / 10.0, //V
        // pv2Current: data[8] / 10.0, //A
        "pv2InputPower": [9, 2, 'UINT32', "pv2 Power", -1],

        "pv1TodayEnergy": [59, 2, 'UINT32', "pv2 Today Energy", -1],
        "pv1TotalEnergy": [61, 2, 'UINT32', "pv2 Total Energy", -1],
        "pv2TodayEnergy": [63, 2, 'UINT32', "pv2 Today Energy", -1],
        "pv2TotalEnergy": [65, 2, 'UINT32', "pv2 Total Energy", -1],
        "pvEnergyTotal": [91, 2, 'UINT32', "pv Total Energy", -1],

        // "realoutputpercentage": [101, 1, 'UINT16', "real output power percentage", 0],
        // "outputmaxpowerlimited": [102 ,2, 'UINT32', "output max power limited", -1 ],

        // ipmTemperature: data[94] / 10.0, //°C
        // inverterOutputPf: data[100], //powerfactor 0-20000
        "error": [105, 1, 'UINT16', "Error", 0],
        // realPowerPercent: data[113] //% 0-100

        // "ac_chargepower": [116 ,2, 'UINT32', "AC charge Power", -1 ],

        "battDischarge": [1009, 2, 'UINT32', "battery Discharge", -1],
        "battCharge": [1011, 2, 'UINT32', "battery Charge", -1],
        "battvoltage": [1013, 1, 'UINT16', "battery Voltage", -1],
        "battsoc": [1014, 1, 'UINT16', "battery soc", 0],

        "batttemperature": [1040, 1, 'UINT16', "battery Temperature", -1],

        "bmssoc": [1086, 1, 'UINT16', "bms soc", 0],
        "bmstemperature": [1089, 1, 'UINT16', "bms Temperature", -1],
        "bmscyclecount": [1095, 1, 'UINT16', "bms cycle count", 0],
        "bmshealth": [1096, 1, 'UINT16', "bms soh", 0],
        "bmsstatus": [1083, 1, 'UINT16', "bms status", 0],
        "bmserror": [1085, 1, 'UINT16', "bms error", 0],

        "totalhouseload": [1037, 2, 'UINT32', "Total house Load", -1],
        "priority": [118, 1, 'UINT16', "priority", 0],

        "pactouserr":     [1015, 2, 'UINT32', "import from grid to user", -1],
        "pactousertotal": [1021, 2, 'UINT32', "import from grid to user total", -1],
        "pactogrid":      [1023, 2, 'UINT32', "export to grid", -1],
        "pactogridtotal": [1029, 2, 'UINT32', "export to grid total", -1],

        "today_grid_import": [1044, 2, 'UINT32', "Today's Grid Import", -1],
        "total_grid_import": [1046, 2, 'UINT32', "Total Grid Import", -1],
        "today_grid_export": [1048, 2, 'UINT32', "Today's Grid Export", -1],
        "total_grid_export": [1050, 2, 'UINT32', "Total Grid Export", -1],

        "today_battery_output_energy": [1052, 2, 'UINT32', "Today's Battery Output Energy", -1],
        "total_battery_output_energy": [1054, 2, 'UINT32', "Total Battery Output Energy", -1],
        "today_battery_input_energy": [1056, 2, 'UINT32', "Today's Battery Input Energy", -1],
        "total_battery_intput_energy": [1058, 2, 'UINT32', "Total Battery Input Energy", -1],

        "today_load": [1060, 2, 'UINT32', "Today's Load", -1],
        "total_load": [1062, 2, 'UINT32', "Total Load", -1],

    };

    registersTL: Object = {

        "l1_current": [39, 1, 'UINT16', "L1 Current", -1],
        "l2_current": [43, 1, 'UINT16', "L2 Current", -1],
        "l3_current": [47, 1, 'UINT16', "L3 Current", -1],

        "temperature": [93, 1, 'UINT16', "Temperature", -1],

        "status": [0, 1, 'UINT16', "Status", 0],
        "inputPower": [1, 2, 'UINT32', "Input Power", -1],
        "outputPower": [35, 2, 'UINT32', "Output Power", -1],

        "pv1Voltage": [3, 1, 'UINT16', "pv1 Voltage", -1],
        "pv2Voltage": [7, 1, 'UINT16', "pv2 Voltage", -1],


        "gridFrequency": [37, 1, 'UINT16', "Grid Frequency", -2],
        "gridVoltage": [38, 1, 'UINT16', "Grid Voltage", -1],
        "gridOutputCurrent": [39, 1, 'UINT16', "Grid Output Current", -1],
        "gridOutputPower": [40, 2, 'UINT32', "Grid Output Power", -1],
        "todayEnergy": [53, 2, 'UINT32', "Today Energy", -1],
        "totalEnergy": [55, 2, 'UINT32', "Total Energy", -1],


        // pv1Current: data[4] / 10.0, //A
        "pv1InputPower": [5, 2, 'UINT32', "pv1 Power", -1],
        // pv2Voltage: data[7] / 10.0, //V
        // pv2Current: data[8] / 10.0, //A
        "pv2InputPower": [9, 2, 'UINT32', "pv2 Power", -1],

        "pv1TodayEnergy": [59, 2, 'UINT32', "pv2 Today Energy", -1],
        "pv1TotalEnergy": [61, 2, 'UINT32', "pv2 Total Energy", -1],
        "pv2TodayEnergy": [63, 2, 'UINT32', "pv2 Today Energy", -1],
        "pv2TotalEnergy": [65, 2, 'UINT32', "pv2 Total Energy", -1],
        "pvEnergyTotal": [91, 2, 'UINT32', "pv Total Energy", -1],

        "error": [105, 1, 'UINT16', "Error", 0],

        "battDischarge": [3178, 2, 'UINT32', "battery Discharge", -1],
        "battCharge": [3180, 2, 'UINT32', "battery Charge", -1],
        "battvoltage": [3169, 1, 'UINT16', "battery Voltage", -2],
        "battsoc": [3171, 1, 'UINT16', "battery soc", 0],

        "batttemperature": [3218, 1, 'UINT16', "battery Temperature", -1],

        "bmssoc": [3215, 1, 'UINT16', "bms soc", 0],
        "bmstemperature": [3218, 1, 'UINT16', "bms Temperature", -1],
        "bmscyclecount": [3221, 1, 'UINT16', "bms cycle count", 0],
        "bmshealth": [3222, 1, 'UINT16', "bms soh", 0],
        "bmsstatus": [3212, 1, 'UINT16', "bms status", 0],
        "bmserror": [3202, 1, 'UINT16', "bms error", 0],

        "totalhouseload": [3045, 2, 'UINT32', "Total house Load", -1],
        "priority": [3144, 1, 'UINT16', "priority", 0],

        "today_grid_import": [3067, 2, 'UINT32', "Today's Grid Import", -1],
        "total_grid_import": [3069, 2, 'UINT32', "Total Grid Import", -1],
        "today_grid_export": [3071, 2, 'UINT32', "Today's Grid Export", -1],
        "total_grid_export": [3073, 2, 'UINT32', "Total Grid Export", -1],

        "today_battery_output_energy": [3125, 2, 'UINT32', "Today's Battery Output Energy", -1],
        "total_battery_output_energy": [3127, 2, 'UINT32', "Total Battery Output Energy", -1],
        "today_battery_input_energy": [3129, 2, 'UINT32', "Today's Battery Input Energy", -1],
        "total_battery_intput_energy": [3131, 2, 'UINT32', "Total Battery Input Energy", -1],

        "today_load": [3075, 2, 'UINT32', "Today's Load", -1],
        "total_load": [3077, 2, 'UINT32', "Total Load", -1],

    };    

    processResult(result: Record<string, Measurement>, maxpeakpower: number) {
        if (result) {

            // result
            for (let k in result) {
                console.log(k, result[k].value, result[k].scale, result[k].label)
            }

            if (result['outputPower'] && result['outputPower'].value != 'xxx') {
                this.addCapability('measure_power');
                var outputPower = Number(result['outputPower'].value) * (Math.pow(10, Number(result['outputPower'].scale)));
                
                if (maxpeakpower > 0 && outputPower > maxpeakpower ) {
                    // skip
                    console.log("skip measure_power, max: "+ maxpeakpower + " power: " + outputPower);
                } else {
                    this.setCapabilityValue('measure_power', Math.round(outputPower));
                }
            }

            if (result['gridOutputPower'] && result['gridOutputPower'].value != 'xxx') {
                this.addCapability('measure_power.gridoutput');
                var gridOutputPower = Number(result['gridOutputPower'].value) * (Math.pow(10, Number(result['gridOutputPower'].scale)));
                this.setCapabilityValue('measure_power.gridoutput', Math.round(gridOutputPower));
            }

            if (result['inputPower'] && result['inputPower'].value != 'xxx') {
                this.addCapability('measure_power.input');
                var inputPower = Number(result['inputPower'].value) * (Math.pow(10, Number(result['inputPower'].scale)));
                this.setCapabilityValue('measure_power.input', Math.round(inputPower));
            }

            if (result['pv1InputPower'] && result['pv1InputPower'].value != 'xxx') {
                this.addCapability('measure_power.pv1input');
                var pv1InputPower = Number(result['pv1InputPower'].value) * (Math.pow(10, Number(result['pv1InputPower'].scale)));
                this.setCapabilityValue('measure_power.pv1input', Math.round(pv1InputPower));
            }

            if (result['pv2InputPower'] && result['pv2InputPower'].value != 'xxx') {
                this.addCapability('measure_power.pv2input');
                var pv2InputPower = Number(result['pv2InputPower'].value) * (Math.pow(10, Number(result['pv2InputPower'].scale)));
                this.setCapabilityValue('measure_power.pv2input', Math.round(pv2InputPower));
            }

            if (result['l1_current'] && result['l1_current'].value != '-1' && result['l1_current'].value != 'xxx') {
                this.addCapability('measure_current.phase1');
                var currenteac1 = Number(result['l1_current'].value) * (Math.pow(10, Number(result['l1_current'].scale)));
                this.setCapabilityValue('measure_current.phase1', currenteac1);
            }
            if (result['l2_current'] && result['l2_current'].value != '-1' && result['l2_current'].value != 'xxx') {
                this.addCapability('measure_current.phase2');
                var currenteac2 = Number(result['l2_current'].value) * (Math.pow(10, Number(result['l2_current'].scale)));
                this.setCapabilityValue('measure_current.phase2', currenteac2);
            }
            if (result['l3_current'] && result['l3_current'].value != '-1' && result['l3_current'].value != 'xxx') {
                this.addCapability('measure_current.phase3');
                var currenteac3 = Number(result['l3_current'].value) * (Math.pow(10, Number(result['l3_current'].scale)));
                this.setCapabilityValue('measure_current.phase3', currenteac3);
            }

            if (result['temperature'] && result['temperature'].value != 'xxx') {
                this.addCapability('measure_temperature.invertor');
                var temperature = Number(result['temperature'].value) * (Math.pow(10, Number(result['temperature'].scale)));
                this.setCapabilityValue('measure_temperature.invertor', temperature);
            }

            if (result['todayEnergy'] && result['todayEnergy'].value != 'xxx') {
                this.addCapability('meter_power.daily');
                var todayEnergy = Number(result['todayEnergy'].value) * (Math.pow(10, Number(result['todayEnergy'].scale)));
                this.setCapabilityValue('meter_power.daily', todayEnergy);
            }

            if (result['pv1TodayEnergy'] && result['pv1TodayEnergy'].value != 'xxx') {
                this.addCapability('meter_power.pv1TodayEnergy');
                var pv1TodayEnergy = Number(result['pv1TodayEnergy'].value) * (Math.pow(10, Number(result['pv1TodayEnergy'].scale)));
                this.setCapabilityValue('meter_power.pv1TodayEnergy', pv1TodayEnergy);
            }

            if (result['pv2TodayEnergy'] && result['pv2TodayEnergy'].value != 'xxx') {
                this.addCapability('meter_power.pv2TodayEnergy');
                var pv2TodayEnergy = Number(result['pv2TodayEnergy'].value) * (Math.pow(10, Number(result['pv2TodayEnergy'].scale)));
                this.setCapabilityValue('meter_power.pv2TodayEnergy', pv2TodayEnergy);
            }

            if (result['totalEnergy'] && result['totalEnergy'].value != 'xxx') {
                this.addCapability('meter_power');
                var totalEnergy = Number(result['totalEnergy'].value) * (Math.pow(10, Number(result['totalEnergy'].scale)));
                this.setCapabilityValue('meter_power', totalEnergy);
            }

            if (result['pv1TotalEnergy'] && result['pv1TotalEnergy'].value != 'xxx') {
                this.addCapability('meter_power.pv1TotalEnergy');
                var pv1TotalEnergy = Number(result['pv1TotalEnergy'].value) * (Math.pow(10, Number(result['pv1TotalEnergy'].scale)));
                this.setCapabilityValue('meter_power.pv1TotalEnergy', pv1TotalEnergy);
            }

            if (result['pv2TotalEnergy'] && result['pv2TotalEnergy'].value != 'xxx') {
                this.addCapability('meter_power.pv2TotalEnergy');
                var pv2TotalEnergy = Number(result['pv2TotalEnergy'].value) * (Math.pow(10, Number(result['pv2TotalEnergy'].scale)));
                this.setCapabilityValue('meter_power.pv2TotalEnergy', pv2TotalEnergy);
            }

            if (result['gridVoltage'] && result['gridVoltage'].value != 'xxx') {
                this.addCapability('measure_voltage.meter');
                var gridVoltage = Number(result['gridVoltage'].value) * (Math.pow(10, Number(result['gridVoltage'].scale)));
                this.setCapabilityValue('measure_voltage.meter', gridVoltage);
            }

            // batt
            if (result['battvoltage'] && result['battvoltage'].value != 'xxx' && this.hasCapability('measure_voltage.battery')) {
                this.addCapability('measure_voltage.battery');
                var battvoltage = Number(result['battvoltage'].value) * (Math.pow(10, Number(result['battvoltage'].scale)));
                this.setCapabilityValue('measure_voltage.battery', battvoltage);
            }

            if (result['batttemperature'] && result['batttemperature'].value != 'xxx' && this.hasCapability('measure_temperature.battery')) {
                this.addCapability('measure_temperature.battery');
                var temperature = Number(result['batttemperature'].value) * (Math.pow(10, Number(result['batttemperature'].scale)));
                if ( temperature < 6 ) {
                    temperature = temperature * 10;
                }
                this.setCapabilityValue('measure_temperature.battery', temperature);
            }

            if (result['battsoc'] && result['battsoc'].value != 'xxx' && this.hasCapability('measure_battery')) {
                this.addCapability('battery');
                this.addCapability('measure_battery');
                var soc = Number(result['battsoc'].value) * (Math.pow(10, Number(result['battsoc'].scale)));
                this.setCapabilityValue('battery', soc);
                this.setCapabilityValue('measure_battery', soc);
            }

            if (result['bmshealth'] && result['bmshealth'].value != 'xxx' && this.hasCapability('batterysoh')) {
                this.addCapability('batterysoh');
                var soh = Number(result['bmshealth'].value) * (Math.pow(10, Number(result['bmshealth'].scale)));
                this.setCapabilityValue('batterysoh', soh);
            }

            if (result['battDischarge'] && result['battDischarge'].value != 'xxx' && this.hasCapability('measure_power.batt_discharge')) {
                this.addCapability('measure_power.batt_discharge');
                var discharge = Number(result['battDischarge'].value) * (Math.pow(10, Number(result['battDischarge'].scale)));
                this.setCapabilityValue('measure_power.batt_discharge', discharge);
            }
            if (result['battCharge'] && result['battCharge'].value != 'xxx' && this.hasCapability('measure_power.batt_charge')) {
                this.addCapability('measure_power.batt_charge');
                var charge = Number(result['battCharge'].value) * (Math.pow(10, Number(result['battCharge'].scale)));
                this.setCapabilityValue('measure_power.batt_charge', charge);
            }

            if (result['bmsstatus'] && result['bmsstatus'].value != 'xxx' && this.hasCapability('batterystatus')) {
                this.addCapability('batterystatus');
                var battstatus = Number(result['bmsstatus'].value);
                this.setCapabilityValue('batterystatus', battstatus);
            }

            if (result['bmscyclecount'] && result['bmscyclecount'].value != 'xxx' && this.hasCapability('batterycycles')) {
                this.addCapability('batterycycles');
                var bmscyclecount = Number(result['bmscyclecount'].value) * (Math.pow(10, Number(result['bmscyclecount'].scale)));
                this.setCapabilityValue('batterycycles', bmscyclecount);
            }

            if (result['exportlimitenabled'] && result['exportlimitenabled'].value != 'xxx' && this.hasCapability('exportlimitenabled')) {
                this.addCapability('exportlimitenabled');
                this.setCapabilityValue('exportlimitenabled', result['exportlimitenabled'].value);
            }

            if (result['exportlimitpowerrate'] && result['exportlimitpowerrate'].value != 'xxx' && this.hasCapability('exportlimitpowerrate')) {
                this.addCapability('exportlimitpowerrate');
                var exportlimitpowerrate = Number(result['exportlimitpowerrate'].value) * (Math.pow(10, Number(result['exportlimitpowerrate'].scale)));
                this.setCapabilityValue('exportlimitpowerrate', exportlimitpowerrate);
            }

            // if (result['ac_chargepower'] && result['ac_chargepower'].value != 'xxx' && this.hasCapability('measure_power.gridpowertoload')) {
            //     this.addCapability('measure_power.gridpowertoload');
            //     var gridpowertoload = Number(result['ac_chargepower'].value) * (Math.pow(10, Number(result['ac_chargepower'].scale)));
            //     this.setCapabilityValue('measure_power.gridpowertoload', gridpowertoload);
            //     console.log('gridpowertoload ' + gridpowertoload);
            // }     

            // if (result['realoutputpercentage'] && result['realoutputpercentage'].value != 'xxx' && this.hasCapability('realoutputpercentage')) {
            //     this.addCapability('realoutputpercentage');
            //     var realoutputpercentage = Number(result['realoutputpercentage'].value) * (Math.pow(10, Number(result['realoutputpercentage'].scale)));
            //     this.setCapabilityValue('realoutputpercentage', realoutputpercentage);
            // }   

            // if (result['outputmaxpowerlimited'] && result['outputmaxpowerlimited'].value != 'xxx' && this.hasCapability('outputmaxpowerlimited')) {
            //     this.addCapability('outputmaxpowerlimited');
            //     var outputmaxpowerlimited = Number(result['outputmaxpowerlimited'].value) * (Math.pow(10, Number(result['outputmaxpowerlimited'].scale)));
            //     this.setCapabilityValue('outputmaxpowerlimited', outputmaxpowerlimited);
            // }

            // if (result['exportlimitwhenfailed'] && result['exportlimitwhenfailed'].value != 'xxx' && this.hasCapability('exportlimitwhenfailed')) {
            //     this.addCapability('exportlimitwhenfailed');
            //     var exportlimitwhenfailed = Number(result['exportlimitwhenfailed'].value) * (Math.pow(10, Number(result['exportlimitwhenfailed'].scale)));
            //     this.setCapabilityValue('exportlimitwhenfailed', exportlimitwhenfailed);
            // } 

            if (result['priority'] && result['priority'].value != 'xxx' && this.hasCapability('priority')) {
                this.addCapability('priority');
                this.setCapabilityValue('priority', result['priority'].value);
            }

            try {
                if (result['totalhouseload'] && result['totalhouseload'].value != 'xxx' && this.hasCapability('measure_power.houseload')) {
                    this.addCapability('measure_power.houseload');
                    var totalhouseload = Number(result['totalhouseload'].value) * (Math.pow(10, Number(result['totalhouseload'].scale)));
                    this.setCapabilityValue('measure_power.houseload', totalhouseload);
                }
            } catch (err) {
                console.log("error with key: totalhouseload");
                console.log(err);
            }

            if (result['pactousertotal'] && result['pactousertotal'].value != 'xxx' && this.hasCapability('measure_power.import')) {
                this.addCapability('measure_power.import');
                var meterimport = Number(result['pactousertotal'].value) * (Math.pow(10, Number(result['pactousertotal'].scale)));
                this.setCapabilityValue('measure_power.import', meterimport);
            }            
            if (result['pactogridtotal'] && result['pactogridtotal'].value != 'xxx' && this.hasCapability('measure_power.export')) {
                this.addCapability('measure_power.export');
                var meterexport = Number(result['pactogridtotal'].value) * (Math.pow(10, Number(result['pactogridtotal'].scale)));
                this.setCapabilityValue('measure_power.export', meterexport);
            } 

            if (result['today_grid_import'] && result['today_grid_import'].value != 'xxx' && this.hasCapability('meter_power.today_grid_import')) {
                this.addCapability('meter_power.today_grid_import');
                var today_grid_import = Number(result['today_grid_import'].value) * (Math.pow(10, Number(result['today_grid_import'].scale)));
                this.setCapabilityValue('meter_power.today_grid_import', today_grid_import);
            }

            if (result['today_grid_export'] && result['today_grid_export'].value != 'xxx' && this.hasCapability('meter_power.today_grid_export')) {
                this.addCapability('meter_power.today_grid_export');
                var today_grid_export = Number(result['today_grid_export'].value) * (Math.pow(10, Number(result['today_grid_export'].scale)));
                this.setCapabilityValue('meter_power.today_grid_export', today_grid_export);
            }

            if (result['today_battery_output_energy'] && result['today_battery_output_energy'].value != 'xxx' && this.hasCapability('meter_power.today_batt_output')) {
                this.addCapability('meter_power.today_batt_output');
                var today_battery_output_energy = Number(result['today_battery_output_energy'].value) * (Math.pow(10, Number(result['today_battery_output_energy'].scale)));
                this.setCapabilityValue('meter_power.today_batt_output', today_battery_output_energy);
            }

            if (result['today_battery_input_energy'] && result['today_battery_input_energy'].value != 'xxx' && this.hasCapability('meter_power.today_batt_input')) {
                this.addCapability('meter_power.today_batt_input');
                var today_battery_input_energy = Number(result['today_battery_input_energy'].value) * (Math.pow(10, Number(result['today_battery_input_energy'].scale)));
                this.setCapabilityValue('meter_power.today_batt_input', today_battery_input_energy);
            }

            try {
                if (result['today_load'] && result['today_load'].value != 'xxx' && this.hasCapability('meter_power.today_load')) {
                    this.addCapability('meter_power.today_load');
                    var today_load = Number(result['today_load'].value) * (Math.pow(10, Number(result['today_load'].scale)));
                    this.setCapabilityValue('meter_power.today_load', today_load);
                }
            } catch (err) {
                console.log("error with key: today_load");
                console.log(err);
            }

            if (result['gridfirststopsoc'] && result['gridfirststopsoc'].value != 'xxx' && this.hasCapability('batteryminsoc')) {
                this.addCapability('batteryminsoc');
                var soc = Number(result['gridfirststopsoc'].value);
                this.setCapabilityValue('batteryminsoc', soc);
            }

            if (result['batfirststopsoc'] && result['batfirststopsoc'].value != 'xxx' && this.hasCapability('batterymaxsoc')) {
                this.addCapability('batterymaxsoc');
                var soc = Number(result['batfirststopsoc'].value);
                this.setCapabilityValue('batterymaxsoc', soc);
            }

            if (result['acchargeswitch'] && result['acchargeswitch'].value != 'xxx' && this.hasCapability('battacchargeswitch')) {
                this.addCapability('battacchargeswitch');
                var acswitch = result['acchargeswitch'].value;
                this.setCapabilityValue('battacchargeswitch', acswitch);
            }

            if (result['gridfirststarttime1'] && result['gridfirststarttime1'].value != 'xxx' && this.hasCapability('gridfirst1')) {
                var value = Number(result['gridfirststarttime1'].value);
                let lowVal = value & 0xFF;
                let highval = (value >> 8) & 0xFF;
                // console.log('gridfirststarttime1: hour ' + highval + ' min ' + lowVal );
                var value2 = Number(result['gridfirststoptime1'].value);
                let lowVal2 = value2 & 0xFF;
                let highval2 = (value2 >> 8) & 0xFF;
                // console.log('gridfirststoptime1: hour ' + highval2 + ' min ' + lowVal2 );
                var value3 = result['gridfirststopswitch1'].value;
                // console.log('gridfirststopswitch1: ' + value3);
                console.log('gridfirst1 from: ' + highval.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' ~ ' + highval2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' state: ' + value3);
                this.addCapability('gridfirst1');
                this.setCapabilityValue('gridfirst1', highval.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' ~ ' + highval2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' state: ' + value3);
            }
            if (result['battfirststarttime1'] && result['battfirststarttime1'].value != 'xxx' && this.hasCapability('battfirst1')) {
                var value = Number(result['battfirststarttime1'].value);
                let lowVal = value & 0xFF;
                let highval = (value >> 8) & 0xFF;
                // console.log('battfirststarttime1: hour ' + highval + ' min ' + lowVal );
                var value2 = Number(result['battfirststoptime1'].value);
                let lowVal2 = value2 & 0xFF;
                let highval2 = (value2 >> 8) & 0xFF;
                // console.log('battfirststoptime1: hour ' + highval2 + ' min ' + lowVal2 );
                var value3 = result['battfirststopswitch1'].value;
                // console.log('battfirststopswitch1: ' + value3);
                console.log('battfirst1 from: ' + highval.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' ~ ' + highval2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' state: ' + value3);
                this.addCapability('battfirst1');
                this.setCapabilityValue('battfirst1', highval.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' ~ ' + highval2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' state: ' + value3);
            }


            if (result['period1start'] && result['period1start'].value != 'xxx' && this.hasCapability('period1')) {
                var value = Number(result['period1start'].value);
                let lowVal = value & 0xFF;
                let highval = (value >> 8) & 0xFF;

                let bit0 = (highval & (1<<0)); 
                let bit1 = (highval & (1<<1));                                 
                let bit2 = (highval & (1<<2)); 
                let bit3 = (highval & (1<<3)); 
                let bit4 = (highval & (1<<4));
                let starthour = bit0 + bit1 + bit2 + bit3 + bit4; 

                let bit5 = (highval & (1<<5)); 
                let bit6 = (highval & (1<<6));
                let priorityPeriod1 = "";
                if ((bit5 + bit6) == 0) {
                    priorityPeriod1 = "load";
                } else if ((bit5 + bit6) == 32) {
                    priorityPeriod1 = "battery";
                } else {
                    priorityPeriod1 = "grid";
                }                              
                
                let enabledPeriod1 = false;
                let bit7 = (highval & (1<<7)); 
                if (bit7 == 128) {
                    enabledPeriod1 = true;
                }

                console.log('period1start: hour ' + starthour + ' min ' + lowVal );

                var value2 = Number(result['period1stop'].value);
                let lowVal2 = value2 & 0xFF;
                let highval2 = (value2 >> 8) & 0xFF;
                console.log('period1stop: hour ' + highval2 + ' min ' + lowVal2 );

                this.addCapability('period1');
                this.setCapabilityValue('period1', starthour.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' ~ ' + highval2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' state: ' + enabledPeriod1 + ' priority: ' + priorityPeriod1);
            }


            if (result['period2start'] && result['period2start'].value != 'xxx' && this.hasCapability('period2')) {
                var value = Number(result['period2start'].value);
                let lowVal = value & 0xFF;
                let highval = (value >> 8) & 0xFF;

                let bit0 = (highval & (1<<0)); 
                let bit1 = (highval & (1<<1));                                 
                let bit2 = (highval & (1<<2)); 
                let bit3 = (highval & (1<<3)); 
                let bit4 = (highval & (1<<4));
                let starthour = bit0 + bit1 + bit2 + bit3 + bit4; 

                let bit5 = (highval & (1<<5)); 
                let bit6 = (highval & (1<<6));
                let priorityperiod2 = "";
                if ((bit5 + bit6) == 0) {
                    priorityperiod2 = "load";
                } else if ((bit5 + bit6) == 32) {
                    priorityperiod2 = "battery";
                } else {
                    priorityperiod2 = "grid";
                }                              
                
                let enabledperiod2 = false;
                let bit7 = (highval & (1<<7)); 
                if (bit7 == 128) {
                    enabledperiod2 = true;
                }

                console.log('period2start: hour ' + starthour + ' min ' + lowVal );

                var value2 = Number(result['period2stop'].value);
                let lowVal2 = value2 & 0xFF;
                let highval2 = (value2 >> 8) & 0xFF;
                console.log('period2stop: hour ' + highval2 + ' min ' + lowVal2 );

                this.addCapability('period2');
                this.setCapabilityValue('period2', starthour.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' ~ ' + highval2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' state: ' + enabledperiod2 + ' priority: ' + priorityperiod2);
            }

            if (result['period3start'] && result['period3start'].value != 'xxx' && this.hasCapability('period3')) {
                var value = Number(result['period3start'].value);
                let lowVal = value & 0xFF;
                let highval = (value >> 8) & 0xFF;

                let bit0 = (highval & (1<<0)); 
                let bit1 = (highval & (1<<1));                                 
                let bit2 = (highval & (1<<2)); 
                let bit3 = (highval & (1<<3)); 
                let bit4 = (highval & (1<<4));
                let starthour = bit0 + bit1 + bit2 + bit3 + bit4; 

                let bit5 = (highval & (1<<5)); 
                let bit6 = (highval & (1<<6));
                let priorityperiod3 = "";
                if ((bit5 + bit6) == 0) {
                    priorityperiod3 = "load";
                } else if ((bit5 + bit6) == 32) {
                    priorityperiod3 = "battery";
                } else {
                    priorityperiod3 = "grid";
                }                              
                
                let enabledperiod3 = false;
                let bit7 = (highval & (1<<7)); 
                if (bit7 == 128) {
                    enabledperiod3 = true;
                }

                console.log('period3start: hour ' + starthour + ' min ' + lowVal );

                var value2 = Number(result['period3stop'].value);
                let lowVal2 = value2 & 0xFF;
                let highval2 = (value2 >> 8) & 0xFF;
                console.log('period3stop: hour ' + highval2 + ' min ' + lowVal2 );

                this.addCapability('period3');
                this.setCapabilityValue('period3', starthour.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' ~ ' + highval2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' state: ' + enabledperiod3 + ' priority: ' + priorityperiod3);
            }

            if (result['period4start'] && result['period4start'].value != 'xxx' && this.hasCapability('period4')) {
                var value = Number(result['period4start'].value);
                let lowVal = value & 0xFF;
                let highval = (value >> 8) & 0xFF;

                let bit0 = (highval & (1<<0)); 
                let bit1 = (highval & (1<<1));                                 
                let bit2 = (highval & (1<<2)); 
                let bit3 = (highval & (1<<3)); 
                let bit4 = (highval & (1<<4));
                let starthour = bit0 + bit1 + bit2 + bit3 + bit4; 

                let bit5 = (highval & (1<<5)); 
                let bit6 = (highval & (1<<6));
                let priorityperiod4 = "";
                if ((bit5 + bit6) == 0) {
                    priorityperiod4 = "load";
                } else if ((bit5 + bit6) == 32) {
                    priorityperiod4 = "battery";
                } else {
                    priorityperiod4 = "grid";
                }                              
                
                let enabledperiod4 = false;
                let bit7 = (highval & (1<<7)); 
                if (bit7 == 128) {
                    enabledperiod4 = true;
                }

                console.log('period4start: hour ' + starthour + ' min ' + lowVal );

                var value2 = Number(result['period4stop'].value);
                let lowVal2 = value2 & 0xFF;
                let highval2 = (value2 >> 8) & 0xFF;
                console.log('period4stop: hour ' + highval2 + ' min ' + lowVal2 );

                this.addCapability('period4');
                this.setCapabilityValue('period4', starthour.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' ~ ' + highval2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ':' + lowVal2.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }) + ' state: ' + enabledperiod4 + ' priority: ' + priorityperiod4);
            }
        }

        

    }
}
