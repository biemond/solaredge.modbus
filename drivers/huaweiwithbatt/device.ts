import * as Modbus from 'jsmodbus';
import net from 'net';
import {checkHoldingRegisterHuawei} from '../response';
import { Huawei } from '../huawei';

const RETRY_INTERVAL = 75 * 1000; 

class MyHuaweiDeviceBattery extends Huawei {
  timer!: NodeJS.Timer;  
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyHuaweiDevice has been initialized');

    let name = this.getData().id;
    this.log("device name id " + name );
    this.log("device name " + this.getName());

    this.pollInvertor();

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor();
    }, RETRY_INTERVAL);
 

  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyHuaweiDeviceBattery has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings: {}, newSettings: {}, changedKeys: {} }): Promise<string|void> {
    this.log('MyHuaweiDeviceBattery settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyHuaweiDeviceBattery was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyHuaweiDeviceBattery has been deleted');
    this.homey.clearInterval(this.timer);
  }
  
  delay(ms: any) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async pollInvertor() {
    this.log("pollInvertor");
    this.log(this.getSetting('address'));

    let modbusOptions = {
      'host': this.getSetting('address'),
      'port': this.getSetting('port'),
      'unitId': this.getSetting('id'),
      'timeout': 70,
      'autoReconnect': false,
      'logLabel' : 'huawei Inverter Battery',
      'logLevel': 'error',
      'logEnabled': true
    }    

    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID, 3500);
    socket.setKeepAlive(false);
    socket.connect(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');
      console.log(modbusOptions);
      const startTime = new Date();
      await this.delay(2000);

      const checkRegisterRes = await checkHoldingRegisterHuawei(this.holdingRegisters, client);
      const checkBatteryRes = await checkHoldingRegisterHuawei(this.holdingRegistersBattery, client);
      const checkMetersRes = await checkHoldingRegisterHuawei(this.holdingRegistersMeters, client);

      console.log('disconnect'); 
      client.socket.end();
      socket.end();
      const finalRes = { ...checkRegisterRes, ...checkBatteryRes, ...checkMetersRes }
      this.processResult(finalRes)
      const endTime = new Date();
      const timeDiff = endTime.getTime() - startTime.getTime();
      let seconds = Math.floor(timeDiff / 1000);
      console.log("total time: " +seconds + " seconds");
    });    

    socket.on('close', () => {
      console.log('Client closed');
    });  

    socket.on('timeout', () => {
      console.log('socket timed out!');
      client.socket.end();
      socket.end();
    });

    socket.on('error', (err) => {
      console.log(err);
      client.socket.end();
      socket.end();
    })
  }
}

module.exports = MyHuaweiDeviceBattery;
