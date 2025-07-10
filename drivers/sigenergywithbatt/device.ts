import * as Modbus from 'jsmodbus';
import net from 'net';
import Homey, { Device } from 'homey';
import { checkRegisterSigenergy, checkHoldingRegisterSigenergy } from '../response';
import { Sigenergy } from '../sigenergy';

const RETRY_INTERVAL = 15 * 1000;

class MySigenergyDevice extends Sigenergy {
  timer!: NodeJS.Timer;
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MySigenergyDevice has been initialized');

    const name = this.getData().id;
    this.log(`device name id ${name}`);
    this.log(`device name ${this.getName()}`);

    this.pollInvertor();

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor();
    }, RETRY_INTERVAL);

    if (this.hasCapability('grid_status') === false) {
      await this.addCapability('grid_status');
    }
    if (this.hasCapability('meter_power.pv_total') === false) {
      await this.addCapability('meter_power.pv_total');
    }
    if (this.hasCapability('meter_power.pv_daily') === false) {
      await this.addCapability('meter_power.pv_daily');
    }
    if (this.hasCapability('meter_power.daily_load_consumption') === false) {
      await this.addCapability('meter_power.daily_load_consumption');
    }
    if (this.hasCapability('meter_power.total_load_consumption') === false) {
      await this.addCapability('meter_power.total_load_consumption');
    }            
    if (this.hasCapability('meter_power.import') === false) {
      await this.addCapability('meter_power.import');
    }  
    if (this.hasCapability('meter_power.export') === false) {
      await this.addCapability('meter_power.export');
    }  
    if (this.hasCapability('meter_power') === false) {
      await this.addCapability('meter_power');
    }  

    this.registerCapabilityListener('sigen_remote_ems_code', async (value) => {
      this.updateControl('sigen_remote_ems_code', Number(value), this);
      return value;
    });
    this.registerCapabilityListener('sigen_remote_ems_control_mode_code', async (value) => {
      this.updateControl('sigen_remote_ems_control_mode_code', Number(value), this);
      return value;
    });

    // flow action
    const sigen_remote_ems_code = this.homey.flow.getActionCard('sigen_remote_ems_code');
    sigen_remote_ems_code.registerRunListener(async (args, state) => {
      await this.updateControl('sigen_remote_ems_code', Number(args.value), args.device);
    });

    const sigen_remote_ems_control_mode_code = this.homey.flow.getActionCard('sigen_remote_ems_control_mode_code');
    sigen_remote_ems_control_mode_code.registerRunListener(async (args, state) => {
      await this.updateControl('sigen_remote_ems_control_mode_code', Number(args.mode), args.device);
    });
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MySigenergyDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings: {}, newSettings: {}, changedKeys: {} }): Promise<string | void> {
    this.log('MySigenergyDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MySigenergyDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MySigenergyDevice has been deleted');
    this.homey.clearInterval(this.timer);
  }

  async updateControl(type: string, value: number, device: Homey.Device) {
    const name = device.getData().id;
    this.log(`device name id ${name}`);
    this.log(`device name ${device.getName()}`);
    const socket = new net.Socket();
    const client = new Modbus.client.TCP(socket, 247);

    const modbusOptions = {
      host: device.getSetting('address'),
      port: device.getSetting('port'),
      timeout: 15,
      autoReconnect: false,
      logLabel: 'sigenergy Inverter',
      logLevel: 'error',
      logEnabled: true,
    };

    socket.setKeepAlive(false);
    socket.connect(modbusOptions);
    console.log(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');

      if (type == 'sigen_remote_ems_code') {
        // 0 – Disable
        // 1 – enable
        const sigen_remote_ems_codeRes = await client.writeSingleRegister(40029, Number(value));
        console.log('sigen_remote_ems_code', sigen_remote_ems_codeRes);
      }

      if (type == 'sigen_remote_ems_control_mode_code') {
        const sigen_remote_ems_control_mode_codeRes = await client.writeSingleRegister(40031, Number(value));
        console.log('sigen_remote_ems_control_mode_code', sigen_remote_ems_control_mode_codeRes);
        // # 0: PCS remote control
        // # 1: Standby
        // # 2: Maximum self-consumption
        // # 3: Command charging (consume power from the grid first)
        // # 4: Command charging (consume power from the PV first)
        // # 5: Command discharging (output power from PV first)
        // # 6: Command discharging (output power from the battery first)
      }

      console.log('disconnect');
      client.socket.end();
      socket.end();
    });

    socket.on('close', () => {
      console.log('Client closed');
    });

    socket.on('error', (err) => {
      console.log(err);
      socket.end();
      setTimeout(() => socket.connect(modbusOptions), 4000);
    });
  }

  async pollInvertor() {
    this.log('pollInvertor');
    this.log(this.getSetting('address'));

    const modbusOptions = {
      host: this.getSetting('address'),
      port: this.getSetting('port'),
      timeout: 14,
      autoReconnect: false,
      logLabel: 'sigenenergy Inverter',
      logLevel: 'error',
      logEnabled: true,
    };

    const socket = new net.Socket();
    const unitID = this.getSetting('id');
    const client = new Modbus.client.TCP(socket, 247, 2500);
    const clientInverter = new Modbus.client.TCP(socket, unitID, 2500);
    socket.setKeepAlive(false);
    socket.connect(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');
      console.log(modbusOptions);

      const checkRegisterRes = await checkRegisterSigenergy(this.registers, client);
      const checkHoldingRegisterRes = await checkHoldingRegisterSigenergy(this.holdingRegisters, client);
      const checkRegisterInverterRes = await checkRegisterSigenergy(this.registersInverter, clientInverter);
      console.log('disconnect');
      client.socket.end();
      socket.end();
      const finalRes = { ...checkRegisterRes, ...checkHoldingRegisterRes, ...checkRegisterInverterRes };
      this.processResult(finalRes);
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
    });
  }
}

module.exports = MySigenergyDevice;
