import * as Modbus from 'jsmodbus';
import net from 'net';
/* eslint-disable node/no-missing-import */
import { checkRegisterGrowatt, checkHoldingRegisterGrowatt } from '../response';
import { Growatt } from '../growatt';
/* eslint-enable node/no-missing-import */

const RETRY_INTERVAL = 28 * 1000;

class MyGrowattTL3sDevice extends Growatt {
  timer!: NodeJS.Timeout;
  private _dailyCheckInterval?: NodeJS.Timeout;
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyGrowattTL3sDevice has been initialized');

    const name = this.getData().id;
    this.log(`device name id ${name}`);
    this.log(`device name ${this.getName()}`);

    // on/off state condition
    /* Flowcard not available for this device
    const onoffCondition = this.homey.flow.getConditionCard('on_off');
    onoffCondition.registerRunListener(async (args, state) => {
      const result = Number(await args.device.getCapabilityValue('growatt_onoff')) === Number(args.inverterstate);
      return Promise.resolve(result);
    });
    */

    const limitCondition = this.homey.flow.getConditionCard('exportLimit');
    limitCondition.registerRunListener(async (args, state) => {
      const result = Number(await args.device.getCapabilityValue('exportlimitenabled')) === Number(args.exportlimit);
      return result;
    });

    // flow action
    /* Flowcard not available for this device
    const onoffAction = this.homey.flow.getActionCard('on_off');
    onoffAction.registerRunListener(async (args, state) => {
      await this.updateControl('growatt_onoff', Number(args.mode));
    });
    */

    const exportEnabledAction = this.homey.flow.getActionCard('exportlimitenabled');
    exportEnabledAction.registerRunListener(async (args, state) => {
      const smartmeter = this.getSetting('smartMeter')
        if (!smartmeter) {
          throw new Error(
            'No Modbus Smart Meter is configured.\n\nYou can enable it in the devices Advanced Settings.\nImportant: Do NOT enable the seting when no Modbus Smart Meter is connected.'
          );
        }
      //await this.updateControl('exportlimitenabled', Number(args.mode));
    });

    const exportlimitpowerrateAction = this.homey.flow.getActionCard('exportlimitpowerrate');
    exportlimitpowerrateAction.registerRunListener(async (args, state) => {
      const smartmeter = this.getSetting('smartMeter')
        if (!smartmeter) {
          throw new Error(
            'No Modbus Smart Meter is configured.\n\nYou can enable it in the devices Advanced Settings.\nImportant: Do NOT enable the seting when no Modbus Smart Meter is connected.'
          );
        }          
      //await this.updateControl('exportlimitpowerrate', args.percentage);
    });

    const exportcapacityAction = this.homey.flow.getActionCard('exportcapacity');
    exportcapacityAction.registerRunListener(async (args, state) => {        
      await this.updateControl('exportcapacity', args.percentage);
    });
    

    // remove unexpected capabilities 
    if (this.hasCapability('growatt_onoff')) {
      await this.removeCapability('growatt_onoff');
      this.log('Removed legacy capability growatt_onoff (TLS driver)');
    }

    if (this.hasCapability('growatttls_onoff')) {
      await this.removeCapability('growatttls_onoff');
    }

    if (this.hasCapability('priority')) {
      await this.removeCapability('priority');
      this.log('Removed legacy capability priority (TLS driver)');
    }

    if (this.hasCapability('batterystatus')) {
      await this.removeCapability('batterystatus');
      this.log('Removed legacy capability batterystatus (TLS driver)');
    }

    if (this.hasCapability('measure_power.export')) {
      await this.removeCapability('measure_power.export');
      this.log('Removed legacy capability measure_power.export (TLS driver)');
    }

    if (this.hasCapability('measure_power.gridoutput')) {
      await this.removeCapability('measure_power.gridoutput');
      this.log('Removed legacy capability measure_power.gridoutput (TLS driver)');
    }
    
    if (this.hasCapability('measure_voltage.meter')) {
      await this.removeCapability('measure_voltage.meter');
      this.log('Removed legacy capability measure_voltage.meter (TLS driver)');
    }    
    // end

    if (this.hasCapability('onoff') === true) {
      await this.removeCapability('onoff');
    }

    if (this.hasCapability('exportcapacity') === false) {
      await this.addCapability('exportcapacity');
    }

    if (this.hasCapability('exportlimitenabled') === false) {
      await this.addCapability('exportlimitenabled');
    }

    if (this.hasCapability('exportlimitpowerrate') === false) {
      await this.addCapability('exportlimitpowerrate');
    }

    this.pollInvertor().catch(this.error);

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor().catch(this.error);
    }, RETRY_INTERVAL);

    this._dailyCheckInterval = this.homey.setInterval(
      () => this.checkDailyReset().catch(this.error),
      5 * 60 * 1000 // 5 minutes 
    );
  }

  async checkDailyReset() {
    const today = new Date().toDateString();
    const lastReset = this.getStoreValue('lastDailyReset');

    if (lastReset !== today) {
      await this.setCapabilityValue('meter_power.daily', 0);
      await this.setCapabilityValue('meter_power.pv1TodayEnergy', 0);
      await this.setCapabilityValue('meter_power.pv2TodayEnergy', 0);
      await this.setStoreValue('lastDailyReset', today);
      this.log(`Daily values have been reset to zero for`, this.getName())
    }
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
  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: { [key: string]: string };
    newSettings: { [key: string]: string };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log('MyGrowattBattery settings were changed');
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
    if (this._dailyCheckInterval) {
      this.homey.clearInterval(this._dailyCheckInterval);
    }
  }

  private getRegisterAddressForCapability(capability: string): number | undefined {
    const result = this.getMappingAndRegister(capability, this.holdingRegistersTLS);
    if (!result) return undefined;
    return result.registerDefinition[0];
  }

  private processRegisterValue(capability: string, registerValue: number): number | null {
    return this.processRegisterValueCommon(capability, registerValue, this.holdingRegistersTLS);
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
        let res;

        this.log(`${type} value: ${value}`);
        const registerAddress = this.getRegisterAddressForCapability(type);
        const regValue = this.processRegisterValue(type, value);
        if (registerAddress === undefined) {
          this.log(`${type} register mapping not found`);
        } else if (regValue === null) {
          this.log(`${type} register value not valid`);
        } else {
          this.log(`${type} register: ${registerAddress} value: ${regValue}`);
          res = await client.writeSingleRegister(registerAddress, regValue);
          this.log(type, res);
          // Update the changed capability value
          const typedValue = this.castToCapabilityType(type, value);
          this.log(`typeof typedValue: ${typeof typedValue}, value:`, typedValue);
          await this.setCapabilityValue(type, typedValue);
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

    socket.on('connect', () => {
      (async () => {
        this.log('Connected ...');
        this.log(modbusOptions);

        const checkRegisterRes = await checkRegisterGrowatt(this.registersTLS, client);
        const checkHoldingRegisterRes = await checkHoldingRegisterGrowatt(this.holdingRegistersTLS, client);
        this.log('disconnect');
        client.socket.end();
        socket.end();
        const finalRes = { ...checkRegisterRes, ...checkHoldingRegisterRes };
        this.processResult(finalRes, this.getSetting('maxpeakpower'));
      })().catch(this.error);
    });

    socket.on('close', () => {
      this.log('Client closed');
    });

    socket.on('timeout', () => {
      this.log('socket timed out!');
      client.socket.end();
      socket.end();
    });

    socket.on('error', (err) => {
      this.log(err);
      client.socket.end();
      socket.end();
    });
  }
}

module.exports = MyGrowattTL3sDevice;
