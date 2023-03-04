import Homey, { Device } from 'homey';

export interface Measurement {
    value: string;
    scale: string;
    label: string;
}

export class Growatt extends Homey.Device {

    registers: Object = {

        // "current":    [0x9c87, 1, 'UINT16', "Current", -2 ], 


        "l1_current": [0x9c88, 1, 'UINT16', "L1 Current", -2 ], 
        // "l1_current": [0x040F, 1, 'UINT16', "L1 Current", -1 ],         
        // 39.	Iac1	Three/single phase grid output current		0.1A		78	1039	164	UINT	16	/10	A

        "l2_current": [0x9c89, 1, 'UINT16', "L2 Current", -2 ],
        // "l2_current": [0x0413, 1, 'UINT16', "L2 Current", -1 ],
        // 43.	Iac2	Three phase grid output current		0.1A		86	1043	168	UINT	16	/10	A

        "l3_current": [0x9c8a, 1, 'UINT16', "L3 Current", -2 ], 
        // "l3_current": [0x0417, 1, 'UINT16', "L3 Current", -1 ], 
        // 47.	Iac3	Three phase grid output current		0.1A		94	1047	172	UINT	16	/10	A        

        "power_ac": [0x9c93, 1, 'INT16', "Power", -1],
        // "power_ac": [0x0410, 2, 'UINT32', "Power", -1],
        //40.	Pac1 H	Three/single phase grid output wattVA(high)		0.1VA		80	1040	165	UINT	32	/10	VA
        //41.	Pac1 L	Three/single phase grid output watt VA(low)		0.1VA		82	1041	166				  

        "temperature": [0x9ca7, 1, 'INT16', "Temperature", -2],
        // "temperature": [0x0445, 1, 'UINT16', "Temperature", -1],
        //93.	Temp1	Inverter temperature		0.1C		186	1093	218	UINT	16	/10	C

        // "status": [0x9cab, 1, 'UINT16', "Status", 0],
        //0.	Inverter Status	Inverter run state	0:waiting, 1:normal, 3:fault			0	1000	125	UINT	16	BIN	
        // "status": [0x03e8, 1, 'UINT16', "Status", 0],        

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
           
            if (result['status'] && result['status'].value != 'xxx') {
                if (parseInt(result['status'].value) < 9) {
                    this.addCapability('invertorstatus');
                    if (this.getCapabilityValue('invertorstatus') != result['status'].value) {
                        let status_str: { [key: string]: string } = {
                            "0": 'Undefined',
                            '1': 'Off',
                            '2': 'Sleeping',
                            '3': 'Grid Monitoring',
                            '4': 'Producing',
                            '5': 'Producing (Throttled)',
                            '6': 'Shutting Down',
                            '7': 'Fault',
                            '8': 'Maintenance'
                        }
                        // console.log(this.driver.id);
                        // console.log(status_str[result['status'].value]);
                        this.homey.flow.getDeviceTriggerCard('changedStatus').trigger(this, { status: status_str[result['status'].value] }, {});
                    }
                    this.setCapabilityValue('invertorstatus', result['status'].value);
                }
            }
        }
    }
}
