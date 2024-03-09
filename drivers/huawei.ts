import Homey, { Device } from 'homey';

export interface Measurement {
    value: string;
    scale: string;
    label: string;
}

export class Huawei extends Homey.Device {

    holdingRegisters: Object = {

       
        // rn.RATED_POWER: U32Register("W", 1, 30073, 2),
        "ratedPower": [30073, 2, 'UINT32', "Rated Power", 0],

        // // total solar
        "inputPower": [32064, 2, 'INT32', "Input Power", 0], //	kW	1000

        // rn.GRID_VOLTAGE: U16Register("V", 10, 32066, 1),
        "GRID_VOLTAGE": [32066, 1, 'UINT16', "GRID VOLTAGE", -1],    
        // rn.PHASE_A_VOLTAGE: U16Register("V", 10, 32069, 1),
        "PHASE_A_VOLTAGE": [32069, 1, 'UINT16', "GRID PHASE_A_VOLTAGE", -1],    
        // rn.PHASE_B_VOLTAGE: U16Register("V", 10, 32070, 1),
        "PHASE_B_VOLTAGE": [32070, 1, 'UINT16', "GRID PHASE_B_VOLTAGE", -1],    
        // rn.PHASE_C_VOLTAGE: U16Register("V", 10, 32071, 1),
        "PHASE_C_VOLTAGE": [32071, 1, 'UINT16', "GRID PHASE_C_VOLTAGE", -1],   
        // rn.GRID_CURRENT: I32Register("A", 1000, 32072, 2),
        "GRID_CURRENT": [32072, 2, 'INT32', "GRID GRID_CURRENT", -3],   
        // rn.PHASE_A_CURRENT: I32Register("A", 1000, 32072, 2),
        "PHASE_A_CURRENT": [32072, 2, 'INT32', "GRID PHASE_A_CURRENT", -3],   
        // rn.PHASE_B_CURRENT: I32Register("A", 1000, 32074, 2),
        "PHASE_B_CURRENT": [32074, 2, 'INT32', "GRID PHASE_B_CURRENT", -3],   
        // rn.PHASE_C_CURRENT: I32Register("A", 1000, 32076, 2),
        "PHASE_C_CURRENT": [32076, 2, 'INT32', "GRID PHASE_C_CURRENT", -3],   
 
        // rn.ACCUMULATED_YIELD_ENERGY: U32Register("kWh", 100, 32106, 2),
        "ACCUMULATED_YIELD_ENERGY": [32106, 2, 'UINT32', "ACCUMULATED YIELD ENERGY", -2],  
        // rn.DAY_ACTIVE_POWER_PEAK: I32Register("W", 1, 32078, 2),
        "DAY_ACTIVE_POWER_PEAK": [32078, 2, 'INT32', "DAY_ACTIVE_POWER_PEAK", 0],   
 
        // rn.ACTIVE_POWER: I32Register("W", 1, 32080, 2),
        "ACTIVE_POWER": [32080, 2, 'INT32', "ACTIVE_POWER", 0],   
        // rn.GRID_FREQUENCY: U16Register("Hz", 100, 32085, 1),
        "GRID_FREQUENCY": [32085, 1, 'UINT16', "GRID_FREQUENCY", -2], 
        // rn.INTERNAL_TEMPERATURE: I16Register("°C", 10, 32087, 1),
        "INTERNAL_TEMPERATURE": [32087, 1, 'INT16', "INTERNAL_TEMPERATURE", -1], 

        // rn.DEVICE_STATUS: U16Register(rv.DEVICE_STATUS_DEFINITIONS, 1, 32089, 1),
        "DEVICE_STATUS": [32089, 1, 'UINT16', "DEVICE_STATUS", 0], 
        // rn.DAILY_YIELD_ENERGY: U32Register("kWh", 100, 32114, 2),
        "DAILY_YIELD_ENERGY": [32114, 2, 'UINT32', "DAILY_YIELD_ENERGY", -2], 

        // rn.MODEL_NAME: StringRegister(30000, 15),
        "modelName": [30000, 15, 'STRING', "Model Name", 0],
        // rn.MODEL_ID: U16Register(None, 1, 30070, 1),
        "modelId": [30070, 1, 'UINT16', "Model ID", 0], 

    };


