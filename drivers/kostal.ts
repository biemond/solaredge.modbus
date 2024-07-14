import Homey, { Device } from 'homey';

export interface Measurement {
    value: string;
    scale: string;
    label: string;
}

export class Kostal extends Homey.Device {

    holdingRegisters: Object = {

        // 0x20 32 Number of AC phases - U16 1 RO 0x03
        "totalacphases":   [32, 1, 'UINT16', "Number of AC phases", 0],

        // 0x22 34 Number of PV strings - U16 1 RO 0x03
        "totalpvstrings":  [34, 1, 'UINT16', "Number of PV strings",0],

        // 0x64 100 Total DC power W Float 2 RO 0x03
        "totaldcpower":   [100,  2, 'FLOAT32', "Total DC power", 0],


        // 0x6A 106 Home own consumption from battery W Float 2 RO 0x03
        "homeownconsumptionfrombatt":   [106,  2, 'FLOAT32', "Home own consumption from battery", 0],        
        // 0x6C 108 Home own consumption from grid W Float 2 RO 0x03
        "homeownconsumptionfromgrid":   [108,  2, 'FLOAT32', "Home own consumption from grid", 0],            
        // 0x74 116 Home own consumption from PV W Float 2 RO 0x03
        "homeownconsumptionfrompv":   [116,  2, 'FLOAT32', "Home own consumption from PV", 0],               
        // 0x6E 110 Total home consumption Battery Wh Float 2 RO 0x03
        "totalhomeconsumptionfrombatt":   [110,  2, 'FLOAT32', "Total Home consumption from battery", 3],            
        // 0x70 112 Total home consumption Grid Wh Float 2 RO 0x03
        "totalhomeconsumptionfromgrid":   [112,  2, 'FLOAT32', "Total Home consumption from grid", 3],          
        // 0x72 114 Total home consumption PV Wh Float 2 RO 0x03
        "totalhomeconsumptionfrompv":   [114,  2, 'FLOAT32', "Total Home consumption from PV", 3],        
        // 0x76 118 Total home consumption Wh Float 2 RO 0x03
        "totalhomeconsumption":   [118,  2, 'FLOAT32', "Total Home consumption", 3],   

        // 0x98 152 Grid frequency Hz Float 2 RO 0x03
        "gridfrequency":   [152,  2, 'FLOAT32', "grid frequency", 0],   

        // 0xC2 194 Number of battery cycles - Float 2 RO 0x03
        "batterycycles":   [194,  2, 'FLOAT32', "Number of battery cycles", 0],           
        // 0xC8 200 Actual battery charge (-) / discharge (+) current A Float 2 RO 0x03
        "batterychargedischarge":   [200,  2, 'FLOAT32', "Actual battery charge (-) / discharge", 0],   
        // 0xD2 210 Act. state of charge % Float 2 RO 0x03
        "batterysoc":   [210,  2, 'FLOAT32', "battery state of charge", 0],          
        // 0xD6 214 Battery temperature °C Float 2 RO 0x03
        "batterytemperature":   [214,  2, 'FLOAT32', "Battery temperature", 0],          
        // 0xD8 216 Battery voltage V Float 2 RO 0x03
        "batteryvoltage":   [216,  2, 'FLOAT32', "Battery voltage", 0],          

        // 0xDE 222 Current phase 1 (powermeter) A Float 2 RO 0x03
        "Currentphase1":   [222,  2, 'FLOAT32', "Current phase 1", 0],             
        // 0xE0 224 Active power phase 1 (powermeter) W Float 2 RO 0x03
        "Powerphase1":   [224,  2, 'FLOAT32', "Active power phase 1", 0],          
        // 0xE6 230 Voltage phase 1 (powermeter) V Float 2 RO 0x03
        "Voltagephase1":   [230,  2, 'FLOAT32', "Voltage phase 1", 0],        
        // 0xE8 232 Current phase 2 (powermeter) A Float 2 RO 0x03
        "Currentphase2":   [232,  2, 'FLOAT32', "Current phase 2", 0],     
        // 0xEA 234 Active power phase 2 (powermeter) W Float 2 RO 0x03
        "Powerphase2":   [234,  2, 'FLOAT32', "Active power phase 2", 0],     
        // 0xF0 240 Voltage phase 2 (powermeter) V Float 2 RO 0x03
        "Voltagephase2":   [240,  2, 'FLOAT32', "Voltage phase 2", 0],              
        // 0xF2 242 Current phase 3 (powermeter) A Float 2 RO 0x03
        "Currentphase3":   [242,  2, 'FLOAT32', "Current phase 3", 0],     
        // 0xF4 244 Active power phase 3 (powermeter) W Float 2 RO 0x03
        "Powerphase3":   [244,  2, 'FLOAT32', "Active power phase 3", 0],     
        // 0xFA 250 Voltage phase 3 (powermeter) V Float 2 RO 0x03
        "Voltagephase3":   [250,  2, 'FLOAT32', "Voltage phase 3", 0],    

        // 0xFC 252 Total active power (powermeter)
        // Sensor position 1 (home consumption):
        // (+) House consumption, (-) generation
        // Sensor position 2 (grid connection):
        // (+) Power supply, (-) feed-in
        // W Float 2 RO 0x03
        "Totalactivepower":   [252,  2, 'FLOAT32', "Total active power", 0],   

        // 0x104 260 Power DC1 W Float 2 RO 0x03
        "PowerDC1":   [260,  2, 'FLOAT32', "Power DC1", 0],  
        // 0x10E 270 Power DC2 W Float 2 RO 0x03
        "PowerDC2":   [270,  2, 'FLOAT32', "Power DC2", 0],  
        // 0x118 280 Power DC3 W Float 2 RO 0x03
        "PowerDC3":   [280,  2, 'FLOAT32', "Power DC3", 0],  
        // 0x140 320 Total yield Wh Float 2 RO 0x03
        "totalyield":   [320,  2, 'FLOAT32', "Total yield", 3],          
        // 0x142 322 Daily yield Wh Float 2 RO 0x03
        "Dailyyield":   [322,  2, 'FLOAT32', "Daily yield", 3],  


        // 0x246 582 Actual battery charge/discharge power W S16 1 RO 0x03
        "Actualbatterychargedischargepower":   [582,  1, 'INT16', "Actual battery charge/discharge power", 0],  
    };



