import Homey, { Device } from 'homey';

export interface Measurement {
    value: string;
    scale: string;
    label: string;
}

export class Solaredge extends Homey.Device {

    registers: Object = {
        "c_manufacturer": [0x9c44, 16, 'STRING', "Manufacturer"],
        "c_model": [0x9c54, 16, 'STRING', "Model"],
        "c_version": [0x9c6c, 8, 'STRING', "Version"],
        "c_serialnumber": [0x9c74, 16, 'STRING', "Serial"],
        "c_deviceaddress": [0x9c84, 1, 'UINT16', "Modbus ID"],
        "c_sunspec_did": [0x9c85, 1, 'UINT16', "SunSpec DID"],

        "current": [0x9c87, 1, 'UINT16', "Current"],
        "l1_current": [0x9c88, 1, 'UINT16', "L1 Current"],
        "l2_current": [0x9c89, 1, 'UINT16', "L2 Current"],
        "l3_current": [0x9c8a, 1, 'UINT16', "L3 Current"],
        "current_scale": [0x9c8b, 1, 'SCALE', "Current Scale Factor"],

        "l1_voltage": [0x9c8c, 1, 'UINT16', "L1 Voltage"],
        "l1_voltage_scale": [0x9c92, 1, 'SCALE', "Voltage Scale Factor"],
        "l2_voltage": [0x9c8d, 1, 'UINT16', "L2 Voltage"],
        "l2_voltage_scale": [0x9c92, 1, 'SCALE', "Voltage Scale Factor"],
        "l3_voltage": [0x9c8e, 1, 'UINT16', "L3 Voltage"],
        "l3_voltage_scale": [0x9c92, 1, 'SCALE', "Voltage Scale Factor"],
        "l1n_voltage": [0x9c8f, 1, 'UINT16', "L1-N Voltage"],
        "l1n_voltage_scale": [0x9c92, 1, 'SCALE', "Voltage Scale Factor"],
        "l2n_voltage": [0x9c90, 1, 'UINT16', "L2-N Voltage"],
        "l2n_voltage_scale": [0x9c92, 1, 'SCALE', "Voltage Scale Factor"],
        "l3n_voltage": [0x9c91, 1, 'UINT16', "L3-N Voltage"],
        "l3n_voltage_scale": [0x9c92, 1, 'SCALE', "Voltage Scale Factor"],

        "power_ac": [0x9c93, 1, 'INT16', "Power"],
        "power_ac_scale": [0x9c94, 1, 'SCALE', "Power Scale Factor"],

        // "frequency": [0x9c95, 1, 'UINT16', "Frequency"],
        // "frequency_scale": [0x9c96, 1, 'SCALE', "Frequency Scale Factor"],

        // "power_apparent": [0x9c97, 1, 'INT16', "Power [Apparent]"],
        // "power_apparent_scale": [0x9c98, 1, 'SCALE', "Power [Apparent] Scale Factor"],
        // "power_reactive": [0x9c99, 1, 'INT16', "Power [Reactive]"],
        // "power_reactive_scale": [0x9c9a, 1, 'SCALE', "Power [Reactive] Scale Factor"],
        // "power_factor": [0x9c9b, 1, 'INT16', "Power Factor"],
        // "power_factor_scale": [0x9c9c, 1, 'SCALE', "Power Factor Scale Factor"],

        "energy_total": [0x9c9d, 2, 'ACC32', "Total Energy"],
        "energy_total_scale": [0x9c9f, 1, 'SCALE', "Total Energy Scale Factor"],

        "current_dc": [0x9ca0, 1, 'UINT16', "DC Current"],
        "current_dc_scale": [0x9ca1, 1, 'SCALE', "DC Current Scale Factor"],

        "voltage_dc": [0x9ca2, 1, 'UINT16', "DC Voltage"],
        "voltage_dc_scale": [0x9ca3, 1, 'SCALE', "DC Voltage Scale Factor"],

        "power_dc": [0x9ca4, 1, 'INT16', "DC Power"],
        "power_dc_scale": [0x9ca5, 1, 'SCALE', "DC Power Scale Factor"],

        "temperature": [0x9ca7, 1, 'INT16', "Temperature"],
        "temperature_scale": [0x9caa, 1, 'SCALE', "Temperature Scale Factor"],

        "status": [0x9cab, 1, 'UINT16', "Status"],
        "vendor_status": [0x9cac, 1, 'UINT16', "Vendor Status"],

        "storage_control_mode": [0xe004, 1, 'UINT16', "Storage Control Mode"],
        "storage_accharge_policy": [0xe005, 1, 'UINT16', "Storage AC Charge Policy"],
        "storage_accharge_Limit": [0xe006, 2, 'FLOAT32', "Storage AC Charge Limit"],

        "remote_control_command_mode": [0xe00d, 1, 'UINT16', "Remote Control Command Mode"],
        "remote_control_charge_limit": [0xe00e, 2, 'FLOAT32', "Remote Control Charge Limit"],
        "remote_control_command_discharge_limit": [0xe010, 2, 'FLOAT32', "Remote Control Command Discharge Limit"],
        "remote_control_command_timeout": [0xe00b, 2, 'UINT32', "Remote Control Command Timeout"],
        "remote_control_default_command_mode": [0xe00a, 1, 'UINT16', "Storage Charge/Discharge Default Mode"],

        // "rrcr_state": [0xf000, 1, 'UINT16', "RRCR State"],
        "active_power_limit": [0xf001, 1, 'UINT16', "Active Power Limit"],
        // "cosphi": [0xf002, 2, 'FLOAT32', "CosPhi"],

        "advancedpwrcontrolen": [0xf142, 2, 'UINT32', "Advanced Power Control En"],
        "reactivepwrconfig": [0xf102, 2, 'UINT32', "Reactive Power Config"],        
        "export_control_mode": [0xe000, 1, 'UINT16', "Export control Mode"],
        "export_control_limit_mode": [0xe001, 1, 'UINT16', "Export control limit Mode"],
        "export_control_site": [0xe002, 2, 'FLOAT32', "Export control site limit"],
        "powerreduce": [0xf140, 2, 'FLOAT32', "Power Reduce"],
        "maxcurrent": [0xf18e, 2, 'FLOAT32', "Max Current"]

    };

