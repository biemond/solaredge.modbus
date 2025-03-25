import Homey, { Device } from 'homey';

export interface Measurement {
  value: string;
  scale: string;
  label: string;
}

export class Sigenergy extends Homey.Device {
  registers = {
    sigen_ems_work_mode_code: [30003, 1, 'UINT16', 'Sigen EMS work mode code', 0],
    // # 0: Max self consumption;
    // # 1: Sigen AI Mode;
    // # 2: TOU
    // # 7: Remote EMS mode

    sigen_grid_sensor_active_power: [30005, 2, 'INT32', 'Sigen Grid sensor active power', 0],
    // # > 0: power from grid to system
    // # < 0: power from system to grid
    //   precision: 3
    //   unit_of_measurement: kW
    //   scale: 0.001

    sigen_grid_status_mode: [30009, 1, 'UINT16', 'Sigen gird status mode', 0],
    // 0: on grid
    // 1: off grid (auto)
    // 2: off grid (manual)

    sigen_grid_phase_a_active_power: [30052, 2, 'INT32', 'Sigen Grid Phase A active power', 0],
    // # >0 buy from grid;
    // # <0 sell to grid
    //   precision: 3
    //   unit_of_measurement: kW
    //   scale: 0.001
    sigen_grid_phase_b_active_power: [30054, 2, 'INT32', 'Sigen Grid Phase B active power', 0],
    sigen_grid_phase_c_active_power: [30056, 2, 'INT32', 'Sigen Grid Phase C active power', 0],

    // "sigen_energy_storage_system_soc": [30014, 1, 'UINT16', "Sigen Energy storage system SOC", 0],
    // precision: 1
    // unit_of_measurement: "%"
    // device_class: battery
    // scale: 0.1

    sigen_plant_phase_a_active_power: [30015, 2, 'INT32', 'Sigen Plant phase A active Power', -3],
    // address: 30015
    // precision: 3
    // unit_of_measurement: kW
    // scale: 0.001
    sigen_plant_phase_b_active_power: [30017, 2, 'INT32', 'Sigen Plant phase B active Power', -3],
    sigen_plant_phase_c_active_power: [30019, 2, 'INT32', 'Sigen Plant phase C active Power', -3],

    // "sigen_plant_phase_a_reactive_power": [30021, 2, 'INT32', "Sigen Plant phase A reactive Power", -3],
    // precision: 3
    // unit_of_measurement: kVAr
    // scale: 0.001

    // "sigen_general_alarm1_code": [30027, 1, 'UINT16', "Sigen General Alarm1 code", 0],
    // "sigen_general_alarm2_code": [30028, 1, 'UINT16', "Sigen General Alarm2 code", 0],
    // "sigen_general_alarm3_code": [30029, 1, 'UINT16', "Sigen General Alarm3 code", 0],
    // "sigen_general_alarm4_code": [30030, 1, 'UINT16', "Sigen General Alarm4 code", 0],

    sigen_plant_active_power: [30031, 2, 'INT32', 'Sigen Plant active power', 0],
    // precision: 3
    // unit_of_measurement: kW
    // scale: 0.001

    sigen_pv_power: [30035, 2, 'INT32', 'Sigen Plant PV power', 0],
    // address: 30035
    // precision: 3
    // unit_of_measurement: kW
    // scale: 0.001

    sigen_battery_power: [30037, 2, 'INT32', 'Sigen Battery power', 0],
    //   # <0: discharging
    //   # >0: charging
    //     precision: 3
    //     unit_of_measurement: kW
    //     scale: 0.001

    // "sigen_available_max_active_power": [30039, 2, 'UINT32', "Sigen Available max active power", -3],
    // precision: 3
    // unit_of_measurement: kW
    // scale: 0.001

    // "sigen_available_min_active_power": [30041, 2, 'UINT32', "Sigen Available min active power", -3],
    // precision: 3
    // unit_of_measurement: kW
    // scale: 0.001

    // "sigen_available_max_charging_power": [30047, 2, 'UINT32', "Sigen Available max charging power", -3],
    // precision: 3
    // unit_of_measurement: kW
    // scale: 0.001

    // "sigen_available_max_discharging_power": [30049, 2, 'UINT32', "Sigen Available max discharging power", -3],
    // precision: 3
    // unit_of_measurement: kW
    // scale: 0.001

    // "sigen_plant_running_state_code": [30051, 1, 'UINT16', "Sigen Plant running state code", 0],
  };

