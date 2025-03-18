import * as Modbus from 'jsmodbus';
import net from 'net';
import moment from 'moment-timezone';
import {checkRegisterGrowatt, checkHoldingRegisterGrowatt} from '../response';
import { Growatt } from '../growatt';

const RETRY_INTERVAL = 60 * 1000;

class MyGrowattTLBattery extends Growatt {
  timer!: NodeJS.Timer;
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyGrowattTLBattery has been initialized');

    let name = this.getData().id;
    this.log("device name id " + name );
    this.log("device name " + this.getName());

    this.pollInvertor();

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor();
    }, RETRY_INTERVAL);

    // priority condition
    let prioCondition = this.homey.flow.getConditionCard("priorityMode");
    prioCondition.registerRunListener(async (args, state) => {
      let result = (await args.device.getCapabilityValue('priority') == args.priority);
      return Promise.resolve(result);
    })

    // flow action
    let exportEnabledAction = this.homey.flow.getActionCard('exportlimitenabled');
    exportEnabledAction.registerRunListener(async (args, state) => {
      await this.updateControl('exportlimitenabled', Number(args.mode));
    });

    let exportlimitpowerrateAction = this.homey.flow.getActionCard('exportlimitpowerrate');
    exportlimitpowerrateAction.registerRunListener(async (args, state) => {
      await this.updateControl('exportlimitpowerrate', args.percentage);
    });

    let battmaxsocAction = this.homey.flow.getActionCard('battery_maximum_capacity');
    battmaxsocAction.registerRunListener(async (args, state) => {
      await this.updateControl('battmaxsoc', Number(args.percentage));
    });

    let battminsocAction = this.homey.flow.getActionCard('battery_minimum_capacity');
    battminsocAction.registerRunListener(async (args, state) => {
      await this.updateControl('battminsoc', args.percentage);
    });

    // let prioritychangeAction = this.homey.flow.getActionCard('prioritymode');
    // prioritychangeAction.registerRunListener(async (args, state) => {
    //   await this.updateControl('prioritymode', Number(args.mode));
    // });

    let battacchargeswitchAction = this.homey.flow.getActionCard('battacchargeswitch');
    battacchargeswitchAction.registerRunListener(async (args, state) => {
      await this.updateControl('battacchargeswitch', Number(args.mode));
    });

    let period1Action = this.homey.flow.getActionCard('period1');
    period1Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('period1', Number(args.hourstart), Number(args.minstart), Number(args.hourstop), Number(args.minstop), Number(args.priority), Number(args.active));
    });

    let period2Action = this.homey.flow.getActionCard('period2');
    period2Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('period2', Number(args.hourstart), Number(args.minstart), Number(args.hourstop), Number(args.minstop), Number(args.priority), Number(args.active));
    });

    let period3Action = this.homey.flow.getActionCard('period3');
    period3Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('period3', Number(args.hourstart), Number(args.minstart), Number(args.hourstop), Number(args.minstop), Number(args.priority), Number(args.active));
    });

    let period4Action = this.homey.flow.getActionCard('period4');
    period4Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('period4', Number(args.hourstart), Number(args.minstart), Number(args.hourstop), Number(args.minstop), Number(args.priority), Number(args.active));
    });


    // homey menu / device actions
    this.registerCapabilityListener('exportlimitenabled', async (value) => {
      this.updateControl('exportlimitenabled', Number(value));
      return value;
    });
    this.registerCapabilityListener('exportlimitpowerrate', async (value) => {
      this.updateControl('exportlimitpowerrate', value);
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
  async onSettings({ oldSettings: {}, newSettings: {}, changedKeys: {} }): Promise<string|void> {
    this.log('MyGrowattTLBattery settings where changed');
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
    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID, 2000);

    let modbusOptions = {
      'host': this.getSetting('address'),
      'port': this.getSetting('port'),
      'unitId': this.getSetting('id'),
      'timeout': 15,
      'autoReconnect': false,
      'logLabel': 'growatt Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }

    socket.setKeepAlive(false);
    socket.connect(modbusOptions);
    console.log(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');

      if (type == 'exportlimitenabled') {
        // 0 – Disabled
        // 1 – Enabled
        if (value == 1) {
          const exportlimitenabledRes = await client.writeSingleRegister(122, Number(1));
          console.log('exportlimitenabled', exportlimitenabledRes);
        } else if (value == 0) {
          const exportlimitenabledRes = await client.writeSingleRegister(122, Number(0));
          console.log('exportlimitenabled', exportlimitenabledRes);
        } else {
          console.log('exportlimitenabled unknown value: ' + value);
        }
      }

      if (type == 'battacchargeswitch') {
        // 0 – Disabled
        // 1 – Enabled
        if (value == 1) {
          const battacchargeswitchRes = await client.writeSingleRegister(3049, Number(1));
          console.log('battacchargeswitch', battacchargeswitchRes);
        } else if (value == 0) {
          const battacchargeswitchRes = await client.writeSingleRegister(3049, Number(0));
          console.log('battacchargeswitch', battacchargeswitchRes);
        } else {
          console.log('battacchargeswitch unknown value: ' + value);
        }
      }

      if (type == 'exportlimitpowerrate') {
        // 0 – 100 % with 1 decimal
        // 0 – 1000 as values
        console.log('exportlimitpowerrate value: ' + value);
        if (value >= 0 && value <= 100) {
          const exportlimitpowerratedRes = await client.writeSingleRegister(123, value * 10);
          console.log('exportlimitpowerrate', exportlimitpowerratedRes);
          console.log('exportlimitpowerrate value 2: ' + value * 10);
        } else {
          console.log('exportlimitpowerrate unknown value: ' + value);
        }
      }

      if (type == 'battmaxsoc') {
        // 0 – 100 %
        console.log('battmaxsoc value: ' + value);
        if (value >= 0 && value <= 100) {
          const battmaxsocRes = await client.writeSingleRegister(3048, value);
          console.log('battmaxsoc', battmaxsocRes);
        } else {
          console.log('battmaxsoc unknown value: ' + value);
        }
      }

      if (type == 'battminsoc') {
        // 10 – 100 %
        console.log('battminsoc value: ' + value);
        if (value >= 10 && value <= 100) {
          const battminsocRes = await client.writeSingleRegister(3037, value);
          console.log('battminsoc', battminsocRes);
        } else {
          console.log('battminsoc unknown value: ' + value);
        }
      }

      if (type == 'prioritymode') {
        console.log('prioritymode value: ' + value);
        const prioritychangeRes = await client.writeSingleRegister(1044, value);
        console.log('prioritymode', prioritychangeRes);
      }

      if (type == 'timesync') {
        console.log('timesync value: ' + value);
        const now = moment().tz(this.homey.clock.getTimezone());
        const time: number[] = [ now.hours(), now.minutes(), now.milliseconds() > 500 ? now.seconds() + 1 : now.seconds()];
        const date: number[] = [now.year() - 2000, now.month() + 1, now.date()];

        if (value == 1) {
          await client.writeMultipleRegisters(45, [...date, ...time]);
        } else {
          await client.writeMultipleRegisters(48, time);
        }
        console.log('timesync: ' + now);
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

  async updateControlProfile(type: string, hourstart: number, minstart: number, hourstop: number, minstop: number, priority: number, enabled: number) {
    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID, 2000);

    let modbusOptions = {
      'host': this.getSetting('address'),
      'port': this.getSetting('port'),
      'unitId': this.getSetting('id'),
      'timeout': 15,
      'autoReconnect': false,
      'logLabel': 'growatt Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }

    socket.setKeepAlive(false);
    socket.connect(modbusOptions);
    console.log(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');
      let startRegister = 0;
      let stopRegister = 0;
      let enabledRegister = 0;
      if (type == 'period1') {
        startRegister = 3038
        stopRegister = 3039
      }

      if (type == 'period2') {
        startRegister = 3040
        stopRegister = 3041
      }

      if (type == 'period3') {
        startRegister = 3042
        stopRegister = 3043
      }

      if (type == 'period4') {
        startRegister = 3044
        stopRegister = 3045
      }

      let start  =  ((hourstart + priority + enabled ) * 256) + minstart;
      const startRes = await client.writeSingleRegister(startRegister, start);
      console.log('start', startRes);
      let stop  =  (hourstop * 256) + minstop;
      const stopRes = await client.writeSingleRegister(stopRegister, stop);
      console.log('stop', stopRes);

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
      'timeout': 55,
      'autoReconnect': false,
      'logLabel' : 'Growatt Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }

    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID, 3000);
    socket.setKeepAlive(false);
    socket.connect(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');
      console.log(modbusOptions);

      const checkRegisterRes = await checkRegisterGrowatt(this.registersTL, client);
      const checkHoldingRegisterRes = await checkHoldingRegisterGrowatt(this.holdingRegistersTL, client);

      console.log('disconnect');
      client.socket.end();
      socket.end();
      const finalRes = {...checkRegisterRes, ...checkHoldingRegisterRes}
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
    })
  }
}

module.exports = MyGrowattTLBattery;