    processResult(result: Record<string, Measurement>) {
        if (result) {

            // result
            for (let k in result) {
                console.log(k, result[k].value, result[k].scale, result[k].label)
            }

            if (result['totaldcpower'] && result['totaldcpower'].value != 'xxx') {
                this.addCapability('measure_power');
                var dcPower = Number(result['totaldcpower'].value) * (Math.pow(10, Number(result['totaldcpower'].scale)));
                this.setCapabilityValue('measure_power', Math.round(dcPower));
            }

            if (result['Totalactivepower'] && result['Totalactivepower'].value != 'xxx') {
                this.addCapability('measure_power.meter');
                var dcPower = Number(result['Totalactivepower'].value) * (Math.pow(10, Number(result['Totalactivepower'].scale)));
                this.setCapabilityValue('measure_power.meter', Math.round(dcPower));
            }

            if (result['PowerDC1'] && result['PowerDC1'].value != 'xxx') {
                this.addCapability('measure_power.pv1input');
                var PowerDC1 = Number(result['PowerDC1'].value) * (Math.pow(10, Number(result['PowerDC1'].scale)));
                this.setCapabilityValue('measure_power.pv1input', Math.round(PowerDC1));
            }

            if (result['PowerDC2'] && result['PowerDC2'].value != 'xxx') {
                this.addCapability('measure_power.pv2input');
                var PowerDC2 = Number(result['PowerDC2'].value) * (Math.pow(10, Number(result['PowerDC2'].scale)));
                this.setCapabilityValue('measure_power.pv2input', Math.round(PowerDC2));
            }

            if (result['PowerDC3'] && result['PowerDC3'].value != 'xxx') {
                this.addCapability('measure_power.pv3input');
                var pv3InputPower = Number(result['PowerDC3'].value) * (Math.pow(10, Number(result['PowerDC3'].scale)));
                this.setCapabilityValue('measure_power.pv3input', Math.round(pv3InputPower));
            }

            if (result['homeownconsumptionfrompv'] && result['homeownconsumptionfrompv'].value != 'xxx') {
                this.addCapability('measure_power.houseloadfrompv');
                var power = Number(result['homeownconsumptionfrompv'].value) * (Math.pow(10, Number(result['homeownconsumptionfrompv'].scale)));
                this.setCapabilityValue('measure_power.houseloadfrompv', Math.round(power));
            }

            if (result['homeownconsumptionfrombatt'] && result['homeownconsumptionfrombatt'].value != 'xxx') {
                this.addCapability('measure_power.houseloadfrombatt');
                var power = Number(result['homeownconsumptionfrombatt'].value) * (Math.pow(10, Number(result['homeownconsumptionfrombatt'].scale)));
                this.setCapabilityValue('measure_power.houseloadfrombatt', Math.round(power));
            }

            if (result['houseloadfromgrid'] && result['houseloadfromgrid'].value != 'xxx') {
                this.addCapability('measure_power.houseloadfromgrid');
                var power = Number(result['houseloadfromgrid'].value) * (Math.pow(10, Number(result['houseloadfromgrid'].scale)));
                this.setCapabilityValue('measure_power.houseloadfromgrid', Math.round(power));
            }


            if (result['batterytemperature'] && result['batterytemperature'].value != 'xxx' ) {
                this.addCapability('measure_temperature.battery');
                var temperature = Number(result['batterytemperature'].value) * (Math.pow(10, Number(result['batterytemperature'].scale)));
                this.setCapabilityValue('measure_temperature.battery', temperature);
            }

            if (result['batterysoc'] && result['batterysoc'].value != 'xxx') {
                this.addCapability('battery');
                this.addCapability('measure_battery');
                var soc = Number(result['batterysoc'].value) * (Math.pow(10, Number(result['batterysoc'].scale)));
                this.setCapabilityValue('battery', soc);
                this.setCapabilityValue('measure_battery', soc);
            }

            if (result['batterycycles'] && result['batterycycles'].value != 'xxx' ) {
                this.addCapability('batterycycles');
                var batterycycles = Number(result['batterycycles'].value) * (Math.pow(10, Number(result['batterycycles'].scale)));
                this.setCapabilityValue('batterycycles', batterycycles);
            }

            if (result['totalyield'] && result['totalyield'].value != 'xxx') {
                this.addCapability('meter_power');
                var totalyield = Number(result['totalyield'].value) / 1000;
                this.setCapabilityValue('meter_power', totalyield);
            }

            if (result['Dailyyield'] && result['Dailyyield'].value != 'xxx') {
                this.addCapability('meter_power.daily');
                var Dailyyield = Number(result['Dailyyield'].value) / 1000 ;
                this.setCapabilityValue('meter_power.daily', Dailyyield);
            }
  
            if (result['totalhomeconsumption'] && result['totalhomeconsumption'].value != 'xxx') {
                this.addCapability('meter_power.houseload');
                var totalhomeconsumption = Number(result['totalhomeconsumption'].value) / 1000;
                this.setCapabilityValue('meter_power.houseload', totalhomeconsumption);
            }
            
            if (result['batteryvoltage'] && result['batteryvoltage'].value != 'xxx') {
                this.addCapability( "measure_voltage.battery");
                var batteryvoltage = Number(result['batteryvoltage'].value) * (Math.pow(10, Number(result['batteryvoltage'].scale)));
                this.setCapabilityValue( "measure_voltage.battery", batteryvoltage);
            } 

            if (result['Actualbatterychargedischargepower'] && result['Actualbatterychargedischargepower'].value != 'xxx' ) {
                this.addCapability('measure_power.batt_charge_discharge');
                var charge = Number(result['Actualbatterychargedischargepower'].value) * (Math.pow(10, Number(result['Actualbatterychargedischargepower'].scale)));
                this.setCapabilityValue('measure_power.batt_charge_discharge', charge);
            } 

            if (result['Currentphase1'] && result['Currentphase1'].value != 'xxx') {
                this.addCapability('measure_current.meter_phase1');
                var currenteac1 = Number(result['Currentphase1'].value) * (Math.pow(10,  Number(result['Currentphase1'].scale)));
                this.setCapabilityValue('measure_current.meter_phase1', currenteac1);
            }
            if (result['Currentphase2'] && result['Currentphase2'].value != 'xxx') {
                this.addCapability('measure_current.meter_phase2');
                var currenteac2 = Number(result['Currentphase2'].value) * (Math.pow(10,  Number(result['Currentphase2'].scale)));
                this.setCapabilityValue('measure_current.meter_phase2', currenteac2);
            }
            if (result['Currentphase3'] && result['Currentphase3'].value != 'xxx') {
                this.addCapability('measure_current.meter_phase3');
                var currenteac3 = Number(result['Currentphase3'].value) * (Math.pow(10,  Number(result['Currentphase3'].scale)));
                this.setCapabilityValue('measure_current.meter_phase3', currenteac3);
            }            

            if (result['Voltagephase1'] && result['Voltagephase1'].value != 'xxx') {
                this.addCapability('measure_voltage.meter_phase1');
                var voltageeac1 = Number(result['Voltagephase1'].value) * (Math.pow(10,  Number(result['Voltagephase1'].scale)));
                this.setCapabilityValue('measure_voltage.meter_phase1', voltageeac1);
            }
            if (result['Voltagephase2'] && result['Voltagephase2'].value != 'xxx') {
                this.addCapability('measure_voltage.meter_phase2');
                var voltageeac2 = Number(result['Voltagephase2'].value) * (Math.pow(10,  Number(result['Voltagephase2'].scale)));
                this.setCapabilityValue('measure_voltage.meter_phase2', voltageeac2);
            }
            if (result['Voltagephase3'] && result['Voltagephase3'].value != 'xxx') {
                this.addCapability('measure_voltage.meter_phase3');
                var voltageeac3 = Number(result['Voltagephase3'].value) * (Math.pow(10,  Number(result['Voltagephase3'].scale)));
                this.setCapabilityValue('measure_voltage.meter_phase3', voltageeac3);
            }            

            if (result['Powerphase1'] && result['Powerphase1'].value != 'xxx') {
                this.addCapability('measure_power.meter_phase1');
                var power = Number(result['Powerphase1'].value) * (Math.pow(10,  Number(result['Powerphase1'].scale)));
                this.setCapabilityValue('measure_power.meter_phase1', power);
            }
            if (result['Powerphase2'] && result['Powerphase2'].value != 'xxx') {
                this.addCapability('measure_power.meter_phase2');
                var power = Number(result['Powerphase2'].value) * (Math.pow(10,  Number(result['Powerphase2'].scale)));
                this.setCapabilityValue('measure_power.meter_phase2', power);
            }
            if (result['Powerphase3'] && result['Powerphase3'].value != 'xxx') {
                this.addCapability('measure_power.meter_phase3');
                var power = Number(result['Powerphase3'].value) * (Math.pow(10,  Number(result['Powerphase3'].scale)));
                this.setCapabilityValue('measure_power.meter_phase3', power);
            }            
            
        }
    }
}