  holdingRegisters = {
    sigen_remote_ems_code: [40029, 1, 'UINT16', 'Sigen Remote EMS code', 0],
    // # 0: disabled
    // # 1: enabled
    // # When needed to control EMS remotely, this register needs to be enabled.
    // # When enabled, the plant’s EMS work mode (30003) will switch to remote EMS.

    sigen_independent_phase_power_control_code: [40030, 1, 'UINT16', 'Sigen Independent phase power control code', 0],
    // # Valid only when output type is L1/L2/L3/N. To enable independent phase control, this parameter must be enabled.
    // # 0: disabled
    // # 1: enabled

    sigen_remote_ems_control_mode_code: [40031, 1, 'UINT16', 'Sigen Remote EMS control mode code', 0],
    // # 0: PCS remote control
    // # 1: Standby
    // # 2: Maximum self-consumption
    // # 3: Command charging (consume power from the grid first)
    // # 4: Command charging (consume power from the PV first)
    // # 5: Command discharging (output power from PV first)
    // # 6: Command discharging (output power from the battery first)

    sigen_ess_max_charging_limit: [40032, 2, 'UINT32', 'Sigen ESS max charging limit', 0],
    // # [0, Rated ESS charging power]. This register will take effect when Remote EMS control mode (40031) is 3 or 4.
    //   precision: 3
    //   unit_of_measurement: kW
    //   scale: 0.001

    sigen_ess_max_discharging_limit: [40034, 2, 'UINT32', 'Sigen ESS max discharging limit', -3],
    // # [0, Rated ESS discharging power]. This register will take effect when Remote EMS control mode (40031) is 5 or 6.
    //   precision: 3
    //   unit_of_measurement: kW
    //   scale: 0.001

    // "sigen_pv_max_power_limit": [40036, 2, 'UINT32', "Sigen PV max power limit", -3],
    // # This register will take effect when Remote EMS control mode (40031) is 3, 4, 5 or 6.
    //   unique_id: sigen_pv_max_power_limit
    //   precision: 3
    //   unit_of_measurement: kW
    //   scale: 0.001
  };

