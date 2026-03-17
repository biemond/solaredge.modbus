import Homey from 'homey';

class MyHuaweiBatteryDriver extends Homey.Driver {
  async onInit() {
    this.log('MyHuaweiBatteryDriver has been initialized');
  }

  async onPairListDevices() {
    return [];
  }
}

module.exports = MyHuaweiBatteryDriver;
