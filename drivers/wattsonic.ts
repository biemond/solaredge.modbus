import Homey, { Device } from 'homey';

export interface Measurement {
    value: string;
    scale: string;
    label: string;
}

export class Wattsonic extends Homey.Device {

    holdingRegisters: Object = {

        "SN":         [10000,	8, 'STRING',"Inverter SN", 0],
        "firmware":   [10011,	2, 'UINT32', "Firmware Version", 0],
        "equipment":  [10008,	1, 'UINT16', "Equipment Info", 0],        

        "l1_current": [11010, 1, 'UINT16', "L1 Current", -1], // 	A	10
        "l2_current": [11012, 1, 'UINT16', "L2 Current", -1],
        "l3_current": [11014, 1, 'UINT16', "L3 Current", -1],

        "temperature": [11032, 1, 'UINT16', "Temperature", -1], //℃	10

        // 10105	1	Inverter Running Status	U16	N/A	1	0:wait, wait for on-grid
        // 1:check, self-check
        // 2:On Grid
        // 3:fault
        // 4:flash, firmware update
        // 5.Off Grid

        "status": [10105, 1, 'UINT16', "Status", 0],

        // total solar
        "inputPower": [11028, 2, 'UINT32', "Input Power", 0], //	kW	1000

        "gridFrequency": [11015, 1, 'UINT16', "Grid Frequency", -2],  //Hz	100

        "pv1Voltage": [11038, 1, 'UINT16', "pv1 Voltage", -1], // V	10	
        "pv2Voltage": [11040, 1, 'UINT16', "pv2 Voltage", -1],
        
        "pvEnergyTotal": [11028, 2, 'UINT32', "PV Input Total Power", -1],  //	kW	1000
        "pv1InputPower": [11062, 2, 'UINT32', "PV1 Input Power", -1],  //	kW	1000
        "pv2InputPower": [11064, 2, 'UINT32', "PV2 Input Power", -1],
        "pvTodayEnergy": [11018, 2, 'UINT32', "Total PV Generation on that day", -1], // kWh	10
        "pvTotalEnergy": [11020, 2, 'UINT32', "Total PV Generation from Installation", -1], //kWh	10

        "error": [10112, 2, 'UINT32', "Error", 0],
    };