  registersInverter = {
    sigendev_type: [30500, 15, 'STRING', 'Sigen Type', 0],
    // "sigendev_serial_number": [30515, 10, 'STRING', "Sigen Serial number", 0],
    // "sigendev_firmware_version": [30525, 15, 'STRING', "Sigen Firmware version", 0],
    // "sigendev_rated_active_power": [30540, 2, 'UINT32', "Sigen Rated active power", -3],
    // precision: 3
    // unit_of_measurement: kW
    // scale: 0.001

    sigendev_daily_export_energy: [30554, 2, 'UINT32', 'Sigen Daily export energy', -2],
    // precision: 2
    // unit_of_measurement: kWh
    // scale: 0.01

    sigendev_accumulated_export_energy: [30556, 4, 'UINT64', 'Sigen Accumulated export energy', -2],
    // precision: 2
    // unit_of_measurement: kWh
    // scale: 0.01

    sigendev_daily_import_energy: [30560, 2, 'UINT32', 'Sigen daily import energy', -2],
    // precision: 2
    // unit_of_measurement: kWh
    // scale: 0.01

    sigendev_accumulated_import_energy: [30562, 4, 'UINT64', 'Sigen Accumulated import energy', -2],
    // precision: 2
    // unit_of_measurement: kWh
    // scale: 0.01

    sigendev_daily_charge_energy: [30566, 2, 'UINT32', 'Sigen Daily charge energy', -2],
    // precision: 2
    // unit_of_measurement: kWh
    // scale: 0.01
    sigendev_daily_discharge_energy: [30572, 2, 'UINT32', 'Sigen Daily discharge energy', -2],
    // precision: 2
    // unit_of_measurement: kWh
    // scale: 0.01

    sigendev_running_state_code: [30578, 1, 'UINT16', 'Sigen Running state code', 0],
    // Standby 0x00
    // Running 0x01
    // Fault 0x02
    // Shutdown 0x03

    sigendev_active_power: [30587, 2, 'INT32', 'Sigen Active power', 0],
    // precision: 3
    // unit_of_measurement: kW
    // scale: 0.001

    // "sigendev_ess_max_battery_charge_power": [30591, 2, 'UINT32', "Sigen ESS Max. battery charge power", -3],
    // precision: 3
    // unit_of_measurement: kW
    // scale: 0.001

    // "sigendev_ess_max_battery_discharge_power": [30593, 2, 'UINT32', "Sigen ESS Max. battery discharge power", -3],
    // precision: 3
    // unit_of_measurement: kW
    // scale: 0.001

    //    "sigendev_ess_available_battery_charge_energy": [30595, 2, 'UINT32', "Sigen ESS Available battery charge Energy", -2],
    // precision: 2
    // unit_of_measurement: kWh
    // scale: 0.01

    // "sigendev_ess_available_battery_discharge_energy": [30597, 2, 'UINT32', "Sigen ESS Available battery discharge Energy", -2],

    sigendev_ess_charge_discharge_power: [30599, 2, 'INT32', 'Sigen ESS charge / discharge power', -3],
    // precision: 3
    // unit_of_measurement: kW
    // scale: 0.001
    sigendev_ess_battery_soc: [30601, 1, 'UINT16', 'Sigen ESS battery SOC', -1],
    // precision: 1
    // unit_of_measurement: "%"
    // scale: 0.1
    sigendev_ess_battery_soh: [30602, 1, 'UINT16', 'Sigen ESS battery SOH', -1],

    sigendev_ess_average_cell_temperature: [30603, 1, 'INT16', 'Sigen ESS average cell temperature', -1],
    // precision: 1
    // unit_of_measurement: °C
    // scale: 0.1

    sigendev_ess_average_cell_voltage: [30604, 1, 'UINT16', 'Sigen ESS average cell voltage', -1],
    // precision: 2
    // unit_of_measurement: V
    // scale: 0.1

    sigendev_alarm1_code: [30605, 1, 'UINT16', 'Sigen Alarm1 code', 0],
    sigendev_alarm2_code: [30606, 1, 'UINT16', 'Sigen Alarm2 code', 0],
    sigendev_alarm3_code: [30607, 1, 'UINT16', 'Sigen Alarm3 code', 0],
    sigendev_alarm4_code: [30608, 1, 'UINT16', 'Sigen Alarm4 code', 0],

    // "sigendev_rated_grid_voltage": [31000, 1, 'UINT16', "Sigen Rated grid voltage", -1],
    // precision: 2
    // unit_of_measurement: V
    // scale: 0.1

    sigendev_inverter_temperature: [31003, 1, 'INT16', 'Sigen Inverter temperature', -1],
    // precision: 1
    // unit_of_measurement: °C
    // scale: 0.1

    sigendev_phase_a_voltage: [31011, 2, 'UINT32', 'Sigen Phase A voltage', -2],
    // precision: 2
    // unit_of_measurement: V
    // scale: 0.01
    sigendev_phase_b_voltage: [31013, 2, 'UINT32', 'Sigen Phase B voltage', -2],
    sigendev_phase_c_voltage: [31015, 2, 'UINT32', 'Sigen Phase C voltage', -2],

    sigendev_phase_a_current: [31017, 2, 'UINT32', 'Sigen Phase A current', -2],
    sigendev_phase_b_current: [31019, 2, 'UINT32', 'Sigen Phase B current', -2],
    sigendev_phase_c_current: [31021, 2, 'UINT32', 'Sigen Phase C current', -2],

    // "sigendev_pv_string_count": [31025, 1, 'UINT16', "Sigen pv string count", 0],

    sigendev_pv_power: [31025, 1, 'UINT16', 'Sigen pv power', 0],
    // precision: 3
    // unit_of_measurement: kW
    // scale: 0.001
  };

