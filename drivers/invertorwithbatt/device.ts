
import * as Modbus from 'jsmodbus';
import net from 'net';
import {Solaredge} from '../solaredge';
import {Measurement} from '../solaredge';

const RETRY_INTERVAL = 40 * 1000; 
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

    // homey menu / device actions
    this.registerCapabilityListener('storagecontrolmode', async (value)  => {
      this.updateControl('storagecontrolmode', Number(value));
      return value;
    }); 
    this.registerCapabilityListener('storagedefaultmode', async (value)  => {
      this.updateControl('storagedefaultmode', Number(value));
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

    let batteryChargedStatus = this.homey.flow.getConditionCard("batterycharge");
    batteryChargedStatus.registerRunListener(async (args, state) => {
        let result = (await this.getCapabilityValue('measure_battery') >= args.charged);
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
  
  async updateControl(type: string, value: number) {
    function handleErrors(err: any) {
      console.log('Unknown Error', err);
    }
    this.log("storagecontrolmode set  ", value );
    let socket = new net.Socket()
    let client = new Modbus.client.TCP(socket);  

    let modbusOptions = {
      'host': this.getSetting('address'),
      'port': this.getSetting('port'),
      'unitId': 1,
      'timeout': 20,
      'autoReconnect': false,
      'logLabel' : 'solaredge Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }    

    socket.connect(modbusOptions);
    socket.on('connect', () => {
      console.log('Connected ...');

        if ( type == 'storagecontrolmode'){
          // 0 – Disabled
          // 1 – Maximize Self Consumption – requires a SolarEdge Electricity meter on the grid or load connection point
          // 2 – Time of Use (Profile programming) – requires a SolarEdge Electricity meter on the grid or load connection point 3 – Backup Only (applicable only for systems support backup functionality)
          // 4 – Remote Control – the battery charge/discharge state is controlled by an external controller
          client.writeSingleRegister(0xe004, Number(value))
          .then(function (resp) {
            console.log('controlmodewrite', resp)
          })
          .catch(handleErrors);
        }

        if ( type == 'storagedefaultmode'){
          client.writeSingleRegister(0xe004, 4)
          .then(function (resp) {
            console.log('controlmodewrite', resp)
          }).catch(handleErrors);
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
          client.writeSingleRegister(0xe00d, value)
          .then(function (resp) {
            console.log('remotecontrolwrite', resp)
          }).catch(handleErrors);          
        }
    })

    setTimeout(() => 
    {
      console.log('disconnect'); 
      client.socket.end();
      socket.end();
    }, 2000)

    socket.on('error', (err) => {
      console.log(err);
      socket.end();
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
    let result: Record<string, Measurement> = {};

    let modbusOptions = {
      'host': this.getSetting('address'),
      'port': this.getSetting('port'),
      'unitId': 1,
      'timeout': 20,
      'autoReconnect': false,
      'logLabel' : 'solaredge Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }    

    let socket = new net.Socket()
    let client = new Modbus.client.TCP(socket);  
    socket.connect(modbusOptions);
    let hasRegisterFinished = false;
    let hasMeterFinished = false;
    let hasBatteryFinished = false;

    socket.on('connect', () => {
      console.log('Connected ...');
      result = {};

      async function checkRegister(
        registers : Object, 
        ctx : MySolaredgeDevice,
        socket: net.Socket,  
        client : InstanceType<typeof  Modbus.client.TCP>,
        result: Record<string, Measurement>) {
        for (const [key, value] of Object.entries(registers)) {
          const res= client.readHoldingRegisters(value[0],value[1])
          const actualRes = await res;
          // const metrics = actualRes.metrics;
          // const request = actualRes.request;
          const response = actualRes.response;
          const measurement: Measurement = {
            value: 'xxx',
            scale: 'xxx',
            label: value[3],
          };
          let resultValue: string = 'xxx';          
          switch( value[2]) { 
            case 'UINT16':
              resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
              break;
            case 'UINT32':
              resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
              break;                   
            case 'ACC32':
              resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
              break;
            case 'FLOAT':
              resultValue = response.body.valuesAsBuffer.readFloatBE().toString();
              break;
            case 'STRING':
              resultValue = response.body.valuesAsBuffer.toString();
              break;
            case 'INT16': 
              resultValue = response.body.valuesAsBuffer.readInt16BE().toString(); 
              break;
            case 'SCALE':
              resultValue = response.body.valuesAsBuffer.readInt16BE().toString(); 
              // console.log(value[3] + ": " + resultValue);
              // console.log(key.replace('_scale', ''));
              result[key.replace('_scale', '')].scale = resultValue
              break;
            case 'FLOAT32':
              resultValue = response.body.valuesAsBuffer.swap16().swap32().readFloatBE().toString();
              break;
            default:
              console.log(key + ": type not found " + value[2]);
              break;
            }
            measurement.value = resultValue;
            result[key] = measurement;
        }
        hasRegisterFinished = true;
        ctx.closeSocket(hasBatteryFinished, hasRegisterFinished, hasMeterFinished, result, socket, client);
      }

      async function checkMeter(meter_dids : Object, 
                               meter_registers:Object, 
                               ctx : MySolaredgeDevice,
                               socket: net.Socket,  
                               client : InstanceType<typeof  Modbus.client.TCP>,
                               result: Record<string, Measurement>
                               ){
        for (const [key, value] of Object.entries(meter_dids)) {
          try{
            const res = client.readHoldingRegisters(value[0],value[1])
            const actualRes = await res;
            // const metrics = actualRes?.metrics;
            // const request = actualRes?.request;
            // const response = actualRes?.response;

            if ( value[2] == 'UINT16') {
              for (const [key2, value2] of Object.entries(meter_registers)) {

                const innerRes= client.readHoldingRegisters(value2[0] + value[3], value2[1])
                const actualRes = await innerRes
                // const metrics = actualRes.metrics;
                // const request = actualRes.request;
                const response = actualRes.response;
                
                const measurement: Measurement = {
                  value: 'xxx',
                  scale: 'xxx',
                  label: value2[3],
                };
                let resultValue: string = 'xxx';   
                switch( value2[2]) {
                case 'UINT16':
                    resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
                    break;
                case 'UINT32':
                    resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
                    break;                               
                case 'SEFLOAT':
                    resultValue = response.body.valuesAsBuffer.swap16().swap32().readFloatBE().toString();
                    break;
                case 'STRING':
                    resultValue = response.body.valuesAsBuffer.toString();
                    break;
                case 'UINT64':
                    resultValue = response.body.valuesAsBuffer.readBigUInt64LE().toString();
                    break;
                case 'INT16':
                    resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
                    break;
                case 'SCALE':
                    resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
                    result[key+'-'+key2.replace('_scale', '')].scale = resultValue 
                    break;                         
                default:
                    console.log(key2 + ": type not found " + value2[2]);
                    break;
                }
                measurement.value = resultValue;
                result[key+'-'+key2] = measurement;   
              }
          }      
            
        }catch(e){
          console.log(e);
        }
      }
        hasMeterFinished = true; 
        ctx.closeSocket(hasBatteryFinished,hasRegisterFinished,hasMeterFinished,result,socket,client);
      }

      async function checkBattery(battery_dids:Object, 
                                 batt_registers : Object, 
                                 ctx : MySolaredgeDevice,
                                 socket: net.Socket,  
                                 client : InstanceType<typeof  Modbus.client.TCP>,
                                 result: Record<string, Measurement>
                                 ){
          for (const [key, value] of Object.entries(battery_dids)) {
            const res =client.readHoldingRegisters(value[0],value[1])
            const actualRes = await res;
            const metrics = actualRes.metrics;
            const request = actualRes.request;
            const response = actualRes.response;

            if ( value[2] == 'UINT16') {
              if ( response.body.valuesAsBuffer.readUInt16BE() != 255 ) {
                console.log(key + ": " + response.body.valuesAsBuffer.readUInt16BE());
                let offset = 0x0;
                for (const [key2, value2] of Object.entries(batt_registers)) {
                const res =   client.readHoldingRegisters(value2[0] + value[3] ,value2[1])
                const actualRes = await res;
                const metrics = actualRes.metrics;
                const request = actualRes.request;
                const response = actualRes.response;
                // console.log(resp.response._body);
                const measurement: Measurement = {
                  value: 'xxx',
                  scale: 'xxx',
                  label: value2[3],
                };
                let resultValue: string = 'xxx';  
                  switch( value2[2]) { 
                    case  'SEFLOAT':
                        resultValue = response.body.valuesAsBuffer.swap16().swap32().readFloatBE().toString();
                        break;
                    case 'STRING':
                        resultValue = response.body.valuesAsBuffer.toString();
                        break;
                    case 'UINT16':
                        resultValue = response.body.valuesAsBuffer.readInt16BE().toString();     
                        break;
                    case 'UINT32':
                        resultValue = response.body.valuesAsArray[0].toString();
                        break;
                    case 'UINT64':
                        resultValue = response.body.valuesAsBuffer.readBigUInt64LE().toString();
                        break;
                    default:
                        console.log(key2 + ": type not found " + value2[2]);
                        break;
                  }
                  measurement.value = resultValue;
                  result[key+'-'+key2] = measurement;   
                }              
              }
            }      
          }  
          hasBatteryFinished = true;   
          ctx.closeSocket(hasBatteryFinished,hasRegisterFinished,hasMeterFinished,result,socket,client);
        }

        checkRegister(this.registers, this, socket, client, result);
        checkMeter(this.meter_dids, this.meter_registers, this, socket, client, result).catch((e)=>console.log(e)) ;     
        checkBattery(this.battery_dids, this.batt_registers, this, socket, client, result).catch((e)=>console.log(e)) ;      
    });    

    socket.on('error', (err) => {
      console.log(err);
      socket.end();
    })
  }
}

module.exports = MySolaredgeDevice;
