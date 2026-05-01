import Homey from 'homey';

class MyGrowattTL3sDriver extends Homey.Driver {
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyGrowattTL3sDriver has been initialized');
    
    const limitCondition = this.homey.flow.getConditionCard('exportLimit');
    limitCondition.registerRunListener(async (args, state) => {
      const result = Number(await args.device.getCapabilityValue('exportlimitenabled')) === Number(args.exportlimit);
      return result;
    });

    const exportEnabledAction = this.homey.flow.getActionCard('exportlimitenabled');
    exportEnabledAction.registerRunListener(async (args, state) => {
      const smartmeter = args.device.getSetting('smartMeter');
      if (!smartmeter) {
        throw new Error(
          'No Modbus Smart Meter is configured.\n\nYou can enable it in the devices Advanced Settings.\nImportant: Do NOT enable the seting when no Modbus Smart Meter is connected.'
        );
      }
      await args.device.updateControl('exportlimitenabled', Number(args.mode));
    });

    const exportlimitpowerrateAction = this.homey.flow.getActionCard('exportlimitpowerrate');
    exportlimitpowerrateAction.registerRunListener(async (args, state) => {
      const smartmeter = args.device.getSetting('smartMeter');
      if (!smartmeter) {
        throw new Error(
          'No Modbus Smart Meter is configured.\n\nYou can enable it in the devices Advanced Settings.\nImportant: Do NOT enable the seting when no Modbus Smart Meter is connected.'
        );
      }
      await args.device.updateControl('exportlimitpowerrate', args.percentage);
    });

    const exportcapacityAction = this.homey.flow.getActionCard('exportcapacity');
    exportcapacityAction.registerRunListener(async (args, state) => {
      await args.device.updateControl('exportcapacity', args.percentage);
    });
  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    return [
      // Example device data, note that `store` is optional
      // {
      //   name: 'My Device',
      //   data: {
      //     id: 'my-device',
      //   },
      //   store: {
      //     address: '127.0.0.1',
      //   },
      // },
    ];
  }
}

module.exports = MyGrowattTL3sDriver;
