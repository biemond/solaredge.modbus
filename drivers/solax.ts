import Homey, { Device } from 'homey';

export interface Measurement {
    value: string;
    scale: string;
    label: string;
}

export class Solax extends Homey.Device {

    inputRegisters: Object = {

        // "GridVoltage":              [0x0000, 1, 'UINT16', "Inverter Voltage", -1],
        // "GridCurrent":              [0x0001, 1, 'INT16', "Inverter Current", -1],
        "GridPower":               [0x0002, 1, 'INT16', "Inverter Power", 0],

        "Temperature":             [0x0008, 1, 'INT16', "radiator temperature",0],
        "Powerdc1":                [0x000A, 1, 'UINT16', "Powerdc1",0],
        "Powerdc2":                [0x000B, 1, 'UINT16', "Powerdc2",0],

        // 0x0014 BatVoltage_Charge1 R BatVoltage_Charge1 0.1V int16 1
        "BatVoltage_Charge1":      [0x0014, 1, 'INT16', "BatVoltage_Charge1", -1],
        // 0x0015 BatCurrent_Charge1 R BatCurrent_Charge1 0.1A int16 1
        "BatCurrent_Charge1":      [0x0015, 1, 'INT16', "BatCurrent_Charge1", -1],
        // 0x0016 Batpower_Charge1 R Batpower_Charge1 1W int16 1
        "Batpower_Charge1":        [0x0016, 1, 'INT16', "Batpower_Charge1", 0],

        // // 0x0018 TemperatureBat R TemperatureBat 1℃ int16
        // "TemperatureBat":          [0x0018, 1, 'INT16', "TemperatureBat"],
        // // 0x001C Battery Capacity R Battery capacity 1% uint16 1
        // "BatteryCapacity":         [0x001C, 1, 'UINT16', "Battery Capacity"],
        // // 0x0020 OutputEnergy_Charge_today R OutputEnergy_Charge_today 0.1kWh uint16 1
        "OutputEnergy_Charge_today": [0x0020, 1, 'UINT16', "Battery Output Energy Today", -1],
        // // 0x0023 InputEnergy_Charge_today R InputEnergy_Charge_today 0.1kWh uint16 1
        "InputEnergy_Charge_today":  [0x0023, 1, 'UINT16', "Battery Input Energy Today", -1],

        // 0x0046
        // feedin_power R
        // Feedin power is obtained from Meter or CT.
        // (Postive mean generate power; Negative mean consumed power）
        // (0x46:LSB,0x47:MSB)
        // 1W int32 2
        "feedin_power":          [0x0046, 2, 'INT32', "Feedin power is obtained from Meter or CT", 0],

        // 0x0048
        // feedin_energy_total(meter) R
        // energy to the grid
        // (0x48:LSB,0x49:MSB)
        // 0.01kWh uint32 2
        "feedin_energy_total":  [0x0048, 2, 'UINT32', "energy to the grid", -2],
        // 0x004A
        // consum_energy_total(meter) R
        // energy form the grid
        // (0x4A:LSB,0x4B:MSB)
        // 0.01kWh uint32 2
        "consum_energy_total":  [0x004A, 2, 'UINT32', "energy from the grid", -2],

        // ~0x0099
        // feedin_energy_today
        // R
        // energy to the grid
        // (meter)
        // (0x98:LSB,0x99:MSB)
        // 0.01kWh uint32
        // 2
        "feedin_energy_today":  [0x0098, 2, 'UINT32', "energy to the grid today", -2],
        // ~0x009B
        // consum_energy_today
        // R
        // energy form the grid
        // (meter)
        // (0x9A:LSB,0x9B:MSB)
        // 0.01kWh uint16
        "consum_energy_today":  [0x009A, 1, 'UINT32', "energy from the grid today", -2],


        // 0x0050 Etoday_togrid R
        // Today Energy 
        // (Inverter AC Port)
        // 0.1kWh uint16 1
        "Etoday_togrid":        [0x0050, 1, 'UINT16', "Today's Solar Energy", -1],

        // 0x0052
        // Etotal_togrid R
        // Total Energy
        // (Inverter AC Port)
        // (0x52:LSB,0x53:MSB)
        // 0.1kWh uint32 2
        "Etotal_togrid":  [0x0052, 2, 'UINT32', "Total Energy (Inverter AC Port)", -1],

        // 0x006A GridVoltage_R(X3) R GridVoltage_R 0.1V uint16 1
        "GridVoltage_R(X3)":        [0x006A, 1, 'UINT16', "GridVoltage_R(X3)", -1],
        // 0x006B GridCurrent_R(X3) R GridCurrent_R 0.1A int16 1
        "GridCurrent_R(X3)":        [0x006B, 1, 'INT16', "GridCurrent_R(X3)", -1],
        // 0x006C GridPower_R(X3) R GridPower_R 1W int16 1
        "GridPower_R(X3)":          [0x006C, 1, 'INT16', "GridPower_R(X3)", 0],
        // 0x006E GridVoltage_S(X3) R GridVoltage_S 0.1V uint16 1
        "GridVoltage_S(X3)":        [0x006E, 1, 'UINT16', "GridVoltage_S(X3)", -1],
        // 0x006F GridCurrent_S(X3) R GridCurrent_S 0.1A int16 1
        "GridCurrent_S(X3)":        [0x006F, 1, 'INT16', "GridCurrent_S(X3)", -1],
        // 0x0070 GridPower_S(X3) R GridPower_S 1W int16 1
        "GridPower_S(X3)":          [0x0070, 1, 'INT16', "GridPower_S(X3)", 0],
        // 0x0072 GridVoltage_T(X3) R GridVoltage_T 0.1V uint16 1
        "GridVoltage_T(X3)":        [0x0072, 1, 'UINT16', "GridVoltage_T(X3)", -1],
        // 0x0073 GridCurrent_T(X3) R GridCurrent_T 0.1A int16 1
        "GridCurrent_T(X3)":        [0x0073, 1, 'INT16', "GridCurrent_T(X3)", -1],
        // 0x0074 GridPower_T(X3) R GridPower_T 1W int16 1
        "GridPower_T(X3)":          [0x0074, 1, 'INT16', "GridPower_T(X3)", 0],

        // // 0x0082
        // // ~0x0083
        // // FeedinPower_Rphase(X3)
        // // R
        // // FeedinPower_Rphase
        // // (meter/CT)
        // // (082:LSB,0x83:MSB)
        // // 1W int32
        // // 2
        // "FeedinPower_Rphase(X3)":          [0x0082, 2, 'INT32', "FeedinPower_Rphase(X3)"],
        // // ~0x0085
        // // FeedinPower_Sphase(X3)
        // // R
        // // FeedinPower_Sphase
        // // (meter/CT)
        // // (0x84:LSB,0x85:MSB)
        // // 1W int32
        // // 2
        // "FeedinPower_Sphase(X3)":          [0x0084, 2, 'INT32', "FeedinPower_Sphase(X3)"],
        // // ~0x0087
        // // FeedinPower_Tphase(X3)
        // // R
        // // FeedinPower_Tphas
        // // e
        // // (meter/CT)
        // // (0x86:LSB,0x87:MSB)
        // // 1W int32
        // // 2
        // "FeedinPower_Tphase(X3)":          [0x0086, 2, 'INT32', "FeedinPower_Tphase(X3)"],

        // // 0x0091 EchargeToday
        // // R
        // // EchargeToday
        // // (Inverter AC Port)
        // // 0.1kWh uint16
        // // 1
        // "EchargeToday":        [0x0091, 1, 'UINT16', "EchargeToday"],
        // // ~0x0093
        // // EchargeTotal
        // // R
        // // EchargeTotal
        // // (Inverter AC Port)
        // // (0x92:LSB,0x93:MSB)
        // // 0.1kWh uint32
        // // 2
        // "EchargeTotal":  [0x0092, 2, 'UINT32', "EchargeTotal"],
        // ~0x0095
        // SolarEnergyTotal
        // R
        // SolarEnergyTotal
        // (0x94:LSB,0x95:MSB)
        // 0.1kWh uint32
        // 2
        "SolarEnergyTotal":  [0x0094, 2, 'UINT32', "SolarEnergyTotal", -1],
        // 0x0096 SolarEnergyToday
        // R SolarEnergyToday 0.1kWh uint16
        // 1
        // 0x0097 REV
        // R
        // -
        // - uint16
        // 1
        "SolarEnergyToday":  [0x0096, 1, 'UINT16', "SolarEnergyToday", -1],


        // // 2
        // // 0x00BE BMS_UserSOC R BMS_UserSOC 1% Uint16 1
        "BMS_UserSOC":        [0x00BE, 1, 'UINT16', "BMS_UserSOC", 0],
        // // 0x00BF BMS_UserSOH R BMS_UserSOH 1% Uint16 1
        "BMS_UserSOH":        [0x00BF, 1, 'UINT16', "BMS_UserSOH", 0],
        // // 0x0102
        // // ActivePowerTarget R ActivePowerTarget 1W int32 2
        // "ActivePowerTarget":  [0x0102, 2, 'INT32', "ActivePowerTarget"],

        // // 0x0114
        // // Charge_Discharg_Power R
        // // Charge_Discharg_Power
        // // (0x114:LSB,0x115:MSB)
        // // 1W int32 2
        // "Charge_Discharg_Power":  [0x0114, 2, 'INT32', "Charge_Discharg_Power"],

        // // 0x011C SocUpper R SocUpper 1% uint16 1
        // "SocUpper":        [0x011C, 1, 'UINT16', "SocUpper"],
        // // 0x011D SocLower R SocLower 1% uint16 1
        // "SocLower":        [0x011D, 1, 'UINT16', "SocLower"],


        // // 0x00BC Cell_Voltage_High R Cell_Voltage_High 0.001V Uint16 1
        // "Cell_Voltage_High":       [0x00BC, 1, 'UINT16', "Cell_Voltage_High"],
        // // 0x00BD Cell_Voltage_Low R Cell_Voltage_Low 0.001V Uint16 1
        // "Cell_Voltage_Low":        [0x00BD, 1, 'UINT16', "Cell_Voltage_Low"],

        // // 0x004C Off-gridVoltage(X1) R Off-grid Voltage 0.1V uint16 1
        // "Off-gridVoltage(X1)":        [0x004C, 1, 'UINT16', "Off-gridVoltage(X1)"],
        // // 0x004D Off-gridCurrent(X1) R Off-grid Current 0.1A uint16 1
        // "Off-gridCurrent(X1)":        [0x004D, 1, 'UINT16', "Off-gridCurrent(X1)"],
        // // 0x004E Off-gridPower(X1) R Off-grid power 1VA uint16 1
        // "Off-gridPower(X1)":        [0x004E, 1, 'UINT16', "Off-gridPower(X1)"],

        // // 0x0066 BusVolt R BusVolt 0.1V uint16 1
        // "BusVolt":        [0x0066, 1, 'UINT16', "BusVolt"],


    };