    meter_dids: Object = {
        "meter1": [0x9cfc, 1, 'UINT16', 0x0],
        // "meter2": [0x9daa, 1, 'UINT16', 0xae],
        // "meter3": [0x9e59, 1, 'UINT16', 0x15c]
    }

    meter_registers: Object = {
        "c_manufacturer": [0x9cbb, 16, 'STRING', "Manufacturer"],
        "c_model": [0x9ccb, 16, 'STRING', "Model"],
        "c_option": [0x9cdb, 8, 'STRING', "Mode"],
        "c_version": [0x9ce3, 8, 'STRING', "Version"],
        "c_serialnumber": [0x9ceb, 16, 'STRING', "Serial"],
        "c_deviceaddress": [0x9cfb, 1, 'UINT16', "Modbus ID"],
        "c_sunspec_did": [0x9cfc, 1, 'UINT16', "SunSpec DID"],

        "current": [0x9cfe, 1, 'INT16', "Current"],
        "l1_current": [0x9cff, 1, 'INT16', "L1 Current"],
        "l2_current": [0x9d00, 1, 'INT16', "L2 Current"],
        "l3_current": [0x9d01, 1, 'INT16', "L3 Current"],
        "current_scale": [0x9d02, 1, 'SCALE', "Current Scale Factor"],

        "voltage_ln": [0x9d03, 1, 'INT16', "L-N Voltage"],
        "l1n_voltage": [0x9d04, 1, 'INT16', "L1-N Voltage"],
        "l2n_voltage": [0x9d05, 1, 'INT16', "L2-N Voltage"],
        "l3n_voltage": [0x9d06, 1, 'INT16', "L3-N Voltage"],
        "voltage_ll": [0x9d07, 1, 'INT16', "L-L Voltage"],
        "l12_voltage": [0x9d08, 1, 'INT16', "L1-l2 Voltage"],
        "l23_voltage": [0x9d09, 1, 'INT16', "L2-l3 Voltage"],
        "l31_voltage": [0x9d0a, 1, 'INT16', "L3-l1 Voltage"],
        "voltage_ln_scale": [0x9d0b, 1, 'SCALE', "Voltage Scale Factor"],

        "frequency": [0x9d0c, 1, 'INT16', "Frequency"],
        "frequency_scale": [0x9d0d, 1, 'SCALE', "Frequency Scale Factor"],

        "power": [0x9d0e, 1, 'INT16', "Power"],
        "l1_power": [0x9d0f, 1, 'INT16', "L1 Power"],
        "l2_power": [0x9d10, 1, 'INT16', "L2 Power"],
        "l3_power": [0x9d11, 1, 'INT16', "L3 Power"],
        "power_scale": [0x9d12, 1, 'SCALE', "Power Scale Factor"],

        // "power_apparent": [0x9d13, 1, 'INT16', "Power (Apparent)"],
        // "l1_power_apparent": [0x9d14, 1, 'INT16', "L1 Power (Apparent)"],
        // "l2_power_apparent": [0x9d15, 1, 'INT16', "L2 Power (Apparent)"],
        // "l3_power_apparent": [0x9d16, 1, 'INT16', "L3 Power (Apparent)"],
        // "power_apparent_scale": [0x9d17, 1, 'SCALE', "Power (Apparent) Scale Factor"],

        // "power_reactive": [0x9d18, 1, 'INT16', "Power (Reactive)"],
        // "l1_power_reactive": [0x9d19, 1, 'INT16', "L1 Power (Reactive)"],
        // "l2_power_reactive": [0x9d1a, 1, 'INT16', "L2 Power (Reactive)"],
        // "l3_power_reactive": [0x9d1b, 1, 'INT16', "L3 Power (Reactive)"],
        // "power_reactive_scale": [0x9d1c, 1, 'SCALE', "Power (Reactive) Scale Factor"],

        // "power_factor": [0x9d1d, 1, 'INT16', "Power Factor"],
        // "l1_power_factor": [0x9d1e, 1, 'INT16', "L1 Power Factor"],
        // "l2_power_factor": [0x9d1f, 1, 'INT16', "L2 Power Factor"],
        // "l3_power_factor": [0x9d20, 1, 'INT16', "L3 Power Factor"],
        // "power_factor_scale": [0x9d21, 1, 'SCALE', "Power Factor Scale Factor"],

        "export_energy_active": [0x9d22, 2, 'UINT32', "Total Exported Energy (Active)"],
        "l1_export_energy_active": [0x9d24, 2, 'UINT32', "L1 Exported Energy (Active)"],
        "l2_export_energy_active": [0x9d26, 2, 'UINT32', "L2 Exported Energy (Active)"],
        "l3_export_energy_active": [0x9d28, 2, 'UINT32', "L3 Exported Energy (Active)"],
        "import_energy_active": [0x9d2a, 2, 'UINT32', "Total Imported Energy (Active)"],
        "l1_import_energy_active": [0x9d2c, 2, 'UINT32', "L1 Imported Energy (Active)"],
        "l2_import_energy_active": [0x9d2e, 2, 'UINT32', "L2 Imported Energy (Active)"],
        "l3_import_energy_active": [0x9d30, 2, 'UINT32', "L3 Imported Energy (Active)"],
        "export_energy_active_scale": [0x9d32, 1, 'SCALE', "Energy (Active) Scale Factor"],

        // "export_energy_apparent": [0x9d33, 2, 'UINT32', "Total Exported Energy (Apparent)"],
        // "l1_export_energy_apparent": [0x9d35, 2, 'UINT32', "L1 Exported Energy (Apparent)"],
        // "l2_export_energy_apparent": [0x9d37, 2, 'UINT32', "L2 Exported Energy (Apparent)"],
        // "l3_export_energy_apparent": [0x9d39, 2, 'UINT32', "L3 Exported Energy (Apparent)"],
        // "import_energy_apparent": [0x9d3b, 2, 'UINT32', "Total Imported Energy (Apparent)"],
        // "l1_import_energy_apparent": [0x9d3d, 2, 'UINT32', "L1 Imported Energy (Apparent)"],
        // "l2_import_energy_apparent": [0x9d3f, 2, 'UINT32', "L2 Imported Energy (Apparent)"],
        // "l3_import_energy_apparent": [0x9d41, 2, 'UINT32', "L3 Imported Energy (Apparent)"],
        // "export_energy_apparent_scale": [0x9d43, 1, 'SCALE', "Energy (Apparent) Scale Factor"],

        // "import_energy_reactive_q1": [0x9d44, 2, 'UINT32', "Total Imported Energy (Reactive) Quadrant 1"],
        // "l1_import_energy_reactive_q1": [0x9d46, 2, 'UINT32', "L1 Imported Energy (Reactive) Quadrant 1"],
        // "l2_import_energy_reactive_q1": [0x9d48, 2, 'UINT32', "L2 Imported Energy (Reactive) Quadrant 1"],
        // "l3_import_energy_reactive_q1": [0x9d4a, 2, 'UINT32', "L3 Imported Energy (Reactive) Quadrant 1"],
        // "import_energy_reactive_q2": [0x9d4c, 2, 'UINT32', "Total Imported Energy (Reactive) Quadrant 2"],
        // "l1_import_energy_reactive_q2": [0x9d4e, 2, 'UINT32', "L1 Imported Energy (Reactive) Quadrant 2"],
        // "l2_import_energy_reactive_q2": [0x9d50, 2, 'UINT32', "L2 Imported Energy (Reactive) Quadrant 2"],
        // "l3_import_energy_reactive_q2": [0x9d52, 2, 'UINT32', "L3 Imported Energy (Reactive) Quadrant 2"],
        // "export_energy_reactive_q3": [0x9d54, 2, 'UINT32', "Total Exported Energy (Reactive) Quadrant 3"],
        // "l1_export_energy_reactive_q3": [0x9d56, 2, 'UINT32', "L1 Exported Energy (Reactive) Quadrant 3"],
        // "l2_export_energy_reactive_q3": [0x9d58, 2, 'UINT32', "L2 Exported Energy (Reactive) Quadrant 3"],
        // "l3_export_energy_reactive_q3": [0x9d5a, 2, 'UINT32', "L3 Exported Energy (Reactive) Quadrant 3"],
        // "export_energy_reactive_q4": [0x9d5c, 2, 'UINT32', "Total Exported Energy (Reactive) Quadrant 4"],
        // "l1_export_energy_reactive_q4": [0x9d5e, 2, 'UINT32', "L1 Exported Energy (Reactive) Quadrant 4"],
        // "l2_export_energy_reactive_q4": [0x9d60, 2, 'UINT32', "L2 Exported Energy (Reactive) Quadrant 4"],
        // "l3_export_energy_reactive_q4": [0x9d62, 2, 'UINT32', "L3 Exported Energy (Reactive) Quadrant 4"],
        // "import_energy_reactive_q1_scale": [0x9d64, 1, 'SCALE', "Energy (Reactive) Scale Factor"]
    }

