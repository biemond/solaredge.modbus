import * as Modbus from 'jsmodbus';
import * as net from 'net';
import moment from 'moment-timezone';
import {checkRegisterGrowatt, checkHoldingRegisterGrowatt} from '../response';
import { Growatt } from '../growatt';

const RETRY_INTERVAL = 28 * 1000;

class MyGrowattBattery extends Growatt {
  timer!: NodeJS.Timer;
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyGrowattBattery has been initialized');

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

    let battminsocLFAction = this.homey.flow.getActionCard('battery_min_cap_load_first');
    battminsocLFAction.registerRunListener(async (args, state) => {
      await this.updateControl('battminsocLF', args.percentage);
    });


    let prioritychangeAction = this.homey.flow.getActionCard('prioritymode');
    prioritychangeAction.registerRunListener(async (args, state) => {
      await this.updateControl('prioritymode', Number(args.mode));
    });

    let battacchargeswitchAction = this.homey.flow.getActionCard('battacchargeswitch');
    battacchargeswitchAction.registerRunListener(async (args, state) => {
      await this.updateControl('battacchargeswitch', Number(args.mode));
    });

    let clocksyncAction = this.homey.flow.getActionCard('timesync');
    clocksyncAction.registerRunListener(async (args, state) => {
      await this.updateControl('timesync', Number(args.syncdate));
    });

    let battFirstAction = this.homey.flow.getActionCard('batt_first_for_interval_with_percentage');
    battFirstAction.registerRunListener(async (args, state) => {
      await this.updateControlPrio('batt_first_for_interval_with_percentage', Number(args.hours) ,Number(args.percentage), Number(args.soc), Number(args.accharge) );
    });

    let gridFirstAction = this.homey.flow.getActionCard('grid_first_for_interval_with_percentage');
    gridFirstAction.registerRunListener(async (args, state) => {
      await this.updateControlPrio('grid_first_for_interval_with_percentage', Number(args.hours) ,Number(args.percentage), Number(args.soc), 0 );
    });

