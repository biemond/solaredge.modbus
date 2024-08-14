import * as Modbus from 'jsmodbus';
import net from 'net';
import {checkHoldingRegisterWattsonic} from '../response';
import { Wattsonic } from '../wattsonic';

const RETRY_INTERVAL = 28 * 1000; 

class MyWattsonicBatteryDevice extends Wattsonic {
  timer!: NodeJS.Timer;  
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyWattsonicBatteryDevice has been initialized');

    let name = this.getData().id;
    this.log("device name id " + name );
    this.log("device name " + this.getName());

    this.pollInvertor();

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor();
    }, RETRY_INTERVAL);

    this.registerCapabilityListener('hybridinvertermode', async (value) => {
      this.updateControl('hybridinvertermode', value);
      return value;
    });    

    let controlAction = this.homey.flow.getActionCard('hybridinvertermode');
    controlAction.registerRunListener(async (args, state) => {
      await this.updateControl('hybridinvertermode', args.mode);
    });

    let batterylevelStatus = this.homey.flow.getConditionCard("batterylevelWattsonic");
    batterylevelStatus.registerRunListener(async (args, state) => {
      let result = (await args.device.getCapabilityValue('measure_battery') >= args.charged);
      return Promise.resolve(result);
    })

  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyWattsonicBatteryDevice has been added');
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
    this.log('MyWattsonicBatteryDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyWattsonicBatteryDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyWattsonicBatteryDevice has been deleted');
    this.homey.clearInterval(this.timer);
  }

  async updateControl(type: string, value: string) {
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

      if (type == 'hybridinvertermode') {
        if (value == '11' || value == '12' || value == '13' || value == '31' || value == '32' || value == '33' || value == '34' ) {
          let high = Number(value.charAt(0));
          let low = Number(value.charAt(1));          
          let modevalue  =  (high * 256) + low;
          const hybridinvertermodeRes = await client.writeSingleRegister(50000, Number(modevalue));
          console.log('hybridinvertermode', hybridinvertermodeRes);
          console.log('hybridinvertermode', Number(modevalue));
        } else if (value == '2') {
          let modevalue  =  (2 * 256);
          const hybridinvertermodeRes = await client.writeSingleRegister(50000, Number(modevalue));
          console.log('hybridinvertermode', Number(modevalue));
          console.log('hybridinvertermode', hybridinvertermodeRes);
        } else {
          console.log('hybridinvertermode unknown value: ' + value);
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
      'timeout': 22,
      'autoReconnect': false,
      'logLabel' : 'wattsonic Inverter',
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

      const checkRegisterRes = await checkHoldingRegisterWattsonic(this.holdingRegistersBattery, client);
      console.log('disconnect'); 
      client.socket.end();
      socket.end();
      const finalRes = {...checkRegisterRes}
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

module.exports = MyWattsonicBatteryDevice;
