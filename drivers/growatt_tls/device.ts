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

    if (this.hasCapability('onoff')) {
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

    if (this.hasCapability('target_power') === false) {
      await this.addCapability('target_power');
    }

    const maxpeakpower = Number(this.getSetting('maxpeakpower'));
    
    await this.setCapabilityOptions('target_power', { min: 0, max: this.getEffectiveMaxPower() });
    await this.setCapabilityOptions('exportcapacity', { max: this.getEffectiveMaxPower() });
    
    if (maxpeakpower <= 0) {
      await this.homey.notifications.createNotification({ excerpt: 'Growatt TLS: Max peak power is not configured. Please set it in the device settings for accurate target power control.' });
    }

    this.registerCapabilityListener('target_power', async (value) => {
      if (maxpeakpower <= 0) {
        throw new Error('Max peak power is not configured. Please set it in the device settings.');
      }
      const percentage = Math.round((value / maxpeakpower) * 100);
      await this.updateControl('target_power', percentage);
      await this.setCapabilityValue('exportcapacity', value);  
    });

    if (this.getCapabilityValue('target_power') === null) {
      await this.setCapabilityValue('target_power', 0);
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
    this.log('Growatt TLS settings were changed');
    if (changedKeys.includes('maxpeakpower')) {
      const max = Number(newSettings.maxpeakpower) || 6000;
      await this.setCapabilityOptions('target_power', { min: 0, max });
      await this.setCapabilityOptions('exportcapacity', { max });
    }    
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

  private getEffectiveMaxPower(): number {
    return Number(this.getSetting('maxpeakpower')) || 6000;
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
          if (type !== 'target_power') {
            const typedValue = this.castToCapabilityType(type, value);
            this.log(`typeof typedValue: ${typeof typedValue}, value:`, typedValue);
            await this.setCapabilityValue(type, typedValue);
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
    this.log('pollInvertor',this.getSetting('address'),this.getSetting('id'));

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
        if (finalRes.inverterFaultBits && Number(finalRes.inverterFaultBits.value) !== 0) {
          await this.setWarning(`Inverter fault active (code: ${finalRes.inverterFaultBits.value})`);
        } else {
          await this.unsetWarning();
        }   
        const maxpeakpower = Number(this.getSetting('maxpeakpower'));
        this.processResult(finalRes, maxpeakpower);
        if (finalRes.activePRate && maxpeakpower > 0 && this.hasCapability('target_power')) {
          const pct = Number(finalRes.activePRate.value);
          if (pct >= 0 && pct <= 100) {
            const watts = Math.round((pct / 100) * maxpeakpower);
            await this.setCapabilityValue('target_power', watts);
            await this.setCapabilityValue('exportcapacity', watts);
          }
        }
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
