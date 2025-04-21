import * as Modbus from 'jsmodbus';
import net from 'net';
import moment from 'moment-timezone';
/* eslint-disable node/no-missing-import */
import { checkRegisterGrowatt, checkHoldingRegisterGrowatt } from '../response';
import { Growatt } from '../growatt';
/* eslint-enable node/no-missing-import */

const RETRY_INTERVAL = 60 * 1000;

class MyGrowattTLBattery extends Growatt {
  timer!: NodeJS.Timer;
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyGrowattTLBattery has been initialized');

    const name = this.getData().id;
    this.log(`device name id ${name}`);
    this.log(`device name ${this.getName()}`);

    this.pollInvertor().catch(this.error);

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor().catch(this.error);
    }, RETRY_INTERVAL);

    // priority condition
    const prioCondition = this.homey.flow.getConditionCard('priorityMode');
    prioCondition.registerRunListener(async (args, state) => {
      const result = Number(await args.device.getCapabilityValue('priority')) === Number(args.priority);
      return Promise.resolve(result);
    });

    const limitCondition = this.homey.flow.getConditionCard('exportLimit');
    limitCondition.registerRunListener(async (args, state) => {
      const result = Number(await args.device.getCapabilityValue('exportLimit')) === Number(args.exportlimit);
      return Promise.resolve(result);
    });

    const acCondition = this.homey.flow.getConditionCard('acCharge');
    acCondition.registerRunListener(async (args, state) => {
      const result = Number(await args.device.getCapabilityValue('battacchargeswitch')) === Number(args.accharge);
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

    const battmaxsocAction = this.homey.flow.getActionCard('battery_maximum_capacity');
    battmaxsocAction.registerRunListener(async (args, state) => {
      await this.updateControl('battmaxsoc', Number(args.percentage));
    });

    const battminsocAction = this.homey.flow.getActionCard('battery_minimum_capacity');
    battminsocAction.registerRunListener(async (args, state) => {
      await this.updateControl('battminsoc', args.percentage);
    });

    // let prioritychangeAction = this.homey.flow.getActionCard('prioritymode');
    // prioritychangeAction.registerRunListener(async (args, state) => {
    //   await this.updateControl('prioritymode', Number(args.mode));
    // });

    const battacchargeswitchAction = this.homey.flow.getActionCard('battacchargeswitch');
    battacchargeswitchAction.registerRunListener(async (args, state) => {
      await this.updateControl('battacchargeswitch', Number(args.mode));
    });

    const period1Action = this.homey.flow.getActionCard('period1');
    period1Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile(
        'period1',
        Number(args.hourstart),
        Number(args.minstart),
        Number(args.hourstop),
        Number(args.minstop),
        Number(args.priority),
        Number(args.active),
      );
    });

    const period2Action = this.homey.flow.getActionCard('period2');
    period2Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile(
        'period2',
        Number(args.hourstart),
        Number(args.minstart),
        Number(args.hourstop),
        Number(args.minstop),
        Number(args.priority),
        Number(args.active),
      );
    });

    const period3Action = this.homey.flow.getActionCard('period3');
    period3Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile(
        'period3',
        Number(args.hourstart),
        Number(args.minstart),
        Number(args.hourstop),
        Number(args.minstop),
        Number(args.priority),
        Number(args.active),
      );
    });

    const period4Action = this.homey.flow.getActionCard('period4');
    period4Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile(
        'period4',
        Number(args.hourstart),
        Number(args.minstart),
        Number(args.hourstop),
        Number(args.minstop),
        Number(args.priority),
        Number(args.active),
      );
    });

    // homey menu / device actions
    this.registerCapabilityListener('exportlimitenabled', async (value) => {
      await this.updateControl('exportlimitenabled', Number(value));
      return value;
    });
    this.registerCapabilityListener('exportlimitpowerrate', async (value) => {
      await this.updateControl('exportlimitpowerrate', value);
      return value;
    });

    if (this.hasCapability('period1') === false) {
      await this.addCapability('period1');
    }
    if (this.hasCapability('period2') === false) {
      await this.addCapability('period2');
    }
    if (this.hasCapability('period3') === false) {
      await this.addCapability('period3');
    }
    if (this.hasCapability('period4') === false) {
      await this.addCapability('period4');
    }
    if (this.hasCapability('gridfirst1') === true) {
      await this.removeCapability('gridfirst1');
    }
    if (this.hasCapability('battfirst1') === true) {
      await this.removeCapability('battfirst1');
    }
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyGrowattTLBattery has been added');
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
    this.log('MyGrowattTLBattery was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyGrowattTLBattery has been deleted');
    this.homey.clearInterval(this.timer);
  }

  private getRegisterAddressForCapability(capability: string): number | undefined {
    const result = this.getMappingAndRegister(capability, this.holdingRegistersTL);
    if (!result) return undefined;
    return result.registerDefinition[0];
  }

  private processRegisterValue(capability: string, registerValue: number): number | null {
    return this.processRegisterValueCommon(capability, registerValue, this.holdingRegistersTL);
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

        switch (type) {
          case 'prioritymode': {
            this.log(`prioritymode value: ${value}`);
            const res = await client.writeSingleRegister(1044, value);
            this.log('prioritymode', res);
            break;
          }
          case 'timesync': {
            this.log(`timesync value: ${value}`);
            const now = moment().tz(this.homey.clock.getTimezone());
            const time: number[] = [now.hours(), now.minutes(), now.milliseconds() > 500 ? now.seconds() + 1 : now.seconds()];
            const date: number[] = [now.year() - 2000, now.month() + 1, now.date()];
            let format = 'hh:mm:ss';

            if (value === 1) {
              format = `DD-MM-YYYY ${format}`;
              await client.writeMultipleRegisters(45, [...date, ...time]);
            } else {
              await client.writeMultipleRegisters(48, time);
            }
            this.log(`timesync: ${now.format(format)}`);
            break;
          }
          default: {
            this.log(`${type} value: ${value}`);
            const registerAddress = this.getRegisterAddressForCapability(type);
            const regValue = this.processRegisterValue(type, value);
            if (registerAddress === undefined) {
              this.log(`${type} register mapping not found`);
            } else if (regValue === null) {
              this.log(`${type} register value not valid`);
            } else {
              this.log(`${type} register: ${registerAddress} value: ${regValue}`);
              const res = await client.writeSingleRegister(registerAddress, regValue);
              this.log(type, res);
              // Update the changed capability value
              const typedValue = this.castToCapabilityType(type, value);
              this.log(`typeof typedValue: ${typeof typedValue}, value:`, typedValue);
              await this.setCapabilityValue(type, typedValue);
            }
            break;
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

  async updateControlProfile(type: string, hourstart: number, minstart: number, hourstop: number, minstop: number, priority: number, enabled: number) {
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
        const startRegister = this.holdingRegistersTL[`${type}start`]?.[0];
        if (startRegister === undefined) {
          this.log(`${type}start register mapping not found`);
          return;
        }
        this.log(`${type} start register: ${startRegister}`);

        // any slot has the same structure: start time, stop time, enabled status
        const setData: number[] = [((hourstart + priority + enabled) << 8) + minstart, (hourstop << 8) + minstop];
        const res = await client.writeMultipleRegisters(startRegister, setData);
        this.log(type, res);
        const capabilityStr = this.getSlotCapabilityValue(setData[0], setData[1]);
        this.log(`${type}: `, capabilityStr);
        await this.setCapabilityValue(type, capabilityStr);

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
      timeout: 55,
      autoReconnect: false,
      logLabel: 'Growatt Inverter',
      logLevel: 'error',
      logEnabled: true,
    };

    const socket = new net.Socket();
    const unitID = this.getSetting('id');
    const client = new Modbus.client.TCP(socket, unitID, 3000);
    socket.setKeepAlive(false);
    socket.connect(modbusOptions);

    socket.on('connect', () => {
      (async () => {
        this.log('Connected ...');
        this.log(modbusOptions);

        const checkRegisterRes = await checkRegisterGrowatt(this.registersTL, client);
        const checkHoldingRegisterRes = await checkHoldingRegisterGrowatt(this.holdingRegistersTL, client);

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

module.exports = MyGrowattTLBattery;
