import * as Modbus from 'jsmodbus';
import net from 'net';
import { checkRegisterGrowatt,checkHoldingRegisterGrowatt } from '../response';
import { Growatt } from '../growatt';

const RETRY_INTERVAL = 28 * 1000;

class MyGrowattTL3sDevice extends Growatt {
  timer!: NodeJS.Timer;
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyGrowattTL3sDevice has been initialized');

    const name = this.getData().id;
    this.log(`device name id ${name}`);
    this.log(`device name ${this.getName()}`);

    const limitCondition = this.homey.flow.getConditionCard('exportLimit');
    limitCondition.registerRunListener(async (args, state) => {
      const result = Number(await args.device.getCapabilityValue('exportlimitenabled')) === Number(args.exportlimit);
      return Promise.resolve(result);
    });

    // flow action
    const exportEnabledAction = this.homey.flow.getActionCard('exportlimitenabled');
    exportEnabledAction.registerRunListener(async (args, state) => {
      await this.updateControl('exportlimitenabled', Number(args.mode));
    });

    const exportlimitpowerrateAction = this.homey.flow.getActionCard('exportlimitpowerrate');
    exportlimitpowerrateAction.registerRunListener(async (args, state) => {
      await this.updateControl('exportlimitpowerrate', args.percentage);
    });

    if (this.hasCapability('exportlimitenabled') === false) {
      await this.addCapability('exportlimitenabled');
    }   
    if (this.hasCapability('exportlimitpowerrate') === false) {
      await this.addCapability('exportlimitpowerrate');
    } 

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
    this.log('MyGrowattTL3sDevice has been added');
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
    this.log('MyGrowattTL3sDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyGrowattTL3sDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyGrowattTL3sDevice has been deleted');
    this.homey.clearInterval(this.timer);
  }

  async updateControl(type: string, value: number) {
    const socket = new net.Socket();
    const unitID = this.getSetting('id');
    const client = new Modbus.client.TCP(socket, unitID, 2000);

    const modbusOptions = {
      host: this.getSetting('address'),
      port: this.getSetting('port'),
      unitId: this.getSetting('id'),
      timeout: 15,
      autoReconnect: false,
      logLabel: 'growatt Inverter',
      logLevel: 'error',
      logEnabled: true,
    };

    socket.setKeepAlive(false);
    socket.connect(modbusOptions);
    this.log(modbusOptions);

    socket.on('connect', () => {
      (async () => {
        this.log('Connected ...');

        if (type == 'exportlimitenabled') {
          // 0 – Disabled
          // 1 – Enabled
          if (value == 1) {
            const exportlimitenabledRes = await client.writeSingleRegister(122, Number(1));
            this.log('exportlimitenabled', exportlimitenabledRes);
          } else if (value == 0) {
            const exportlimitenabledRes = await client.writeSingleRegister(122, Number(0));
            this.log('exportlimitenabled', exportlimitenabledRes);
          } else {
            this.log(`exportlimitenabled unknown value: ${value}`);
          }
        }
        if (type == 'exportlimitpowerrate') {
          // 0 – 100 % with 1 decimal
          // 0 – 1000 as values
          this.log(`exportlimitpowerrate value: ${value}`);
          if (value >= 0 && value <= 100) {
            const exportlimitpowerratedRes = await client.writeSingleRegister(123, value * 10);
            this.log('exportlimitpowerrate', exportlimitpowerratedRes);
            this.log(`exportlimitpowerrate value 2: ${value * 10}`);
          } else {
            this.log(`exportlimitpowerrate unknown value: ${value}`);
          }
        }

        this.log('disconnect');
        client.socket.end();
        socket.end();
      })().catch(this.error);
    });

    socket.on('close', () => {
      this.log('Client closed');
    });

    socket.on('error', (err) => {
      this.log(err);
      socket.end();
      this.homey.setTimeout(() => socket.connect(modbusOptions), 4000);
    });
  }


  async pollInvertor() {
    this.log('pollInvertor');
    this.log(this.getSetting('address'));

    const modbusOptions = {
      host: this.getSetting('address'),
      port: this.getSetting('port'),
      unitId: this.getSetting('id'),
      timeout: 22,
      autoReconnect: false,
      logLabel: 'Growatt Inverter',
      logLevel: 'error',
      logEnabled: true,
    };

    const socket = new net.Socket();
    const unitID = this.getSetting('id');
    const client = new Modbus.client.TCP(socket, unitID, 1000);
    socket.setKeepAlive(false);
    socket.connect(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');
      console.log(modbusOptions);

      const checkRegisterRes = await checkRegisterGrowatt(this.registersTLS, client);
      const checkHoldingRegisterRes = await checkHoldingRegisterGrowatt(this.holdingRegistersBase, client);      
      console.log('disconnect');
      client.socket.end();
      socket.end();
      const finalRes = { ...checkRegisterRes, ...checkHoldingRegisterRes };
      this.processResult(finalRes, this.getSetting('maxpeakpower'));
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

module.exports = MyGrowattTL3sDevice;
