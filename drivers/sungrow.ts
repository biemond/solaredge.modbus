import Homey, { Device } from 'homey';

export interface Measurement {
    value: string;
    scale: string;
    label: string;
}

export class Sungrow extends Homey.Device {


    inputRegistersStandard: Object = {
        "totaldcpower":                        [5016, 2, 'UINT32', "Total DC power", 0],
        "active_power_limit":                  [5000, 1, 'UINT16', "Nominal active power", -1],    
        "temperature":                         [5007, 1, 'INT16', "temperature",-1],
        "pvTodayEnergy":                       [5002, 1, 'UINT16', "daily energy yield", -1],    
        "pvMonthEnergy":                       [5127, 2, 'UINT32', "monthly energy yield", -1],
        "pvTotalEnergy":                       [5003, 2, 'UINT32', "total energy yield", -1],    
        "daily_export_from_pv":                [5092, 2, 'UINT32', "daily export from pv", -1],
        "daily_direct_energy_consumption":     [5100, 2, 'UINT32', "daily direct energy consumption", -1],        
    };


    inputRegisters: Object = {


        "totaldcpower":   [5016,  2, 'UINT32', "Total DC power", 0],
        "battery_power":  [13021, 1, 'UINT16', "battery_power",0],


        "loadpower":               [13007, 2, 'INT32', "Load power", 0],
        "exportpower":             [13009, 2, 'INT32', "Export power", 0],

        "outputPower":              [5002, 1, 'UINT16', "Daily Output Energy pv + batt discharge", 0],
        "active_power_limit":       [5000, 1, 'UINT16', "Nominal active power", -1],    

        "pvTodayEnergy":            [13001, 1, 'UINT16', "Daily PV Generation", -1],

        // "TotalOutputEnergy":        [5003, 2, 'UINT32', "Total Output Energy pv & battery discharge", 0],
        "pvTotalEnergy":            [13002, 2, 'UINT32', "Total PV Generation", -1],

        "temperature":              [5007, 1, 'INT16', "temperature",-1],

        "battsoc":                  [13022, 1, 'UINT16', "battery_level",-1],
        "bmshealth":                [13023, 1, 'UINT16', "battery_state_of_health",-1],
        "batttemperature":          [13024, 1, 'INT16', "battery_temperature",-1],

        "today_battery_output_energy":  [13025, 1, 'UINT16', "Daily battery discharge energy",-1],
        "total_battery_output_energy":  [13026, 2, 'UINT32', "Total battery discharge energy",-1],
        "today_battery_input_energy":   [13039, 1, 'UINT16', "Daily battery charge energy",-1],
        "total_battery_input_energy":   [13040, 2, 'UINT32', "Total battery charge energy",-1],

        "today_grid_import":  [13035, 1, 'UINT16', "Daily import energy",-1],
        "total_grid_import":  [13036, 2, 'UINT32', "Total import energy",-1],

        "today_grid_export":  [13044, 1, 'UINT16', "Daily export energy",-1],
        "total_grid_export":  [13045, 2, 'UINT32', "Total export energy",-1],


        "Runningstate":  [13000, 1, 'UINT16', "Running state",0],

    };


