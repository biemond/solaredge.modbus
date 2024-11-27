import * as Modbus from 'jsmodbus';
import net from 'net';
import {checkHoldingRegisterHuawei} from '../response';
import { Huawei } from '../huawei';
import Homey, { Device } from 'homey';

const RETRY_INTERVAL = 180 * 1000; 

class MyHuaweiDoubleDeviceBattery extends Huawei {
  timer!: NodeJS.Timer;  
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyHuaweiDoubleDeviceBattery has been initialized');

    let name = this.getData().id;
    this.log("s-dongle device name id " + name );
    this.log("s-dongle device name " + this.getName());

    this.pollInvertor();

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor();
    }, RETRY_INTERVAL);

    let controlActionStorageWorkingModeSettings = this.homey.flow.getActionCard('storage_working_mode_settings');
    controlActionStorageWorkingModeSettings.registerRunListener(async (args, state) => {
      await this.updateControl('storage_working_mode_settings', args.deviceid, Number(args.mode), args.device);
    });

    let controlActionRemoteChargeDischargeControlMode = this.homey.flow.getActionCard('remote_charge_discharge_control_mode');
    controlActionRemoteChargeDischargeControlMode.registerRunListener(async (args, state) => {
      await this.updateControl('remote_charge_discharge_control_mode', args.deviceid, Number(args.mode), args.device);
    });

    let controlActionStorageForceChargeDischarge = this.homey.flow.getActionCard('storage_force_charge_discharge2');
    controlActionStorageForceChargeDischarge.registerRunListener(async (args, state) => {
      await this.updateControl('storage_force_charge_discharge', args.deviceid, Number(args.mode), args.device);
    });

    let controlActionActivepowerControlmode = this.homey.flow.getActionCard('activepower_controlmode');
    controlActionActivepowerControlmode.registerRunListener(async (args, state) => {
      await this.updateControl('activepower_controlmode', args.deviceid, Number(args.mode), args.device);
    });
    
    let controlActionStorageExcessPvEnergyUseInTou = this.homey.flow.getActionCard('storage_excess_pv_energy_use_in_tou');
    controlActionStorageExcessPvEnergyUseInTou.registerRunListener(async (args, state) => {
      await this.updateControl('storage_excess_pv_energy_use_in_tou', args.deviceid, Number(args.mode), args.device);
    });    


  }

  async updateControl(type: string, deviceid: number, value: number, device: Homey.Device) {

    let name = device.getData().id;
    this.log("device name id " + name );
    this.log("device name " + device.getName());    
    let socket = new net.Socket();

    let client = new Modbus.client.TCP(socket, deviceid, 5500); 

    let modbusOptions = {
      'host': device.getSetting('address'),
      'port': device.getSetting('port'),
      'timeout': 25,
      'autoReconnect': false,
      'logLabel': 'huawei Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }    


    socket.setKeepAlive(false); 
    socket.connect(modbusOptions);
    console.log(modbusOptions);
    
    socket.on('connect', async () => {
      console.log('Connected ...');
      await this.delay(5000);
      if (type == 'storage_excess_pv_energy_use_in_tou') {
        const storage_excess_pvRes = await client.writeSingleRegister(47299, value);
        console.log('storage_excess_pv_energy_use_in_tou', storage_excess_pvRes);
      }
 
      if (type == 'storage_force_charge_discharge') {
        const storage_forceRes = await client.writeSingleRegister(47100, value);
        console.log('storage_force_charge_discharge', storage_forceRes);
      }     

      if (type == 'activepower_controlmode') {
        const activepowerRes = await client.writeSingleRegister(47415, value);
        console.log('activepower_controlmode', activepowerRes);
      }  

      if (type == 'remote_charge_discharge_control_mode') {
        const controlmodeRes = await client.writeSingleRegister(47589, value);
        console.log('remote_charge_discharge_control_mode', controlmodeRes);
      } 
      
      if (type == 'storage_working_mode_settings') {
        const storageworkingmodesettingsRes = await client.writeSingleRegister(47086, value);
        console.log('storage_working_mode_settings', storageworkingmodesettingsRes);
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
      setTimeout(() => socket.connect(modbusOptions), 12000);
    })
  }



  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyHuaweiDeviceBattery has been added');
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
    this.log('MyHuaweiDoubleDeviceBattery settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyHuaweiDoubleDeviceBattery was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyHuaweiDoubleDeviceBattery has been deleted');
    this.homey.clearInterval(this.timer);
  }

  delay(ms: any) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async pollInvertor() {
    this.log("pollInvertor");
    this.log(this.getSetting('address'));

    let modbusOptions = {
      'host': this.getSetting('address'),
      'port': this.getSetting('port'),
      'timeout': 175,
      'autoReconnect': false,
      'logLabel' : 'huawei sdongle Inverter Battery',
      'logLevel': 'error',
      'logEnabled': true
    }    

    let socket = new net.Socket();
    this.log(this.getSettings());
    const unitID = this.getSetting('id');
    const unitID2 = this.getSetting('id2');
    const client  = new Modbus.client.TCP(socket, unitID,  5500);
    const client2 = new Modbus.client.TCP(socket, unitID2, 5500);

    socket.setKeepAlive(true);
    socket.connect(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected s-dongle...');
      console.log(modbusOptions);
      const startTime = new Date();
      await this.delay(5000);
      console.log('Retrieving unit: ' + unitID);
      const checkRegisterRes = await checkHoldingRegisterHuawei(this.holdingRegisters, client);
      let checkBatteryRes = {}
      let checkMetersRes = {}
      if (this.getSetting('has_battery') == true){
        checkBatteryRes = await checkHoldingRegisterHuawei(this.holdingRegistersBattery, client);
        checkMetersRes = await checkHoldingRegisterHuawei(this.holdingRegistersMeters, client);
      }
      await this.delay(10000);
      console.log('Retrieving unit: ' + unitID2);
      const checkRegisterRes2 = await checkHoldingRegisterHuawei(this.holdingRegisters, client2);
      let checkBatteryRes2 = {}
      let checkMetersRes2 = {}
      if (this.getSetting('has_battery2') == true){
        checkBatteryRes2 = await checkHoldingRegisterHuawei(this.holdingRegistersBattery, client2);
        checkMetersRes2 = await checkHoldingRegisterHuawei(this.holdingRegistersMeters, client2);
      }
      console.log('Disconnect s-dongle...'); 
      client.socket.end();
      socket.end();

      let finalRes = { ...checkRegisterRes }
      if (this.getSetting('has_battery') == true){
        finalRes = { ...checkRegisterRes, ...checkBatteryRes, ...checkMetersRes }
      }  else {
        this.removeCapability('battery');
        this.removeCapability('measure_battery');     
        this.removeCapability('measure_power.grid_active_power'); 
        this.removeCapability('measure_power.batt_charge');
        this.removeCapability('measure_power.batt_discharge');   
        this.removeCapability('measure_power.grid_phase1');
        this.removeCapability('measure_power.grid_phase2');   
        this.removeCapability('measure_power.grid_phase3');

        this.removeCapability('storage_excess_pv_energy_use_in_tou');     
        this.removeCapability('storage_force_charge_discharge'); 
        this.removeCapability('activepower_controlmode');
        this.removeCapability('remote_charge_discharge_control_mode');   
        this.removeCapability('storage_working_mode_settings');
        this.removeCapability('measure_power.chargesetting');   
        this.removeCapability('measure_power.dischargesetting');
      }
      this.processResult(finalRes,true);

      let  finalRes2 = { ...checkRegisterRes2 };
      if (this.getSetting('has_battery2') == true){
        finalRes2 = { ...checkRegisterRes2, ...checkBatteryRes2, ...checkMetersRes2 };
      } else {
        this.removeCapability('battery2');
        this.removeCapability('measure_power.grid_active_power2');
        this.removeCapability('measure_power.batt_charge2');
        this.removeCapability('measure_power.batt_discharge2');   
        this.removeCapability('measure_power.grid_phase1_2');
        this.removeCapability('measure_power.grid_phase2_2');   
        this.removeCapability('measure_power.grid_phase3_2');

        this.removeCapability('storage_excess_pv_energy_use_in_tou2');     
        this.removeCapability('storage_force_charge_discharge3'); 
        this.removeCapability('activepower_controlmode2');
        this.removeCapability('remote_charge_discharge_control_mode2');   
        this.removeCapability('storage_working_mode_settings2');
        this.removeCapability('measure_power.chargesetting2');   
        this.removeCapability('measure_power.dischargesetting2');

      }
      this.processResult2(finalRes2);


      this.addCapability('measure_power');
      var inputPower  = Number(checkRegisterRes['inputPower'].value) *  (Math.pow(10, Number(checkRegisterRes['inputPower'].scale)));
      var inputPower2 = Number(checkRegisterRes2['inputPower'].value) * (Math.pow(10, Number(checkRegisterRes2['inputPower'].scale)));
      this.setCapabilityValue('measure_power', inputPower + inputPower2);

      const endTime = new Date();
      const timeDiff = endTime.getTime() - startTime.getTime();
      let seconds = Math.floor(timeDiff / 1000);
      console.log("total time: " +seconds + " seconds");
    });    

    socket.on('close', () => {
      console.log('Client s-dongle closed');
    });  

    socket.on('timeout', () => {
      console.log('s-dongle socket timed out!');
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

module.exports = MyHuaweiDoubleDeviceBattery;