    holdingRegistersBattery: Object = {

        "SN":         [10000,	8, 'STRING',"Inverter SN", 0],
        "firmware":   [10011,	2, 'UINT32', "Firmware Version", 0],
        "equipment":  [10008,	1, 'UINT16', "Equipment Info", 0],        



        "l1_current": [11010, 1, 'UINT16', "L1 Current", -1], // 	A	10
        "l2_current": [11012, 1, 'UINT16', "L2 Current", -1],
        "l3_current": [11014, 1, 'UINT16', "L3 Current", -1],

        "temperature": [11032, 1, 'UINT16', "Temperature", -1], //℃	10

        // 10105	1	Inverter Running Status	U16	N/A	1	0:wait, wait for on-grid
        // 1:check, self-check
        // 2:On Grid
        // 3:fault
        // 4:flash, firmware update
        // 5.Off Grid

        "status": [10105, 1, 'UINT16', "Status", 0],

        // total solar
        "inputPower": [11028, 2, 'UINT32', "Input Power", 0], //	kW	1000
        // "outputPower": [35, 2, 'UINT32', "Output Power", -1],

        "gridFrequency": [11015, 1, 'UINT16', "Grid Frequency", -2],  //Hz	100

        // "gridVoltage": [38, 1, 'UINT16', "Grid Voltage", -1],
        // "gridOutputCurrent": [39, 1, 'UINT16', "Grid Output Current", -1],
        // "gridOutputPower": [40, 2, 'UINT32', "Grid Output Power", -1],
        // "todayEnergy": [53, 2, 'UINT32', "Today Energy", -1],
        // "totalEnergy": [55, 2, 'UINT32', "Total Energy", -1],

        "pv1Voltage": [11038, 1, 'UINT16', "pv1 Voltage", -1], // V	10	
        "pv2Voltage": [11040, 1, 'UINT16', "pv2 Voltage", -1],
        
        "pvEnergyTotal": [11028, 2, 'UINT32', "PV Input Total Power", -1],  //	kW	1000
        "pv1InputPower": [11062, 2, 'UINT32', "PV1 Input Power", -1],  //	kW	1000
        "pv2InputPower": [11064, 2, 'UINT32', "PV2 Input Power", -1],
        "pvTodayEnergy": [11018, 2, 'UINT32', "Total PV Generation on that day", -1], // kWh	10
        "pvTotalEnergy": [11020, 2, 'UINT32', "Total PV Generation from Installation", -1], //kWh	10

        "error": [10112, 2, 'UINT32', "Error", 0],
 
        // "battDischarge": [1009, 2, 'UINT32', "battery Discharge", -1],
        // "battCharge": [1011, 2, 'UINT32', "battery Charge", -1],
        "battvoltage":    [30254, 1, 'UINT16', "battery Voltage", -1],  // V	10
        "battery_mode":   [30256, 1, 'UINT16', "Battery mode",  0],

        // total batt power
        "battery_power":  [30258, 2, 'INT32',  "Battery power", 0],

        "battsoc": [33000, 1, 'UINT16', "battery soc", -2],  // 	%	100
        "bmstemperature": [33003, 1, 'UINT16', "bms Temperature", -1],  //	℃10
        "bmshealth": [33001, 1, 'UINT16', "bms soh", -2],  // %	100
        "bmsstatus": [33002, 1, 'UINT16', "bms status", 0],
        "bmserror": [33016, 2, 'UINT32', "bms error", 0],



        "today_grid_import": [31001, 1, 'UINT16', "Today's Grid Import", -1], // kWh	10	
        "today_grid_export": [31000, 1, 'UINT16', "Today's Grid Export", -1],

        "total_grid_import": [31104, 2, 'UINT32', "Total Grid Import", -1],  // kWh	10	
        // Total Energy injected to grid
        "total_grid_export": [31102, 2, 'UINT32', "Total Grid Export", -1],  // kWh	10

        "today_battery_output_energy": [31004, 1, 'UINT16', "Today's Battery Output Energy", -1], // kWh	10	
        "total_battery_output_energy": [31110, 2, 'UINT32', "Total Battery Output Energy", -1],
        "today_battery_input_energy":  [31003, 1, 'UINT16', "Today's Battery Input Energy", -1],
        "total_battery_intput_energy": [31108, 2, 'UINT32', "Total Battery Input Energy", -1],  // kWh	10

        "today_load": [31006, 1, 'UINT16', "Today's Load", -1],
        "total_load": [31114, 2, 'UINT32', "Total Load", -1],   //	kWh	10

    };   


