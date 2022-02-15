import * as Modbus from 'jsmodbus';
import net from 'net';
import {Solaredge} from '../solaredge';
import {Measurement} from '../solaredge';

const RETRY_INTERVAL = 20 * 1000; 
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

    timer = this.homey.setInterval(() => {
      // poll device state from invertor
      this.pollInvertor();
    }, RETRY_INTERVAL);
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
      'unitId': 1,
      'timeout': 20,
      'autoReconnect': false,
      'logLabel' : 'solaredge Inverter',
      'logLevel': 'error',
      'logEnabled': true
    }    
    const socket = new net.Socket()
    const client = new Modbus.client.TCP(socket);

    function handleErrors(err: any) {
      console.log('Unknown Error', err);
    }

    function handleErrorsMeters(err: any) {
      console.log('No meter');
    }
    let result: Record<string, Measurement> = {};

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
                        result[key2.replace('_scale', '')].scale = resultValue 
                        break;                         
                    default:
                        console.log(key2 + ": type not found " + value2[2]);
                        break;
                    }
                    measurement.value = resultValue;
                    result[key2] = measurement;                                  
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
                      result[key2] = measurement;                                    
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
      socket.end();
      // result
      for (let k in result) {
        console.log(k, result[k].value, result[k].scale, result[k].label)
      }

      this.addCapability('measure_power');
      var acpower = Number(result['power_ac'].value)*(Math.pow(10, Number(result['power_ac'].scale)));      
      this.setCapabilityValue('measure_power', Math.round(acpower));      

      this.addCapability('meter_power'); 
      var total = Number(result['energy_total'].value)*(Math.pow(10, Number(result['energy_total'].scale)));  
      this.setCapabilityValue('meter_power', total / 1000);       

      // meters
      this.addCapability('meter_power.export');
      var totalexport = Number(result['export_energy_active'].value)*(Math.pow(10, Number(result['export_energy_active'].scale)));
      this.setCapabilityValue('meter_power.export', totalexport / 1000);    

      // meters
      this.addCapability('meter_power.import');
      var totalimport = Number(result['import_energy_active'].value)*(Math.pow(10, Number(result['export_energy_active'].scale)));
      this.setCapabilityValue('meter_power.import', totalimport / 1000);    

      // "measure_voltage.meter",
      // "measure_power.ac"

      this.addCapability('measure_voltage.dc');
      var dcpower = Number(result['power_dc'].value)*(Math.pow(10, Number(result['power_dc'].scale)));
      this.setCapabilityValue('measure_voltage.dc', dcpower);

      this.addCapability('measure_temperature');
      var temperature = Number(result['temperature'].value)*(Math.pow(10, Number(result['temperature'].scale)));
      this.setCapabilityValue('measure_temperature', temperature);      
      
      // battery
      this.addCapability('battery')      
      var battery = Number(result['soe'].value)
      this.setCapabilityValue('battery', battery); 

      this.addCapability('batterysoh')      
      var battery = Number(result['soh'].value)
      this.setCapabilityValue('batterysoh', battery);       

    }, 10000)

    socket.on('error', (err) => {
      console.log(err);
      socket.end();
    })
  }

}

module.exports = MySolaredgeDevice;