    holdingRegistersBattery: Object = {

 

    };   


    processResult(result: Record<string, Measurement>) {
        if (result) {

            // result
            for (let k in result) {
                console.log(k, result[k].value, result[k].scale, result[k].label)
            }

            // if (result['equipment'] && result['equipment'].value != 'xxx') {
            //     let lowVal = Number(result['equipment'].value) & 0xFF;
            //     let highval = (Number(result['equipment'].value) >> 8) & 0xFF;
            //     console.log("equipment: " + highval + " " + lowVal );
            // }
            // if (result['SN'] && result['SN'].value != 'xxx') {
            //     console.log("SN: " + result['SN'].value );
            // }
            // if (result['firmware'] && result['firmware'].value != 'xxx') {
            //     console.log("firmware: " + result['firmware'].value );
            // }


            
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


            // if (result['pv1InputPower'] && result['pv1InputPower'].value != 'xxx') {
            //     this.addCapability('measure_power.pv1input');
            //     var pv1InputPower = Number(result['pv1InputPower'].value) * (Math.pow(10, Number(result['pv1InputPower'].scale)));
            //     this.setCapabilityValue('measure_power.pv1input', Math.round(pv1InputPower));
            // }

            // if (result['pv2InputPower'] && result['pv2InputPower'].value != 'xxx') {
            //     this.addCapability('measure_power.pv2input');
            //     var pv2InputPower = Number(result['pv2InputPower'].value) * (Math.pow(10, Number(result['pv2InputPower'].scale)));
            //     this.setCapabilityValue('measure_power.pv2input', Math.round(pv2InputPower));
            // }

            // if (result['l1_current'] && result['l1_current'].value != '-1' && result['l1_current'].value != 'xxx') {
            //     this.addCapability('measure_current.phase1');
            //     var currenteac1 = Number(result['l1_current'].value) * (Math.pow(10, Number(result['l1_current'].scale)));
            //     this.setCapabilityValue('measure_current.phase1', currenteac1);
            // }
            // if (result['l2_current'] && result['l2_current'].value != '-1' && result['l2_current'].value != 'xxx') {
            //     this.addCapability('measure_current.phase2');
            //     var currenteac2 = Number(result['l2_current'].value) * (Math.pow(10, Number(result['l2_current'].scale)));
            //     this.setCapabilityValue('measure_current.phase2', currenteac2);
            // }
            // if (result['l3_current'] && result['l2_current'].value != '-1' && result['l3_current'].value != 'xxx') {
            //     this.addCapability('measure_current.phase3');
            //     var currenteac3 = Number(result['l3_current'].value) * (Math.pow(10, Number(result['l3_current'].scale)));
            //     this.setCapabilityValue('measure_current.phase3', currenteac3);
            // }

            // if (result['temperature'] && result['temperature'].value != 'xxx') {
            //     this.addCapability('measure_temperature.invertor');
            //     var temperature = Number(result['temperature'].value) * (Math.pow(10, Number(result['temperature'].scale)));
            //     this.setCapabilityValue('measure_temperature.invertor', temperature);
            // }

            // if (result['todayEnergy'] && result['todayEnergy'].value != 'xxx') {
            //     this.addCapability('meter_power.daily');
            //     var todayEnergy = Number(result['todayEnergy'].value) * (Math.pow(10, Number(result['todayEnergy'].scale)));
            //     this.setCapabilityValue('meter_power.daily', todayEnergy);
            // }

            // if (result['pvTodayEnergy'] && result['pvTodayEnergy'].value != 'xxx') {
            //     this.addCapability('meter_power.pvTodayEnergy');
            //     var pvTodayEnergy = Number(result['pvTodayEnergy'].value) * (Math.pow(10, Number(result['pvTodayEnergy'].scale)));
            //     this.setCapabilityValue('meter_power.daily', pvTodayEnergy);
            // }



            // if (result['totalEnergy'] && result['totalEnergy'].value != 'xxx') {
            //     this.addCapability('meter_power');
            //     var totalEnergy = Number(result['totalEnergy'].value) * (Math.pow(10, Number(result['totalEnergy'].scale)));
            //     this.setCapabilityValue('meter_power', totalEnergy);
            // }

            // if (result['pvTotalEnergy'] && result['pvTotalEnergy'].value != 'xxx') {
            //     this.addCapability('meter_power.pvTotalEnergy');
            //     var pvTotalEnergy = Number(result['pvTotalEnergy'].value) * (Math.pow(10, Number(result['pvTotalEnergy'].scale)));
            //     this.setCapabilityValue('meter_power', pvTotalEnergy);
            // }

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

            if (result['inputPower'] && result['inputPower'].value != 'xxx' ) {
                this.addCapability('measure_power');
                var inputPower = Number(result['inputPower'].value) * (Math.pow(10, Number(result['inputPower'].scale)));
                console.log('inputPower');
                this.setCapabilityValue('measure_power', inputPower);
                console.log(inputPower.toString());
            }


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

            // if (result['total_grid_import'] && result['total_grid_import'].value != 'xxx' && this.hasCapability('meter_power.grid_import')) {
            //     this.addCapability('meter_power.grid_import');
            //     var total_grid_import = Number(result['total_grid_import'].value) * (Math.pow(10, Number(result['total_grid_import'].scale)));
            //     this.setCapabilityValue('meter_power.grid_import', total_grid_import);
            // }

            // if (result['total_grid_export'] && result['total_grid_export'].value != 'xxx' && this.hasCapability('meter_power.grid_export')) {
            //     this.addCapability('meter_power.grid_export');
            //     var total_grid_export = Number(result['total_grid_export'].value) * (Math.pow(10, Number(result['total_grid_export'].scale)));
            //     this.setCapabilityValue('meter_power.grid_export', total_grid_export);
            // }

            // if (result['total_battery_input_energy'] && result['total_battery_input_energy'].value != 'xxx' && this.hasCapability('meter_power.battery_input')) {
            //     this.addCapability('meter_power.battery_input');
            //     var total_battery_input_energy = Number(result['total_battery_input_energy'].value) * (Math.pow(10, Number(result['total_battery_input_energy'].scale)));
            //     this.setCapabilityValue('meter_power.battery_input', total_battery_input_energy);
            // }

            // if (result['total_battery_output_energy'] && result['total_battery_output_energy'].value != 'xxx' && this.hasCapability('meter_power.battery_output')) {
            //     this.addCapability('meter_power.battery_output');
            //     var total_battery_output_energy = Number(result['total_battery_output_energy'].value) * (Math.pow(10, Number(result['total_battery_output_energy'].scale)));
            //     this.setCapabilityValue('meter_power.battery_output', total_battery_output_energy);
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

            // if (result['today_load'] && result['today_load'].value != 'xxx' && this.hasCapability('meter_power.today_load')) {
            //     this.addCapability('meter_power.today_load');
            //     var today_load = Number(result['today_load'].value) * (Math.pow(10, Number(result['today_load'].scale)));
            //     this.setCapabilityValue('meter_power.today_load', today_load);
            // }

            // if (result['HybridInverterWorkingMode'] && result['HybridInverterWorkingMode'].value != 'xxx' && this.hasCapability('hybridinvertermode')) {
            //     this.addCapability('hybridinvertermode');
            //     var HybridInverterWorking = Number(result['HybridInverterWorkingMode'].value );
            //     let lowVal = HybridInverterWorking & 0xFF;
            //     let highval = (HybridInverterWorking >> 8) & 0xFF;
            //     if ( highval == 2 ) {
            //         lowVal = 0;
            //     }
            //     this.setCapabilityValue('hybridinvertermode', highval.toString() + lowVal.toString());
            // }
            
        }
    }
}