    processResult(result: Record<string, Measurement>) {
        if (result) {

            // result
            for (let k in result) {
                console.log(k, result[k].value, result[k].scale, result[k].label)
            }

            if (result['equipment'] && result['equipment'].value != 'xxx') {
                let lowVal = Number(result['equipment'].value) & 0xFF;
                let highval = (Number(result['equipment'].value) >> 8) & 0xFF;
                console.log("equipment: " + highval + " " + lowVal );
            }
            if (result['SN'] && result['SN'].value != 'xxx') {
                console.log("SN: " + result['SN'].value );
            }
            if (result['firmware'] && result['firmware'].value != 'xxx') {
                console.log("firmware: " + result['firmware'].value );
            }


            
            // if (result['outputPower'] && result['outputPower'].value != 'xxx') {
            //     this.addCapability('measure_power');
            //     var outputPower = Number(result['outputPower'].value) * (Math.pow(10, Number(result['outputPower'].scale)));
            //     this.setCapabilityValue('measure_power', Math.round(outputPower));
            // }

            // if (result['gridOutputPower'] && result['gridOutputPower'].value != 'xxx') {
            //     this.addCapability('measure_power.gridoutput');
            //     var gridOutputPower = Number(result['gridOutputPower'].value) * (Math.pow(10, Number(result['gridOutputPower'].scale)));
            //     this.setCapabilityValue('measure_power.gridoutput', Math.round(gridOutputPower));
            // }

            if (result['inputPower'] && result['inputPower'].value != 'xxx') {
                this.addCapability('measure_power.input');
                var inputPower = Number(result['inputPower'].value) * (Math.pow(10, Number(result['inputPower'].scale)));
                this.setCapabilityValue('measure_power', Math.round(inputPower));
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
            if (result['l3_current'] && result['l2_current'].value != '-1' && result['l3_current'].value != 'xxx') {
                this.addCapability('measure_current.phase3');
                var currenteac3 = Number(result['l3_current'].value) * (Math.pow(10, Number(result['l3_current'].scale)));
                this.setCapabilityValue('measure_current.phase3', currenteac3);
            }

            if (result['temperature'] && result['temperature'].value != 'xxx') {
                this.addCapability('measure_temperature.invertor');
                var temperature = Number(result['temperature'].value) * (Math.pow(10, Number(result['temperature'].scale)));
                this.setCapabilityValue('measure_temperature.invertor', temperature);
            }

            // if (result['todayEnergy'] && result['todayEnergy'].value != 'xxx') {
            //     this.addCapability('meter_power.daily');
            //     var todayEnergy = Number(result['todayEnergy'].value) * (Math.pow(10, Number(result['todayEnergy'].scale)));
            //     this.setCapabilityValue('meter_power.daily', todayEnergy);
            // }

            if (result['pvTodayEnergy'] && result['pvTodayEnergy'].value != 'xxx') {
                this.addCapability('meter_power.pvTodayEnergy');
                var pvTodayEnergy = Number(result['pvTodayEnergy'].value) * (Math.pow(10, Number(result['pvTodayEnergy'].scale)));
                this.setCapabilityValue('meter_power.daily', pvTodayEnergy);
            }



            // if (result['totalEnergy'] && result['totalEnergy'].value != 'xxx') {
            //     this.addCapability('meter_power');
            //     var totalEnergy = Number(result['totalEnergy'].value) * (Math.pow(10, Number(result['totalEnergy'].scale)));
            //     this.setCapabilityValue('meter_power', totalEnergy);
            // }

            if (result['pvTotalEnergy'] && result['pvTotalEnergy'].value != 'xxx') {
                this.addCapability('meter_power.pvTotalEnergy');
                var pvTotalEnergy = Number(result['pvTotalEnergy'].value) * (Math.pow(10, Number(result['pvTotalEnergy'].scale)));
                this.setCapabilityValue('meter_power', pvTotalEnergy);
            }

            // if (result['gridVoltage'] && result['gridVoltage'].value != 'xxx') {
            //     this.addCapability('measure_voltage.meter');
            //     var gridVoltage = Number(result['gridVoltage'].value) * (Math.pow(10, Number(result['gridVoltage'].scale)));
            //     this.setCapabilityValue('measure_voltage.meter', gridVoltage);
            // }

            // // batt
            // if (result['battvoltage'] && result['battvoltage'].value != 'xxx' && this.hasCapability('measure_voltage.battery')) {
            //     this.addCapability('measure_voltage.battery');
            //     var battvoltage = Number(result['battvoltage'].value) * (Math.pow(10, Number(result['battvoltage'].scale)));
            //     this.setCapabilityValue('measure_voltage.battery', battvoltage);
            // }

            // if (result['batttemperature'] && result['batttemperature'].value != 'xxx' && this.hasCapability('measure_temperature.battery')) {
            //     this.addCapability('measure_temperature.battery');
            //     var temperature = Number(result['batttemperature'].value) * (Math.pow(10, Number(result['batttemperature'].scale)));
            //     this.setCapabilityValue('measure_temperature.battery', temperature);
            // }

            // if (result['battsoc'] && result['battsoc'].value != 'xxx' && this.hasCapability('measure_battery')) {
            //     this.addCapability('battery');
            //     this.addCapability('measure_battery');
            //     var soc = Number(result['battsoc'].value) * (Math.pow(10, Number(result['battsoc'].scale)));
            //     this.setCapabilityValue('battery', soc);
            //     this.setCapabilityValue('measure_battery', soc);
            // }

            // if (result['bmshealth'] && result['bmshealth'].value != 'xxx' && this.hasCapability('batterysoh')) {
            //     this.addCapability('batterysoh');
            //     var soh = Number(result['bmshealth'].value) * (Math.pow(10, Number(result['bmshealth'].scale)));
            //     this.setCapabilityValue('batterysoh', soh);
            // }

            // if (result['battDischarge'] && result['battDischarge'].value != 'xxx' && this.hasCapability('measure_power.batt_discharge')) {
            //     this.addCapability('measure_power.batt_discharge');
            //     var discharge = Number(result['battDischarge'].value) * (Math.pow(10, Number(result['battDischarge'].scale)));
            //     this.setCapabilityValue('measure_power.batt_discharge', discharge);
            // }
            // if (result['battCharge'] && result['battCharge'].value != 'xxx' && this.hasCapability('measure_power.batt_charge')) {
            //     this.addCapability('measure_power.batt_charge');
            //     var charge = Number(result['battCharge'].value) * (Math.pow(10, Number(result['battCharge'].scale)));
            //     this.setCapabilityValue('measure_power.batt_charge', charge);
            // }

            // if (result['bmsstatus'] && result['bmsstatus'].value != 'xxx' && this.hasCapability('batterystatus')) {
            //     this.addCapability('batterystatus');
            //     var battstatus = Number(result['bmsstatus'].value);
            //     this.setCapabilityValue('batterystatus', battstatus);
            // }



            // try {
            //     if (result['totalhouseload'] && result['totalhouseload'].value != 'xxx' && this.hasCapability('measure_power.houseload')) {
            //         this.addCapability('measure_power.houseload');
            //         var totalhouseload = Number(result['totalhouseload'].value) * (Math.pow(10, Number(result['totalhouseload'].scale)));
            //         this.setCapabilityValue('measure_power.houseload', totalhouseload);
            //     }
            // } catch (err) {
            //     console.log("error with key: totalhouseload");
            //     console.log(err);
            // }
            
            // if (result['today_grid_import'] && result['today_grid_import'].value != 'xxx' && this.hasCapability('meter_power.today_grid_import')) {
            //     this.addCapability('meter_power.today_grid_import');
            //     var today_grid_import = Number(result['today_grid_import'].value) * (Math.pow(10, Number(result['today_grid_import'].scale)));
            //     this.setCapabilityValue('meter_power.today_grid_import', today_grid_import);
            // }

            // if (result['today_grid_export'] && result['today_grid_export'].value != 'xxx' && this.hasCapability('meter_power.today_grid_export')) {
            //     this.addCapability('meter_power.today_grid_export');
            //     var today_grid_export = Number(result['today_grid_export'].value) * (Math.pow(10, Number(result['today_grid_export'].scale)));
            //     this.setCapabilityValue('meter_power.today_grid_export', today_grid_export);
            // }

            // if (result['today_battery_output_energy'] && result['today_battery_output_energy'].value != 'xxx' && this.hasCapability('meter_power.today_batt_output')) {
            //     this.addCapability('meter_power.today_batt_output');
            //     var today_battery_output_energy = Number(result['today_battery_output_energy'].value) * (Math.pow(10, Number(result['today_battery_output_energy'].scale)));
            //     this.setCapabilityValue('meter_power.today_batt_output', today_battery_output_energy);
            // }

            // if (result['today_battery_input_energy'] && result['today_battery_input_energy'].value != 'xxx' && this.hasCapability('meter_power.today_batt_input')) {
            //     this.addCapability('meter_power.today_batt_input');
            //     var today_battery_input_energy = Number(result['today_battery_input_energy'].value) * (Math.pow(10, Number(result['today_battery_input_energy'].scale)));
            //     this.setCapabilityValue('meter_power.today_batt_input', today_battery_input_energy);
            // }

            // try {
            //     if (result['today_load'] && result['today_load'].value != 'xxx' && this.hasCapability('meter_power.today_load')) {
            //         this.addCapability('meter_power.today_load');
            //         var today_load = Number(result['today_load'].value) * (Math.pow(10, Number(result['today_load'].scale)));
            //         this.setCapabilityValue('meter_power.today_load', today_load);
            //     }
            // } catch (err) {
            //     console.log("error with key: today_load");
            //     console.log(err);
            // }


            
        }
    }
}