    let battfirsttime1Action = this.homey.flow.getActionCard('battfirsttime1');
    battfirsttime1Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('battfirsttime1', args.starttime, args.stoptime, Number(args.active) );
    });
    // let battfirsttime2Action = this.homey.flow.getActionCard('battfirsttime2');
    // battfirsttime2Action.registerRunListener(async (args, state) => {
    //   await this.updateControlProfile('battfirsttime2', args.starttime, args.stoptime, Number(args.active));
    // });
    // let battfirsttime3Action = this.homey.flow.getActionCard('battfirsttime3');
    // battfirsttime3Action.registerRunListener(async (args, state) => {
    //   await this.updateControlProfile('battfirsttime3', args.starttime, args.stoptime, Number(args.active));
    // });

    let gridfirsttime1Action = this.homey.flow.getActionCard('gridfirsttime1');
    gridfirsttime1Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('gridfirsttime1', args.starttime, args.stoptime, Number(args.active));
    });
    // let gridfirsttime2Action = this.homey.flow.getActionCard('gridfirsttime2');
    // gridfirsttime2Action.registerRunListener(async (args, state) => {
    //   await this.updateControlProfile('gridfirsttime2', args.starttime, args.stoptime, Number(args.active));
    // });
    // let gridfirsttime3Action = this.homey.flow.getActionCard('gridfirsttime3');
    // gridfirsttime3Action.registerRunListener(async (args, state) => {
    //   await this.updateControlProfile('gridfirsttime3', args.starttime, args.stoptime, Number(args.active));
    // });


    // homey menu / device actions
    this.registerCapabilityListener('exportlimitenabled', async (value) => {
      this.updateControl('exportlimitenabled', Number(value));
      return value;
    });
    this.registerCapabilityListener('exportlimitpowerrate', async (value) => {
      this.updateControl('exportlimitpowerrate', value);
      return value;
    });

    if (this.hasCapability('priority') === false) {
      await this.addCapability('priority');
    }
    if (this.hasCapability('measure_power.houseload') === false) {
      await this.addCapability('measure_power.houseload');
    }
    if (this.hasCapability('meter_power.today_grid_import') === false) {
      await this.addCapability('meter_power.today_grid_import');
    }
    if (this.hasCapability('meter_power.today_grid_export') === false) {
      await this.addCapability('meter_power.today_grid_export');
    }
    if (this.hasCapability('meter_power.today_batt_output') === false) {
      await this.addCapability('meter_power.today_batt_output');
    }
    if (this.hasCapability('meter_power.today_batt_input') === false) {
      await this.addCapability('meter_power.today_batt_input');
    }
    if (this.hasCapability('meter_power.today_load') === false) {
      await this.addCapability('meter_power.today_load');
    }
    if (this.hasCapability('batteryminsoc') === false) {
      await this.addCapability('batteryminsoc');
    }
    if (this.hasCapability('batterymaxsoc') === false) {
      await this.addCapability('batterymaxsoc');
    }
    if (this.hasCapability('gridfirst1') === false) {
      await this.addCapability('gridfirst1');
    }
    if (this.hasCapability('battfirst1') === false) {
      await this.addCapability('battfirst1');
    }
    if (this.hasCapability('battacchargeswitch') === false) {
      await this.addCapability('battacchargeswitch');
    }
    if (this.hasCapability('measure_power.import') === false) {
      await this.addCapability('measure_power.import');
    }
    if (this.hasCapability('measure_power.export') === false) {
      await this.addCapability('measure_power.export');
    }
    if (this.hasCapability('batteryminsoclf') === false) {
      await this.addCapability('batteryminsoclf');
    }
    if (this.hasCapability('gfdischargerate') === false) {
      await this.addCapability('gfdischargerate');
    }
    if (this.hasCapability('bfchargerate') === false) {
      await this.addCapability('bfchargerate');
    }

  }
  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyGrowattBattery has been added');
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
    this.log('MyGrowattBattery settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyGrowattBattery was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyGrowattBattery has been deleted');
    this.homey.clearInterval(this.timer);
  }

  delay(ms: any) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async updateControl(type: string, value: number) {
    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID);

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
          const battacchargeswitchRes = await client.writeSingleRegister(1092, Number(1));
          console.log('battacchargeswitch', battacchargeswitchRes);
        } else if (value == 0) {
          const battacchargeswitchRes = await client.writeSingleRegister(1092, Number(0));
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
          const battmaxsocRes = await client.writeSingleRegister(1091, value);
          console.log('battmaxsoc', battmaxsocRes);
        } else {
          console.log('battmaxsoc unknown value: ' + value);
        }
      }

      if (type == 'battminsoc') {
        // 10 – 100 %
        console.log('battminsoc value: ' + value);
        if (value >= 10 && value <= 100) {
          const battminsocRes = await client.writeSingleRegister(1071, value);
          console.log('battminsoc', battminsocRes);
        } else {
          console.log('battminsoc unknown value: ' + value);
        }
      }

      if (type == 'battminsocLF') {
        // 10 – 100 %
        console.log('battminsocLF value: ' + value);
        if (value >= 10 && value <= 100) {
          const battminsocRes = await client.writeSingleRegister(608, value);
          console.log('battminsocLF', battminsocRes);
        } else {
          console.log('battminsocLF unknown value: ' + value);
        }
      }

      if (type == 'prioritymode') {
        console.log('prioritymode value: ' + value);
        const limit = Number(this.getCapabilityValue('exportlimitenabled'));
        console.log('export limit is:', limit);
        const res = client.readHoldingRegisters(1080, 29)
        const actualRes = await res;
        await this.delay(850); // Growatt needs at least 850ms between commands
        let registers = actualRes.response.body.valuesAsArray;

        if (value === 0) {
          // disable all time slots, to enforce Load First
          registers[2] = registers[5] = registers[8] = registers[22] = registers[25] = registers[28] = 0;
          console.log('prioritymode Load First: all time slots for Batt&Grid set to disabled');
        } else if (value === 1) {

          // set Battery First slot#1 to enabled / 00:00-23:59
          registers[20] = 0; // 1100->00:00
          registers[21] = 5947; // 1101->23:59
          registers[22] = 1; // 1102->enabled
          // disable all other slots
          registers[2] = registers[5] = registers[8] = registers[25] = registers[28] = 0;
          console.log('prioritymode Batt First: slot#1 is enabled and set to 00:00-23:59');
        } else if (value === 2) {
          if (limit === 0) {
            // set Grid First slot#1 to enabled / 00:00-23:59
            registers[0] = 0; // 1080->00:00
            registers[1] = 5947; // 1081->23:59
            registers[2] = 1; // 1082->enabled
            // disable all other slots
            registers[5] = registers[8] = registers[22] = registers[25] = registers[28] = 0;
            console.log('prioritymode Grid First: slot#1 is enabled and set to 00:00-23:59');
          } else {
            console.log('prioritymode Grid First: not possible, export limit is enabled');
          }
        } else {
          console.log('prioritymode unknown value: ' + value);
        }
        const setData: number[] = Array.from(registers);
        let priorityRes;
        if (limit === 0) {
          priorityRes = await client.writeMultipleRegisters(1080, setData);
        } else if (value != 2) {
          // export limit is enabled, only write Batt First registers
          const modifiedSetData = setData.slice(20, 29);
          priorityRes = await client.writeMultipleRegisters(1100, modifiedSetData);
        } else {
          priorityRes = 'Grid First: not possible, export limit is enabled';
        }
        console.log('prioritymode', priorityRes);
      }

      if (type == 'timesync') {
        console.log('timesync value: ' + value);
        const now = moment().tz(this.homey.clock.getTimezone());
        const time: number[] = [ now.hours(), now.minutes(), now.milliseconds() > 500 ? now.seconds() + 1 : now.seconds()];
        const date: number[] = [now.year() - 2000, now.month() + 1, now.date()];
        let format = 'hh:mm:ss'

        if (value == 1) {
          format = 'DD-MM-YYYY ' + format;
          await client.writeMultipleRegisters(45, [...date, ...time]);
        } else {
          await client.writeMultipleRegisters(48, time);
        }
        console.log('timesync: ' + now.format(format));
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

  async updateControlProfile(type: string, startTime: string, stopTime: string, active: number) {
    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID, 500);

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

    // Set start registers for all slots
    const startRegisters: Record<string, number> = {
      battfirsttime1: 1100,
      battfirsttime2: 1103,
      battfirsttime3: 1106,
      gridfirsttime1: 1080,
      gridfirsttime2: 1083,
      gridfirsttime3: 1086
    };

    socket.on('connect', async () => {
      console.log('Connected ...');
      const limit = Number(this.getCapabilityValue('exportlimitenabled'));
      const startRegister = startRegisters[type];
      if (limit === 1 && startRegister < 1100) {
        console.log('export limit is enabled, cannot change grid first time slot');
      } else {
        // Parse startTime and stopTime in "HH:MM" format
        const [hourstart, minstart] = startTime.split(":").map(Number);
        const [hourstop, minstop] = stopTime.split(":").map(Number);
        // any slot has the same structure: start time, stop time, enabled status
        const setData: number[] = [(hourstart * 256) + minstart, (hourstop * 256) + minstop, active];
        const timeRes = await client.writeMultipleRegisters(startRegister, setData);
        console.log(type, timeRes);
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

  async updateControlPrio(type: string, hours: number, percentage: number, soc: number, ac: number) {
    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID, 500);

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

    // Set start registers for all slots
    let startRegister = 0;
    if (type == 'grid_first_for_interval_with_percentage') {
      startRegister = 1070;
    }
    if (type == 'batt_first_for_interval_with_percentage') {
      startRegister = 1090;
    }

    const now = moment().tz(this.homey.clock.getTimezone());
    const end = moment().tz(this.homey.clock.getTimezone()).add(hours, 'hours');
    let startTime = now.hours() * 256 + now.minutes();
    let endTime = 0;
    // if end time is not today, set to 23:59
    if(end.date() != now.date()) {
      endTime = 5947; // 23:59
    } else {
      endTime = end.hours() * 256 + end.minutes();
    }

    socket.on('connect', async () => {
      console.log('Connected ...');
      let registers: number[] =  Array(13).fill(0);
      registers[0] = percentage; // Charge/discharge rate limit
      registers[1] = soc; // SOC limit
      if (type == 'batt_first_for_interval_with_percentage') {
        registers[2] = ac; // Battery First AC charge enable
      }
      registers[10] = startTime; // Slot start time
      registers[11] = endTime; // Slot stop time
      registers[12] = 1; // Slot enabled
      const priorityRes = await client.writeMultipleRegisters(startRegister, registers);
      console.log('prioritymode', priorityRes);

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
      'timeout': 22,
      'autoReconnect': false,
      'logLabel' : 'Growatt Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }

    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID, 1000);
    socket.setKeepAlive(false);
    socket.connect(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');
      console.log(modbusOptions);

      const checkRegisterRes = await checkRegisterGrowatt(this.registers, client);
      const checkHoldingRegisterRes = await checkHoldingRegisterGrowatt(this.holdingRegisters, client);

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

module.exports = MyGrowattBattery;