  processResult(result: Record<string, Measurement>) {
    if (result) {
      // result
      for (let k in result) {
        console.log('sigenergy: ', k, result[k].value, result[k].scale, result[k].label);
      }

      if (result['sigen_plant_active_power'] && result['sigen_plant_active_power'].value != 'xxx') {
        this.addCapability('measure_power');
        let activePower = Number(result['sigen_plant_active_power'].value) * Math.pow(10, Number(result['sigen_plant_active_power'].scale));
        this.setCapabilityValue('measure_power', Math.round(activePower));
      }

      if (result['sigen_pv_power'] && result['sigen_pv_power'].value != 'xxx') {
        this.addCapability('measure_power.pv');
        let PowerDC = Number(result['sigen_pv_power'].value) * Math.pow(10, Number(result['sigen_pv_power'].scale));
        this.setCapabilityValue('measure_power.pv', Math.round(PowerDC));
      }

      if (result['sigen_grid_sensor_active_power'] && result['sigen_grid_sensor_active_power'].value != 'xxx') {
        this.addCapability('measure_power.grid');
        let PowerGrid = Number(result['sigen_grid_sensor_active_power'].value) * Math.pow(10, Number(result['sigen_grid_sensor_active_power'].scale));
        this.setCapabilityValue('measure_power.grid', Math.round(PowerGrid));
      }

      if (result['sigen_battery_power'] && result['sigen_battery_power'].value != 'xxx') {
        this.addCapability('measure_power.batt_charge_discharge');
        let PowerBatt = Number(result['sigen_battery_power'].value) * Math.pow(10, Number(result['sigen_battery_power'].scale));
        this.setCapabilityValue('measure_power.batt_charge_discharge', Math.round(PowerBatt));
      }

      if (result['sigen_grid_sensor_active_power'] && result['sigen_grid_sensor_active_power'].value != 'xxx') {
        this.addCapability('measure_power.consumed');
        let PowerBatt = Number(result['sigen_battery_power'].value) * Math.pow(10, Number(result['sigen_battery_power'].scale));
        let PowerGrid = Number(result['sigen_grid_sensor_active_power'].value) * Math.pow(10, Number(result['sigen_grid_sensor_active_power'].scale));
        let PowerDC = Number(result['sigen_pv_power'].value) * Math.pow(10, Number(result['sigen_pv_power'].scale));
        this.setCapabilityValue('measure_power.consumed', Math.round(PowerDC - PowerBatt + PowerGrid));
      }

      if (result['sigendev_ess_battery_soc'] && result['sigendev_ess_battery_soc'].value != 'xxx') {
        this.addCapability('battery');
        this.addCapability('measure_battery');
        let soc = Number(result['sigendev_ess_battery_soc'].value) * Math.pow(10, Number(result['sigendev_ess_battery_soc'].scale));
        this.setCapabilityValue('battery', soc);
        this.setCapabilityValue('measure_battery', soc);
      }
      if (result['sigendev_ess_battery_soh'] && result['sigendev_ess_battery_soh'].value != 'xxx') {
        this.addCapability('batterysoh');
        let soh = Number(result['sigendev_ess_battery_soh'].value) * Math.pow(10, Number(result['sigendev_ess_battery_soh'].scale));
        this.setCapabilityValue('batterysoh', soh);
      }

      if (result['sigendev_inverter_temperature'] && result['sigendev_inverter_temperature'].value != 'xxx') {
        this.addCapability('measure_temperature.invertor');
        let temperature = Number(result['sigendev_inverter_temperature'].value) * Math.pow(10, Number(result['sigendev_inverter_temperature'].scale));
        this.setCapabilityValue('measure_temperature.invertor', temperature);
      }
      if (result['sigendev_ess_average_cell_temperature'] && result['sigendev_ess_average_cell_temperature'].value != 'xxx') {
        this.addCapability('measure_temperature.battery');
        let temperature =
          Number(result['sigendev_ess_average_cell_temperature'].value) * Math.pow(10, Number(result['sigendev_ess_average_cell_temperature'].scale));
        this.setCapabilityValue('measure_temperature.battery', temperature);
      }

      if (result['sigendev_running_state_code'] && result['sigendev_running_state_code'].value != 'xxx') {
        this.addCapability('sigendev_running_state_code');
        let state = result['sigendev_running_state_code'].value;
        this.setCapabilityValue('sigendev_running_state_code', state);
      }

      if (result['sigendev_phase_a_current'] && result['sigendev_phase_a_current'].value != '-1' && result['sigendev_phase_a_current'].value != 'xxx') {
        this.addCapability('measure_current.phase1');
        let currenteac1 = Number(result['sigendev_phase_a_current'].value) * Math.pow(10, Number(result['sigendev_phase_a_current'].scale));
        this.setCapabilityValue('measure_current.phase1', currenteac1);
      }
      if (result['sigendev_phase_b_current'] && result['sigendev_phase_b_current'].value != '-1' && result['sigendev_phase_b_current'].value != 'xxx') {
        this.addCapability('measure_current.phase2');
        let currenteac2 = Number(result['sigendev_phase_b_current'].value) * Math.pow(10, Number(result['sigendev_phase_b_current'].scale));
        this.setCapabilityValue('measure_current.phase2', currenteac2);
      }
      if (result['sigendev_phase_c_current'] && result['sigendev_phase_c_current'].value != '-1' && result['sigendev_phase_c_current'].value != 'xxx') {
        this.addCapability('measure_current.phase3');
        let currenteac3 = Number(result['sigendev_phase_c_current'].value) * Math.pow(10, Number(result['sigendev_phase_c_current'].scale));
        this.setCapabilityValue('measure_current.phase3', currenteac3);
      }

      if (result['sigendev_phase_a_voltage'] && result['sigendev_phase_a_voltage'].value != '-1' && result['sigendev_phase_a_voltage'].value != 'xxx') {
        this.addCapability('measure_voltage.phase1');
        let voltageeac1 = Number(result['sigendev_phase_a_voltage'].value) * Math.pow(10, Number(result['sigendev_phase_a_voltage'].scale));
        this.setCapabilityValue('measure_voltage.phase1', voltageeac1);
      }
      if (result['sigendev_phase_b_voltage'] && result['sigendev_phase_b_voltage'].value != '-1' && result['sigendev_phase_b_voltage'].value != 'xxx') {
        this.addCapability('measure_voltage.phase2');
        let voltageeac2 = Number(result['sigendev_phase_b_voltage'].value) * Math.pow(10, Number(result['sigendev_phase_b_voltage'].scale));
        this.setCapabilityValue('measure_voltage.phase2', voltageeac2);
      }
      if (result['sigendev_phase_c_voltage'] && result['sigendev_phase_c_voltage'].value != '-1' && result['sigendev_phase_c_voltage'].value != 'xxx') {
        this.addCapability('measure_voltage.phase3');
        let voltageeac3 = Number(result['sigendev_phase_c_voltage'].value) * Math.pow(10, Number(result['sigendev_phase_c_voltage'].scale));
        this.setCapabilityValue('measure_voltage.phase3', voltageeac3);
      }

      if (
        result['sigendev_ess_average_cell_voltage'] &&
        result['sigendev_ess_average_cell_voltage'].value != '-1' &&
        result['sigendev_ess_average_cell_voltage'].value != 'xxx'
      ) {
        this.addCapability('measure_voltage.battery');
        let voltageebatt = Number(result['sigendev_ess_average_cell_voltage'].value) * Math.pow(10, Number(result['sigendev_ess_average_cell_voltage'].scale));
        this.setCapabilityValue('measure_voltage.battery', voltageebatt);
      }

      if (
        result['sigendev_daily_export_energy'] &&
        result['sigendev_daily_export_energy'].value != '-1' &&
        result['sigendev_daily_export_energy'].value != 'xxx'
      ) {
        this.addCapability('meter_power.daily_export');
        let voltageebatt = Number(result['sigendev_daily_export_energy'].value) * Math.pow(10, Number(result['sigendev_daily_export_energy'].scale));
        this.setCapabilityValue('meter_power.daily_export', voltageebatt);
      }

      if (
        result['sigendev_daily_import_energy'] &&
        result['sigendev_daily_import_energy'].value != '-1' &&
        result['sigendev_daily_import_energy'].value != 'xxx'
      ) {
        this.addCapability('meter_power.daily_import');
        let voltageebatt = Number(result['sigendev_daily_import_energy'].value) * Math.pow(10, Number(result['sigendev_daily_import_energy'].scale));
        this.setCapabilityValue('meter_power.daily_import', voltageebatt);
      }

      if (
        result['sigendev_daily_charge_energy'] &&
        result['sigendev_daily_charge_energy'].value != '-1' &&
        result['sigendev_daily_charge_energy'].value != 'xxx'
      ) {
        this.addCapability('meter_power.daily_charge');
        let voltageebatt = Number(result['sigendev_daily_charge_energy'].value) * Math.pow(10, Number(result['sigendev_daily_charge_energy'].scale));
        this.setCapabilityValue('meter_power.daily_charge', voltageebatt);
      }

      if (
        result['sigendev_daily_discharge_energy'] &&
        result['sigendev_daily_discharge_energy'].value != '-1' &&
        result['sigendev_daily_discharge_energy'].value != 'xxx'
      ) {
        this.addCapability('meter_power.daily_discharge');
        let voltageebatt = Number(result['sigendev_daily_discharge_energy'].value) * Math.pow(10, Number(result['sigendev_daily_discharge_energy'].scale));
        this.setCapabilityValue('meter_power.daily_discharge', voltageebatt);
      }

      if (result['sigen_remote_ems_code'] && result['sigen_remote_ems_code'].value != '-1' && result['sigen_remote_ems_code'].value != 'xxx') {
        this.addCapability('sigen_remote_ems_code');
        let emscode = result['sigen_remote_ems_code'].value;
        this.setCapabilityValue('sigen_remote_ems_code', emscode);
      }

      if (
        result['sigen_remote_ems_control_mode_code'] &&
        result['sigen_remote_ems_control_mode_code'].value != '-1' &&
        result['sigen_remote_ems_control_mode_code'].value != 'xxx'
      ) {
        this.addCapability('sigen_remote_ems_control_mode_code');
        let emscode = result['sigen_remote_ems_control_mode_code'].value;
        this.setCapabilityValue('sigen_remote_ems_control_mode_code', emscode);
      }

      if (result['sigen_grid_status_mode'] && result['sigen_grid_status_mode'].value != '-1' && result['sigen_grid_status_mode'].value != 'xxx') {
        this.addCapability('grid_status');
        let gridmode = result['sigen_grid_status_mode'].value;
        this.setCapabilityValue('grid_status', gridmode);
      }
    }
  }
}
