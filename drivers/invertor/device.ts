import * as Modbus from 'jsmodbus';
import net from 'net';
import {Solaredge}     from '../solaredge';
import {checkRegister} from '../response';

const RETRY_INTERVAL = 18 * 1000; 
let timer:NodeJS.Timer;

class MySolaredgeDevice extends Solaredge {
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MySolaredgeDevice has been initialized');

    let name = this.getData().id;
    this.log("device name id " + name );
    this.log("device name " + this.getName());

    this.pollInvertor();

    timer = this.homey.setInterval(() => {
      // poll device state from invertor
      this.pollInvertor();
    }, RETRY_INTERVAL);


    // flow action 
    let solarchargeStatus = this.homey.flow.getConditionCard("solarcharge");
    solarchargeStatus.registerRunListener(async (args, state) => {
        let result = (await this.getCapabilityValue('measure_power') >= args.charging);
        return Promise.resolve(result);
    })  

  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MySolaredgeDevice has been added');
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
    this.log('MySolaredgeDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MySolaredgeDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MySolaredgeDevice has been deleted');
    this.homey.clearInterval(timer);
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
      'logLabel' : 'solaredge Inverter',
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

       const checkRegisterRes = await checkRegister(this.registers, client);
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
      socket.end();
    });

    socket.on('error', (err) => {
      console.log(err);
      socket.end();
    })
  }
}

module.exports = MySolaredgeDevice;
