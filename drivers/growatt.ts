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
        "power_ac":    [40, 2, 'UINT32', "Power", -1],

        "pv1Voltage": [3 ,1, 'UINT16', "pv1 Voltage", -1 ],
        "pv2Voltage": [7 ,1, 'UINT16', "pv2 Voltage", -1 ], 


        "gridFrequency":     [37 ,1, 'UINT16', "Grid Frequency", -2 ],
        "gridVoltage":       [38 ,1, 'UINT16', "Grid Voltage", -1 ],
        "gridOutputCurrent": [39 ,1, 'UINT16', "Grid Output Current", -1 ],
        "gridOutputPower":   [40 ,2, 'UINT32', "Grid Output Power", -1 ], 
        "todayEnergy":       [53 ,2, 'UINT32', "Today Energy", -1 ], 
        "totalEnergy":       [55 ,2, 'UINT32', "Total Energy", -1 ], 


        // pv1Current: data[4] / 10.0, //A
        // pv1InputPower: (data[5] << 16 | data[6]) / 10.0, //W
        // pv2Voltage: data[7] / 10.0, //V
        // pv2Current: data[8] / 10.0, //A
        // pv2InputPower: (data[9] << 16 | data[10]) / 10.0, //W

        // pv1TodayEnergy: (data[59] << 16 | data[60]) / 10.0, //kWh
        // pv1TotalEnergy: (data[61] << 16 | data[62]) / 10.0, //kWh
        // pv2TodayEnergy: (data[63] << 16 | data[64]) / 10.0, //kWh
        // pv2TotalEnergy: (data[65] << 16 | data[66]) / 10.0, //kWh
        // pvEnergyTotal: (data[91] << 16 | data[92]) / 10.0, //kWh

        // ipmTemperature: data[94] / 10.0, //°C
        // inverterOutputPf: data[100], //powerfactor 0-20000
        // error: errorMap[data[105]] || data[105],
        // realPowerPercent: data[113] //% 0-100


    };


    processResult(result: Record<string, Measurement>) {
        if (result) {

            // result
            for (let k in result) {
                console.log(k, result[k].value, result[k].scale, result[k].label)
            }

            if (result['power_ac'] && result['power_ac'].value != 'xxx') {
                this.addCapability('measure_power');
                var acpower = Number(result['power_ac'].value) * (Math.pow(10, Number(result['power_ac'].scale)));
                this.setCapabilityValue('measure_power', Math.round(acpower));
            }

            if (result['inputPower'] && result['inputPower'].value != 'xxx') {
                this.addCapability('measure_power.input');
                var acpower = Number(result['inputPower'].value) * (Math.pow(10, Number(result['inputPower'].scale)));
                this.setCapabilityValue('measure_power.input', Math.round(acpower));
            }

            if (result['outputPower'] && result['outputPower'].value != 'xxx') {
                this.addCapability('measure_power.output');
                var acpower = Number(result['outputPower'].value) * (Math.pow(10, Number(result['outputPower'].scale)));
                this.setCapabilityValue('measure_power.output', Math.round(acpower));
            }

            if (result['current'] && result['current'].value != 'xxx') {
                this.addCapability('measure_current');
                var currenteac = Number(result['current'].value) * (Math.pow(10, Number(result['current'].scale)));
                this.setCapabilityValue('measure_current', currenteac);
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

            if (result['totalEnergy'] && result['totalEnergy'].value != 'xxx') {
                this.addCapability('meter_power');
                var total = Number(result['totalEnergy'].value) * (Math.pow(10, Number(result['totalEnergy'].scale)));
                this.setCapabilityValue('meter_power', total / 1000);
            }

        }
    }
}
