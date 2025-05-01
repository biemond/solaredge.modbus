import * as Modbus from 'jsmodbus';
import net from 'net';
import { checkRegisterSungrow, checkHoldingRegisterSungrow } from '../response';
import { Sungrow } from '../sungrow';

const RETRY_INTERVAL = 25 * 1000;

class MyWSungrowPlainDevice extends Sungrow {
  timer!: NodeJS.Timer;
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyWSungrowPlainDevice has been initialized');

    const name = this.getData().id;
    this.log(`device name id ${name}`);
    this.log(`device name ${this.getName()}`);

    if (this.hasCapability('active_power_limit') === true) {
      await this.removeCapability('active_power_limit');
    }

    if (this.hasCapability('activepowerlimit2') === false) {
      await this.addCapability('activepowerlimit2');
    }

    if (this.hasCapability('nominalactivepower') === false) {
      await this.addCapability('nominalactivepower');
    }
    if (this.hasCapability('start_stop') === false) {
      await this.addCapability('start_stop');
    }

    if (this.hasCapability('power_limitation_switch') === false) {
      await this.addCapability('power_limitation_switch');
    }

    // flow action
    const power_limitation_switchAction = this.homey.flow.getActionCard('power_limitation_switch');
    power_limitation_switchAction.registerRunListener(async (args, state) => {
      await this.updateControl('power_limitation_switch', Number(args.mode));
    });

    const start_stopAction = this.homey.flow.getActionCard('start_stop');
    start_stopAction.registerRunListener(async (args, state) => {
      await this.updateControl('start_stop', Number(args.mode));
    });

    this.pollInvertor();

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor();
    }, RETRY_INTERVAL);
  }

 async updateControl(type: string, value: number) {
    const socket = new net.Socket();
    const unitID = this.getSetting('id');
    const client = new Modbus.client.TCP(socket, unitID, 2000);

    const modbusOptions = {
      host: this.getSetting('address'),
      port: this.getSetting('port'),
      unitId: this.getSetting('id'),
      timeout: 22,
      autoReconnect: false,
      logLabel: 'sungrow Inverter',
      logLevel: 'error',
      logEnabled: true,
    };

    socket.setKeepAlive(false);
    socket.connect(modbusOptions);
    console.log(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');

      if (type == 'power_limitation_switch') {
        const power_limitation_switchRes = await client.writeSingleRegister(5006, value);
        console.log('power_limitation_switch', power_limitation_switchRes);
      }

      if (type == 'start_stop') {
        const start_stopRes = await client.writeSingleRegister(5005, value);
        console.log('start_stop', start_stopRes);
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

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyWSungrowPlainDevice has been added');
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
    this.log('MyWSungrowPlainDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyWSungrowPlainDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyWSungrowPlainDevice has been deleted');
    this.homey.clearInterval(this.timer);
  }

  async pollInvertor() {
    this.log('pollInvertor');
    this.log(this.getSetting('address'));

    const modbusOptions = {
      host: this.getSetting('address'),
      port: this.getSetting('port'),
      unitId: this.getSetting('id'),
      timeout: 30,
      autoReconnect: false,
      logLabel: 'sungrow Inverter',
      logLevel: 'error',
      logEnabled: true,
    };

    const socket = new net.Socket();
    const unitID = this.getSetting('id');
    const client = new Modbus.client.TCP(socket, unitID, 2500);
    socket.setKeepAlive(false);
    socket.connect(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');
      console.log(modbusOptions);

      const checkRegisterRes = await checkRegisterSungrow(this.inputRegistersStandard, client);
      const checkHoldingRegisterRes = await checkHoldingRegisterSungrow(this.holdingRegistersStandard, client);
      console.log('disconnect');
      client.socket.end();
      socket.end();
      const finalRes = { ...checkRegisterRes, ...checkHoldingRegisterRes };
      this.processResultPlain(finalRes);
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

module.exports = MyWSungrowPlainDevice;
