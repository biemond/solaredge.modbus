import * as Modbus from 'jsmodbus';
import * as net from 'net';
import moment from 'moment-timezone';
/* eslint-disable node/no-missing-import */
import { checkRegisterGrowatt, checkHoldingRegisterGrowatt } from '../response';
import { Growatt } from '../growatt';
/* eslint-enable node/no-missing-import */

const RETRY_INTERVAL = 28 * 1000;

class MyGrowattBattery extends Growatt {
  timer!: NodeJS.Timer;
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyGrowattBattery has been initialized');

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
      const result = Number(await args.device.getCapabilityValue('priority')) === Number(args.priority);
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

    const exportlimitpowerrateAction = this.homey.flow.getActionCard('exportlimitpowerrate');
    exportlimitpowerrateAction.registerRunListener(async (args, state) => {
      await this.updateControl('exportlimitpowerrate', args.percentage);
    });

    const battmaxsocAction = this.homey.flow.getActionCard('battery_maximum_capacity');
    battmaxsocAction.registerRunListener(async (args, state) => {
      await this.updateControl('batterymaxsoc', Number(args.percentage));
    });

    const battminsocAction = this.homey.flow.getActionCard('battery_minimum_capacity');
    battminsocAction.registerRunListener(async (args, state) => {
      await this.updateControl('batteryminsoc', args.percentage);
    });

    const battminsocLFAction = this.homey.flow.getActionCard('battery_min_cap_load_first');
    battminsocLFAction.registerRunListener(async (args, state) => {
      await this.updateControl('batteryminsoclf', args.percentage);
    });

    const dischargeRateAction = this.homey.flow.getActionCard('discharge_rate_grid_first');
    dischargeRateAction.registerRunListener(async (args, state) => {
      await this.updateControl('gfdischargerate', args.percentage);
    });

    const chargeRateAction = this.homey.flow.getActionCard('charge_rate_batt_first');
    chargeRateAction.registerRunListener(async (args, state) => {
      await this.updateControl('bfchargerate', args.percentage);
    });

    const prioritychangeAction = this.homey.flow.getActionCard('prioritymode');
    prioritychangeAction.registerRunListener(async (args, state) => {
      await this.updateControl('priority', Number(args.mode));
    });

    const battacchargeswitchAction = this.homey.flow.getActionCard('battacchargeswitch');
    battacchargeswitchAction.registerRunListener(async (args, state) => {
      await this.updateControl('battacchargeswitch', Number(args.mode));
    });

    const clocksyncAction = this.homey.flow.getActionCard('timesync');
    clocksyncAction.registerRunListener(async (args, state) => {
      await this.updateControl('timesync', Number(args.syncdate));
    });

    const battFirstAction = this.homey.flow.getActionCard('batt_first_for_interval_with_percentage');
    battFirstAction.registerRunListener(async (args, state) => {
      await this.updateControlPrio('batfirstrate', Number(args.hours), Number(args.percentage), Number(args.soc), Number(args.accharge));
    });

    const gridFirstAction = this.homey.flow.getActionCard('grid_first_for_interval_with_percentage');
    gridFirstAction.registerRunListener(async (args, state) => {
      await this.updateControlPrio('gridfirstrate', Number(args.hours), Number(args.percentage), Number(args.soc), 0);
    });

