import * as Modbus from 'jsmodbus';
import net from 'net';
import { checkHoldingRegisterHuawei } from '../response';
import { Huawei, Measurement } from '../huawei';

const RETRY_INTERVAL = 120 * 1000;

class MyHuaweiBatteryDevice extends Huawei {
  timer!: NodeJS.Timer;

  async onInit() {
    this.log('MyHuaweiBatteryDevice has been initialized');

    const name = this.getData().id;
    this.log(`device name id ${name}`);
    this.log(`device name ${this.getName()}`);

    this.pollInvertor();

    this.timer = this.homey.setInterval(() => {
      this.pollInvertor();
    }, RETRY_INTERVAL);
  }

  async onAdded() {
    this.log('MyHuaweiBatteryDevice has been added');
  }

  async onSettings({ oldSettings: {}, newSettings: {}, changedKeys: {} }): Promise<string | void> {
    this.log('MyHuaweiBatteryDevice settings where changed');
  }

  async onRenamed(name: string) {
    this.log('MyHuaweiBatteryDevice was renamed');
  }

  async onDeleted() {
    this.log('MyHuaweiBatteryDevice has been deleted');
    this.homey.clearInterval(this.timer);
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
      logLabel: 'huawei LUNA2000 Battery',
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

      const checkBatteryRes = await checkHoldingRegisterHuawei(this.holdingRegistersBattery, client);

      console.log('disconnect');
      client.socket.end();
      socket.end();
      this.processBatteryResult(checkBatteryRes);
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

  processBatteryResult(result: Record<string, Measurement>) {
    if (!result) return;

    for (const k in result) {
      console.log('huawei battery: ', k, result[k].value, result[k].scale, result[k].label);
    }

    // Battery charge/discharge power: positive = charging, negative = discharging.
    // STORAGE_CHARGE_DISCHARGE_POWER is an INT32 with the same sign convention
    // that Homey expects for measure_power on a homeBattery device.
    if (result['STORAGE_CHARGE_DISCHARGE_POWER'] && result['STORAGE_CHARGE_DISCHARGE_POWER'].value !== 'xxx') {
      const batteryPower = Number(result['STORAGE_CHARGE_DISCHARGE_POWER'].value) * Math.pow(10, Number(result['STORAGE_CHARGE_DISCHARGE_POWER'].scale));
      this.setCapabilityValue('measure_power', batteryPower);
    }

    // State of Charge
    if (result['STORAGE_STATE_OF_CAPACITY'] && result['STORAGE_STATE_OF_CAPACITY'].value !== 'xxx') {
      const soc = Number(result['STORAGE_STATE_OF_CAPACITY'].value) * Math.pow(10, Number(result['STORAGE_STATE_OF_CAPACITY'].scale));
      this.setCapabilityValue('battery', soc);
      this.setCapabilityValue('measure_battery', soc);
    }
  }
}

module.exports = MyHuaweiBatteryDevice;
