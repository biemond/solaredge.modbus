import Homey, { Device } from 'homey';

export interface Measurement {
    value: string;
    scale: string;
    label: string;
}

export class Huawei extends Homey.Device {

    holdingRegisters: Object = {

       
        // rn.RATED_POWER: U32Register("W", 1, 30073, 2),
        // "ratedPower": [30073, 2, 'UINT32', "Rated Power", 0],

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

        // "Number of PV strings"	RO	U16	N/A	1	30071	1
        // "TotalPVstrings": [30071, 1, 'UINT16', "Number of PV strings", 0], 
        // PV1 voltage	RO	I16	V	10	32016
        "PV1voltage": [32016, 1, 'INT16', "PV1 voltage", -1], 
        // PV1 current	RO	I16	A	100	32017
        "PV1current": [32017, 1, 'INT16', "PV1 current", -2], 
        // PV2 voltage	RO	I16	V	10	32018
        "PV2voltage": [32018, 1, 'INT16', "PV2 voltage", -1], 
        // PV2 current	RO	I16	A	100	32019
        "PV2current": [32019, 1, 'INT16', "PV2 current", -2], 
    };

    holdingRegistersMeters: Object = {

        // rn.GRID_A_VOLTAGE: I32Register("V", 10, 37101, 2),
        "GRID_A_VOLTAGE": [37101, 2, 'INT32', "GRID PHASE_A_VOLTAGE", -1],    
        // rn.GRID_B_VOLTAGE: I32Register("V", 10, 37103, 2),
        "GRID_B_VOLTAGE": [37105, 2, 'INT32', "GRID PHASE_B_VOLTAGE", -1],    
        // rn.GRID_C_VOLTAGE: I32Register("V", 10, 37105, 2),
        "GRID_C_VOLTAGE": [37105, 2, 'INT32', "GRID PHASE_C_VOLTAGE", -1], 

        // rn.ACTIVE_GRID_A_CURRENT: I32Register("I", 100, 37107, 2),
        "GRID_PHASE_A_CURRENT": [37107, 2, 'INT32', "GRID PHASE_A_CURRENT", -2],   
        // rn.ACTIVE_GRID_B_CURRENT: I32Register("I", 100, 37109, 2),
        "GRID_PHASE_B_CURRENT": [37109, 2, 'INT32', "GRID PHASE_B_CURRENT", -2],   
        // rn.ACTIVE_GRID_C_CURRENT: I32Register("I", 100, 37111, 2),
        "GRID_PHASE_C_CURRENT": [37111, 2, 'INT32', "GRID PHASE_C_CURRENT", -2],  

        // rn.POWER_METER_ACTIVE_POWER: I32Register("W", 1, 37113, 2),
        "POWER_METER_ACTIVE_POWER": [37113, 2, 'INT32', "POWER METER_ACTIVE_POWER", 0],  

        // rn.GRID_EXPORTED_ENERGY: I32AbsoluteValueRegister("kWh", 100, 37119, 2),
        "GRID_EXPORTED_ENERGY": [37119, 2, 'INT32', "GRID_EXPORTED_ENERGY", -2],  
        // rn.GRID_ACCUMULATED_ENERGY: I32Register("kWh", 100, 37121, 2),
        "GRID_ACCUMULATED_ENERGY": [37121, 2, 'INT32', "GRID_ACCUMULATED_ENERGY", -2],  

        // rn.ACTIVE_GRID_A_POWER: I32Register("W", 1, 37132, 2),
        "ACTIVE_GRID_A_POWER": [37132, 2, 'INT32', "ACTIVE_GRID_A_POWER", 0],  
        // rn.ACTIVE_GRID_B_POWER: I32Register("W", 1, 37134, 2),
        "ACTIVE_GRID_B_POWER": [37134, 2, 'INT32', "ACTIVE_GRID_B_POWER", 0],  
        // rn.ACTIVE_GRID_C_POWER: I32Register("W", 1, 37136, 2),
        "ACTIVE_GRID_C_POWER": [37136, 2, 'INT32', "ACTIVE_GRID_C_POWER", 0],  

    }

