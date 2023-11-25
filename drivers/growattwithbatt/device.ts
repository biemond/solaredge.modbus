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

    let battmaxsocAction = this.homey.flow.getActionCard('battery_maximum_capacity');
    battmaxsocAction.registerRunListener(async (args, state) => {
      await this.updateControl('battmaxsoc', Number(args.percentage));
    });

    let battminsocAction = this.homey.flow.getActionCard('battery_minimum_capacity');
    battminsocAction.registerRunListener(async (args, state) => {
      await this.updateControl('battminsoc', args.percentage);
    });
    
    let prioritychangeAction = this.homey.flow.getActionCard('prioritymode');
    prioritychangeAction.registerRunListener(async (args, state) => {
      await this.updateControl('prioritymode', Number(args.mode));
    });

    let battacchargeswitchAction = this.homey.flow.getActionCard('battacchargeswitch');
    battacchargeswitchAction.registerRunListener(async (args, state) => {
      await this.updateControl('battacchargeswitch', Number(args.mode));
    });

    let battfirsttime1Action = this.homey.flow.getActionCard('battfirsttime1');
    battfirsttime1Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('battfirsttime1', Number(args.hourstart),Number(args.minstart) ,Number(args.hourstop) ,Number(args.minstop) , args.active );
    });
    let gridfirsttime1Action = this.homey.flow.getActionCard('gridfirsttime1');
    gridfirsttime1Action.registerRunListener(async (args, state) => {
      await this.updateControlProfile('gridfirsttime1', Number(args.hourstart),Number(args.minstart) ,Number(args.hourstop) ,Number(args.minstop) , args.active );
    });
    // let loadfirsttime1Action = this.homey.flow.getActionCard('loadfirsttime1');
    // loadfirsttime1Action.registerRunListener(async (args, state) => {
    //   await this.updateControlProfile('loadfirsttime1', Number(args.hourstart),Number(args.minstart) ,Number(args.hourstop) ,Number(args.minstop) , args.active );
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

      if (type == 'prioritymode') {
        console.log('prioritymode value: ' + value);
        const prioritychangeRes = await client.writeSingleRegister(1044, value);
        console.log('prioritymode', prioritychangeRes);
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

  async updateControlProfile(type: string, hourstart: number, minstart: number, hourstop: number, minstop: number, enabled: string) {
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
      let startRegister = 0;
      let stopRegister = 0;
      let enabledRegister = 0;
      if (type == 'battfirsttime1') {
        // "battfirststarttime1": [1100, 1, 'UINT16', "Battery First Start Time", 0],
        // "battfirststoptime1": [1101, 1, 'UINT16', "Battery First Stop Time", 0],
        // "battfirststopswitch1": [1102, 1, 'UINT16', "Battery First Stop Switch 1", 0],
        startRegister = 1100
        stopRegister = 1101
        enabledRegister = 1102
      }

      if (type == 'gridfirsttime1') {
        // "gridfirststarttime1": [1080, 1, 'UINT16', "Grid First Start Time", 0],
        // "gridfirststoptime1": [1081, 1, 'UINT16', "Grid First Stop Time", 0],
        // "gridfirststopswitch1": [1082, 1, 'UINT16', "Grid First Stop Switch 1", 0],
        startRegister = 1080
        stopRegister = 1081
        enabledRegister = 1082
      }

      if (type == 'loadfirsttime1') {
        // "loadfirststarttime1": [1110, 1, 'UINT16', "Load First Start Time", 0],
        // "loadfirststoptime1": [1111, 1, 'UINT16', "Load First Stop Time", 0],
        // "loadfirststopswitch1": [1112, 1, 'UINT16', "Load First Stop Switch 1", 0]
        startRegister = 1110
        stopRegister = 1111
        enabledRegister = 1112
      }      
      if ( hourstart == 0 && minstart == 0 ) {
        minstart = 1;
      }
      let start  =  (hourstart * 256) + minstart;
      const startRes = await client.writeSingleRegister(startRegister, start);
      console.log('start', startRes);
      let stop  =  (hourstop * 256) + minstop;   
      const stopRes = await client.writeSingleRegister(stopRegister, stop);
      console.log('stop', stopRes);             
      // 0 – Disabled
      // 1 – Enabled
      if (enabled == "1") {
        const enabledRes = await client.writeSingleRegister(enabledRegister, Number(1));
        console.log('timeenabled', enabledRes);
      } else if (enabled == "0") {
        const enabledRes = await client.writeSingleRegister(enabledRegister, Number(0));
        console.log('timeenabled', enabledRes);
      } else {
        console.log('timeenabled unknown value: ' + enabled);
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
      'timeout': 22,
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
