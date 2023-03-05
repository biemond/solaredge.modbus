import Homey, { Device } from 'homey';

export interface Measurement {
    value: string;
    scale: string;
    label: string;
}

export class Growatt extends Homey.Device {

    registers: Object = {

        "l1_current": [39, 1, 'UINT16', "L1 Current", -1 ],         
        "l2_current": [43, 1, 'UINT16', "L2 Current", -1 ],
        "l3_current": [47, 1, 'UINT16', "L3 Current", -1 ], 

        "temperature": [93, 1, 'UINT16', "Temperature", -1],

        "status":      [0, 1, 'UINT16', "Status", 0],        
        "inputPower":  [1, 2, 'UINT32', "Input Power", -1], 
        "outputPower": [35 ,2, 'UINT32', "Output Power", -1 ], 

        "pv1Voltage": [3 ,1, 'UINT16', "pv1 Voltage", -1 ],
        "pv2Voltage": [7 ,1, 'UINT16', "pv2 Voltage", -1 ], 


        "gridFrequency":     [37 ,1, 'UINT16', "Grid Frequency", -2 ],
        "gridVoltage":       [38 ,1, 'UINT16', "Grid Voltage", -1 ],
        "gridOutputCurrent": [39 ,1, 'UINT16', "Grid Output Current", -1 ],
        "gridOutputPower":   [40 ,2, 'UINT32', "Grid Output Power", -1 ], 
        "todayEnergy":       [53 ,2, 'UINT32', "Today Energy", -1 ], 
        "totalEnergy":       [55 ,2, 'UINT32', "Total Energy", -1 ], 


        // pv1Current: data[4] / 10.0, //A
        "pv1InputPower": [5, 2, 'UINT32', "pv1 Power", -1 ], 
        // pv2Voltage: data[7] / 10.0, //V
        // pv2Current: data[8] / 10.0, //A
        "pv2InputPower": [9, 2, 'UINT32', "pv2 Power", -1 ], 

        "pv1TodayEnergy": [59, 2, 'UINT32', "pv2 Today Energy", -1 ], 
        "pv1TotalEnergy": [61, 2, 'UINT32', "pv2 Total Energy", -1 ], 
        "pv2TodayEnergy": [63, 2, 'UINT32', "pv2 Today Energy", -1 ], 
        "pv2TotalEnergy": [65, 2, 'UINT32', "pv2 Total Energy", -1 ], 
        "pvEnergyTotal":  [91, 2, 'UINT32', "pv Total Energy", -1 ], 

        // ipmTemperature: data[94] / 10.0, //°C
        // inverterOutputPf: data[100], //powerfactor 0-20000
        "error": [105 ,1, 'UINT16', "Error", 0 ],
        // realPowerPercent: data[113] //% 0-100

        "battDischarge": [1009, 2, 'UINT32', "battery Discharge", -1 ], 
        "battCharge":    [1011, 2, 'UINT32', "battery Charge", -1 ], 
        "battvoltage":   [1013 ,1, 'UINT16', "battery Voltage", -2 ],
        "battsoc":       [1014 ,1, 'UINT16', "battery soc", 0 ],

        "batttemperature": [1040, 1, 'UINT16', "battery Temperature", -1],

        "bmssoc":          [1086 ,1, 'UINT16', "bms soc", 0 ],
        "bmstemperature":  [1089, 1, 'UINT16', "bms Temperature", -1],
        "bmscyclecount":   [1095, 1, 'UINT16', "bms cycle count", 0],
        "bmshealth":       [1096, 1, 'UINT16', "bms soh", 0],  
        "bmsstatus":       [1083, 1, 'UINT16', "bms status", 0], 
        "bmserror":        [1085, 1, 'UINT16', "bms error", 0],                           
    };


