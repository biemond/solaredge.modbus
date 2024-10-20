import * as Modbus from 'jsmodbus';
import net from 'net';
import {checkHoldingRegisterHuaweiEmma} from '../response';
import { Huawei } from '../huawei';
import Homey, { Device } from 'homey';

const RETRY_INTERVAL = 25 * 1000; 

class MyHuaweiEmmaDevice extends Huawei {
  timer!: NodeJS.Timer;  
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyHuaweiEmmaDevice has been initialized');

    let name = this.getData().id;
    this.log("device name id " + name );
    this.log("device name " + this.getName());

    this.pollInvertor();

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor();
    }, RETRY_INTERVAL);

    // homey menu / device actions
    this.registerCapabilityListener('battery_control', async (value) => {
      this.updateControl('battery_control', Number(value), this);
      return value;
    });
    this.registerCapabilityListener('power_control_mode_at_grid', async (value) => {
      this.updateControl('power_control_mode_at_grid', Number(value), this);
      return value;
    });    

    let controlBatteryControl = this.homey.flow.getActionCard('battery_control');
    controlBatteryControl.registerRunListener(async (args, state) => {
      let name = this.getData().id;
      this.log("device name id " + name );
      this.log("device name " + this.getName());
      this.log(args.device.getName());      
      await this.updateControl('battery_control', Number(args.mode), args.device);
    });  

    let controlpowerControlModeAtGrid = this.homey.flow.getActionCard('power_control_mode_at_grid');
    controlpowerControlModeAtGrid.registerRunListener(async (args, state) => {
      let name = this.getData().id;
      this.log("device name id " + name );
      this.log("device name " + this.getName());
      this.log(args.device.getName());      
      await this.updateControl('power_control_mode_at_grid', Number(args.mode), args.device);
    });  

  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyHuaweiEmmaDevice has been added');
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
    this.log('MyHuaweiEmmaDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyHuaweiEmmaDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyHuaweiEmmaDevice has been deleted');
    this.homey.clearInterval(this.timer);
  }
  
  delay(ms: any) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async updateControl(type: string, value: number, device:  Homey.Device) {
    let name = device.getData().id;
    this.log("device name id " + name );
    this.log("device name " + device.getName());    
    let socket = new net.Socket();
    var unitID = device.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID, 2000); 

    let modbusOptions = {
      'host': device.getSetting('address'),
      'port': device.getSetting('port'),
      'unitId': device.getSetting('id'),
      'timeout': 15,
      'autoReconnect': false,
      'logLabel': 'emma device',
      'logLevel': 'error',
      'logEnabled': true
    }

    socket.setKeepAlive(false); 
    socket.connect(modbusOptions);
    console.log(modbusOptions);
    
    socket.on('connect', async () => {

      if ( type== 'battery_control') {
        // Battery control ESS control mode RW ENUM16 40000 1
        // 1: reserved
        // 2: maximum self-consumption
        // 3: reserved
        // 4: fully fed to grid
        // 5: time of use
        // 6: Third- party dispatch
        const battery_controlRes = await client.writeSingleRegister(40000, Number(value));
        console.log('battery_control', battery_controlRes)
      }

      if (type == 'power_control_mode_at_grid') {
        // 0: unlimited
        // 5: grid connecte d with zero power
        // 6: limited feed-in (kW)
        // 7: power- limited grid connecte d (%)
        const power_control_mode_at_gridRes = await client.writeSingleRegister(40100, Number(value));
        console.log('power_control_mode_at_grid', power_control_mode_at_gridRes)
      }

      console.log('disconnect');
      client.socket.end();
      socket.end();
    })

    socket.on('close', () => {
      console.log('Client closed');
    }); 

    socket.on('error', (err) => {
      console.log(err);
      socket.end();
      setTimeout(() => socket.connect(modbusOptions), 4000);
    })
  }


  async pollInvertor() {
    this.log("pollInvertor");
    this.log(this.getSetting('address'));

    let modbusOptions = {
      'host': this.getSetting('address'),
      'port': this.getSetting('port'),
      'unitId': this.getSetting('id'),
      'timeout': 27,
      'autoReconnect': false,
      'logLabel' : 'huawei Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }    

    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID, 1500);
    socket.setKeepAlive(false);
    socket.connect(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');
      console.log(modbusOptions);
      const startTime = new Date();
      await this.delay(1000);

      const checkRegisterRes = await checkHoldingRegisterHuaweiEmma(this.holdingEmmaRegisters, client);

      console.log('disconnect'); 
      client.socket.end();
      socket.end();
      const finalRes = { ...checkRegisterRes }
      this.processEmmaResult(finalRes)
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

module.exports = MyHuaweiEmmaDevice;
