import * as Modbus from 'jsmodbus';
import net from 'net';
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

    // flow action 
    let exportEnabledAction = this.homey.flow.getActionCard('exportlimitenabled');
    exportEnabledAction.registerRunListener(async (args, state) => {
      await this.updateControl('exportlimitenabled', Number(args.mode));
    });

    let exportlimitpowerrateAction = this.homey.flow.getActionCard('exportlimitpowerrate');
    exportlimitpowerrateAction.registerRunListener(async (args, state) => {
      await this.updateControl('exportlimitpowerrate', args.percentage);
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

    // flow action 
    let solarchargeStatus = this.homey.flow.getConditionCard("solarcharge");
    solarchargeStatus.registerRunListener(async (args, state) => {
        let result = (await this.getCapabilityValue('measure_power') >= args.charging);
        return Promise.resolve(result);
    })  

    // // flow conditions
    // let changedStatus = this.homey.flow.getConditionCard("changedStatus");
    // changedStatus.registerRunListener(async (args, state) => {
    //   let result = (await this.getCapabilityValue('invertorstatus') == args.argument_main);
    //   return Promise.resolve(result);
    // })  

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
      'timeout': 15,
      'autoReconnect': false,
      'logLabel' : 'Growatt Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }    

    let socket = new net.Socket();
    var unitID = this.getSetting('id');
    let client = new Modbus.client.TCP(socket, unitID);
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

module.exports = MyGrowattBattery;
