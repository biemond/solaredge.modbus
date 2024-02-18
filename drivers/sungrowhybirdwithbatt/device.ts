import * as Modbus from 'jsmodbus';
import net from 'net';
import {checkRegisterSungrow, checkHoldingRegisterSungrow} from '../response';
import { Sungrow } from '../sungrow';

const RETRY_INTERVAL = 28 * 1000; 

class MyWSungrowDevice extends Sungrow {
  timer!: NodeJS.Timer;  
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyWSungrowDevice has been initialized');

    let name = this.getData().id;
    this.log("device name id " + name );
    this.log("device name " + this.getName());

    this.pollInvertor();

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor();
    }, RETRY_INTERVAL);

    // flow action 
    let exportEnabledAction = this.homey.flow.getActionCard('exportlimitenabled');
    exportEnabledAction.registerRunListener(async (args, state) => {
      await this.updateControl('emsmodeselection', Number(args.mode));
    });

    // homey menu / device actions
    this.registerCapabilityListener('exportlimitenabled', async (value) => {
      this.updateControl('emsmodeselection', Number(value));
      return value;
    });

  }

  async updateControl(type: string, value: number) {
    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID); 

    let modbusOptions = {
      'host': this.getSetting('address'),
      'port': this.getSetting('port'),
      'unitId': this.getSetting('id'),
      'timeout': 22,
      'autoReconnect': false,
      'logLabel' : 'sungrow Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }    

    socket.setKeepAlive(false); 
    socket.connect(modbusOptions);
    console.log(modbusOptions);
    
    socket.on('connect', async () => {
      console.log('Connected ...');

      if (type == 'emsmodeselection') {
        // 0 – Self-consumption mode
        // 2 – Forced mode (charge/discharge/stop)
        // 3 - External EMS mode
        const emsmodeselectionRes = await client.writeSingleRegister(13049, value);
        console.log('emsmodeselection', emsmodeselectionRes);
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

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyWSungrowDevice has been added');
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
    this.log('MyWSungrowDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyWSungrowDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyWSungrowDevice has been deleted');
    this.homey.clearInterval(this.timer);
  }
  
  async pollInvertor() {
    this.log("pollInvertor");
    this.log(this.getSetting('address'));

    let modbusOptions = {
      'host': this.getSetting('address'),
      'port': this.getSetting('port'),
      'unitId': this.getSetting('id'),
      'timeout': 22,
      'autoReconnect': false,
      'logLabel' : 'sungrow Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }    

    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID, 1000);
    socket.setKeepAlive(false);
    socket.connect(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');
      console.log(modbusOptions);

      const checkRegisterRes = await checkRegisterSungrow(this.inputRegisters, client);
      const checkHoldingRegisterRes = await checkHoldingRegisterSungrow(this.holdingRegisters, client);      
      console.log('disconnect'); 
      client.socket.end();
      socket.end();
      const finalRes = {...checkRegisterRes, ...checkHoldingRegisterRes}
      this.processResult(finalRes)
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

module.exports = MyWSungrowDevice;
