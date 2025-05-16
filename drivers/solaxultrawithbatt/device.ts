import * as Modbus from 'jsmodbus';
import net from 'net';
import Homey, { Device } from 'homey';
import { checkinputRegisterSolax, checkholdingRegisterSolax } from '../response';
import { Solax } from '../solax';

const RETRY_INTERVAL = 30 * 1000;

class MySolaxUltraDevice extends Solax {
  timer!: NodeJS.Timer;
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MySolaxUltraDevice has been initialized');

    const name = this.getData().id;
    this.log(`device name id ${name}`);
    this.log(`device name ${this.getName()}`);

    if (this.hasCapability('measure_power.gridoutput') === false) {
      await this.addCapability('measure_power.gridoutput');
    }
    if (this.hasCapability('measure_power.load') === false) {
      await this.addCapability('measure_power.load');
    }

    this.registerCapabilityListener('solarcharger_use_mode', async (value) => {
      this.updateControl('solarcharger_use_mode', Number(value), this);
      return value;
    });

    this.registerCapabilityListener('storage_force_charge_discharge2', async (value) => {
      this.updateControl('storage_force_charge_discharge', Number(value), this);
      return value;
    });

    this.pollInvertor();

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor();
    }, RETRY_INTERVAL);
  }

  async updateControl(type: string, value: number, device: Homey.Device) {
    const name = device.getData().id;
    this.log(`device name id ${name}`);
    this.log(`device name ${device.getName()}`);
    const socket = new net.Socket();
    const unitID = device.getSetting('id');
    const client = new Modbus.client.TCP(socket, unitID, 3500);

    const modbusOptions = {
      host: device.getSetting('address'),
      port: device.getSetting('port'),
      unitId: device.getSetting('id'),
      timeout: 15,
      autoReconnect: false,
      logLabel: 'solax Inverter',
      logLevel: 'error',
      logEnabled: true,
    };

    socket.setKeepAlive(false);
    socket.connect(modbusOptions);
    console.log(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');

      if (type == 'solarcharger_use_mode') {
        const solarcharger_use_modeRes = await client.writeSingleRegister(0x001f, value);
        console.log('solarcharger_use_mode', solarcharger_use_modeRes);
      }

      if (type == 'storage_force_charge_discharge') {
        const storage_forceRes = await client.writeSingleRegister(0x0020, value);
        console.log('storage_force_charge_discharge', storage_forceRes);
      }

      // // 0x00B7 FeedinOnPower W 0~8000 1W uint16
      // if (type == 'FeedinOnPower') {
      //   const FeedinOnPowerRes = await client.writeSingleRegister(0x00b7, value);
      //   console.log('FeedinOnPower', FeedinOnPowerRes);
      // }

      // // 0x0042 ExportcontrolUserLimit W
      // // Export control User_Limit
      // // (0~60000)
      // // 1W uint16
      // if (type == 'ExportcontrolUserLimit') {
      //   const ExportcontrolUserLimitRes = await client.writeSingleRegister(0x0042, value);
      //   console.log('ExportcontrolUserLimit', ExportcontrolUserLimitRes);
      // }

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


  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MySolaxUltraDevice has been added');
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
    this.log('MySolaxUltraDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MySolaxUltraDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MySolaxUltraDevice has been deleted');
    this.homey.clearInterval(this.timer);
  }



  async pollInvertor() {
    this.log('pollInvertor');
    this.log(this.getSetting('address'));

    const modbusOptions = {
      host: this.getSetting('address'),
      port: this.getSetting('port'),
      unitId: this.getSetting('id'),
      timeout: 29,
      autoReconnect: false,
      logLabel: 'solax Inverter',
      logLevel: 'error',
      logEnabled: true,
    };

    const socket = new net.Socket();
    const unitID = this.getSetting('id');
    const client = new Modbus.client.TCP(socket, unitID, 2000);
    socket.setKeepAlive(false);
    socket.connect(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');
      console.log(modbusOptions);

      const checkRegisterRes = await checkinputRegisterSolax(this.inputRegistersUltra, client);
      const checkRegisterHoldingRes = await checkholdingRegisterSolax(this.holdingRegistersUltra, client);
      console.log('disconnect');
      client.socket.end();
      socket.end();
      const finalRes = { ...checkRegisterRes, ...checkRegisterHoldingRes };
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

module.exports = MySolaxUltraDevice;