    holdingRegistersBattery: Object = {
        // "STORAGE_RUNNING_STATUS": [37762, 1, 'UINT16', "RUNNING STATUS", 0],
        "STORAGE_CHARGE_DISCHARGE_POWER": [37765, 2, 'INT32', "CHARGE_DISCHARGE POWER", 0],   
        "STORAGE_STATE_OF_CAPACITY": [37760, 1, 'UINT16', "RUNNING STATUS", -1],

        "STORAGE_CURRENT_DAY_CHARGE_CAPACITY": [37784, 2, 'UINT32', "CURRENT_DAY_CHARGE_CAPACITY", -2],
        "STORAGE_CURRENT_DAY_DISCHARGE_CAPACITY": [37786, 2, 'UINT32', "CURRENT_DAY_DISCHARGE_CAPACITY", -2],

        "STORAGE_TOTAL_CHARGE": [37780, 2, 'UINT32', "TOTAL_CHARGE", -2],
        "STORAGE_TOTAL_DISCHARGE": [37782, 2, 'UINT32', "TOTAL_DISCHARGE", -2],        

        "STORAGE_MAXIMUM_CHARGE_POWER": [37046, 2, 'UINT32', "STORAGE_MAXIMUM_CHARGE_POWER", 0],    
        "STORAGE_MAXIMUM_DISCHARGE_POWER": [37048, 2, 'UINT32', "STORAGE_MAXIMUM_DISCHARGE_POWER", 0],    
        "STORAGE_RATED_CAPACITY": [37758, 2, 'UINT32', "STORAGE_RATED_CAPACITY", 0],    

        "ACTIVE_POWER_CONTROL_MODE": [47415, 1, 'UINT16', "ACTIVE_POWER_CONTROL_MODE", 0],        
        //         rn.ACTIVE_POWER_CONTROL_MODE: U16Register(rv.ActivePowerControlMode, 1, 47415, 1, writeable=True),

        //         """Active Power Control Mode."""

        //         UNLIMITED = 0  # default mode
        //         DI_ACTIVE_SCHEDULING = 1
        //         ZERO_POWER_GRID_CONNECTION = 5
        //         POWER_LIMITED_GRID_CONNECTION_WATT = 6
        //         POWER_LIMITED_GRID_CONNECTION_PERCENT = 7

        "REMOTE_CHARGE_DISCHARGE_CONTROL_MODE": [47589, 1, 'INT16', "REMOTE_CHARGE_DISCHARGE_CONTROL_MODE", 0],     
        // rn.REMOTE_CHARGE_DISCHARGE_CONTROL_MODE: I16Register(
        // rv.RemoteChargeDischargeControlMode, 1, 47589, 1, writeable=True
        // ),

        //         """Remote Charge/Discharge Control Mode"""

        //         LOCAL_CONTROL = 0
        //         REMOTE_CONTROL_MAXIMUM_SELF_CONSUMPTION = 1
        //         REMOTE_CONTROL_FULLY_FED_TO_GRID = 2
        //         REMOTE_CONTROL_TOU = 3
        //         REMOTE_CONTROL_AI_CONTROL = 4

        "STORAGE_FORCIBLE_CHARGE_DISCHARGE_SOC": [47101, 1, 'UINT16', "STORAGE_FORCIBLE_CHARGE_DISCHARGE_SOC", -1],   
        // rn.STORAGE_FORCIBLE_CHARGE_DISCHARGE_SOC: U16Register("%", 10, 47101, 1, writeable=True),

        "STORAGE_FORCIBLE_CHARGE_DISCHARGE_WRITE": [47100, 1, 'UINT16', "STORAGE_FORCIBLE_CHARGE_DISCHARGE_WRITE", 0],   
        // rn.STORAGE_FORCIBLE_CHARGE_DISCHARGE_WRITE: U16Register(
        // rv.StorageForcibleChargeDischarge, 1, 47100, 1, writeable=True
        // ),

        //         """Storage Product Model."""

        //         STOP = 0
        //         CHARGE = 1
        //         DISCHARGE = 2

        "STORAGE_EXCESS_PV_ENERGY_USE_IN_TOU": [47299, 1, 'UINT16', "STORAGE_EXCESS_PV_ENERGY_USE_IN_TOU", 0],   
        // rn.STORAGE_EXCESS_PV_ENERGY_USE_IN_TOU: U16Register(rv.StorageExcessPvEnergyUseInTOU, 1, 47299, 1, writeable=True),
        //         """Storage Excess PV Energy use in Time-of-Use."""

        //         FED_TO_GRID = 0
        //         CHARGE = 1


        "STORAGE_WORKING_MODE_SETTINGS": [47086, 1, 'UINT16', "STORAGE_WORKING_MODE_SETTINGS", 0],   
        // rn.STORAGE_WORKING_MODE_SETTINGS: U16Register(rv.StorageWorkingModesC, 1, 47086, 1, writeable=True),
        //         """Working mode of the Connected Energy Storage."""

        //         ADAPTIVE = 0
        //         FIXED_CHARGE_DISCHARGE = 1
        //         MAXIMISE_SELF_CONSUMPTION = 2
        //         TIME_OF_USE_LG = 3
        //         FULLY_FED_TO_GRID = 4
        //         TIME_OF_USE_LUNA2000 = 5



    };   


