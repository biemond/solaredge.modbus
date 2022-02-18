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
          })
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
          })          
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
    socket.on('connect', () => {
      console.log('Connected ...');
      result = {};
   
      for (const [key, value] of Object.entries(this.registers)) {
        client.readHoldingRegisters(value[0],value[1])
        .then(({ metrics, request, response }) => {
          // console.log('Transfer Time: ' + metrics.transferTime)
          // console.log('Response Body Payload: ' + response.body.valuesAsArray)
          // console.log('Response Body Payload As Buffer: ' + response.body.valuesAsBuffer)
          const measurement: Measurement = {
            value: 'xxx',
            scale: 'xxx',
            label: value[3],
          };
          let resultValue: string = 'xxx';          
          switch( value[2]) { 
            case 'UINT16':
              resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
              // console.log(value[3] + ": " + resultValue);
              break;
            case 'ACC32':
              resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
              // console.log(value[3] + ": " + resultValue);
              break;
            case 'FLOAT':
              resultValue = response.body.valuesAsBuffer.readFloatBE().toString();
              // console.log(value[3] + ": " + resultValue);
              break;
            case 'STRING':
              resultValue = response.body.valuesAsBuffer.toString();
              // console.log(value[3] + ": " + resultValue);
              break;
            case 'INT16': 
              resultValue = response.body.valuesAsBuffer.readInt16BE().toString(); 
              // console.log(value[3] + ": " + resultValue);
              break;
            case 'SCALE':
              resultValue = response.body.valuesAsBuffer.readInt16BE().toString(); 
              // console.log(value[3] + ": " + resultValue);
              // console.log(key.replace('_scale', ''));
              result[key.replace('_scale', '')].scale = resultValue
              break;
            case 'FLOAT32':
              resultValue = response.body.valuesAsBuffer.swap16().swap32().readFloatBE().toString();
              // console.log(value[3] + ": " + resultValue);
              break;
            default:
              console.log(key + ": type not found " + value[2]);
              break;
            }
            measurement.value = resultValue;
            result[key] = measurement;
        })
        .catch(handleErrors);
      }

      for (const [key, value] of Object.entries(this.meter_dids)) {
        client.readHoldingRegisters(value[0],value[1])
        .then(({ metrics, request, response }) => {
          // console.log('Transfer Time: ' + metrics.transferTime)
          // console.log('Response Body Payload: ' + response.body.valuesAsArray)
          // console.log('Response Body Payload As Buffer: ' + response.body.valuesAsBuffer)
          if ( value[2] == 'UINT16') {
            for (const [key2, value2] of Object.entries(this.meter_registers)) {
                // console.log(key2, value2);
                // console.log( "offset "+value[3]);
                client.readHoldingRegisters(value2[0] + value[3], value2[1])
                .then(({ metrics, request, response }) => {
                    const measurement: Measurement = {
                      value: 'xxx',
                      scale: 'xxx',
                      label: value2[3],
                    };
                    let resultValue: string = 'xxx';   
                    switch( value2[2]) {
                    case 'UINT16':
                        resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
                        // console.log(key + "-" + value2[3] + ": " + resultValue);
                        break;
                    case 'UINT32':
                        resultValue = response.body.valuesAsBuffer.readUInt32BE().toString();
                        // console.log(key + "-" +value2[3] + ": " + resultValue); 
                        break;                               
                    case 'SEFLOAT':
                        resultValue = response.body.valuesAsBuffer.swap16().swap32().readFloatBE().toString();
                        // console.log(key + "-" + value2[3] + ": " + resultValue);
                        break;
                    case 'STRING':
                        resultValue = response.body.valuesAsBuffer.toString();
                        // console.log(key + "-" + value2[3] + ": " + resultValue);
                        break;
                    case 'UINT64':
                        resultValue = response.body.valuesAsBuffer.readBigUInt64LE().toString();
                        // console.log(key + "-" + value2[3] + ": " + resultValue);
                        break;
                    case 'INT16':
                        resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
                        // console.log(key + "-" + value2[3] + ": " + resultValue);
                        break;
                    case 'SCALE':
                        resultValue = response.body.valuesAsBuffer.readInt16BE().toString();
                        // console.log(key + "-" + value2[3] + ": " + resultValue);
                        result[key+'-'+key2.replace('_scale', '')].scale = resultValue 
                        break;                         
                    default:
                        console.log(key2 + ": type not found " + value2[2]);
                        break;
                    }
                    measurement.value = resultValue;
                    result[key+'-'+key2] = measurement;                                  
                })
                .catch((err) => {
                    console.log(err);
                });
            }
          }      
        })
        .catch(handleErrorsMeters);
      } 

      for (const [key, value] of Object.entries(this.battery_dids)) {
        client.readHoldingRegisters(value[0],value[1])
        .then(({ metrics, request, response }) => {
          // console.log('Transfer Time: ' + metrics.transferTime)
          // console.log('Response Body Payload: ' + response.body.valuesAsArray)
          // console.log('Response Body Payload As Buffer: ' + response.body.valuesAsBuffer)
          if ( value[2] == 'UINT16') {
            if ( response.body.valuesAsBuffer.readUInt16BE() != 255 ) {
              console.log(key + ": " + response.body.valuesAsBuffer.readUInt16BE());
              let offset = 0x0;
              for (const [key2, value2] of Object.entries(this.batt_registers)) {
                  client.readHoldingRegisters(value2[0] + value[3] ,value2[1])
                  .then(({ metrics, request, response }) => {
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
                            // console.log(key + "-" + value2[3] + ": " + resultValue);
                            break;
                        case 'STRING':
                            resultValue = response.body.valuesAsBuffer.toString();
                            // console.log(key + "-" + value2[3] + ": " + resultValue);
                            break;
                        case 'UINT16':
                            resultValue = response.body.valuesAsBuffer.readInt16BE().toString();     
                            // console.log(key + "-" + value2[3] + ": " + resultValue);
                            break;
                        case 'UINT32':
                            resultValue = response.body.valuesAsArray[0].toString();
                            // console.log(key + "-" + value2[3] + ": " + resultValue);
                            break;
                        case 'UINT64':
                            resultValue = response.body.valuesAsBuffer.readBigUInt64LE().toString();
                            // console.log(key + "-" + value2[3] + ": " + resultValue);
                            break;
                        default:
                            // console.log(key2 + ": type not found " + value2[2]);
                            break;
                      }
                      measurement.value = resultValue;
                      result[key+'-'+key2] = measurement;                                    
                  })
                  .catch((err) => {
                      console.log(err);
                  });
              }              
            }
          }      
        })
        .catch(handleErrors);
      }  
    });      

    setTimeout(() => 
    {
      console.log('disconnect'); 
      client.socket.end();
      socket.end();
      // result
      for (let k in result) {
        console.log(k, result[k].value, result[k].scale, result[k].label)
      }
      
      if (result['power_ac'] && result['power_ac'].value != 'xxx' ){
        this.addCapability('measure_power');
        var acpower = Number(result['power_ac'].value)*(Math.pow(10, Number(result['power_ac'].scale)));      
        this.setCapabilityValue('measure_power', Math.round(acpower));     
      } 

      // if (result['energy_total'] && result['energy_total'].value != 'xxx' ){
      //   this.addCapability('meter_power'); 
      //   var total = Number(result['energy_total'].value)*(Math.pow(10, Number(result['energy_total'].scale)));  
      //   this.setCapabilityValue('meter_power', total / 1000);
      // }       

      if (result['power_dc'] && result['power_dc'].value != 'xxx' ){
        this.addCapability('measure_voltage.dc');
        var dcpower = Number(result['power_dc'].value)*(Math.pow(10, Number(result['power_dc'].scale)));
        this.setCapabilityValue('measure_voltage.dc', dcpower);
      }

      if (result['temperature'] && result['temperature'].value != 'xxx' ){
        this.addCapability('measure_temperature.invertor');
        var temperature = Number(result['temperature'].value)*(Math.pow(10, Number(result['temperature'].scale)));
        this.setCapabilityValue('measure_temperature.invertor', temperature);
      }   

      // // meters
      // if (result['meter1-export_energy_active'] && result['meter1-export_energy_active'].value != 'xxx' ){
      //   this.addCapability('meter_power.export');
      //   var totalexport = Number(result['meter1-export_energy_active'].value)*(Math.pow(10, Number(result['meter1-export_energy_active'].scale)));
      //   this.setCapabilityValue('meter_power.export', totalexport / 1000);
      // }    

      // // meters
      // if (result['meter1-import_energy_active'] && result['meter1-import_energy_active'].value != 'xxx' ){
      //   this.addCapability('meter_power.import');
      //   var totalimport = Number(result['meter1-import_energy_active'].value)*(Math.pow(10, Number(result['meter1-export_energy_active'].scale)));
      //   this.setCapabilityValue('meter_power.import', totalimport / 1000); 
      // }   

      if (result['meter1-voltage_ln'] && result['meter1-voltage_ln'].value != 'xxx' ){
        this.addCapability('measure_voltage.meter');
        var voltageac = Number(result['meter1-voltage_ln'].value)*(Math.pow(10, Number(result['meter1-voltage_ln'].scale)));
        this.setCapabilityValue('measure_voltage.meter', voltageac);
      }
      
      // battery  
      if (result['batt1-instantaneous_power'] && result['batt1-instantaneous_power'].value != 'xxx' ){
        this.addCapability('measure_power.batt_charge') ;
        this.addCapability('measure_power.batt_discharge') ;
        var battpower = Number(result['batt1-instantaneous_power'].value);
        if ( battpower > 0 ) {
          this.setCapabilityValue('measure_power.batt_charge', battpower);
          this.setCapabilityValue('measure_power.batt_discharge', 0); 
        } else {
          this.setCapabilityValue('measure_power.batt_charge', 0);
          this.setCapabilityValue('measure_power.batt_discharge', -1 * battpower); 
        }       
      }   

      if (result['batt1-soe'] && result['batt1-soe'].value != 'xxx' ){
        this.addCapability('battery');      
        this.addCapability('measure_battery');    
        var battery = Number(Number.parseFloat(result['batt1-soe'].value).toFixed(2));
        if (this.getCapabilityValue('battery') != battery) {
          this.homey.flow.getDeviceTriggerCard('changedBattery').trigger(this, { charge: battery }, {});
        }      
        this.setCapabilityValue('battery', battery);
        this.setCapabilityValue('measure_battery', battery);
      }        

      if (result['batt1-soh'] && result['batt1-soh'].value != 'xxx' ){
        var health = Number(result['batt1-soh'].value);
        this.setCapabilityValue('batterysoh', health);
      }   
      
      if (result['storage_control_mode'] && result['storage_control_mode'].value != 'xxx' ){
        this.addCapability('storagecontrolmode') ;
        var storagecontrolmode = result['storage_control_mode'].value;
        this.setCapabilityValue('storagecontrolmode', storagecontrolmode);
      }         

      if (result['remote_control_command_mode'] && result['remote_control_command_mode'].value != 'xxx' ){
        this.addCapability('storagedefaultmode') ;
        var storagedefaultmode = result['remote_control_command_mode'].value;
        this.setCapabilityValue('storagedefaultmode', storagedefaultmode);
      }      

      if (result['batt1-average_temperature'] && result['batt1-average_temperature'].value != 'xxx' ){
        this.addCapability("measure_temperature.battery");
        var batt_temperature = Number(result['batt1-average_temperature'].value);
        this.setCapabilityValue("measure_temperature.battery", Math.round(batt_temperature));
      }         
    }, 10000)

    socket.on('error', (err) => {
      console.log(err);
      socket.end();
    })
  }

}

module.exports = MySolaredgeDevice;
