import Homey from 'homey';

class MyGrowattBatteryDriver extends Homey.Driver {
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyGrowattBatteryDriver has been initialized');

    this.homey.flow.getConditionCard('eps_is_active').registerRunListener(async (args) => {
      return args.device.getCapabilityValue('eps_active') === true;
    });

    this.homey.flow.getConditionCard('eps_power_above').registerRunListener(async (args) => {
      const value = args.device.getCapabilityValue('measure_power.eps');
      return typeof value === 'number' && value > Number(args.power);
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

module.exports = MyGrowattBatteryDriver;