    holdingRegisters: Object = {

        // SolarChargerUseMode:
        // 0:Self use mode
        // 1: Feedin Priority
        // 2:Back up mode
        // 3:Manual mode
        "SolarChargerUseMode":       [0x008B, 1, 'UINT16', "SolarChargerUseMode", 0],

        // 0:Stop charge&discharge
        // 1:Force charge
        // 2:Force discharge
        "ManualMode":                [0x008C, 1, 'UINT16', "Manual mode", 0],


        "PowerLimitsPercent":        [0x0025, 1, 'UINT16', "output power limits precent 0~100", 0],
        "FeedinOnPower":             [0x0123, 1, 'UINT16', "Grid connected pull in power point",0],
        // 0x008D wBattery1_Type R 0：Lead Acid 1：Lithium 1 uint16 1
        "wBattery1_Type":             [0x008D, 1, 'UINT16', "Battery1 Type", 0],

        // 0x008E Charge_floatVolt R Lead-acid battery charge_float voltage 0.1V
        "Charge_floatVolt":        [0x008E, 1, 'UINT16', "Charge_floatVolt", 0],
        // 0x008F Battery_DischargeCutVoltage R Lead-acid battery discharge cut-off
        "BusBattery_DischargeCutVoltageVolt":        [0x008F, 1, 'UINT16', "Battery_DischargeCutVoltage", 0],


        // 0x0090 Battery_ChargeMaxCurrent R
        // Lead-acid battery charge
        // maximum current
        // 0.1A uint16 1
        "Battery_ChargeMaxCurrent":        [0x0090, 1, 'UINT16', "Battery_ChargeMaxCurrent", 0],

        // 0x0091 Battery_DischargeMaxCurrent R
        // Lead-acid battery discharge
        // maximum Current
        // 0.1A uint16 1
        "Battery_DischargeMaxCurrent":        [0x0091, 1, 'UINT16', "Battery_DischargeMaxCurrent", 0],

        // 0x0092 absorpt_voltage R Lead-acid battery absorpt_voltage 0.1V uint16 1
        "absorpt_voltage":        [0x0092, 1, 'UINT16', "absorpt_voltage", 0],

        // 0x00B6 Export control user limit R Export_control user limit 1W uint16 1
        "Export_control_user_limit":        [0x00B6, 1, 'UINT16', "Export control user limit", 0],
        // 0x00F0 HardExportPower R HardExportPower
        // 1W(X1)
        // 10W(X3)
        // uint16 1
        "HardExportPower":        [0x00F0, 1, 'UINT16', "HardExportPower", 0],


    };   


