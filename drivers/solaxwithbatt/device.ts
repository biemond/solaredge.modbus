import * as Modbus from 'jsmodbus';
import net from 'net';
import {checkinputRegisterSolax} from '../response';
import { Solax } from '../solax';
import Homey, { Device } from 'homey';

const RETRY_INTERVAL = 30 * 1000; 

class MySolaxDevice extends Solax {
  timer!: NodeJS.Timer;  
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MySolaxDevice has been initialized');

    let name = this.getData().id;
    this.log("device name id " + name );
    this.log("device name " + this.getName());

    this.pollInvertor();

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor();
    }, RETRY_INTERVAL);


    this.registerCapabilityListener('solarcharger_use_mode', async (value) => {
      this.updateControl('solarcharger_use_mode', Number(value), this);
      return value;
    });

    this.registerCapabilityListener('storage_force_charge_discharge2', async (value) => {
      this.updateControl('storage_force_charge_discharge', Number(value), this);
      return value;
    });

    let controlAction = this.homey.flow.getActionCard('solarcharger_use_mode');
    controlAction.registerRunListener(async (args, state) => {
      await this.updateControl('solarcharger_use_mode', Number(args.mode), args.device);
    });

    let customChargeAction = this.homey.flow.getActionCard('storage_force_charge_discharge');
    customChargeAction.registerRunListener(async (args, state) => {
      await this.updateControl('storage_force_charge_discharge', Number(args.mode), args.device);
    });

  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MySolaxDevice has been added');
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
    this.log('MySolaxDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MySolaxDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MySolaxDevice has been deleted');
    this.homey.clearInterval(this.timer);
  }
  
  async updateControl(type: string, value: number, device: Homey.Device) {
    let name = device.getData().id;
    this.log("device name id " + name );
    this.log("device name " + device.getName());    
    let socket = new net.Socket();
    var unitID = device.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID, 3500);

    let modbusOptions = {
      'host': device.getSetting('address'),
      'port': device.getSetting('port'),
      'unitId': device.getSetting('id'),
      'timeout': 15,
      'autoReconnect': false,
      'logLabel': 'solax Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }


    socket.setKeepAlive(false); 
    socket.connect(modbusOptions);
    console.log(modbusOptions);
    
    socket.on('connect', async () => {
      console.log('Connected ...');

      if (type == 'solarcharger_use_mode') {
        const solarcharger_use_modeRes = await client.writeSingleRegister(0x001F, value);
        console.log('solarcharger_use_mode', solarcharger_use_modeRes);
      }
 
      if (type == 'storage_force_charge_discharge') {
        const storage_forceRes = await client.writeSingleRegister(0x0020, value);
        console.log('storage_force_charge_discharge', storage_forceRes);
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
      'timeout': 29,
      'autoReconnect': false,
      'logLabel' : 'solax Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }    

    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID, 2000);
    socket.setKeepAlive(false);
    socket.connect(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');
      console.log(modbusOptions);

      const checkRegisterRes = await checkinputRegisterSolax(this.inputRegisters, client);
      const checkRegisterHoldingRes = await checkinputRegisterSolax(this.holdingRegisters, client);
      console.log('disconnect'); 
      client.socket.end();
      socket.end();
      const finalRes = {...checkRegisterRes, ...checkRegisterHoldingRes}
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

module.exports = MySolaxDevice;
