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

    // on/off state condition
    const onoffCondition = this.homey.flow.getConditionCard('on_off');
    onoffCondition.registerRunListener(async (args, state) => {
      const result = Number(await args.device.getCapabilityValue('growatt_onoff')) === Number(args.inverterstate);
      return Promise.resolve(result);
    });

    // priority condition
    const prioCondition = this.homey.flow.getConditionCard('priorityMode');
    prioCondition.registerRunListener(async (args, state) => {
      const result = (await args.device.getCapabilityValue('priority')) == args.priority;
      return Promise.resolve(result);
    });

    const limitCondition = this.homey.flow.getConditionCard('exportLimit');
    limitCondition.registerRunListener(async (args, state) => {
      const result = Number(await args.device.getCapabilityValue('exportlimitenabled')) === Number(args.exportlimit);
      return Promise.resolve(result);
    });

    const acCondition = this.homey.flow.getConditionCard('acCharge');
    acCondition.registerRunListener(async (args, state) => {
      const result = Number(await args.device.getCapabilityValue('battacchargeswitch')) === Number(args.accharge);
      return Promise.resolve(result);
    });

    // flow action
    const onoffAction = this.homey.flow.getActionCard('on_off');
    onoffAction.registerRunListener(async (args, state) => {
      await this.updateControl('growatt_onoff', Number(args.mode));
    });

    const exportEnabledAction = this.homey.flow.getActionCard('exportlimitenabled');
    exportEnabledAction.registerRunListener(async (args, state) => {
      await this.updateControl('exportlimitenabled', Number(args.mode));
    });

    const dischargeAction = this.homey.flow.getActionCard('grid_first_discharge_percentage');
    dischargeAction.registerRunListener(async (args, state) => {
      await this.updateControl('grid_first_discharge_percentage', Number(args.value));
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

    if (this.hasCapability('growatt_onoff') === false) {
      await this.addCapability('growatt_onoff');
    }
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

        if (type == 'growatt_onoff') {
          // 0 – Disabled
          // 1 – Enabled
          if (value == 1) {
            const onoffRes = await client.writeSingleRegister(0, Number(1));
            this.log('onoff', onoffRes);
          } else if (value == 0) {
            const onoffRes = await client.writeSingleRegister(0, Number(0));
            this.log('onoff', onoffRes);
          } else {
            this.log(`onoff unknown value: ${value}`);
          }
        }

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
        
        if (type == 'grid_first_discharge_percentage') {
            const dischargeRatedRes = await client.writeSingleRegister(3036, value);
            this.log('dischargeRatedRes', dischargeRatedRes);
        }

        if (type == 'battacchargeswitch') {
          // 0 – Disabled
          // 1 – Enabled
          if (value == 1) {
            const battacchargeswitchRes = await client.writeSingleRegister(3049, Number(1));
            this.log('battacchargeswitch', battacchargeswitchRes);
          } else if (value == 0) {
            const battacchargeswitchRes = await client.writeSingleRegister(3049, Number(0));
            this.log('battacchargeswitch', battacchargeswitchRes);
          } else {
            this.log(`battacchargeswitch unknown value: ${value}`);
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

        if (type == 'battmaxsoc') {
          // 0 – 100 %
          this.log(`battmaxsoc value: ${value}`);
          if (value >= 0 && value <= 100) {
            const battmaxsocRes = await client.writeSingleRegister(3048, value);
            this.log('battmaxsoc', battmaxsocRes);
          } else {
            this.log(`battmaxsoc unknown value: ${value}`);
          }
        }

        if (type == 'battminsoc') {
          // 10 – 100 %
          this.log(`battminsoc value: ${value}`);
          if (value >= 10 && value <= 100) {
            const battminsocRes = await client.writeSingleRegister(3037, value);
            this.log('battminsoc', battminsocRes);
          } else {
            this.log(`battminsoc unknown value: ${value}`);
          }
        }

        if (type == 'prioritymode') {
          this.log(`prioritymode value: ${value}`);
          const prioritychangeRes = await client.writeSingleRegister(1044, value);
          this.log('prioritymode', prioritychangeRes);
        }

        if (type == 'timesync') {
          this.log(`timesync value: ${value}`);
          const now = moment().tz(this.homey.clock.getTimezone());
          const time: number[] = [now.hours(), now.minutes(), now.milliseconds() > 500 ? now.seconds() + 1 : now.seconds()];
          const date: number[] = [now.year() - 2000, now.month() + 1, now.date()];
          let format = 'hh:mm:ss';

          if (value == 1) {
            format = `DD-MM-YYYY ${format}`;
            await client.writeMultipleRegisters(45, [...date, ...time]);
          } else {
            await client.writeMultipleRegisters(48, time);
          }
          this.log(`timesync: ${now.format(format)}`);
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

    const startRegisters: Record<string, number> = {
      period1: 3038,
      period2: 3040,
      period3: 3042,
      period4: 3044,
    };

    socket.on('connect', () => {
      (async () => {
        this.log('Connected ...');
        const startRegister = startRegisters[type];
        // any slot has the same structure: start time, stop time, enabled status
        const setData: number[] = [(hourstart + priority + enabled) * 256 + minstart, hourstop * 256 + minstop];
        const timeRes = await client.writeMultipleRegisters(startRegister, setData);
        this.log(type, timeRes);

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
