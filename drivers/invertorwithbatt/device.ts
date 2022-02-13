import * as Modbus from 'jsmodbus';
import net from 'net';
import {Solaredge} from '../solaredge';

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

    socket.connect(modbusOptions);
    socket.on('connect', () => {
      console.log('Connected ...');

      for (const [key, value] of Object.entries(this.registers)) {
        client.readHoldingRegisters(value[0],value[1])
        .then(({ metrics, request, response }) => {
          // console.log('Transfer Time: ' + metrics.transferTime)
          // console.log('Response Body Payload: ' + response.body.valuesAsArray)
          // console.log('Response Body Payload As Buffer: ' + response.body.valuesAsBuffer)
          switch( value[2]) { 
            case 'UINT16': 
              console.log(value[3] + ": " + response.body.valuesAsBuffer.readInt16BE());
              break;
            case 'ACC32':
              console.log(value[3] + ": " + response.body.valuesAsBuffer.readUInt32BE());
              break;
            case 'FLOAT':
              console.log(value[3] + ": " + response.body.valuesAsBuffer.readFloatBE());
              break;
            case 'STRING':
              console.log(value[3] + ": " + response.body.valuesAsBuffer);
              break;
            case 'INT16': 
              console.log(value[3] + ": " + response.body.valuesAsBuffer.readInt16BE());
              break;
            case 'SCALE': 
              console.log(value[3] + ": " + response.body.valuesAsBuffer.readInt16BE());
              break;
            case 'FLOAT32':
              console.log(value[3] + ": " + response.body.valuesAsBuffer.swap16().swap32().readFloatBE());
              break;
            default: 
              console.log(key + ": type not found " + value[2]);
              break;
            }            
        })
        .catch(handleErrors);
      }

      for (const [key, value] of Object.entries(this.meter_dids)) {
        client.readHoldingRegisters(value[0],value[1])
        .then(({ metrics, request, response }) => {
          // console.log('Transfer Time: ' + metrics.transferTime)
          // console.log('Response Body Payload: ' + response.body.valuesAsArray)
          console.log('Response Body Payload As Buffer: ' + response.body.valuesAsBuffer)
          if ( value[2] == 'UINT16') {
            for (const [key2, value2] of Object.entries(this.meter_registers)) {
                // console.log(key2, value2);
                // console.log( "offset "+value[3]);
                client.readHoldingRegisters(value2[0] + value[3], value2[1])
                .then(({ metrics, request, response }) => {
                    switch( value2[2]) {
                    case 'UINT16':
                        console.log(key + "-" + value2[3] + ": " + response.body.valuesAsBuffer.readUInt16BE());
                        break;
                    case 'UINT32':
                        console.log(key + "-" +value2[3] + ": " + response.body.valuesAsBuffer.readUInt32BE()); 
                        break;                               
                    case 'SEFLOAT':
                        console.log(key + "-" + value2[3] + ": " + response.body.valuesAsBuffer.swap16().swap32().readFloatBE());
                        break;
                    case 'STRING':
                        console.log(key + "-" + value2[3] + ": " + response.body.valuesAsBuffer);
                        break;
                    case 'UINT64':
                        console.log(key + "-" + value2[3] + ": " + response.body.valuesAsBuffer.readBigUInt64LE());
                        break;
                    case 'INT16':
                        console.log(key + "-" + value2[3] + ": " + response.body.valuesAsBuffer.readInt16BE());
                        break;
                    case 'SCALE':
                        console.log(key + "-" + value2[3] + ": " + response.body.valuesAsBuffer.readInt16BE()); 
                        break;                         
                    default:
                        console.log(key2 + ": type not found " + value2[2]);
                        break;
                    }                                  
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
                      switch( value2[2]) { 
                        case  'SEFLOAT':
                            console.log(key + "-" + value2[3] + ": " + response.body.valuesAsBuffer.swap16().swap32().readFloatBE());
                            break;
                        case 'STRING':
                            console.log(key + "-" + value2[3] + ": " + response.body.valuesAsBuffer);
                            break;
                        case 'UINT16':     
                            console.log(key + "-" + value2[3] + ": " + response.body.valuesAsBuffer.readInt16BE());
                            break;
                        case 'UINT32':
                            console.log(key + "-" + value2[3] + ": " + response.body.valuesAsArray[0]);
                            break;
                        case 'UINT64':
                            console.log(key + "-" + value2[3] + ": " + response.body.valuesAsBuffer.readBigUInt64LE());
                            break;
                        default:
                            console.log(key2 + ": type not found " + value2[2]);
                            break;
                      }                                 
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
    }, 10000)

    socket.on('error', (err) => {
      console.log(err);
      socket.end();
    })
  }

}

module.exports = MySolaredgeDevice;