    processResult(result: Record<string, Measurement>) {
        if (result) {

            // result
            for (let k in result) {
                console.log(k, result[k].value, result[k].scale, result[k].label)
            }
  

            if (result['PHASE_A_CURRENT'] && result['PHASE_A_CURRENT'].value != '-1' && result['PHASE_A_CURRENT'].value != 'xxx'  && this.hasCapability('measure_current.phase1')) {
                this.addCapability('measure_current.phase1');
                var currenteac1 = Number(result['PHASE_A_CURRENT'].value) * (Math.pow(10, Number(result['PHASE_A_CURRENT'].scale)));
                this.setCapabilityValue('measure_current.phase1', currenteac1);
            }
            if (result['PHASE_B_CURRENT'] && result['PHASE_B_CURRENT'].value != '-1' && result['PHASE_B_CURRENT'].value != 'xxx' && this.hasCapability('measure_current.phase2')) {
                this.addCapability('measure_current.phase2');
                var currenteac2 = Number(result['PHASE_B_CURRENT'].value) * (Math.pow(10, Number(result['PHASE_B_CURRENT'].scale)));
                this.setCapabilityValue('measure_current.phase2', currenteac2);
            }
            if (result['PHASE_C_CURRENT'] && result['PHASE_C_CURRENT'].value != '-1' && result['PHASE_C_CURRENT'].value != 'xxx' && this.hasCapability('measure_current.phase3')) {
                this.addCapability('measure_current.phase3');
                var currenteac3 = Number(result['PHASE_C_CURRENT'].value) * (Math.pow(10, Number(result['PHASE_C_CURRENT'].scale)));
                this.setCapabilityValue('measure_current.phase3', currenteac3);
            }

            if (result['GRID_PHASE_A_CURRENT'] && result['GRID_PHASE_A_CURRENT'].value != '-1' && result['GRID_PHASE_A_CURRENT'].value != 'xxx'  && this.hasCapability('measure_current.grid_phase1')) {
                this.addCapability('measure_current.grid_phase1');
                var currenteac1 = Number(result['GRID_PHASE_A_CURRENT'].value) * (Math.pow(10, Number(result['GRID_PHASE_A_CURRENT'].scale)));
                this.setCapabilityValue('measure_current.grid_phase1', currenteac1);
            }
            if (result['GRID_PHASE_B_CURRENT'] && result['GRID_PHASE_B_CURRENT'].value != '-1' && result['GRID_PHASE_B_CURRENT'].value != 'xxx' && this.hasCapability('measure_current.grid_phase2')) {
                this.addCapability('measure_current.grid_phase2');
                var currenteac2 = Number(result['GRID_PHASE_B_CURRENT'].value) * (Math.pow(10, Number(result['GRID_PHASE_B_CURRENT'].scale)));
                this.setCapabilityValue('measure_current.grid_phase2', currenteac2);
            }
            if (result['GRID_PHASE_C_CURRENT'] && result['GRID_PHASE_C_CURRENT'].value != '-1' && result['GRID_PHASE_C_CURRENT'].value != 'xxx' && this.hasCapability('measure_current.grid_phase3')) {
                this.addCapability('measure_current.grid_phase3');
                var currenteac3 = Number(result['GRID_PHASE_C_CURRENT'].value) * (Math.pow(10, Number(result['GRID_PHASE_C_CURRENT'].scale)));
                this.setCapabilityValue('measure_current.grid_phase3', currenteac3);
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


            if (result['GRID_VOLTAGE'] && result['GRID_VOLTAGE'].value != 'xxx' && this.hasCapability('measure_voltage')) {
                this.addCapability('measure_voltage');
                var GRID_VOLTAGE = Number(result['GRID_VOLTAGE'].value) * (Math.pow(10, Number(result['GRID_VOLTAGE'].scale)));
                this.setCapabilityValue('measure_voltage', GRID_VOLTAGE);
            }

            if (result['GRID_A_VOLTAGE'] && result['GRID_A_VOLTAGE'].value != 'xxx' && this.hasCapability('measure_voltage.grid_phase1')) {
                this.addCapability('measure_voltage.grid_phase1');
                var GRID_A_VOLTAGE = Number(result['GRID_A_VOLTAGE'].value) * (Math.pow(10, Number(result['GRID_A_VOLTAGE'].scale)));
                this.setCapabilityValue('measure_voltage.grid_phase1', GRID_A_VOLTAGE);
            }

            if (result['GRID_B_VOLTAGE'] && result['GRID_B_VOLTAGE'].value != 'xxx' && this.hasCapability('measure_voltage.grid_phase2')) {
                this.addCapability('measure_voltage.grid_phase2');
                var GRID_B_VOLTAGE = Number(result['GRID_B_VOLTAGE'].value) * (Math.pow(10, Number(result['GRID_B_VOLTAGE'].scale)));
                this.setCapabilityValue('measure_voltage.grid_phase2', GRID_B_VOLTAGE);
            }

            if (result['GRID_C_VOLTAGE'] && result['GRID_C_VOLTAGE'].value != 'xxx' && this.hasCapability('measure_voltage.grid_phase3')) {
                this.addCapability('measure_voltage.grid_phase3');
                var GRID_C_VOLTAGE = Number(result['GRID_C_VOLTAGE'].value) * (Math.pow(10, Number(result['GRID_C_VOLTAGE'].scale)));
                this.setCapabilityValue('measure_voltage.grid_phase3', GRID_C_VOLTAGE);
            }        

            if (result['PHASE_A_VOLTAGE'] && result['PHASE_A_VOLTAGE'].value != 'xxx' && this.hasCapability('measure_voltage.phase1')) {
                this.addCapability('measure_voltage.phase1');
                var PHASE_A_VOLTAGE = Number(result['PHASE_A_VOLTAGE'].value) * (Math.pow(10, Number(result['PHASE_A_VOLTAGE'].scale)));
                this.setCapabilityValue('measure_voltage.phase1', PHASE_A_VOLTAGE);
            }

            if (result['PHASE_B_VOLTAGE'] && result['PHASE_B_VOLTAGE'].value != 'xxx' && this.hasCapability('measure_voltage.phase2')) {
                this.addCapability('measure_voltage.phase2');
                var PHASE_B_VOLTAGE = Number(result['PHASE_B_VOLTAGE'].value) * (Math.pow(10, Number(result['PHASE_B_VOLTAGE'].scale)));
                this.setCapabilityValue('measure_voltage.phase2', PHASE_B_VOLTAGE);
            }

            if (result['PHASE_C_VOLTAGE'] && result['PHASE_C_VOLTAGE'].value != 'xxx' && this.hasCapability('measure_voltage.phase3')) {
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

            let DEVICE_STATUS_DEFINITIONS: { [key: string]: string } = {
                "0": "Standby: initializing",
                "1": "Standby: detecting insulation resistance",
                "2": "Standby: detecting irradiation",
                "3": "Standby: grid detecting",
                "256": "Starting",
                "512": "On-grid",
                "513": "Grid Connection: power limited",
                "514": "Grid Connection: self-derating",
                "515": "Off-grid mode: running",
                "768": "Shutdown: fault",
                "769": "Shutdown: command",
                "770": "Shutdown: OVGR",
                "771": "Shutdown: communication disconnected",
                "772": "Shutdown: power limited",
                "773": "Shutdown: manual startup required",
                "774": "Shutdown: DC switches disconnected",
                "775": "Shutdown: rapid cutoff",
                "776": "Shutdown: input underpowered",
                "1025": "Grid scheduling: cosphi-P curve",
                "1026": "Grid scheduling: Q-U curve",
                "1027": "Grid scheduling: PF-U curve",
                "1028": "Grid scheduling: dry contact",
                "1029": "Grid scheduling: Q-P curve",
                "1280": "Spot-check ready",
                "1281": "Spot-checking",
                "1536": "Inspecting",
                "1792": "AFCI self check",
                "2048": "I-V scanning",
                "2304": "DC input detection",
                "2560": "Running: off-grid charging",
                "40960": "Standby: no irradiation",
            }

            if (result['DEVICE_STATUS'] && result['DEVICE_STATUS'].value != 'xxx' ) {
                this.addCapability('huawei_status');
                var huawei_status = result['DEVICE_STATUS'].value;
                this.setCapabilityValue('huawei_status',  DEVICE_STATUS_DEFINITIONS[huawei_status] );
                console.log('inverter status ' + DEVICE_STATUS_DEFINITIONS[huawei_status]);
            }


            // "STORAGE_STATE_OF_CAPACITY": [37760, 1, 'UINT16', "RUNNING STATUS", -1],
            if (result['STORAGE_STATE_OF_CAPACITY'] && result['STORAGE_STATE_OF_CAPACITY'].value != 'xxx' && this.hasCapability('measure_battery')) {
                this.addCapability('battery');
                this.addCapability('measure_battery');
                var soc = Number(result['STORAGE_STATE_OF_CAPACITY'].value) * (Math.pow(10, Number(result['STORAGE_STATE_OF_CAPACITY'].scale)));
                this.setCapabilityValue('battery', soc);
                this.setCapabilityValue('measure_battery', soc);
            }

            // "STORAGE_CHARGE_DISCHARGE_POWER": [37765, 2, 'INT32', "CHARGE_DISCHARGE POWER", 0],   
            if (result['STORAGE_CHARGE_DISCHARGE_POWER'] && result['STORAGE_CHARGE_DISCHARGE_POWER'].value != 'xxx' && this.hasCapability('measure_power.batt_discharge')) {
                this.addCapability('measure_power.batt_discharge');
                var discharge = Number(result['STORAGE_CHARGE_DISCHARGE_POWER'].value) * (Math.pow(10, Number(result['STORAGE_CHARGE_DISCHARGE_POWER'].scale)));
                if (discharge < 0 ){
                  this.setCapabilityValue('measure_power.batt_discharge', -1 * discharge);
                } else {
                  this.setCapabilityValue('measure_power.batt_discharge', 0);
                }
            }
            if (result['STORAGE_CHARGE_DISCHARGE_POWER'] && result['STORAGE_CHARGE_DISCHARGE_POWER'].value != 'xxx' && this.hasCapability('measure_power.batt_charge')) {
                this.addCapability('measure_power.batt_charge');
                var charge = Number(result['STORAGE_CHARGE_DISCHARGE_POWER'].value) * (Math.pow(10, Number(result['STORAGE_CHARGE_DISCHARGE_POWER'].scale)));
                if (charge > 0 ){
                    this.setCapabilityValue('measure_power.batt_charge', charge);
                } else {
                    this.setCapabilityValue('measure_power.batt_charge', 0);
                }
            }


            if (result['ACTIVE_GRID_A_POWER'] && result['ACTIVE_GRID_A_POWER'].value != 'xxx' && this.hasCapability('measure_power.grid_phase1')) {
                this.addCapability('measure_power.grid_phase1');
                var ACTIVE_GRID_A_POWER = Number(result['ACTIVE_GRID_A_POWER'].value) * (Math.pow(10, Number(result['ACTIVE_GRID_A_POWER'].scale)));
                this.setCapabilityValue('measure_power.grid_phase1', ACTIVE_GRID_A_POWER);
            }

            if (result['ACTIVE_GRID_B_POWER'] && result['ACTIVE_GRID_B_POWER'].value != 'xxx' && this.hasCapability('measure_power.grid_phase2')) {
                this.addCapability('measure_power.grid_phase2');
                var ACTIVE_GRID_B_POWER = Number(result['ACTIVE_GRID_B_POWER'].value) * (Math.pow(10, Number(result['ACTIVE_GRID_B_POWER'].scale)));
                this.setCapabilityValue('measure_power.grid_phase2', ACTIVE_GRID_B_POWER);
            }

            if (result['ACTIVE_GRID_C_POWER'] && result['ACTIVE_GRID_C_POWER'].value != 'xxx' && this.hasCapability('measure_power.grid_phase3')) {
                this.addCapability('measure_power.grid_phase3');
                var ACTIVE_GRID_C_POWER = Number(result['ACTIVE_GRID_C_POWER'].value) * (Math.pow(10, Number(result['ACTIVE_GRID_C_POWER'].scale)));
                this.setCapabilityValue('measure_power.grid_phase3', ACTIVE_GRID_C_POWER);
            }            

            if (result['POWER_METER_ACTIVE_POWER'] && result['POWER_METER_ACTIVE_POWER'].value != 'xxx' && this.hasCapability('measure_power.grid_active_power')) {
                this.addCapability('measure_power.grid_active_power');
                var POWER_METER_ACTIVE_POWER = Number(result['POWER_METER_ACTIVE_POWER'].value) * (Math.pow(10, Number(result['POWER_METER_ACTIVE_POWER'].scale)));
                this.setCapabilityValue('measure_power.grid_active_power', POWER_METER_ACTIVE_POWER);
            }

            if (result['GRID_EXPORTED_ENERGY'] && result['GRID_EXPORTED_ENERGY'].value != 'xxx' && this.hasCapability('meter_power.grid_import')) {
                this.addCapability('meter_power.grid_import');
                var GRID_EXPORTED_ENERGY = Number(result['GRID_EXPORTED_ENERGY'].value) * (Math.pow(10, Number(result['GRID_EXPORTED_ENERGY'].scale)));
                this.setCapabilityValue('meter_power.grid_import', GRID_EXPORTED_ENERGY);
            }

            if (result['GRID_ACCUMULATED_ENERGY'] && result['GRID_ACCUMULATED_ENERGY'].value != 'xxx' && this.hasCapability('meter_power.grid_export')) {
                this.addCapability('meter_power.grid_export');
                var GRID_ACCUMULATED_ENERGY = Number(result['GRID_ACCUMULATED_ENERGY'].value) * (Math.pow(10, Number(result['GRID_ACCUMULATED_ENERGY'].scale)));
                this.setCapabilityValue('meter_power.grid_export', GRID_ACCUMULATED_ENERGY);
            } 

            if (result['STORAGE_CURRENT_DAY_DISCHARGE_CAPACITY'] && result['STORAGE_CURRENT_DAY_DISCHARGE_CAPACITY'].value != 'xxx' && this.hasCapability('meter_power.today_batt_output')) {
                this.addCapability('meter_power.today_batt_output');
                var STORAGE_CURRENT_DAY_DISCHARGE_CAPACITY = Number(result['STORAGE_CURRENT_DAY_DISCHARGE_CAPACITY'].value) * (Math.pow(10, Number(result['STORAGE_CURRENT_DAY_DISCHARGE_CAPACITY'].scale)));
                this.setCapabilityValue('meter_power.today_batt_output', STORAGE_CURRENT_DAY_DISCHARGE_CAPACITY);
            }

            if (result['STORAGE_CURRENT_DAY_CHARGE_CAPACITY'] && result['STORAGE_CURRENT_DAY_CHARGE_CAPACITY'].value != 'xxx' && this.hasCapability('meter_power.today_batt_input')) {
                this.addCapability('meter_power.today_batt_input');
                var STORAGE_CURRENT_DAY_CHARGE_CAPACITY = Number(result['STORAGE_CURRENT_DAY_CHARGE_CAPACITY'].value) * (Math.pow(10, Number(result['STORAGE_CURRENT_DAY_CHARGE_CAPACITY'].scale)));
                this.setCapabilityValue('meter_power.today_batt_input', STORAGE_CURRENT_DAY_CHARGE_CAPACITY);
            } 


            if (result['STORAGE_CURRENT_DAY_CHARGE_CAPACITY'] && result['STORAGE_CURRENT_DAY_CHARGE_CAPACITY'].value != 'xxx' && this.hasCapability('meter_power.today_batt_input')) {
                this.addCapability('meter_power.today_batt_input');
                var STORAGE_CURRENT_DAY_CHARGE_CAPACITY = Number(result['STORAGE_CURRENT_DAY_CHARGE_CAPACITY'].value) * (Math.pow(10, Number(result['STORAGE_CURRENT_DAY_CHARGE_CAPACITY'].scale)));
                this.setCapabilityValue('meter_power.today_batt_input', STORAGE_CURRENT_DAY_CHARGE_CAPACITY);
            } 

            if (result['ACTIVE_POWER_CONTROL_MODE'] && result['ACTIVE_POWER_CONTROL_MODE'].value != 'xxx' && this.hasCapability('activepower_controlmode')) {
                this.addCapability('activepower_controlmode');
                var ACTIVE_POWER_CONTROL_MODE = result['ACTIVE_POWER_CONTROL_MODE'].value;
                this.setCapabilityValue('activepower_controlmode', ACTIVE_POWER_CONTROL_MODE);
            } 

            if (result['STORAGE_FORCIBLE_CHARGE_DISCHARGE_WRITE'] && result['STORAGE_FORCIBLE_CHARGE_DISCHARGE_WRITE'].value != 'xxx' && this.hasCapability('storage_force_charge_discharge')) {
                this.addCapability('storage_force_charge_discharge');
                var STORAGE_FORCIBLE_CHARGE_DISCHARGE_WRITE = result['STORAGE_FORCIBLE_CHARGE_DISCHARGE_WRITE'].value;
                this.setCapabilityValue('storage_force_charge_discharge', STORAGE_FORCIBLE_CHARGE_DISCHARGE_WRITE);
            }             

            if (result['STORAGE_EXCESS_PV_ENERGY_USE_IN_TOU'] && result['STORAGE_EXCESS_PV_ENERGY_USE_IN_TOU'].value != 'xxx' && this.hasCapability('storage_excess_pv_energy_use_in_tou')) {
                this.addCapability('storage_excess_pv_energy_use_in_tou');
                var STORAGE_EXCESS_PV_ENERGY_USE_IN_TOU = result['STORAGE_EXCESS_PV_ENERGY_USE_IN_TOU'].value;
                this.setCapabilityValue('storage_excess_pv_energy_use_in_tou', STORAGE_EXCESS_PV_ENERGY_USE_IN_TOU);
            }   

            if (result['REMOTE_CHARGE_DISCHARGE_CONTROL_MODE'] && result['REMOTE_CHARGE_DISCHARGE_CONTROL_MODE'].value != 'xxx' && this.hasCapability('remote_charge_discharge_control_mode')) {
                this.addCapability('remote_charge_discharge_control_mode');
                var REMOTE_CHARGE_DISCHARGE_CONTROL_MODE = result['REMOTE_CHARGE_DISCHARGE_CONTROL_MODE'].value;
                this.setCapabilityValue('remote_charge_discharge_control_mode', REMOTE_CHARGE_DISCHARGE_CONTROL_MODE);
            }   

            if (result['STORAGE_WORKING_MODE_SETTINGS'] && result['STORAGE_WORKING_MODE_SETTINGS'].value != 'xxx' && this.hasCapability('storage_working_mode_settings')) {
                this.addCapability('remote_charge_discharge_control_mode');
                var STORAGE_WORKING_MODE_SETTINGS = result['STORAGE_WORKING_MODE_SETTINGS'].value;
                this.setCapabilityValue('storage_working_mode_settings', STORAGE_WORKING_MODE_SETTINGS);
            }   
        }
    }
}