    holdingRegisters: Object = {

        "emsmodeselection":         [13049, 1, 'UINT16', "EMS mode 0: Self-consumption mode, 2: Forced mode (charge/discharge/stop), 3: External EMS mode | ", 0],
        "charge_discharge_command": [13050, 1, 'UINT16', "Charge/discharge command 170: Charge, 187: Discharge, 204: Stop | ", 0],
        "charge_discharge_power":   [13051, 1, 'UINT16', "Charge/discharge power", 0],
        "max_soc ":                 [13057, 1, 'UINT16', "Max SOC ", -1],
        "min_soc":                  [13058, 1, 'UINT16', "Min SOC", -1],
        "export_power":             [13073, 1, 'UINT16', "Export power", 0],
        "export_power_enabled":     [13086, 1, 'UINT16', "Export power limitation 170: Enable, 85: Disable | ", 0],

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

            if (result['battery_power'] && result['battery_power'].value != 'xxx') {
                this.addCapability('measure_power.battery');
                var dcPower = Number(result['battery_power'].value) * (Math.pow(10, Number(result['battery_power'].scale)));
                this.setCapabilityValue('measure_power.battery', Math.round(dcPower));
            }

            if (result['active_power_limit'] && result['active_power_limit'].value != 'xxx') {
                this.addCapability('activepowerlimit');
                var power_limit = Number(result['active_power_limit'].value);
                this.setCapabilityValue('activepowerlimit', power_limit);
            }

            if (result['pvTodayEnergy'] && result['pvTodayEnergy'].value != 'xxx') {
                this.addCapability('meter_power.daily');
                var pvTodayEnergy = Number(result['pvTodayEnergy'].value) * (Math.pow(10, Number(result['pvTodayEnergy'].scale)));

                if (this.getCapabilityValue('meter_power.daily') != pvTodayEnergy) {
                    let tokens = {
                        "meter_power.daily": pvTodayEnergy
                    };
                    this.homey.flow.getDeviceTriggerCard('meter_power_day_changed').trigger(this,tokens);
                }

                this.setCapabilityValue('meter_power.daily', pvTodayEnergy);
            }

            if (result['pvTotalEnergy'] && result['pvTotalEnergy'].value != 'xxx') {
                this.addCapability('meter_power');
                var pvTotalEnergy = Number(result['pvTotalEnergy'].value) * (Math.pow(10, Number(result['pvTotalEnergy'].scale)));
                this.setCapabilityValue('meter_power', pvTotalEnergy);
            }

            if (result['temperature'] && result['temperature'].value != 'xxx') {
                this.addCapability('measure_temperature.invertor');
                var temperature = Number(result['temperature'].value) * (Math.pow(10, Number(result['temperature'].scale)));

                if (this.getCapabilityValue('measure_temperature.invertor') != temperature) {
                    let tokens = {
                        "measure_temperature.invertor": temperature
                    };
                    this.homey.flow.getDeviceTriggerCard('measure_temperature_inverter_changed').trigger(this,tokens);
                }
                this.setCapabilityValue('measure_temperature.invertor', temperature);
            }

            if (result['batttemperature'] && result['batttemperature'].value != 'xxx' && this.hasCapability('measure_temperature.battery')) {
                this.addCapability('measure_temperature.battery');
                var temperature = Number(result['batttemperature'].value) * (Math.pow(10, Number(result['batttemperature'].scale)));
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

            if (result['loadpower'] && result['loadpower'].value != 'xxx' && this.hasCapability('measure_power.load')) {
                this.addCapability('measure_power.load');
                var load = Number(result['loadpower'].value) * (Math.pow(10, Number(result['loadpower'].scale)));
                if (this.getCapabilityValue('measure_power.load') != load) {
                    this.homey.flow.getDeviceTriggerCard('measure_power_load_changed').trigger(this,{ 'measure_power.load' : load }, {});
                }
                this.setCapabilityValue('measure_power.load', load);
            }

            if (result['exportpower'] && result['exportpower'].value != 'xxx' && this.hasCapability('measure_power.grid_import')) {
                this.addCapability('measure_power.grid_import');
                this.addCapability('measure_power.grid_export');

                var exportpower = Number(result['exportpower'].value) * (Math.pow(10, Number(result['exportpower'].scale)));
                if ( exportpower >= 0 ) {

                    if (this.getCapabilityValue('measure_power.grid_export') != exportpower) {
                        this.homey.flow.getDeviceTriggerCard('measure_power_grid_export_changed').trigger(this,{ 'measure_power.grid_export' : exportpower }, {});
                    }
                    if (this.getCapabilityValue('measure_power_grid_import') != 0) {
                        this.homey.flow.getDeviceTriggerCard('measure_power_grid_import_changed').trigger(this,{ 'measure_power.grid_import' : 0 }, {});
                    }
                    this.setCapabilityValue('measure_power.grid_export', exportpower);
                    this.setCapabilityValue('measure_power.grid_import', 0);
                } else {
                    if (this.getCapabilityValue('measure_power.grid_export') != 0) {
                        this.homey.flow.getDeviceTriggerCard('measure_power_grid_export_changed').trigger(this,{ 'measure_power.grid_export' : 0 }, {});
                    }
                    if (this.getCapabilityValue('measure_power.grid_import') != (-1 * exportpower)) {
                        this.homey.flow.getDeviceTriggerCard('measure_power_grid_import_changed').trigger(this,{ 'measure_power.grid_import' :  -1 * exportpower }, {});
                    }                    
                    this.setCapabilityValue('measure_power.grid_export', 0);
                    this.setCapabilityValue('measure_power.grid_import', -1 * exportpower); 
                }
            }

            if (result['total_battery_output_energy'] && result['total_battery_output_energy'].value != 'xxx' && this.hasCapability('meter_power.battery_output')) {
                this.addCapability('meter_power.battery_output');
                var total_battery_output_energy = Number(result['total_battery_output_energy'].value) * (Math.pow(10, Number(result['total_battery_output_energy'].scale)));
                this.setCapabilityValue('meter_power.battery_output', total_battery_output_energy);
            }

            if (result['today_battery_output_energy'] && result['today_battery_output_energy'].value != 'xxx' && this.hasCapability('meter_power.today_batt_output')) {
                this.addCapability('meter_power.today_batt_output');
                var today_battery_output_energy = Number(result['today_battery_output_energy'].value) * (Math.pow(10, Number(result['today_battery_output_energy'].scale)));
                this.setCapabilityValue('meter_power.today_batt_output', today_battery_output_energy);
            }

            if (result['total_battery_input_energy'] && result['total_battery_input_energy'].value != 'xxx' && this.hasCapability('meter_power.battery_input')) {
                this.addCapability('meter_power.battery_input');
                var total_battery_input_energy = Number(result['total_battery_input_energy'].value) * (Math.pow(10, Number(result['total_battery_input_energy'].scale)));
                this.setCapabilityValue('meter_power.battery_input', total_battery_input_energy);
            }

            if (result['today_battery_input_energy'] && result['today_battery_input_energy'].value != 'xxx' && this.hasCapability('meter_power.today_batt_input')) {
                this.addCapability('meter_power.today_batt_input');
                var today_battery_input_energy = Number(result['today_battery_input_energy'].value) * (Math.pow(10, Number(result['today_battery_input_energy'].scale)));
                this.setCapabilityValue('meter_power.today_batt_input', today_battery_input_energy);
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

            if (result['total_grid_import'] && result['total_grid_import'].value != 'xxx' && this.hasCapability('meter_power.grid_import')) {
                this.addCapability('meter_power.grid_import');
                var total_grid_import = Number(result['total_grid_import'].value) * (Math.pow(10, Number(result['total_grid_import'].scale)));
                this.setCapabilityValue('meter_power.grid_import', total_grid_import);
            }

            if (result['total_grid_export'] && result['total_grid_export'].value != 'xxx' && this.hasCapability('meter_power.grid_export')) {
                this.addCapability('meter_power.grid_export');
                var total_grid_export = Number(result['total_grid_export'].value) * (Math.pow(10, Number(result['total_grid_export'].scale)));
                this.setCapabilityValue('meter_power.grid_export', total_grid_export);
            }            

            if (result['Runningstate'] && result['Runningstate'].value != 'xxx' ) {
                this.addCapability('status_power_generated_from_pv');
                this.addCapability('status_charging');
                this.addCapability('status_discharging');
                this.addCapability('status_load_is_active');
                this.addCapability('status_exporting_power_to_grid');
                this.addCapability('status_importing_power_from_grid');
                this.addCapability('status_power_generated_from_load');                

                var Runningstate = Number(result['Runningstate'].value);
                let lowVal = Runningstate & 0xFF;
                let highval = (Runningstate >> 8) & 0xFF;
                let bit0 = (lowVal & (1<<0)); 
                let bit1 = (lowVal & (1<<1));                                 
                let bit2 = (lowVal & (1<<2)); 
                let bit3 = (lowVal & (1<<3)); 
                let bit4 = (lowVal & (1<<4));                                 
                let bit5 = (lowVal & (1<<5)); 
                let bit7 = (lowVal & (1<<7)); 

                console.log("Runningstate: " + lowVal);
                console.log("Runningstate: " + highval);
                console.log('bit0 ' + bit0 );
                if (bit0 == 1) {
                   this.setCapabilityValue('status_power_generated_from_pv', true);
                } else {
                   this.setCapabilityValue('status_power_generated_from_pv', false);
                }
                console.log('bit1 ' + bit1 );
                if (bit1 == 2) {
                    this.setCapabilityValue('status_charging', true);
                 } else {
                    this.setCapabilityValue('status_charging', false);
                }                
                console.log('bit2 ' + bit2 );
                if (bit2 == 4) {
                    this.setCapabilityValue('status_discharging', true);
                 } else {
                    this.setCapabilityValue('status_discharging', false);
                }               
                console.log('bit3 ' + bit3 );
                if (bit3 == 8) {
                    this.setCapabilityValue('status_load_is_active', true);
                 } else {
                    this.setCapabilityValue('status_load_is_active', false);
                }        
                console.log('bit4 ' + bit4 );
                if (bit4 == 16) {
                    this.setCapabilityValue('status_exporting_power_to_grid', true);
                 } else {
                    this.setCapabilityValue('status_exporting_power_to_grid', false);
                }        
                console.log('bit5 ' + bit5 );
                if (bit5 == 32) {
                    this.setCapabilityValue('status_importing_power_from_grid', true);
                 } else {
                    this.setCapabilityValue('status_importing_power_from_grid', false);
                }        
                console.log('bit7 ' + bit7 );
                if (bit7 == 128) {
                    this.setCapabilityValue('status_power_generated_from_load', true);
                 } else {
                    this.setCapabilityValue('status_power_generated_from_load', false);
                }        
            }
    
            if (result['emsmodeselection'] && result['emsmodeselection'].value != 'xxx' && this.hasCapability('emsmodeselection')) {
                this.addCapability('emsmodeselection');
                var emsmodeselection = result['emsmodeselection'].value;
                this.setCapabilityValue('emsmodeselection', emsmodeselection);
            } 

            // "export_power_enabled":     [13086, 1, 'UINT16', "Export power limitation 170: Enable, 85: Disable | ", 0],
            if (result['export_power_enabled'] && result['export_power_enabled'].value != 'xxx' && this.hasCapability('exportlimitenabled')) {
                this.addCapability('exportlimitenabled');
                var export_power_enabled = Number(result['export_power_enabled'].value) * (Math.pow(10, Number(result['export_power_enabled'].scale)));
                if (export_power_enabled == 170) {
                    this.setCapabilityValue('exportlimitenabled', "1");
                } else {
                    this.setCapabilityValue('exportlimitenabled', "0");
                }
            } 

            if (result['export_power'] && result['export_power'].value != 'xxx' && this.hasCapability('exportcontrolsitelimit')) {
                this.addCapability('exportcontrolsitelimit');
                var export_power = Number(result['export_power'].value) * (Math.pow(10, Number(result['export_power'].scale)));
                this.setCapabilityValue('exportcontrolsitelimit', export_power);
            }  

            if (result['charge_discharge_command'] && result['charge_discharge_command'].value != 'xxx' && this.hasCapability('chargedischargecommand')) {
                this.addCapability('chargedischargecommand');
                var charge_discharge_command = result['charge_discharge_command'].value;
                this.setCapabilityValue('chargedischargecommand', charge_discharge_command);
            }  

            if (result['charge_discharge_power'] && result['charge_discharge_power'].value != 'xxx' && this.hasCapability('charge_discharge_power')) {
                this.addCapability('charge_discharge_power');
                var charge_discharge_power = Number(result['charge_discharge_power'].value) * (Math.pow(10, Number(result['charge_discharge_power'].scale)));
                this.setCapabilityValue('charge_discharge_power', charge_discharge_power);
            }  

            if (result['max_soc'] && result['max_soc'].value != 'xxx' && this.hasCapability('charge_discharge_power')) {
                this.addCapability('batterymaxsoc');
                var max_soc = Number(result['max_soc'].value) * (Math.pow(10, Number(result['max_soc'].scale)));
                this.setCapabilityValue('batterymaxsoc', max_soc);
            }

            if (result['min_soc'] && result['min_soc'].value != 'xxx' && this.hasCapability('batteryminsoc')) {
                this.addCapability('batteryminsoc');
                var min_soc = Number(result['min_soc'].value) * (Math.pow(10, Number(result['min_soc'].scale)));
                this.setCapabilityValue('batteryminsoc', min_soc);
            }              

        }
    }

    processResultPlain(result: Record<string, Measurement>) {
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



            if (result['active_power_limit'] && result['active_power_limit'].value != 'xxx') {
                this.addCapability('activepowerlimit');
                var power_limit = Number(result['active_power_limit'].value);
                this.setCapabilityValue('activepowerlimit', power_limit);
            }

            if (result['pvTodayEnergy'] && result['pvTodayEnergy'].value != 'xxx') {
                this.addCapability('meter_power.daily');
                var pvTodayEnergy = Number(result['pvTodayEnergy'].value) * (Math.pow(10, Number(result['pvTodayEnergy'].scale)));
                this.setCapabilityValue('meter_power.daily', pvTodayEnergy);
            }

            if (result['pvMonthEnergy'] && result['pvMonthEnergy'].value != 'xxx') {
                this.addCapability('meter_power.monthly');
                var pvMonthEnergy = Number(result['pvMonthEnergy'].value) * (Math.pow(10, Number(result['pvMonthEnergy'].scale)));
                this.setCapabilityValue('meter_power.monthly', pvMonthEnergy);
            }

            if (result['pvTotalEnergy'] && result['pvTotalEnergy'].value != 'xxx') {
                this.addCapability('meter_power');
                var pvTotalEnergy = Number(result['pvTotalEnergy'].value) * (Math.pow(10, Number(result['pvTotalEnergy'].scale)));
                this.setCapabilityValue('meter_power', pvTotalEnergy);
            }

            if (result['temperature'] && result['temperature'].value != 'xxx') {
                this.addCapability('measure_temperature');
                var temperature = Number(result['temperature'].value) * (Math.pow(10, Number(result['temperature'].scale)));
                this.setCapabilityValue('measure_temperature', temperature);
            }
        }
    }

}
