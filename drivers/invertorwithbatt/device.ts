import * as Modbus from 'jsmodbus';
import net from 'net';
import { Solaredge } from '../solaredge';
import { checkRegister } from '../response';
import { checkMeter } from '../response';
import { checkBattery } from '../response';

const RETRY_INTERVAL = 45 * 1000;

class MySolaredgeBatteryDevice extends Solaredge {

  /**
   * onInit is called when the device is initialized.
   */
  timer!: NodeJS.Timer;    

  async onInit() {
    this.log('MySolaredgeBatteryDevice has been initialized');

    let name = this.getData().id;
    this.log("device name id " + name);
    this.log("device name " + this.getName());

    this.pollInvertor();

    this.timer = this.homey.setInterval(() => {
      // poll device state from invertor
      this.pollInvertor();
    }, RETRY_INTERVAL);

    // homey menu / device actions
    this.registerCapabilityListener('storagecontrolmode', async (value) => {
      this.updateControl('storagecontrolmode', Number(value));
      return value;
    });
    this.registerCapabilityListener('storagedefaultmode', async (value) => {
      this.updateControl('storagedefaultmode', Number(value));
      return value;
    });
    this.registerCapabilityListener('limitcontrolmode', async (value) => {
      this.updateControl('limitcontrolmode', Number(value));
      return value;
    });


    // flow action 
    let controlAction = this.homey.flow.getActionCard('storagecontrolmode');
    controlAction.registerRunListener(async (args, state) => {
      await this.updateControl('storagecontrolmode', Number(args.mode));
    });
    let customModeAction = this.homey.flow.getActionCard('storagedefaultmode');
    customModeAction.registerRunListener(async (args, state) => {
      await this.updateControl('storagedefaultmode', Number(args.mode));
    });
    let chargeLimitAction = this.homey.flow.getActionCard('setcharging');
    chargeLimitAction.registerRunListener(async (args, state) => {
      await this.updateControl('chargelimit', Number(args.chargepower));
    });
    let dischargeLimitAction = this.homey.flow.getActionCard('setdischarging');
    dischargeLimitAction.registerRunListener(async (args, state) => {
      await this.updateControl('dischargelimit', Number(args.dischargepower));
    });

    // flow conditions
    let changedStatus = this.homey.flow.getConditionCard("changedStatus");
    changedStatus.registerRunListener(async (args, state) => {
      let result = (await this.getCapabilityValue('invertorstatus') == args.argument_main);
      return Promise.resolve(result);
    })

    let changedBatteryStatus = this.homey.flow.getConditionCard("changedBatteryStatus");
    changedBatteryStatus.registerRunListener(async (args, state) => {
      let result = (await this.getCapabilityValue('battstatus') == args.argument_main);
      return Promise.resolve(result);
    })

    let batterylevelStatus = this.homey.flow.getConditionCard("batterylevel");
    batterylevelStatus.registerRunListener(async (args, state) => {
      let result = (await this.getCapabilityValue('measure_battery') >= args.charged);
      return Promise.resolve(result);
    })

    let batterychargeStatus = this.homey.flow.getConditionCard("batterycharge");
    batterychargeStatus.registerRunListener(async (args, state) => {
      let result = (await this.getCapabilityValue('measure_power.batt_charge') >= args.charging);
      return Promise.resolve(result);
    })

    let batterydischargeStatus = this.homey.flow.getConditionCard("batterydischarge");
    batterydischargeStatus.registerRunListener(async (args, state) => {
      let result = (await this.getCapabilityValue('measure_power.batt_discharge') >= args.discharging);
      return Promise.resolve(result);
    })

    let solarbattchargeStatus = this.homey.flow.getConditionCard("solarbattcharge");
    solarbattchargeStatus.registerRunListener(async (args, state) => {
      let result = (await this.getCapabilityValue('measure_power') >= args.charging);
      return Promise.resolve(result);
    })

    let gridimportStatus = this.homey.flow.getConditionCard("gridimport");
    gridimportStatus.registerRunListener(async (args, state) => {
      let result = (await this.getCapabilityValue('measure_power.import') >= args.import);
      return Promise.resolve(result);
    })

    let gridexportStatus = this.homey.flow.getConditionCard("gridexport");
    gridexportStatus.registerRunListener(async (args, state) => {
      let result = (await this.getCapabilityValue('measure_power.export') >= args.export);
      return Promise.resolve(result);
    })
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MySolaredgeBatteryDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings: { }, newSettings: { }, changedKeys: { } }): Promise<string | void> {
    this.log('MySolaredgeBatteryDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MySolaredgeBatteryDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MySolaredgeBatteryDevice has been deleted');
    this.homey.clearInterval(this.timer);
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
      'logLabel': 'solaredge Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }

    socket.setKeepAlive(false); 
    socket.connect(modbusOptions);
    console.log(modbusOptions);
    socket.on('connect', async () => {
      console.log('Connected ...');
      if (type == 'chargelimit') {
        var chargehex1 = 16384;
        var chargehex2 = 17820;
        //chargepower
        if (value == 500) {
          chargehex1 =  0;
          chargehex2 =  17402;
        } else if (value == 1000) {
          chargehex1 =  0;
          chargehex2 =  17530;
        }  else if (value == 1500) {
          chargehex1 =  32768;
          chargehex2 =  17596;
        } else if (value == 2000) {
          chargehex1 = 0;
          chargehex2 = 17658;
        } else if (value == 2500) {
          chargehex1 =  16384;
          chargehex2 =  17692;
        } else if (value == 3000) {
          chargehex1 =  32768;
          chargehex2 =  17723;
        } else if (value == 4000) {
          chargehex1 =  0;
          chargehex2 =  17786;
        } else if (value == 5000) {
          chargehex1 =  16384;
          chargehex2 =  17820;
        } else if (value == 6600) {
          chargehex1 =  16384;
          chargehex2 =  17870;
        }
        const chargeRes = await client.writeMultipleRegisters(0xe00e, [chargehex1, chargehex2]);
        console.log('charge', chargeRes);
      }
      
      if (type == 'dischargelimit') {
        var dischargehex1 = 16384;
        var dischargehex2 = 17820;
        //dischargepower
        if (value == 500) {
          dischargehex1 =  0;
          dischargehex2 =  17402;
        } else if (value == 1000) {
          dischargehex1 =  0;
          dischargehex2 =  17530;
        }  else if (value == 1500) {
          dischargehex1 =  32768;
          dischargehex2 =  17596;
        } else if (value == 2000) {
          dischargehex1 = 0;
          dischargehex2 = 17658;
        } else if (value == 2500) {
          dischargehex1 =  16384;
          dischargehex2 =  17692;
        } else if (value == 3000) {
          dischargehex1 =  32768;
          dischargehex2 =  17723;
        } else if (value == 4000) {
          dischargehex1 =  0;
          dischargehex2 =  17786;
        } else if (value == 5000) {
          dischargehex1 =  16384;
          dischargehex2 =  17820;
        }
        else if (value == 6600) {
          dischargehex1 =  16384;
          dischargehex2 =  17870;
        }
        const dischargeRes = await client.writeMultipleRegisters(0xe010, [dischargehex1, dischargehex2]);
        console.log('discharge', dischargeRes);        
      }

      if (type == 'limitcontrolmode') {
        // 0 – Disabled
        // 1 – Export Control
        // 2 – Production Control
        // 11 – Minimum Import Control
        if (value == 1) {
          const limitcontrolmodeeRes = await client.writeSingleRegister(0xe000, Number(1));
          console.log('limitcontrolmode', limitcontrolmodeeRes);
          // side = 0
          const limitcontrolsideRes = await client.writeSingleRegister(0xe001, Number(0));
          console.log('limitcontrolside', limitcontrolsideRes);
          // 5000
          const limitcontrolWattRes = await client.writeMultipleRegisters(0xe002, [ 16384, 17820]);
          console.log('limitcontrolwatt', limitcontrolWattRes);
        } else {
          const limitcontrolmodeeRes = await client.writeSingleRegister(0xe000, Number(0));
          console.log('limitcontrolmode', limitcontrolmodeeRes);
        }

      }

      if (type == 'storagecontrolmode') {
        // 0 – Disabled
        // 1 – Maximize Self Consumption – requires a SolarEdge Electricity meter on the grid or load connection point
        // 2 – Time of Use (Profile programming) – requires a SolarEdge Electricity meter on the grid or load connection point 3 – Backup Only (applicable only for systems support backup functionality)
        // 4 – Remote Control – the battery charge/discharge state is controlled by an external controller
        const storagecontrolmodeRes = await client.writeSingleRegister(0xe004, Number(value));
        console.log('controlmodewrite', storagecontrolmodeRes)
      }

      if (type == 'storagedefaultmode') {
        const storagedefaultmodeRes = await client.writeSingleRegister(0xe004, Number(4));
        console.log('controlmodewrite', storagedefaultmodeRes)

        // set timeout to 6 hours, done in seconds
        const remoteTimeout = await client.writeMultipleRegisters(0xe00b, [ Number(21600), 0 ]);
        console.log('remote_control_command_timeout', remoteTimeout);
        // 0 – Off
        // 1 – Charge excess PV power only.
        // Only PV excess power not going to AC is used for charging the battery. Inverter NominalActivePowerLimit (or the inverter rated power whichever is lower) sets how much power the inverter is producing to the AC. In this mode, the battery cannot be discharged. If the PV power is lower than NominalActivePowerLimit the AC production will be equal to the PV power.
        // 2 – Charge from PV first, before producing power to the AC.
        // The Battery charge has higher priority than AC production. First charge the battery then produce AC.
        // If StorageRemoteCtrl_ChargeLimit is lower than PV excess power goes to AC according to NominalActivePowerLimit. If NominalActivePowerLimit is reached and battery StorageRemoteCtrl_ChargeLimit is reached, PV power is curtailed.
        // 3 – Charge from PV+AC according to the max battery power.
        // Charge from both PV and AC with priority on PV power.
        // If PV production is lower than StorageRemoteCtrl_ChargeLimit, the battery will be charged from AC up to NominalActivePow-erLimit. In this case AC power = StorageRemoteCtrl_ChargeLimit- PVpower.
        // If PV power is larger than StorageRemoteCtrl_ChargeLimit the excess PV power will be directed to the AC up to the Nominal-ActivePowerLimit beyond which the PV is curtailed.
        // 4 – Maximize export – discharge battery to meet max inverter AC limit.
        // AC power is maintained to NominalActivePowerLimit, using PV power and/or battery power. If the PV power is not sufficient, battery power is used to complement AC power up to StorageRemoteCtrl_DishargeLimit. In this mode, charging excess power will occur if there is more PV than the AC limit.
        // 5 – Discharge to meet loads consumption. Discharging to the grid is not allowed. 
        // 7 – Maximize self-consumption
        const remotecontrolwrite = await client.writeSingleRegister(0xe00d, Number(value));
        console.log('remotecontrolwrite', remotecontrolwrite);
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

  async pollInvertor() {
    this.log("pollInvertor");
    this.log(this.getSetting('address'));

    function handleErrors(err: any) {
      console.log('Unknown Error', err);
    }

    function handleErrorsMeters(err: any) {
      console.log('No meter');
    }

    let modbusOptions = {
      'host': this.getSetting('address'),
      'port': this.getSetting('port'),
      'unitId': this.getSetting('id'),
      'timeout': 25,
      'autoReconnect': false,
      'logLabel': 'solaredge Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }

    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID);
    socket.setKeepAlive(false);  
    socket.connect(modbusOptions);
    console.log(modbusOptions);
    socket.on('connect', async () => {
      console.log('Connected ...');
      const checkRegisterRes = await checkRegister(this.registers, client);
      const checkMeterRes = await checkMeter(this.meter_dids, this.meter_registers, client);
      const checkBatteryRes = await checkBattery(this.battery_dids, this.batt_registers, client);
      console.log('disconnect');
      client.socket.end();
      socket.end();
      const finalRes = { ...checkRegisterRes, ...checkMeterRes, ...checkBatteryRes }
      this.processResult(finalRes)
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

module.exports = MySolaredgeBatteryDevice;