    processResult(result: Record<string, Measurement>) {
        if (result) {

            // result
            for (let k in result) {
                console.log(k, result[k].value, result[k].scale, result[k].label)
            }
            
            if (result['outputPower'] && result['outputPower'].value != 'xxx') {
                this.addCapability('measure_power');
                var acpower = Number(result['outputPower'].value) * (Math.pow(10, Number(result['outputPower'].scale)));
                this.setCapabilityValue('measure_power', Math.round(acpower));
            }

            if (result['gridOutputPower'] && result['gridOutputPower'].value != 'xxx') {
                this.addCapability('measure_power.gridoutput');
                var acpower = Number(result['gridOutputPower'].value) * (Math.pow(10, Number(result['gridOutputPower'].scale)));
                this.setCapabilityValue('measure_power.gridoutput', Math.round(acpower));
            }

            if (result['inputPower'] && result['inputPower'].value != 'xxx') {
                this.addCapability('measure_power.input');
                var acpower = Number(result['inputPower'].value) * (Math.pow(10, Number(result['inputPower'].scale)));
                this.setCapabilityValue('measure_power.input', Math.round(acpower));
            }

            if (result['pv1InputPower'] && result['pv1InputPower'].value != 'xxx') {
                this.addCapability('measure_power.pv1input');
                var acpower = Number(result['pv1InputPower'].value) * (Math.pow(10, Number(result['pv1InputPower'].scale)));
                this.setCapabilityValue('measure_power.pv1input', Math.round(acpower));
            }

            if (result['pv2InputPower'] && result['pv2InputPower'].value != 'xxx') {
                this.addCapability('measure_power.pv2input');
                var acpower = Number(result['pv2InputPower'].value) * (Math.pow(10, Number(result['pv2InputPower'].scale)));
                this.setCapabilityValue('measure_power.pv2input', Math.round(acpower));
            }            

            if (result['l1_current'] && result['l1_current'].value != '-1' && result['l1_current'].value != 'xxx') {
                this.addCapability('measure_current.phase1');
                var currenteac1 = Number(result['l1_current'].value) * (Math.pow(10,  Number(result['l1_current'].scale)));
                this.setCapabilityValue('measure_current.phase1', currenteac1);
            }
            if (result['l2_current'] && result['l2_current'].value != '-1' && result['l2_current'].value != 'xxx') {
                this.addCapability('measure_current.phase2');
                var currenteac2 = Number(result['l2_current'].value) * (Math.pow(10,  Number(result['l2_current'].scale)));
                this.setCapabilityValue('measure_current.phase2', currenteac2);
            }
            if (result['l3_current'] && result['l2_current'].value != '-1' && result['l3_current'].value != 'xxx') {
                this.addCapability('measure_current.phase3');
                var currenteac3 = Number(result['l3_current'].value) * (Math.pow(10,  Number(result['l3_current'].scale)));
                this.setCapabilityValue('measure_current.phase3', currenteac3);
            }

            if (result['temperature'] && result['temperature'].value != 'xxx') {
                this.addCapability('measure_temperature.invertor');
                var temperature = Number(result['temperature'].value) * (Math.pow(10, Number(result['temperature'].scale)));
                this.setCapabilityValue('measure_temperature.invertor', temperature);
            }

            if (result['todayEnergy'] && result['todayEnergy'].value != 'xxx') {
                this.addCapability('meter_power.daily');
                var total = Number(result['todayEnergy'].value) * (Math.pow(10, Number(result['todayEnergy'].scale)));
                this.setCapabilityValue('meter_power.daily', total);
            }

            if (result['pv1TodayEnergy'] && result['pv1TodayEnergy'].value != 'xxx') {
                this.addCapability('meter_power.pv1TodayEnergy');
                var total = Number(result['pv1TodayEnergy'].value) * (Math.pow(10, Number(result['pv1TodayEnergy'].scale)));
                this.setCapabilityValue('meter_power.pv1TodayEnergy', total);
            }

            if (result['pv2TodayEnergy'] && result['pv2TodayEnergy'].value != 'xxx') {
                this.addCapability('meter_power.pv2TodayEnergy');
                var total = Number(result['pv2TodayEnergy'].value) * (Math.pow(10, Number(result['pv2TodayEnergy'].scale)));
                this.setCapabilityValue('meter_power.pv2TodayEnergy', total);
            }

            if (result['totalEnergy'] && result['totalEnergy'].value != 'xxx') {
                this.addCapability('meter_power');
                var total = Number(result['totalEnergy'].value) * (Math.pow(10, Number(result['totalEnergy'].scale)));
                this.setCapabilityValue('meter_power', total / 1000);
            }

            if (result['pv1TotalEnergy'] && result['pv1TotalEnergy'].value != 'xxx') {
                this.addCapability('meter_power.pv1TotalEnergy');
                var total = Number(result['pv1TotalEnergy'].value) * (Math.pow(10, Number(result['pv1TotalEnergy'].scale)));
                this.setCapabilityValue('meter_power.pv1TotalEnergy', total / 1000);
            }

            if (result['pv2TotalEnergy'] && result['pv2TotalEnergy'].value != 'xxx') {
                this.addCapability('meter_power.pv2TotalEnergy');
                var total = Number(result['pv2TotalEnergy'].value) * (Math.pow(10, Number(result['pv2TotalEnergy'].scale)));
                this.setCapabilityValue('meter_power.pv2TotalEnergy', total / 1000);
            }

            // batt
            if (result['batttemperature'] && result['batttemperature'].value != 'xxx') {
                this.addCapability('measure_temperature.battery');
                var temperature = Number(result['batttemperature'].value) * (Math.pow(10, Number(result['batttemperature'].scale)));
                this.setCapabilityValue('measure_temperature.battery', temperature);
            }

            if (result['battsoc'] && result['battsoc'].value != 'xxx') {
                this.addCapability('battery');
                this.addCapability('measure_battery');
                var temperature = Number(result['battsoc'].value) * (Math.pow(10, Number(result['battsoc'].scale)));
                this.setCapabilityValue('battery', temperature);
                this.setCapabilityValue('measure_battery', temperature);
            }
            
            if (result['bmshealth'] && result['bmshealth'].value != 'xxx') {
                this.addCapability('batterysoh');
                var temperature = Number(result['bmshealth'].value) * (Math.pow(10, Number(result['bmshealth'].scale)));
                this.setCapabilityValue('batterysoh', temperature);
            }            

            if (result['battDischarge'] && result['battDischarge'].value != 'xxx') {
                this.addCapability('measure_power.batt_discharge');
                var temperature = Number(result['battDischarge'].value) * (Math.pow(10, Number(result['battDischarge'].scale)));
                this.setCapabilityValue('measure_power.batt_discharge', temperature);
            }
            if (result['battCharge'] && result['battCharge'].value != 'xxx') {
                this.addCapability('measure_power.batt_charge');
                var temperature = Number(result['battCharge'].value) * (Math.pow(10, Number(result['battCharge'].scale)));
                this.setCapabilityValue('measure_power.batt_charge', temperature);
            }            

            if (result['bmsstatus'] && result['bmsstatus'].value != 'xxx') {
                this.addCapability('batterystatus');
                var temperature = Number(result['bmsstatus'].value) * (Math.pow(10, Number(result['bmsstatus'].scale)));
                this.setCapabilityValue('batterystatus', temperature);
            }            

            if (result['bmscyclecount'] && result['bmscyclecount'].value != 'xxx') {
                this.addCapability('batterycycles');
                var temperature = Number(result['bmscyclecount'].value) * (Math.pow(10, Number(result['bmscyclecount'].scale)));
                this.setCapabilityValue('batterycycles', temperature);
            }    

        

        }
    }
}
