import * as Modbus from 'jsmodbus';
import net from 'net';
import Homey, { Device } from 'homey';
import { checkHoldingRegisterHuawei } from '../response';
import { Huawei } from '../huawei';

const RETRY_INTERVAL = 120 * 1000;

class MyHuaweiDeviceBattery extends Huawei {
  timer!: NodeJS.Timer;
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyHuaweiDevice has been initialized');

    const name = this.getData().id;
    this.log(`device name id ${name}`);
    this.log(`device name ${this.getName()}`);

    this.pollInvertor();

    this.timer = this.homey.setInterval(() => {
      // poll device state from inverter
      this.pollInvertor();
    }, RETRY_INTERVAL);

    // homey menu / device actions
    this.registerCapabilityListener('storage_excess_pv_energy_use_in_tou', async (value) => {
      this.updateControl('storage_excess_pv_energy_use_in_tou', Number(value), this);
      return value;
    });
    this.registerCapabilityListener('storage_force_charge_discharge', async (value) => {
      this.updateControl('storage_force_charge_discharge', Number(value), this);
      return value;
    });
    this.registerCapabilityListener('activepower_controlmode', async (value) => {
      this.updateControl('activepower_controlmode', Number(value), this);
      return value;
    });
    this.registerCapabilityListener('remote_charge_discharge_control_mode', async (value) => {
      this.updateControl('remote_charge_discharge_control_mode', Number(value), this);
      return value;
    });

    this.registerCapabilityListener('storage_working_mode_settings', async (value) => {
      this.updateControl('storage_working_mode_settings', Number(value), this);
      return value;
    });

    const controlActionStorageWorkingModeSettings = this.homey.flow.getActionCard('storage_working_mode_settings_main');
    controlActionStorageWorkingModeSettings.registerRunListener(async (args, state) => {
      await this.updateControl('storage_working_mode_settings', Number(args.mode), args.device);
    });

    const controlActionRemoteChargeDischargeControlMode = this.homey.flow.getActionCard('remote_charge_discharge_control_mode_main');
    controlActionRemoteChargeDischargeControlMode.registerRunListener(async (args, state) => {
      await this.updateControl('remote_charge_discharge_control_mode', Number(args.mode), args.device);
    });

    const controlActionStorageForceChargeDischarge = this.homey.flow.getActionCard('storage_force_charge_discharge_main');
    controlActionStorageForceChargeDischarge.registerRunListener(async (args, state) => {
      await this.updateControl('storage_force_charge_discharge', Number(args.mode), args.device);
    });

    const controlActionActivepowerControlmode = this.homey.flow.getActionCard('activepower_controlmode_main');
    controlActionActivepowerControlmode.registerRunListener(async (args, state) => {
      await this.updateControl('activepower_controlmode', Number(args.mode), args.device);
    });

    const controlActionStorageExcessPvEnergyUseInTou = this.homey.flow.getActionCard('storage_excess_pv_energy_use_in_tou_main');
    controlActionStorageExcessPvEnergyUseInTou.registerRunListener(async (args, state) => {
      await this.updateControl('storage_excess_pv_energy_use_in_tou', Number(args.mode), args.device);
    });
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
  async onSettings({ oldSettings: {}, newSettings: {}, changedKeys: {} }): Promise<string | void> {
    this.log('MyHuaweiDeviceBattery settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyHuaweiDeviceBattery was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyHuaweiDeviceBattery has been deleted');
    this.homey.clearInterval(this.timer);
  }

  async updateControl(type: string, value: number, device: Homey.Device) {
    const socket = new net.Socket();
    const unitID = device.getSetting('id');

    const client = new Modbus.client.TCP(socket, unitID, 5500);

    const modbusOptions = {
      host: this.getSetting('address'),
      port: this.getSetting('port'),
      unitId: this.getSetting('id'),
      timeout: 45,
      autoReconnect: false,
      logLabel: 'huawei Inverter Battery',
      logLevel: 'error',
      logEnabled: true,
    };

    socket.setKeepAlive(false);
    socket.connect(modbusOptions);
    console.log(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');

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
    });

    socket.on('close', () => {
      console.log('Client closed');
    });

    socket.on('error', (err) => {
      console.log(err);
      socket.end();
      setTimeout(() => socket.connect(modbusOptions), 4000);
    });
  }

  delay(ms: any) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async pollInvertor() {
    this.log('pollInvertor');
    this.log(this.getSetting('address'));

    const modbusOptions = {
      host: this.getSetting('address'),
      port: this.getSetting('port'),
      unitId: this.getSetting('id'),
      timeout: 115,
      autoReconnect: false,
      logLabel: 'huawei Inverter Battery',
      logLevel: 'error',
      logEnabled: true,
    };

    const socket = new net.Socket();
    const unitID = this.getSetting('id');
    const client = new Modbus.client.TCP(socket, unitID, 5500);
    socket.setKeepAlive(false);
    socket.connect(modbusOptions);

    socket.on('connect', async () => {
      console.log('Connected ...');
      console.log(modbusOptions);
      const startTime = new Date();
      await this.delay(5000);

      const checkRegisterRes = await checkHoldingRegisterHuawei(this.holdingRegisters, client);
      const checkBatteryRes = await checkHoldingRegisterHuawei(this.holdingRegistersBattery, client);
      const checkMetersRes = await checkHoldingRegisterHuawei(this.holdingRegistersMeters, client);

      console.log('disconnect');
      client.socket.end();
      socket.end();
      const finalRes = { ...checkRegisterRes, ...checkBatteryRes, ...checkMetersRes };
      this.processResult(finalRes);
      const endTime = new Date();
      const timeDiff = endTime.getTime() - startTime.getTime();
      const seconds = Math.floor(timeDiff / 1000);
      console.log(`total time: ${seconds} seconds`);
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
    });
  }
}

module.exports = MyHuaweiDeviceBattery;
