import * as Modbus from 'jsmodbus';
import net from 'net';
/* eslint-disable node/no-missing-import */
import { checkRegisterGrowatt, checkHoldingRegisterGrowatt, checkRegisterGrowattBlocks } from '../response';
import { Growatt } from '../growatt';
import withErrorContext from '../../lib/error-context';
/* eslint-enable node/no-missing-import */


const DEFAULT_RETRY_INTERVAL = 28;
// Mark the device unavailable after this many failed polls in a row
const MAX_FAILED_POLLS = 3;


class MyGrowattDevice extends Growatt {
  timer!: NodeJS.Timer;
  pollBusy = false;
  failedPolls = 0;
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyGrowattDevice has been initialized');

    const name = this.getData().id;
    this.log(`device name id ${name}`);
    this.log(`device name ${this.getName()}`);

    const maxpeakpower = Number(this.getSetting('maxpeakpower'));

    if (!this.hasCapability('exportcapacity')) {
      await this.addCapability('exportcapacity');
    }
    if (!this.hasCapability('target_power')) {
      await this.addCapability('target_power');
    }

    await this.setCapabilityOptions('target_power', { min: 0, max: this.getEffectiveMaxPower() });
    await this.setCapabilityOptions('exportcapacity', { max: this.getEffectiveMaxPower() });

    if (maxpeakpower <= 0) {
      await this.homey.notifications.createNotification({
        excerpt: 'Growatt: Max peak power is not configured. Please set it in the device settings for accurate target power control.',
      });
    }

    this.registerCapabilityListener('target_power', async (value) => {
      const currentMax = Number(this.getSetting('maxpeakpower'));
      if (currentMax <= 0) {
        throw new Error('Max peak power is not configured. Please set it in the device settings.');
      }
      const percentage = Math.round((value / currentMax) * 100);
      await this.updateControl('target_power', percentage);
      await this.setCapabilityValue('exportcapacity', value);
    });

    if (this.getCapabilityValue('target_power') === null) {
      await this.setCapabilityValue('target_power', 0);
    }

    // on/off state condition
    const onoffCondition = this.homey.flow.getConditionCard('on_off');
    onoffCondition.registerRunListener(async (args, state) => {
      const result = Number(await args.device.getCapabilityValue('growatt_onoff')) === Number(args.inverterstate);
      return Promise.resolve(result);
    });

    const limitCondition = this.homey.flow.getConditionCard('exportLimit');
    limitCondition.registerRunListener(async (args, state) => {
      const result = Number(await args.device.getCapabilityValue('exportlimitenabled')) === Number(args.exportlimit);
      return Promise.resolve(result);
    });

    // Make export limit capabilities writable only when the user has explicitly
    // opted in via the 'ems_control' device setting. The global capability
    // definitions keep setable: false to protect other Growatt variants (e.g.
    // TLS) where writing these registers without a compatible meter on the
    // Modbus network can cause inverter errors.
    if (this.getSetting('ems_control') === true) {
      await this.setCapabilityOptions('exportlimitenabled',   { setable: true });
      await this.setCapabilityOptions('exportlimitpowerrate', { setable: true });

      this.registerCapabilityListener('exportlimitenabled', async (value) => {
        await this.updateControl('exportlimitenabled', Number(value));
      });

      this.registerCapabilityListener('exportlimitpowerrate', async (value) => {
        await this.updateControl('exportlimitpowerrate', Number(value));
      });
    }

    // flow action
    const onoffAction = this.homey.flow.getActionCard('on_off');
    onoffAction.registerRunListener(async (args, state) => {
      await this.updateControl('growatt_onoff', Number(args.mode));
    });

    const exportEnabledAction = this.homey.flow.getActionCard('exportlimitenabled');
    exportEnabledAction.registerRunListener(async (args, state) => {
      await this.updateControl('exportlimitenabled', Number(args.mode));
    });

