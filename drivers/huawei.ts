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

        // "Number of PV strings"	RO	U16	N/A	1	30071	1
        "TotalPVstrings": [30071, 1, 'UINT16', "Number of PV strings", 0], 
        // PV1 voltage	RO	I16	V	10	32016
        "PV1voltage": [32016, 1, 'INT16', "PV1 voltage", -1], 
        // PV1 current	RO	I16	A	100	32017
        "PV1current": [32017, 1, 'INT16', "PV1 current", -2], 
        // PV2 voltage	RO	I16	V	10	32018
        "PV2voltage": [32018, 1, 'INT16', "PV2 voltage", -1], 
        // PV2 current	RO	I16	A	100	32019
        "PV2current": [32019, 1, 'INT16', "PV2 current", -2], 

    };


    holdingRegistersBattery: Object = {

 

    };   


    processResult(result: Record<string, Measurement>) {
        if (result) {

            // result
            for (let k in result) {
                console.log(k, result[k].value, result[k].scale, result[k].label)
            }
  

            if (result['PHASE_A_CURRENT'] && result['PHASE_A_CURRENT'].value != '-1' && result['PHASE_A_CURRENT'].value != 'xxx') {
                this.addCapability('measure_current.phase1');
                var currenteac1 = Number(result['PHASE_A_CURRENT'].value) * (Math.pow(10, Number(result['PHASE_A_CURRENT'].scale)));
                this.setCapabilityValue('measure_current.phase1', currenteac1);
            }
            if (result['PHASE_B_CURRENT'] && result['PHASE_B_CURRENT'].value != '-1' && result['PHASE_B_CURRENT'].value != 'xxx') {
                this.addCapability('measure_current.phase2');
                var currenteac2 = Number(result['PHASE_B_CURRENT'].value) * (Math.pow(10, Number(result['PHASE_B_CURRENT'].scale)));
                this.setCapabilityValue('measure_current.phase2', currenteac2);
            }
            if (result['PHASE_C_CURRENT'] && result['PHASE_C_CURRENT'].value != '-1' && result['PHASE_C_CURRENT'].value != 'xxx') {
                this.addCapability('measure_current.phase3');
                var currenteac3 = Number(result['PHASE_C_CURRENT'].value) * (Math.pow(10, Number(result['PHASE_C_CURRENT'].scale)));
                this.setCapabilityValue('measure_current.phase3', currenteac3);
            }

            if (result['PV1current'] && result['PV1current'].value != '-1' && result['PV1current'].value != 'xxx') {
                this.addCapability('measure_current.pv1');
                var currentepv1 = Number(result['PV1current'].value) * (Math.pow(10, Number(result['PV1current'].scale)));
                this.setCapabilityValue('measure_current.pv1', currentepv1);
            }
            if (result['PV2current'] && result['PV2current'].value != '-1' && result['PV2current'].value != 'xxx') {
                this.addCapability('measure_current.pv2');
                var currentpv2 = Number(result['PV2current'].value) * (Math.pow(10, Number(result['PV2current'].scale)));
                this.setCapabilityValue('measure_current.pv2', currentpv2);
            }

            if (result['INTERNAL_TEMPERATURE'] && result['INTERNAL_TEMPERATURE'].value != 'xxx') {
                this.addCapability('measure_temperature.invertor');
                var temperature = Number(result['INTERNAL_TEMPERATURE'].value) * (Math.pow(10, Number(result['INTERNAL_TEMPERATURE'].scale)));
                this.setCapabilityValue('measure_temperature.invertor', temperature);
            }

            if (result['DAILY_YIELD_ENERGY'] && result['DAILY_YIELD_ENERGY'].value != 'xxx') {
                this.addCapability('meter_power.daily');
                var DAILY_YIELD_ENERGY = Number(result['DAILY_YIELD_ENERGY'].value) * (Math.pow(10, Number(result['DAILY_YIELD_ENERGY'].scale)));
                this.setCapabilityValue('meter_power.daily', DAILY_YIELD_ENERGY);
            }

            if (result['ACCUMULATED_YIELD_ENERGY'] && result['ACCUMULATED_YIELD_ENERGY'].value != 'xxx') {
                this.addCapability('meter_power');
                var ACCUMULATED_YIELD_ENERGY = Number(result['ACCUMULATED_YIELD_ENERGY'].value) * (Math.pow(10, Number(result['ACCUMULATED_YIELD_ENERGY'].scale)));
                this.setCapabilityValue('meter_power', ACCUMULATED_YIELD_ENERGY);
            }


            if (result['GRID_VOLTAGE'] && result['GRID_VOLTAGE'].value != 'xxx') {
                this.addCapability('measure_voltage');
                var GRID_VOLTAGE = Number(result['GRID_VOLTAGE'].value) * (Math.pow(10, Number(result['GRID_VOLTAGE'].scale)));
                this.setCapabilityValue('measure_voltage', GRID_VOLTAGE);
            }

            if (result['PHASE_A_VOLTAGE'] && result['PHASE_A_VOLTAGE'].value != 'xxx') {
                this.addCapability('measure_voltage.phase1');
                var PHASE_A_VOLTAGE = Number(result['PHASE_A_VOLTAGE'].value) * (Math.pow(10, Number(result['PHASE_A_VOLTAGE'].scale)));
                this.setCapabilityValue('measure_voltage.phase1', PHASE_A_VOLTAGE);
            }

            if (result['PHASE_B_VOLTAGE'] && result['PHASE_B_VOLTAGE'].value != 'xxx') {
                this.addCapability('measure_voltage.phase2');
                var PHASE_B_VOLTAGE = Number(result['PHASE_B_VOLTAGE'].value) * (Math.pow(10, Number(result['PHASE_B_VOLTAGE'].scale)));
                this.setCapabilityValue('measure_voltage.phase2', PHASE_B_VOLTAGE);
            }

            if (result['PHASE_C_VOLTAGE'] && result['PHASE_C_VOLTAGE'].value != 'xxx') {
                this.addCapability('measure_voltage.phase3');
                var PHASE_C_VOLTAGE = Number(result['PHASE_C_VOLTAGE'].value) * (Math.pow(10, Number(result['PHASE_C_VOLTAGE'].scale)));
                this.setCapabilityValue('measure_voltage.phase3', PHASE_C_VOLTAGE);
            }

            if (result['PV1voltage'] && result['PV1voltage'].value != 'xxx') {
                this.addCapability('measure_voltage.pv1');
                var PV1voltage = Number(result['PV1voltage'].value) * (Math.pow(10, Number(result['PV1voltage'].scale)));
                this.setCapabilityValue('measure_voltage.pv1', PV1voltage);
            }

            if (result['PV2voltage'] && result['PV2voltage'].value != 'xxx') {
                this.addCapability('measure_voltage.pv2');
                var PV2voltage = Number(result['PV2voltage'].value) * (Math.pow(10, Number(result['PV2voltage'].scale)));
                this.setCapabilityValue('measure_voltage.pv2', PV2voltage);
            }

            if (result['inputPower'] && result['inputPower'].value != 'xxx' ) {
                this.addCapability('measure_power');
                var inputPower = Number(result['inputPower'].value) * (Math.pow(10, Number(result['inputPower'].scale)));
                this.setCapabilityValue('measure_power', inputPower);
            }
        
            if (result['ACTIVE_POWER'] && result['ACTIVE_POWER'].value != 'xxx' ) {
                this.addCapability('measure_power.active_power');
                var ACTIVE_POWER = Number(result['ACTIVE_POWER'].value) * (Math.pow(10, Number(result['ACTIVE_POWER'].scale)));
                this.setCapabilityValue('measure_power.active_power', ACTIVE_POWER);
            }

            if (result['DEVICE_STATUS'] && result['DEVICE_STATUS'].value != 'xxx' ) {
                this.addCapability('huawei_status');
                var huawei_status = Number(result['DEVICE_STATUS'].value);
                this.setCapabilityValue('huawei_status', huawei_status);
            }
        }
    }
}