    processResult(result: Record<string, Measurement>) {
        if (result) {

            // result
            for (let k in result) {
                console.log(k, result[k].value, result[k].scale, result[k].label)
            }

            if (result['GridPower'] && result['GridPower'].value != 'xxx') {
                this.addCapability('measure_power');
                var dcPower = Number(result['GridPower'].value) * (Math.pow(10, Number(result['GridPower'].scale)));
                this.setCapabilityValue('measure_power', Math.round(dcPower));
            }

            // def value_function_house_load(initval, descr, datadict):
            // return ( datadict.get('inverter_load', 0) - datadict.get('measured_power', 0) )
            // name = "Inverter Power",
            // register = 0x2,
            // name = "Measured Power",
            // register = 0x46,
            if (result['GridPower'] && result['GridPower'].value != 'xxx' && result['feedin_power'] && result['feedin_power'].value != 'xxx') {
                this.addCapability('measure_power.load');
                var dcPower = Number(result['GridPower'].value) * (Math.pow(10, Number(result['GridPower'].scale)));
                var feedin_power = Number(result['feedin_power'].value) * (Math.pow(10, Number(result['feedin_power'].scale)));
                this.setCapabilityValue('measure_power.load', Math.round(dcPower - feedin_power));
            }

            if (result['Batpower_Charge1'] && result['Batpower_Charge1'].value != 'xxx') {
                this.addCapability('measure_power.battery');
                var dcPower = Number(result['Batpower_Charge1'].value) * (Math.pow(10, Number(result['Batpower_Charge1'].scale)));
                this.setCapabilityValue('measure_power.battery', Math.round(dcPower));
            }
            if (result['BatVoltage_Charge1'] && result['BatVoltage_Charge1'].value != 'xxx') {
                this.addCapability('measure_voltage.batt_charge');
                var dcPower = Number(result['BatVoltage_Charge1'].value) * (Math.pow(10, Number(result['BatVoltage_Charge1'].scale)));
                this.setCapabilityValue('measure_voltage.batt_charge', dcPower);
            }
            if (result['BatCurrent_Charge1'] && result['BatCurrent_Charge1'].value != 'xxx') {
                this.addCapability('measure_current.batt_charge');
                var dcPower = Number(result['BatCurrent_Charge1'].value) * (Math.pow(10, Number(result['BatCurrent_Charge1'].scale)));
                this.setCapabilityValue('measure_current.batt_charge', dcPower);
            }            

            if (result['Powerdc1'] && result['Powerdc1'].value != 'xxx') {
                this.addCapability('measure_power.pv1input');
                var dcPower = Number(result['Powerdc1'].value) * (Math.pow(10, Number(result['Powerdc1'].scale)));
                this.setCapabilityValue('measure_power.pv1input', Math.round(dcPower));
            }
            if (result['Powerdc2'] && result['Powerdc2'].value != 'xxx') {
                this.addCapability('measure_power.pv2input');
                var dcPower = Number(result['Powerdc2'].value) * (Math.pow(10, Number(result['Powerdc2'].scale)));
                this.setCapabilityValue('measure_power.pv2input', Math.round(dcPower));
            }  

            if (result['Powerdc2'] && result['Powerdc2'].value != 'xxx' && result['Powerdc1'] && result['Powerdc1'].value != 'xxx') {
                this.addCapability('measure_power.pvinput');
                var dcPower1 = Number(result['Powerdc1'].value) * (Math.pow(10, Number(result['Powerdc1'].scale)));
                var dcPower2 = Number(result['Powerdc2'].value) * (Math.pow(10, Number(result['Powerdc2'].scale)));
                this.setCapabilityValue('measure_power.pvinput', Math.round(dcPower1 + dcPower2));
            }  

            if (result['Temperature'] && result['Temperature'].value != 'xxx') {
                this.addCapability('measure_temperature.invertor');
                var dcPower = Number(result['Temperature'].value) * (Math.pow(10, Number(result['Temperature'].scale)));
                this.setCapabilityValue('measure_temperature.invertor', dcPower);
            }     

            if (result['OutputEnergy_Charge_today'] && result['OutputEnergy_Charge_today'].value != 'xxx') {
                this.addCapability('meter_power.today_batt_output');
                var dcPower = Number(result['OutputEnergy_Charge_today'].value) * (Math.pow(10, Number(result['OutputEnergy_Charge_today'].scale)));
                this.setCapabilityValue('meter_power.today_batt_output', Math.round(dcPower));
            }            
            if (result['InputEnergy_Charge_today'] && result['InputEnergy_Charge_today'].value != 'xxx') {
                this.addCapability('meter_power.today_batt_input');
                var dcPower = Number(result['InputEnergy_Charge_today'].value) * (Math.pow(10, Number(result['InputEnergy_Charge_today'].scale)));
                this.setCapabilityValue('meter_power.today_batt_input', Math.round(dcPower));
            }  

            if (result['feedin_power'] && result['feedin_power'].value != 'xxx') {
                this.addCapability('measure_power.gridoutput');
                var dcPower = Number(result['feedin_power'].value) * (Math.pow(10, Number(result['feedin_power'].scale)));
                this.setCapabilityValue('measure_power.gridoutput', Math.round(dcPower));
            }  

            if (result['feedin_energy_total'] && result['feedin_energy_total'].value != 'xxx') {
                this.addCapability('meter_power.export');
                var dcPower = Number(result['feedin_energy_total'].value) * (Math.pow(10, Number(result['feedin_energy_total'].scale)));
                this.setCapabilityValue('meter_power.export', dcPower);
            }  

            if (result['consum_energy_total'] && result['consum_energy_total'].value != 'xxx') {
                this.addCapability('meter_power.import');
                var dcPower = Number(result['consum_energy_total'].value) * (Math.pow(10, Number(result['consum_energy_total'].scale)));
                this.setCapabilityValue('meter_power.import', dcPower);
            }  

            if (result['feedin_energy_today'] && result['feedin_energy_today'].value != 'xxx') {
                this.addCapability('meter_power.export_daily');
                var dcPower = Number(result['feedin_energy_today'].value) * (Math.pow(10, Number(result['feedin_energy_today'].scale)));
                this.setCapabilityValue('meter_power.export_daily',dcPower);
            }  

            if (result['consum_energy_today'] && result['consum_energy_today'].value != 'xxx') {
                this.addCapability('meter_power.import_daily');
                var dcPower = Number(result['consum_energy_today'].value) * (Math.pow(10, Number(result['consum_energy_today'].scale)));
                this.setCapabilityValue('meter_power.import_daily', dcPower);
            }  

            if (result['Etoday_togrid'] && result['Etoday_togrid'].value != 'xxx') {
                this.addCapability('meter_power.daily');
                var dcPower = Number(result['Etoday_togrid'].value) * (Math.pow(10, Number(result['Etoday_togrid'].scale)));
                this.setCapabilityValue('meter_power.daily', dcPower);
            }  

            if (result['Etotal_togrid'] && result['Etotal_togrid'].value != 'xxx') {
                this.addCapability('meter_power');
                var dcPower = Number(result['Etotal_togrid'].value) * (Math.pow(10, Number(result['Etotal_togrid'].scale)));
                this.setCapabilityValue('meter_power', dcPower);
            }  

            if (result['GridCurrent_R(X3)'] && result['GridCurrent_R(X3)'].value != 'xxx') {
                this.addCapability('measure_current.meter_phase1');
                var dcPower = Number(result['GridCurrent_R(X3)'].value) * (Math.pow(10, Number(result['GridCurrent_R(X3)'].scale)));
                this.setCapabilityValue('measure_current.meter_phase1', dcPower);
            }  

            if (result['GridCurrent_S(X3)'] && result['GridCurrent_S(X3)'].value != 'xxx') {
                this.addCapability('measure_current.meter_phase2');
                var dcPower = Number(result['GridCurrent_S(X3)'].value) * (Math.pow(10, Number(result['GridCurrent_S(X3)'].scale)));
                this.setCapabilityValue('measure_current.meter_phase2', dcPower);
            }  

            if (result['GridCurrent_T(X3)'] && result['GridCurrent_T(X3)'].value != 'xxx') {
                this.addCapability('measure_current.meter_phase3');
                var dcPower = Number(result['GridCurrent_T(X3)'].value) * (Math.pow(10, Number(result['GridCurrent_T(X3)'].scale)));
                this.setCapabilityValue('measure_current.meter_phase3', dcPower);
            }  

            if (result['GridVoltage_R(X3)'] && result['GridVoltage_R(X3)'].value != 'xxx') {
                this.addCapability('measure_voltage.meter_phase1');
                var dcPower = Number(result['GridVoltage_R(X3)'].value) * (Math.pow(10, Number(result['GridVoltage_R(X3)'].scale)));
                this.setCapabilityValue('measure_voltage.meter_phase1', dcPower);
            }  

            if (result['GridVoltage_S(X3)'] && result['GridVoltage_S(X3)'].value != 'xxx') {
                this.addCapability('measure_voltage.meter_phase2');
                var dcPower = Number(result['GridVoltage_S(X3)'].value) * (Math.pow(10, Number(result['GridVoltage_S(X3)'].scale)));
                this.setCapabilityValue('measure_voltage.meter_phase2', dcPower);
            }  

            if (result['GridVoltage_T(X3)'] && result['GridVoltage_T(X3)'].value != 'xxx') {
                this.addCapability('measure_voltage.meter_phase3');
                var dcPower = Number(result['GridVoltage_T(X3)'].value) * (Math.pow(10, Number(result['GridVoltage_T(X3)'].scale)));
                this.setCapabilityValue('measure_voltage.meter_phase3', dcPower);
            }  


            if (result['GridPower_R(X3)'] && result['GridPower_R(X3)'].value != 'xxx') {
                this.addCapability('measure_power.meter_phase1');
                var dcPower = Number(result['GridPower_R(X3)'].value) * (Math.pow(10, Number(result['GridPower_R(X3)'].scale)));
                this.setCapabilityValue('measure_power.meter_phase1', Math.round(dcPower));
            }  

            if (result['GridPower_S(X3)'] && result['GridPower_S(X3)'].value != 'xxx') {
                this.addCapability('measure_power.meter_phase2');
                var dcPower = Number(result['GridPower_S(X3)'].value) * (Math.pow(10, Number(result['GridPower_S(X3)'].scale)));
                this.setCapabilityValue('measure_power.meter_phase2', Math.round(dcPower));
            }  

            if (result['GridPower_T(X3)'] && result['GridPower_T(X3)'].value != 'xxx') {
                this.addCapability('measure_power.meter_phase3');
                var dcPower = Number(result['GridPower_T(X3)'].value) * (Math.pow(10, Number(result['GridPower_T(X3)'].scale)));
                this.setCapabilityValue('measure_power.meter_phase3', Math.round(dcPower));
            }  

            // "BMS_UserSOC":        [0x00BE, 1, 'UINT16', "BMS_UserSOC", 0],
            // "BMS_UserSOH":        [0x00BF, 1, 'UINT16', "BMS_UserSOH", 0],
            if (result['BMS_UserSOC'] && result['BMS_UserSOC'].value != 'xxx') {
                this.addCapability('battery');
                this.addCapability('measure_battery');
                var battery = Number(result['BMS_UserSOC'].value);
                if ( battery > 0 ) {
                    this.setCapabilityValue('battery', battery);
                    this.setCapabilityValue('measure_battery', battery);
                }
            }
            if (result['BMS_UserSOH'] && result['BMS_UserSOH'].value != 'xxx') {
                this.addCapability('batterysoh');
                var health = Number(result['BMS_UserSOH'].value);
                this.setCapabilityValue('batterysoh', health);
            }

            if (result['SolarChargerUseMode'] && result['SolarChargerUseMode'].value != 'xxx') {
                this.addCapability('solarcharger_use_mode');
                var storage = result['SolarChargerUseMode'].value;
                this.setCapabilityValue('solarcharger_use_mode', storage);
            }

            if (result['ManualMode'] && result['ManualMode'].value != 'xxx') {
                this.addCapability('storage_force_charge_discharge2');
                var mode = result['ManualMode'].value;
                this.setCapabilityValue('storage_force_charge_discharge2', mode);
            }            
            
        }
    }
}