    const exportlimitpowerrateAction = this.homey.flow.getActionCard('exportlimitpowerrate');
    exportlimitpowerrateAction.registerRunListener(async (args, state) => {
      await this.updateControl('exportlimitpowerrate', args.percentage);
    });

    if (this.hasCapability('growatt_onoff') === false) {
      await this.addCapability('growatt_onoff');
    }
    if (this.hasCapability('exportlimitenabled') === false) {
      await this.addCapability('exportlimitenabled');
    }
    if (this.hasCapability('exportlimitpowerrate') === false) {
      await this.addCapability('exportlimitpowerrate');
    }

    this.pollInvertor().catch(this.error);
    let settings = this.getSettings();

    if (settings.pollinginterval === undefined) {
      this.setSettings({ pollinginterval: DEFAULT_RETRY_INTERVAL });
      settings.pollinginterval = 28;
    }

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor().catch(this.error);
    }, settings.pollinginterval * 1000);

  
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyGrowattDevice has been added');
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
    if (changedKeys.includes('maxpeakpower')) {
      const max = Number(newSettings.maxpeakpower) || 6000;
      await this.setCapabilityOptions('target_power', { min: 0, max });
      await this.setCapabilityOptions('exportcapacity', { max });
    }
    if (changedKeys.includes('ems_control')) {
      // Restart required to re-register capability listeners
      return this.homey.__('settings.restart_required') ?? 'Restart the app to apply this change.';
    }

    if (changedKeys.includes('unavailable_after')) {
      // Re-apply right away: available again if the new limit is 0 or not reached yet
      const unavailableAfter = this.getUnavailableAfter(newSettings.unavailable_after);
      const reached = unavailableAfter > 0 && this.failedPolls >= unavailableAfter;
      if (!reached && !this.getAvailable()) {
        await this.setAvailable();
      }
    }

    if (changedKeys.indexOf('pollinginterval') > -1) {
      console.log('Changing the "pollinginterval" settings from', oldSettings.pollinginterval, 'to', newSettings.pollinginterval);

      this.homey.clearInterval(this.timer);
      this.timer = this.homey.setInterval(() => {
        // poll device state from inverter
        this.pollInvertor();
      }, Number(newSettings.pollinginterval) * 1000);
    }

  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyGrowattDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyGrowattDevice has been deleted');
    this.homey.clearInterval(this.timer);
  }

  private getEffectiveMaxPower(): number {
    return Number(this.getSetting('maxpeakpower')) || 6000;
  }

  private getRegisterAddressForCapability(capability: string): number | undefined {
    const result = this.getMappingAndRegister(capability, this.holdingRegistersBase);
    if (!result) return undefined;
    return result.registerDefinition[0];
  }

  private processRegisterValue(capability: string, registerValue: number): number | null {
    return this.processRegisterValueCommon(capability, registerValue, this.holdingRegistersBase);
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
      withErrorContext(`Growatt driver=${this.driver.id} device=${this.getData().id} name=${this.getName()} write=${type} unit=${unitID}`, async () => {
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
          // target_power is updated via pollInvertor (% → W back-conversion), not here
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
    // Never start a second connection while the previous poll is still running,
    // dataloggers like the ShineWiLan-X2 can't handle parallel Modbus connections.
    if (this.pollBusy) {
      this.log('pollInvertor: previous poll still running, skipped');
      return;
    }
    this.pollBusy = true;
    try {
      const ok = await this.readInvertor();
      await this.updateAvailability(ok);
    } finally {
      this.pollBusy = false;
    }
  }

  async updateAvailability(ok: boolean) {
    if (ok) {
      this.failedPolls = 0;
      if (!this.getAvailable()) {
        await this.setAvailable();
      }
      return;
    }
    this.failedPolls += 1;
    this.log(`pollInvertor: failed poll ${this.failedPolls} in a row`);
    const unavailableAfter = this.getUnavailableAfter();
    if (unavailableAfter > 0 && this.failedPolls >= unavailableAfter && this.getAvailable()) {
      await this.setUnavailable('No response from the inverter');
    }
  }

  getUnavailableAfter(value: unknown = this.getSetting('unavailable_after')): number {
    const n = Number(value);
    return value === undefined || value === null || Number.isNaN(n) ? DEFAULT_UNAVAILABLE_AFTER : n;
  }

  // Resolves true when the inverter answered, false on connect error, timeout or no data.
  readInvertor(): Promise<boolean> {
    this.log('pollInvertor');
    this.log(this.getSetting('address'));

    const modbusOptions = {
      host: this.getSetting('address'),
      port: this.getSetting('port'),
      unitId: this.getSetting('id'),
      autoReconnect: false,
      logLabel: 'Growatt Inverter',
      logLevel: 'error',
      logEnabled: true,
    };

    const socket = new net.Socket();
    const unitID = this.getSetting('id');
    const client = new Modbus.client.TCP(socket, unitID, 3000);

    // A poll must end before the next one is due. An idle timeout on the socket doesn't
    // work here: every new request counts as activity, and an inverter that doesn't answer
    // makes a poll take ~1 s per register (54 registers).
    const pollTimeoutMs = (Number(this.getSetting('pollinginterval')) || DEFAULT_RETRY_INTERVAL) * 1000 - 1000;

    return new Promise<boolean>((resolve) => {
      const started = Date.now();
      let done = false;
      const finish = (ok: boolean) => {
        if (done) return;
        done = true;
        this.homey.clearTimeout(pollTimer);
        this.log(`pollInvertor: ${ok ? 'ok' : 'failed'} after ${Date.now() - started} ms`);
        resolve(ok);
      };
      const pollTimer = this.homey.setTimeout(() => {
        this.log('poll timed out!');
        socket.destroy();
        finish(false);
      }, pollTimeoutMs);

      socket.setKeepAlive(false);
      socket.connect(modbusOptions);

      socket.on('connect', () => {
        withErrorContext(`Growatt driver=${this.driver.id} device=${this.getData().id} name=${this.getName()} poll unit=${unitID}`, async () => {
          this.log('Connected ...');
          this.log(modbusOptions);

          // Optional (device setting): read registers in blocks instead of one request per register
          const blockRead = this.getSetting('block_read') === true;
          const checkRegisterRes = blockRead
            ? await checkRegisterGrowattBlocks(this.registers, client, 'input')
            : await checkRegisterGrowatt(this.registers, client);
          const checkHoldingRegisterRes = blockRead
            ? await checkRegisterGrowattBlocks(this.holdingRegistersBase, client, 'holding')
            : await checkHoldingRegisterGrowatt(this.holdingRegistersBase, client);
          // The poll was already given up (timeout or error), don't use partial results
          if (done) return;
          this.log('disconnect');
          socket.end();
          finish(Object.keys(checkRegisterRes).length > 0);
          const finalRes = { ...checkRegisterRes, ...checkHoldingRegisterRes };
          const maxpeakpower = Number(this.getSetting('maxpeakpower'));
          await this.processResult(finalRes, maxpeakpower);
          if (finalRes.activePRate && maxpeakpower > 0 && this.hasCapability('target_power')) {
            const pct = Number(finalRes.activePRate.value);
            if (pct >= 0 && pct <= 100) {
              const watts = Math.round((pct / 100) * maxpeakpower);
              await this.setCapabilityValue('target_power', watts);
              await this.setCapabilityValue('exportcapacity', watts);
            }
          }
        })().catch((err) => {
          this.error(err);
          socket.destroy();
          finish(false);
        });
      });

      socket.on('close', () => {
        this.log('Client closed');
        finish(false);
      });

      socket.on('error', (err) => {
        this.log(err);
        socket.destroy();
        finish(false);
      });
    });
  }
}

module.exports = MyGrowattDevice;
