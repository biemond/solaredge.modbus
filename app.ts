import Homey from 'homey';

class MySolaredgeApp extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('MySolaredgeApp has been initialized');
    this.registerSolaredgeFlowCards();
  }

  private registerSolaredgeFlowCards() {
    // Flow cards are shared by all devices. Register once and dispatch to the
    // selected device, so inverter and battery variants can coexist.
    const actions = [
      ['activepowerlimit', 'activepowerlimit', 'value'],
      ['powerreduce', 'powerreduce', 'value'],
      ['storagecontrolmode', 'storagecontrolmode', 'mode'],
      ['storagedefaultmode', 'storagedefaultmode', 'mode'],
      ['setcharging', 'chargelimit', 'chargepower'],
      ['setdischarging', 'dischargelimit', 'dischargepower'],
      ['limitcontrolmode', 'limitcontrolmode', 'mode'],
      ['exportlimit', 'exportlimit', 'exportlimit'],
    ] as const;
    for (const [cardId, control, argument] of actions) {
      this.homey.flow.getActionCard(cardId).registerRunListener(async (args) => {
        await args.device.updateControl(control, Number(args[argument]), args.device);
      });
    }

    const statusConditions = [
      ['changedStatus', 'invertorstatus'],
      ['changedBatteryStatus', 'battstatus'],
      ['changedStoragedefaultmode', 'storagedefaultmode'],
      ['changedStoragecontrolmode', 'storagecontrolmode'],
    ] as const;
    for (const [cardId, capability] of statusConditions) {
      this.homey.flow.getConditionCard(cardId).registerRunListener(async (args) => (
        // Existing cards accept numeric arguments for string enum capabilities.
        (await args.device.getCapabilityValue(capability)) == args.argument_main
      ));
    }

    const thresholdConditions = [
      ['solarcharge', 'measure_power', 'charging'],
      ['batterylevel', 'measure_battery', 'charged'],
      ['batterycharge', 'measure_power.batt_charge', 'charging'],
      ['batterydischarge', 'measure_power.batt_discharge', 'discharging'],
      ['solarbattcharge', 'measure_power', 'charging'],
      ['gridimport', 'measure_power.import', 'import'],
      ['gridexport', 'measure_power.export', 'export'],
    ] as const;
    for (const [cardId, capability, argument] of thresholdConditions) {
      this.homey.flow.getConditionCard(cardId).registerRunListener(async (args) => (
        (await args.device.getCapabilityValue(capability)) >= args[argument]
      ));
    }
  }
}

module.exports = MySolaredgeApp;