    const battfirsttime1Action = this.homey.flow.getActionCard('battfirsttime1');
    battfirsttime1Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('battfirst1', args.starttime, args.stoptime, Number(args.active));
    });
    const battfirsttime2Action = this.homey.flow.getActionCard('battfirsttime2');
    battfirsttime2Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('battfirst2', args.starttime, args.stoptime, Number(args.active));
    });
    const battfirsttime3Action = this.homey.flow.getActionCard('battfirsttime3');
    battfirsttime3Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('battfirst3', args.starttime, args.stoptime, Number(args.active));
    });

    const gridfirsttime1Action = this.homey.flow.getActionCard('gridfirsttime1');
    gridfirsttime1Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('gridfirst1', args.starttime, args.stoptime, Number(args.active));
    });
    const gridfirsttime2Action = this.homey.flow.getActionCard('gridfirsttime2');
    gridfirsttime2Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('gridfirst2', args.starttime, args.stoptime, Number(args.active));
    });
    const gridfirsttime3Action = this.homey.flow.getActionCard('gridfirsttime3');
    gridfirsttime3Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('gridfirst3', args.starttime, args.stoptime, Number(args.active));
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
    if (this.hasCapability('gridfirst2') === false) {
      await this.addCapability('gridfirst2');
    }
    if (this.hasCapability('gridfirst3') === false) {
      await this.addCapability('gridfirst3');
    }
    if (this.hasCapability('battfirst1') === false) {
      await this.addCapability('battfirst1');
    }
    if (this.hasCapability('battfirst2') === false) {
      await this.addCapability('battfirst2');
    }
    if (this.hasCapability('battfirst3') === false) {
      await this.addCapability('battfirst3');
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
    this.log('MyGrowattBattery was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyGrowattBattery has been deleted');
    this.homey.clearInterval(this.timer);
  }

  delay(ms: number) {
    return new Promise((resolve) => this.homey.setTimeout(resolve, ms));
  }

  private getRegisterAddressForCapability(capability: string): number | undefined {
    const result = this.getMappingAndRegister(capability, this.holdingRegisters);
    if (!result) return undefined;
    return result.registerDefinition[0];
  }

  private processRegisterValue(capability: string, registerValue: number): number | null {
    return this.processRegisterValueCommon(capability, registerValue, this.holdingRegisters);
  }

  async updateControl(type: string, value: number) {
    const socket = new net.Socket();
    const unitID = this.getSetting('id');
    const client = new Modbus.client.TCP(socket, unitID);

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
        switch (type) {
          case 'priority': {
            this.log(`prioritymode value: ${value}`);
            const limit = Number(this.getCapabilityValue('exportlimitenabled'));
            this.log('export limit is:', limit);
            // All slot registers start with gridfirst1starttime
            const startRegister = this.holdingRegisters['gridfirst1starttime'][0];
            res = client.readHoldingRegisters(startRegister, 29);
            const actualRes = await res;
            await this.delay(850); // Growatt needs at least 850ms between commands
            const registers = actualRes.response.body.valuesAsArray;

            switch (value) {
              case 0:
                // disable all time slots, to enforce Load First
                if (limit === 0) {
                  // eslint-disable-next-line no-multi-assign
                  registers[2] = registers[5] = registers[8] = registers[22] = registers[25] = registers[28] = 0;
                } else {
                  // eslint-disable-next-line no-multi-assign
                  registers[22] = registers[25] = registers[28] = 0;
                }
                this.log('prioritymode Load First: all time slots for Batt&Grid set to disabled');
                break;
              case 1:
                // set Battery First slot#1 to enabled / 00:00-23:59
                registers[20] = 0; // 1100->00:00
                registers[21] = 5947; // 1101->23:59
                registers[22] = 1; // 1102->enabled
                // disable all other slots
                if (limit === 0) {
                  // eslint-disable-next-line no-multi-assign
                  registers[2] = registers[5] = registers[8] = registers[25] = registers[28] = 0;
                } else {
                  // eslint-disable-next-line no-multi-assign
                  registers[25] = registers[28] = 0;
                }
                this.log('prioritymode Batt First: slot#1 is enabled and set to 00:00-23:59');
                break;
              case 2:
                if (limit === 0) {
                  // set Grid First slot#1 to enabled / 00:00-23:59
                  registers[0] = 0; // 1080->00:00
                  registers[1] = 5947; // 1081->23:59
                  registers[2] = 1; // 1082->enabled
                  // disable all other slots
                  // eslint-disable-next-line no-multi-assign
                  registers[5] = registers[8] = registers[22] = registers[25] = registers[28] = 0;
                  this.log('prioritymode Grid First: slot#1 is enabled and set to 00:00-23:59');
                } else {
                  this.log('prioritymode Grid First: not possible, export limit is enabled');
                }
                break;
              default:
                this.log(`prioritymode unknown value: ${value}`);
            }

            const setData: number[] = Array.from(registers);
            if (limit === 0) {
              res = await client.writeMultipleRegisters(startRegister, setData);
            } else if (value !== 2) {
              // export limit is enabled, only write Batt First registers
              const modifiedSetData = setData.slice(20, 29);
              res = await client.writeMultipleRegisters(startRegister + 20, modifiedSetData);
            } else {
              res = 'Grid First: not possible, export limit is enabled';
            }
            this.log('prioritymode', res);
            // Update the changed capabilities value
            const typedValue = this.castToCapabilityType(type, value);
            this.log(`typeof typedValue: ${typeof typedValue}, value:`, typedValue);
            await Promise.all([
              this.setCapabilityValue(type, typedValue),
              this.setCapabilityValue('gridfirst1', this.getSlotCapabilityValue(setData[0], setData[1], setData[2])),
              this.setCapabilityValue('gridfirst2', this.getSlotCapabilityValue(setData[3], setData[4], setData[5])),
              this.setCapabilityValue('gridfirst3', this.getSlotCapabilityValue(setData[6], setData[7], setData[8])),
              this.setCapabilityValue('battfirst1', this.getSlotCapabilityValue(setData[20], setData[21], setData[22])),
              this.setCapabilityValue('battfirst2', this.getSlotCapabilityValue(setData[23], setData[24], setData[25])),
              this.setCapabilityValue('battfirst3', this.getSlotCapabilityValue(setData[26], setData[27], setData[28])),
            ]);
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
              res = await client.writeSingleRegister(registerAddress, regValue);
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

  async updateControlProfile(type: string, startTime: string, stopTime: string, active: number) {
    const socket = new net.Socket();
    const unitID = this.getSetting('id');
    const client = new Modbus.client.TCP(socket, unitID, 500);

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
        const limit = Number(this.getCapabilityValue('exportlimitenabled'));
        const startRegister = this.holdingRegisters[`${type}starttime`]?.[0];
        if (startRegister === undefined) {
          this.log(`${type}starttime register mapping not found`);
          return;
        }
        this.log(`${type} start register: ${startRegister}`);
        if (limit === 1 && startRegister < 1100) {
          this.log('export limit is enabled, cannot change grid first time slot');
        } else {
          // Parse startTime and stopTime in "HH:MM" format
          const [hourstart, minstart] = startTime.split(':').map(Number);
          const [hourstop, minstop] = stopTime.split(':').map(Number);
          // any slot has the same structure: start time, stop time, enabled status
          const setData: number[] = [(hourstart << 8) + minstart, (hourstop << 8) + minstop, active];
          const res = await client.writeMultipleRegisters(startRegister, setData);
          this.log(type, res);
          await this.setCapabilityValue(type, this.getSlotCapabilityValue(setData[0], setData[1], setData[2]));
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

  async updateControlPrio(type: string, hours: number, percentage: number, soc: number, ac: number) {
    const socket = new net.Socket();
    const unitID = this.getSetting('id');
    const client = new Modbus.client.TCP(socket, unitID, 500);

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

    // Set start registers for all slots
    const startRegister = this.holdingRegisters[type]?.[0];
    if (startRegister === undefined) {
      this.log(`${type} register mapping not found`);
      return;
    }

    const minutesToAdd = Math.round((hours * 60) / 15) * 15 - 1;
    const now = moment().tz(this.homey.clock.getTimezone());
    const end = now.clone().add(minutesToAdd, 'minutes');
    const startTime = (now.hours() << 8) + now.minutes();
    let endTime = 0;
    // if end time is not today, set to 23:59
    if (end.date() !== now.date()) {
      endTime = 5947; // 23:59
    } else {
      endTime = (end.hours() << 8) + (end.minutes());
    }

    socket.on('connect', () => {
      (async () => {
        this.log('Connected ...');
        const registers: number[] = Array(13).fill(0);
        registers[0] = percentage; // Charge/discharge rate limit
        registers[1] = soc; // SOC limit
        if (type === 'batfirstrate') {
          registers[2] = ac;
        } // Battery First AC charge enable
        registers[10] = startTime; // Slot start time
        registers[11] = endTime; // Slot stop time
        registers[12] = 1; // Slot enabled
        const res = await client.writeMultipleRegisters(startRegister, registers);
        this.log('prioritychange', res);
        if (type === 'gridfirstrate') {
          await Promise.all([
            this.setCapabilityValue('gfdischargerate', percentage),
            this.setCapabilityValue('batteryminsoc', soc),
            this.setCapabilityValue('gridfirst1', this.getSlotCapabilityValue(startTime, endTime, 1)),
            this.setCapabilityValue('priority', '2'),
          ]);
        } else {
          await Promise.all([
            this.setCapabilityValue('bfchargerate', percentage),
            this.setCapabilityValue('batterymaxsoc', soc),
            this.setCapabilityValue('battacchargeswitch', String(ac)),
            this.setCapabilityValue('battfirst1', this.getSlotCapabilityValue(startTime, endTime, 1)),
            this.setCapabilityValue('priority', '1'),
          ]);
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

        const checkRegisterRes = await checkRegisterGrowatt(this.registers, client);
        const checkHoldingRegisterRes = await checkHoldingRegisterGrowatt(this.holdingRegisters, client);

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

module.exports = MyGrowattBattery;