    battery_dids: Object = {
        "batt1": [0xe140, 1, 'UINT16', 0x0],
        // "batt2": [0xe240, 1, 'UINT16', 0x100]
    }

    batt_registers: Object = {
        "c_manufacturer": [0xe100, 16, 'STRING', "Manufacturer"],
        "c_model": [0xe110, 16, 'STRING', "Model"],
        "c_version": [0xe120, 16, 'STRING', "Version"],
        "c_serialnumber": [0xe130, 16, 'STRING', "Serial"],
        "c_deviceaddress": [0xe140, 1, 'UINT16', "Modbus ID"],
        "c_sunspec_did": [0xe141, 1, 'UINT16', "SunSpec DID"],

        "rated_energy": [0xe142, 2, 'SEFLOAT', "Rated Energy"],
        "maximum_charge_continuous_power": [0xe144, 2, 'SEFLOAT', "Maximum Charge Continuous Power"],
        "maximum_discharge_continuous_power": [0xe146, 2, 'SEFLOAT', "Maximum Discharge Continuous Power"],
        "maximum_charge_peak_power": [0xe148, 2, 'SEFLOAT', "Maximum Charge Peak Power"],
        "maximum_discharge_peak_power": [0xe14a, 2, 'SEFLOAT', "Maximum Discharge Peak Power"],

        "average_temperature": [0xe16c, 2, 'SEFLOAT', "Average Temperature"],
        "maximum_temperature": [0xe16e, 2, 'SEFLOAT', "Maximum Temperature"],

        "instantaneous_voltage": [0xe170, 2, 'SEFLOAT', "Instantaneous Voltage"],
        "instantaneous_current": [0xe172, 2, 'SEFLOAT', "Instantaneous Current"],
        "instantaneous_power": [0xe174, 2, 'SEFLOAT', "Instantaneous Power"],

        "lifetime_export_energy_counter": [0xe176, 4, 'UINT64', "Total Exported Energy"],
        "lifetime_import_energy_counter": [0xe17A, 4, 'UINT64', "Total Imported Energy"],

        "maximum_energy": [0xe17e, 2, 'SEFLOAT', "Maximum Energy"],
        "available_energy": [0xe180, 2, 'SEFLOAT', "Available Energy"],

        "soh": [0xe182, 2, 'SEFLOAT', "State of Health [SOH)"],
        "soe": [0xe184, 2, 'SEFLOAT', "State of Energy [SOE)"],

        "status": [0xe186, 2, 'UINT32', "Status"],
        "status_internal": [0xe188, 2, 'UINT32', "Internal Status"],

        "event_log": [0xe18a, 2, 'UINT16', "Event Log"],
        "event_log_internal": [0xe192, 2, 'UINT16', "Internal Event Log"]
    }

    processResult(result: Record<string, Measurement>) {
        if (result) {

            // result
            for (let k in result) {
                console.log(k, result[k].value, result[k].scale, result[k].label)
            }

            if (result['power_ac'] && result['power_ac'].value && result['power_ac'].value != 'xxx') {
                this.addCapability('measure_power');
                var acpower = Number(result['power_ac'].value) * (Math.pow(10, Number(result['power_ac'].scale)));
                // console.log( Number(result['power_ac'].value));
                // console.log( Math.pow(10, Number(result['power_ac'].scale)));
                // console.log( acpower );

                this.setCapabilityValue('measure_power', Math.round(acpower));
            }

            if (result['current'] && result['current'].value && result['current'].value != 'xxx') {
                this.addCapability('measure_current');
                var currenteac = Number(result['current'].value) * (Math.pow(10, Number(result['current'].scale)));
                this.setCapabilityValue('measure_current', currenteac);
            }
            if (result['l1_current'] && result['l1_current'].value && result['l1_current'].value != '-1' && result['l1_current'].value != 'xxx') {
                this.addCapability('measure_current.phase1');
                var currenteac1 = Number(result['l1_current'].value) * (Math.pow(10,  Number(result['current'].scale)));
                this.setCapabilityValue('measure_current.phase1', currenteac1);
            }
            if (result['l2_current'] && result['l2_current'].value && result['l2_current'].value != '-1' && result['l2_current'].value != 'xxx') {
                this.addCapability('measure_current.phase2');
                var currenteac2 = Number(result['l2_current'].value) * (Math.pow(10,  Number(result['current'].scale)));
                this.setCapabilityValue('measure_current.phase2', currenteac2);
            }
            if (result['l3_current'] && result['l3_current'].value && result['l2_current'].value != '-1' && result['l3_current'].value != 'xxx') {
                this.addCapability('measure_current.phase3');
                var currenteac3 = Number(result['l3_current'].value) * (Math.pow(10,  Number(result['current'].scale)));
                this.setCapabilityValue('measure_current.phase3', currenteac3);
            }

            let tz = this.homey.clock.getTimezone();
            var now = new Date().toLocaleString(this.homey.i18n.getLanguage(),
                {
                    hour12: false,
                    timeZone: tz,
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

            if (result['energy_total'] && result['energy_total'].value && result['energy_total'].value != 'xxx') {
                this.addCapability('meter_power');
                var total = Number(result['energy_total'].value) * (Math.pow(10, Number(result['energy_total'].scale)));
                this.setCapabilityValue('meter_power', total / 1000);
                console.log(now);
                if ( total != null ) {
                    if (this.getStoreValue("daily") == null ) {
                        this.setStoreValue("daily", total / 1000 );
                    } else if ( now == "24:01" || now == "24:02" || now == "00:01" || now == "00:02" ) {
                        console.log("reset");
                        console.log(total / 1000);
                        this.setStoreValue("daily", total / 1000 );
                    }
                    if (this.getStoreValue("daily") != null ) {
                        var daily_power  = (total / 1000) -  this.getStoreValue("daily");
                        console.log("daily: " + daily_power);
                        this.addCapability('meter_power.daily');
                        this.setCapabilityValue('meter_power.daily', daily_power);
                    }
                }
            }

            // if (result['power_dc'] && result['power_dc'].value != 'xxx' ){
            //   this.addCapability('measure_voltage.dc');
            //   var dcpower = Number(result['power_dc'].value)*(Math.pow(10, Number(result['power_dc'].scale)));
            //   this.setCapabilityValue('measure_voltage.dc', dcpower);
            // }

            if (result['temperature'] && result['temperature'].value && result['temperature'].value != 'xxx') {
                this.addCapability('measure_temperature.invertor');
                var temperature = Number(result['temperature'].value) * (Math.pow(10, Number(result['temperature'].scale)));
                this.setCapabilityValue('measure_temperature.invertor', temperature);
            }

            if (result['active_power_limit'] && result['active_power_limit'].value  && result['active_power_limit'].value != 'xxx') {
                this.addCapability('activepowerlimit');
                var power_limit = Number(Number.parseFloat(result['active_power_limit'].value).toFixed(2));
                this.setCapabilityValue('activepowerlimit', power_limit);
            }

            if (result['export_control_mode'] && result['export_control_mode'].value  && result['export_control_mode'].value != 'xxx') {
                if (this.hasCapability('limitcontrolmode')) {
                    this.addCapability('limitcontrolmode');
                    var mode = '0';
                    if ( result['export_control_mode'].value == '1' ) {
                        mode = '1';
                    } else if ( result['export_control_mode'].value == '2049' ) {
                        mode = '11';
                    }
                    this.setCapabilityValue('limitcontrolmode', mode);
                }
            }            

            if (result['export_control_limit_mode'] && result['export_control_limit_mode'].value  && result['export_control_limit_mode'].value != 'xxx') {
                if (this.hasCapability('exportcontrollimitmode')) {
                    this.addCapability('exportcontrollimitmode');
                    this.setCapabilityValue('exportcontrollimitmode', result['export_control_limit_mode'].value);
                }
            }   
            if (result['export_control_site'] && result['export_control_site'].value  && result['export_control_site'].value != 'xxx') {
                if (this.hasCapability('exportcontrolsitelimit')) {
                    this.addCapability('exportcontrolsitelimit');
                    if (Number(result['export_control_site'].value) > 0 ) {
                      this.setCapabilityValue('exportcontrolsitelimit', Number(result['export_control_site'].value));
                    } else {
                        this.setCapabilityValue('exportcontrolsitelimit', 0);
                    }
                }
            } 
            
            if (result['status'] && result['status'].value && result['status'].value != 'xxx') {
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

            // meters
            if (result['meter1-export_energy_active'] && result['meter1-export_energy_active'].value && result['meter1-export_energy_active'].value != 'xxx') {
                this.addCapability('meter_power.export');
                var totalexport = Number(result['meter1-export_energy_active'].value) * (Math.pow(10, Number(result['meter1-export_energy_active'].scale)));
                this.setCapabilityValue('meter_power.export', totalexport / 1000);
            }

            // meters
            if (result['meter1-import_energy_active'] && result['meter1-import_energy_active'].value && result['meter1-import_energy_active'].value != 'xxx') {
                this.addCapability('meter_power.import');
                var totalimport = Number(result['meter1-import_energy_active'].value) * (Math.pow(10, Number(result['meter1-export_energy_active'].scale)));
                this.setCapabilityValue('meter_power.import', totalimport / 1000);
            }

            if (result['meter1-voltage_ln'] && result['meter1-voltage_ln'].value && result['meter1-voltage_ln'].value != 'xxx') {
                this.addCapability('measure_voltage.meter');
                var voltageac = Number(result['meter1-voltage_ln'].value) * (Math.pow(10, Number(result['meter1-voltage_ln'].scale)));
                this.setCapabilityValue('measure_voltage.meter', voltageac);
            }

            if (result['meter1-current'] && result['meter1-current'].value && result['meter1-current'].value != 'xxx') {
                this.addCapability('measure_current.meter');
                var currenteac = Number(result['meter1-current'].value) * (Math.pow(10, Number(result['meter1-current'].scale)));
                this.setCapabilityValue('measure_current.meter', currenteac);
            }

            if (result['meter1-l1_current'] && result['meter1-l1_current'].value && result['meter1-l1_current'].value != 'xxx') {
                this.addCapability('measure_current.meter_phase1');
                var currenteac1 = Number(result['meter1-l1_current'].value) * (Math.pow(10,  Number(result['meter1-current'].scale)));
                this.setCapabilityValue('measure_current.meter_phase1', currenteac1);
            }

            if (result['meter1-l2_current'] && result['meter1-l2_current'].value && result['meter1-l2_current'].value != 'xxx') {
                this.addCapability('measure_current.meter_phase2');
                var currenteac2 = Number(result['meter1-l2_current'].value) * (Math.pow(10,  Number(result['meter1-current'].scale)));
                this.setCapabilityValue('measure_current.meter_phase2', currenteac2);
            }
            if (result['meter1-l3_current'] && result['meter1-l3_current'].value && result['meter1-l3_current'].value != 'xxx') {
                this.addCapability('measure_current.meter_phase3');
                var currenteac3 = Number(result['meter1-l3_current'].value) * (Math.pow(10,  Number(result['meter1-current'].scale)));
                this.setCapabilityValue('measure_current.meter_phase3', currenteac3);
            }

            // meter  
            if (result['meter1-power'] && result['meter1-power'].value && result['meter1-power'].value != 'xxx') {
                this.addCapability('measure_power.import');
                this.addCapability('measure_power.export');
                this.addCapability('ownconsumption');
                var acpower = Number(result['power_ac'].value) * (Math.pow(10, Number(result['power_ac'].scale)));
                var meterpower = Number(result['meter1-power'].value) * (Math.pow(10, Number(result['meter1-power'].scale)));
                if (meterpower > 0) {
                    this.setCapabilityValue('measure_power.export', meterpower);
                    this.setCapabilityValue('measure_power.import', 0);
                    this.setCapabilityValue('ownconsumption', acpower - meterpower);
                    this.homey.flow.getDeviceTriggerCard('changedExportPower').trigger(this,{ 'measure_power.export' : meterpower }, {});
                    this.homey.flow.getDeviceTriggerCard('changedImportPower').trigger(this,{ 'measure_power.import' : 0 }, {});
                    this.homey.flow.getDeviceTriggerCard('changedConsumption').trigger(this,{ 'ownconsumption' : acpower - meterpower }, {});
                } else {
                    this.setCapabilityValue('measure_power.export', 0);
                    this.setCapabilityValue('measure_power.import', -1 * meterpower);
                    this.setCapabilityValue('ownconsumption', acpower + (-1 * meterpower));
                    this.homey.flow.getDeviceTriggerCard('changedExportPower').trigger(this,{ 'measure_power.export' : 0 }, {});
                    this.homey.flow.getDeviceTriggerCard('changedImportPower').trigger(this,{ 'measure_power.import' : -1 * meterpower }, {});
                    this.homey.flow.getDeviceTriggerCard('changedConsumption').trigger(this,{ 'ownconsumption' : acpower + (-1 * meterpower) }, {});
                }
            }

            // battery  
            if (result['batt1-instantaneous_power'] && result['batt1-instantaneous_power'].value && result['batt1-instantaneous_power'].value != 'xxx') {
                this.addCapability('measure_power.batt_charge');
                this.addCapability('measure_power.batt_discharge');
                var battpower = Number(result['batt1-instantaneous_power'].value);
                if (battpower > 0) {
                    this.setCapabilityValue('measure_power.batt_charge', battpower);
                    this.setCapabilityValue('measure_power.batt_discharge', 0);
                } else {
                    this.setCapabilityValue('measure_power.batt_charge', 0);
                    this.setCapabilityValue('measure_power.batt_discharge', -1 * battpower);
                }
            }

            if (result['batt1-soe'] && result['batt1-soe'].value && result['batt1-soe'].value != 'xxx') {
                this.addCapability('battery');
                this.addCapability('measure_battery');
                var battery = Number(Number.parseFloat(result['batt1-soe'].value).toFixed(2));
                if ( battery > 0 ) {
                    if (this.getCapabilityValue('battery') != battery) {
                        this.homey.flow.getDeviceTriggerCard('changedBattery').trigger(this, { charge: battery }, {});
                    }
                    this.setCapabilityValue('battery', battery);
                    this.setCapabilityValue('measure_battery', battery);
                }
            }

            if (result['batt1-soh'] && result['batt1-soh'].value && result['batt1-soh'].value != 'xxx') {
                var health = Number(result['batt1-soh'].value);
                this.setCapabilityValue('batterysoh', health);
            }

            if (result['batt1-soh'] && result['batt1-soh'].value && result['batt1-soh'].value != 'xxx') {
                if (result['storage_control_mode'] && result['storage_control_mode'].value != 'xxx') {
                    this.addCapability('storagecontrolmode');
                    var storagecontrolmode = result['storage_control_mode'].value;
                    this.setCapabilityValue('storagecontrolmode', storagecontrolmode);
                }

                if (result['remote_control_command_mode'] && result['remote_control_command_mode'].value && result['remote_control_command_mode'].value != 'xxx') {
                    this.addCapability('storagedefaultmode');
                    var storagedefaultmode = result['remote_control_command_mode'].value;
                    this.setCapabilityValue('storagedefaultmode', storagedefaultmode);
                }

                if (result['remote_control_charge_limit'] && result['remote_control_charge_limit'].value  && result['remote_control_charge_limit'].value != 'xxx') {
                    this.addCapability('measure_power.chargesetting');
                    var chargeLimit = Number(result['remote_control_charge_limit'].value);
                    this.setCapabilityValue('measure_power.chargesetting', chargeLimit);
                }

                if (result['remote_control_command_discharge_limit'] && result['remote_control_command_discharge_limit'].value && result['remote_control_command_discharge_limit'].value != 'xxx') {
                    this.addCapability('measure_power.dischargesetting');
                    var dischargeLimit = Number(result['remote_control_command_discharge_limit'].value);
                    this.setCapabilityValue('measure_power.dischargesetting', dischargeLimit);
                }

            }

            if (result['batt1-average_temperature'] && result['batt1-average_temperature'].value && result['batt1-average_temperature'].value != 'xxx') {
                this.addCapability("measure_temperature.battery");
                var batt_temperature = Number(result['batt1-average_temperature'].value);
                this.setCapabilityValue("measure_temperature.battery", Math.round(batt_temperature));
            }

            if (result['batt1-status'] && result['batt1-status'].value && result['batt1-status'].value != 'xxx') {
                if (parseInt(result['batt1-status'].value) < 11) {
                    this.addCapability('battstatus');
                    if (this.getCapabilityValue('battstatus') != result['batt1-status'].value) {
                        let status_str: { [key: string]: string } = {
                            "0": 'Off',
                            '1': 'Standby',
                            '2': 'Init',
                            '3': 'Charge',
                            '4': 'Discharge',
                            '5': 'Fault',
                            '6': 'Idle',
                            '7': 'Idle',                            
                            '10': 'Unknown'
                        }
                        // console.log(this.driver.id);
                        this.homey.flow.getDeviceTriggerCard('changedBatteryStatus').trigger(this, { status: status_str[result['batt1-status'].value] }, {});
                    }
                    this.setCapabilityValue('battstatus', result['batt1-status'].value);
                }
            }
            if (result['batt1-maximum_energy'] && result['batt1-maximum_energy'].value && result['batt1-maximum_energy'].value != 'xxx') {
                var maxenergy = Number(result['batt1-maximum_energy'].value);
                this.addCapability('batterymaxcap');
                this.setCapabilityValue('batterymaxcap', maxenergy / 1000);
            }
            if (result['batt1-available_energy'] && result['batt1-available_energy'].value && result['batt1-available_energy'].value != 'xxx') {
                var availenergy = Number(result['batt1-available_energy'].value);
                this.addCapability('batterycap');
                this.setCapabilityValue('batterycap', availenergy / 1000);
            }
        }
    }
}
