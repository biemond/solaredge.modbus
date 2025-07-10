import * as Homey from 'homey';

export interface Measurement {
  value: string;
  scale: string;
  label: string;
}

interface GrowattData {
  value: string;
  scale?: string;
}

interface GrowattContext {
  maxpeakpower: number;
}

interface CapabilityMapping {
  resultKey: string;
  capabilities: string[];
  valid?: (data: GrowattData, context?: GrowattContext) => boolean;
  transform?: (data: GrowattData, context?: GrowattContext) => string | number | null;
  requireCapabilityCheck?: boolean;
}

type RegisterDefinition = [number, number, string, string, number];

export class Growatt extends Homey.Device {
  readonly holdingRegisters: { [key: string]: RegisterDefinition } = {
    onoff: [0, 1, 'UINT16', 'On/Off state', 0],
    exportlimitenabled: [122, 1, 'UINT16', 'Export Limit enable', 0],
    exportlimitpowerrate: [123, 1, 'UINT16', 'Export Limit Power Rate', -1],
    priority: [1044, 1, 'UINT16', 'Priority', 0],
    gridfirstrate: [1070, 1, 'UINT16', 'GridFirst discharge rate', 0],
    gridfirststopsoc: [1071, 1, 'UINT16', 'GridFirst stop SOC', 0],
    batfirstrate: [1090, 1, 'UINT16', 'BatFirst charge rate', 0],
    batfirststopsoc: [1091, 1, 'UINT16', 'BatFirst stop SOC', 0],
    loadfirststopsoc: [608, 1, 'UINT16', 'LoadFirst stop SOC', 0],

    acchargeswitch: [1092, 1, 'UINT16', 'Batt AC charge switch', 0],

    gridfirst1starttime: [1080, 1, 'UINT16', 'Grid First Slot 1 Start Time', 0],
    gridfirst1stoptime: [1081, 1, 'UINT16', 'Grid First Slot 1 Stop Time', 0],
    gridfirst1switch: [1082, 1, 'UINT16', 'Grid First Slot 1 Enable Switch', 0],
    gridfirst2starttime: [1083, 1, 'UINT16', 'Grid First Slot 1 Start Time', 0],
    gridfirst2stoptime: [1084, 1, 'UINT16', 'Grid First Slot 1 Stop Time', 0],
    gridfirst2switch: [1085, 1, 'UINT16', 'Grid First Slot 1 Enable Switch', 0],
    gridfirst3starttime: [1086, 1, 'UINT16', 'Grid First Slot 1 Start Time', 0],
    gridfirst3stoptime: [1087, 1, 'UINT16', 'Grid First Slot 1 Stop Time', 0],
    gridfirst3switch: [1088, 1, 'UINT16', 'Grid First Slot 1 Enable Switch', 0],

    battfirst1starttime: [1100, 1, 'UINT16', 'Battery First Start Time', 0],
    battfirst1stoptime: [1101, 1, 'UINT16', 'Battery First Stop Time', 0],
    battfirst1switch: [1102, 1, 'UINT16', 'Battery First Stop Switch 1', 0],
    battfirst2starttime: [1103, 1, 'UINT16', 'Battery First Start Time', 0],
    battfirst2stoptime: [1104, 1, 'UINT16', 'Battery First Stop Time', 0],
    battfirst2switch: [1105, 1, 'UINT16', 'Battery First Stop Switch 1', 0],
    battfirst3starttime: [1106, 1, 'UINT16', 'Battery First Start Time', 0],
    battfirst3stoptime: [1107, 1, 'UINT16', 'Battery First Stop Time', 0],
    battfirst3switch: [1108, 1, 'UINT16', 'Battery First Stop Switch 1', 0],
  };

  readonly holdingRegistersTL: { [key: string]: RegisterDefinition } = {
    onoff: [0, 1, 'UINT16', 'On/Off state', 0],
    exportlimitenabled: [122, 1, 'UINT16', 'Export Limit enable', 0],
    exportlimitpowerrate: [123, 1, 'UINT16', 'Export Limit Power Rate', -1],
    gridfirststopsoc: [3037, 1, 'UINT16', 'GridFirst stop SOC', 0],
    batfirststopsoc: [3048, 1, 'UINT16', 'BatFirst stop SOC', 0],

    acchargeswitch: [3049, 1, 'UINT16', 'Batt AC charge switch', 0],

    period1start: [3038, 1, 'UINT16', 'period1start', 0],
    period1stop: [3039, 1, 'UINT16', 'period1stop', 0],
    period2start: [3040, 1, 'UINT16', 'period2start', 0],
    period2stop: [3041, 1, 'UINT16', 'period2stop', 0],
    period3start: [3042, 1, 'UINT16', 'period3start', 0],
    period3stop: [3043, 1, 'UINT16', 'period3stop', 0],
    period4start: [3044, 1, 'UINT16', 'period4start', 0],
    period4stop: [3045, 1, 'UINT16', 'period4stop', 0],
  };

  readonly registers: { [key: string]: RegisterDefinition } = {
    l1_current: [39, 1, 'UINT16', 'L1 Current', -1],
    l2_current: [43, 1, 'UINT16', 'L2 Current', -1],
    l3_current: [47, 1, 'UINT16', 'L3 Current', -1],

    temperature: [93, 1, 'UINT16', 'Temperature', -1],

    status: [0, 1, 'UINT16', 'Status', 0],
    inputPower: [1, 2, 'UINT32', 'Input Power', -1],
    outputPower: [35, 2, 'UINT32', 'Output Power', -1],

    pv1Voltage: [3, 1, 'UINT16', 'pv1 Voltage', -1],
    pv2Voltage: [7, 1, 'UINT16', 'pv2 Voltage', -1],

    gridFrequency: [37, 1, 'UINT16', 'Grid Frequency', -2],
    gridVoltage: [38, 1, 'UINT16', 'Grid Voltage', -1],
    gridOutputCurrent: [39, 1, 'UINT16', 'Grid Output Current', -1],
    gridOutputPower: [40, 2, 'UINT32', 'Grid Output Power', -1],
    todayEnergy: [53, 2, 'UINT32', 'Today Energy', -1],
    totalEnergy: [55, 2, 'UINT32', 'Total Energy', -1],

    // pv1Current: data[4] / 10.0, //A
    pv1InputPower: [5, 2, 'UINT32', 'pv1 Power', -1],
    // pv2Voltage: data[7] / 10.0, //V
    // pv2Current: data[8] / 10.0, //A
    pv2InputPower: [9, 2, 'UINT32', 'pv2 Power', -1],

    pv1TodayEnergy: [59, 2, 'UINT32', 'pv2 Today Energy', -1],
    pv1TotalEnergy: [61, 2, 'UINT32', 'pv2 Total Energy', -1],
    pv2TodayEnergy: [63, 2, 'UINT32', 'pv2 Today Energy', -1],
    pv2TotalEnergy: [65, 2, 'UINT32', 'pv2 Total Energy', -1],
    pvEnergyTotal: [91, 2, 'UINT32', 'pv Total Energy', -1],

    // "realoutputpercentage": [101, 1, 'UINT16', "real output power percentage", 0],
    // "outputmaxpowerlimited": [102 ,2, 'UINT32', "output max power limited", -1 ],

    // ipmTemperature: data[94] / 10.0, //°C
    // inverterOutputPf: data[100], //powerfactor 0-20000
    error: [105, 1, 'UINT16', 'Error', 0],
    // realPowerPercent: data[113] //% 0-100

    // "ac_chargepower": [116 ,2, 'UINT32', "AC charge Power", -1 ],

    battDischarge: [1009, 2, 'UINT32', 'battery Discharge', -1],
    battCharge: [1011, 2, 'UINT32', 'battery Charge', -1],
    battvoltage: [1013, 1, 'UINT16', 'battery Voltage', -1],
    battsoc: [1014, 1, 'UINT16', 'battery soc', 0],

    batttemperature: [1040, 1, 'UINT16', 'battery Temperature', -1],

    bmssoc: [1086, 1, 'UINT16', 'bms soc', 0],
    bmstemperature: [1089, 1, 'UINT16', 'bms Temperature', -1],
    bmscyclecount: [1095, 1, 'UINT16', 'bms cycle count', 0],
    bmshealth: [1096, 1, 'UINT16', 'bms soh', 0],
    bmsstatus: [1083, 1, 'UINT16', 'bms status', 0],
    bmserror: [1085, 1, 'UINT16', 'bms error', 0],

    totalhouseload: [1037, 2, 'UINT32', 'Total house Load', -1],
    priority: [118, 1, 'UINT16', 'priority', 0],

    pactouserr: [1015, 2, 'UINT32', 'import from grid to user', -1],
    pactousertotal: [1021, 2, 'UINT32', 'import from grid to user total', -1],
    pactogrid: [1023, 2, 'UINT32', 'export to grid', -1],
    pactogridtotal: [1029, 2, 'UINT32', 'export to grid total', -1],

    today_grid_import: [1044, 2, 'UINT32', "Today's Grid Import", -1],
    total_grid_import: [1046, 2, 'UINT32', 'Total Grid Import', -1],
    today_grid_export: [1048, 2, 'UINT32', "Today's Grid Export", -1],
    total_grid_export: [1050, 2, 'UINT32', 'Total Grid Export', -1],

    today_battery_output_energy: [1052, 2, 'UINT32', "Today's Battery Output Energy", -1],
    total_battery_output_energy: [1054, 2, 'UINT32', 'Total Battery Output Energy', -1],
    today_battery_input_energy: [1056, 2, 'UINT32', "Today's Battery Input Energy", -1],
    total_battery_intput_energy: [1058, 2, 'UINT32', 'Total Battery Input Energy', -1],

    today_load: [1060, 2, 'UINT32', "Today's Load", -1],
    total_load: [1062, 2, 'UINT32', 'Total Load', -1],
  };

  readonly registersTL: { [key: string]: RegisterDefinition } = {
    l1_current: [39, 1, 'UINT16', 'L1 Current', -1],
    l2_current: [43, 1, 'UINT16', 'L2 Current', -1],
    l3_current: [47, 1, 'UINT16', 'L3 Current', -1],

    temperature: [93, 1, 'UINT16', 'Temperature', -1],

    status: [0, 1, 'UINT16', 'Status', 0],
    inputPower: [1, 2, 'UINT32', 'Input Power', -1],
    outputPower: [35, 2, 'UINT32', 'Output Power', -1],

    pv1Voltage: [3, 1, 'UINT16', 'pv1 Voltage', -1],
    pv2Voltage: [7, 1, 'UINT16', 'pv2 Voltage', -1],

    gridFrequency: [37, 1, 'UINT16', 'Grid Frequency', -2],
    gridVoltage: [38, 1, 'UINT16', 'Grid Voltage', -1],
    gridOutputCurrent: [39, 1, 'UINT16', 'Grid Output Current', -1],
    gridOutputPower: [40, 2, 'UINT32', 'Grid Output Power', -1],
    todayEnergy: [53, 2, 'UINT32', 'Today Energy', -1],
    totalEnergy: [55, 2, 'UINT32', 'Total Energy', -1],

    // pv1Current: data[4] / 10.0, //A
    pv1InputPower: [5, 2, 'UINT32', 'pv1 Power', -1],
    // pv2Voltage: data[7] / 10.0, //V
    // pv2Current: data[8] / 10.0, //A
    pv2InputPower: [9, 2, 'UINT32', 'pv2 Power', -1],

    pv1TodayEnergy: [59, 2, 'UINT32', 'pv2 Today Energy', -1],
    pv1TotalEnergy: [61, 2, 'UINT32', 'pv2 Total Energy', -1],
    pv2TodayEnergy: [63, 2, 'UINT32', 'pv2 Today Energy', -1],
    pv2TotalEnergy: [65, 2, 'UINT32', 'pv2 Total Energy', -1],
    pvEnergyTotal: [91, 2, 'UINT32', 'pv Total Energy', -1],

    error: [105, 1, 'UINT16', 'Error', 0],

    battDischarge: [3178, 2, 'UINT32', 'battery Discharge', -1],
    battCharge: [3180, 2, 'UINT32', 'battery Charge', -1],
    battvoltage: [3169, 1, 'UINT16', 'battery Voltage', -2],
    battsoc: [3171, 1, 'UINT16', 'battery soc', 0],

    batttemperature: [3218, 1, 'UINT16', 'battery Temperature', -1],

    bmssoc: [3215, 1, 'UINT16', 'bms soc', 0],
    bmstemperature: [3218, 1, 'UINT16', 'bms Temperature', -1],
    bmscyclecount: [3221, 1, 'UINT16', 'bms cycle count', 0],
    bmshealth: [3222, 1, 'UINT16', 'bms soh', 0],
    bmsstatus: [3212, 1, 'UINT16', 'bms status', 0],
    bmserror: [3202, 1, 'UINT16', 'bms error', 0],

    totalhouseload: [3045, 2, 'UINT32', 'Total house Load', -1],
    priority: [3144, 1, 'UINT16', 'priority', 0],

    today_grid_import: [3067, 2, 'UINT32', "Today's Grid Import", -1],
    total_grid_import: [3069, 2, 'UINT32', 'Total Grid Import', -1],
    today_grid_export: [3071, 2, 'UINT32', "Today's Grid Export", -1],
    total_grid_export: [3073, 2, 'UINT32', 'Total Grid Export', -1],

    today_battery_output_energy: [3125, 2, 'UINT32', "Today's Battery Output Energy", -1],
    total_battery_output_energy: [3127, 2, 'UINT32', 'Total Battery Output Energy', -1],
    today_battery_input_energy: [3129, 2, 'UINT32', "Today's Battery Input Energy", -1],
    total_battery_intput_energy: [3131, 2, 'UINT32', 'Total Battery Input Energy', -1],

    today_load: [3075, 2, 'UINT32', "Today's Load", -1],
    total_load: [3077, 2, 'UINT32', 'Total Load', -1],
  };

  readonly CapabilityMappings: CapabilityMapping[] = [
    {
      resultKey: 'onoff',
      capabilities: ['growatt_onoff'],
      valid: (data) => this.isValidNumberInRange(data.value, 0, 1),
      transform: (data) => data.value,
    },
    {
      resultKey: 'outputPower',
      capabilities: ['measure_power'],
      valid: (data: GrowattData, context?: GrowattContext): boolean => {
        if (data.value === 'xxx') return false;
        const value = Number(data.value) * 10 ** Number(data.scale ?? '0');
        return !context || context.maxpeakpower <= 0 || value <= context.maxpeakpower;
      },
      transform: (data: GrowattData, context?: GrowattContext): number | null => {
        const outputPower = Number(data.value) * 10 ** Number(data.scale ?? '0');
        if (context && context.maxpeakpower > 0 && outputPower > context.maxpeakpower) {
          this.log(`skip measure_power, max: ${context.maxpeakpower} power: ${outputPower}`);
          return null;
        }
        return Math.round(outputPower);
      },
    },
    {
      resultKey: 'gridOutputPower',
      capabilities: ['measure_power.gridoutput'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Math.round(Number(data.value) * 10 ** Number(data.scale)),
    },
    {
      resultKey: 'inputPower',
      capabilities: ['measure_power.input'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Math.round(Number(data.value) * 10 ** Number(data.scale)),
    },
    {
      resultKey: 'pv1InputPower',
      capabilities: ['measure_power.pv1input'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Math.round(Number(data.value) * 10 ** Number(data.scale)),
    },
    {
      resultKey: 'pv2InputPower',
      capabilities: ['measure_power.pv2input'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Math.round(Number(data.value) * 10 ** Number(data.scale)),
    },
    {
      resultKey: 'l1_current',
      capabilities: ['measure_current.phase1'],
      valid: (data) => data.value !== 'xxx' && data.value !== '-1',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'l2_current',
      capabilities: ['measure_current.phase2'],
      valid: (data) => data.value !== 'xxx' && data.value !== '-1',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'l3_current',
      capabilities: ['measure_current.phase3'],
      valid: (data) => data.value !== 'xxx' && data.value !== '-1',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'temperature',
      capabilities: ['measure_temperature.invertor'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'todayEnergy',
      capabilities: ['meter_power.daily'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'pv1TodayEnergy',
      capabilities: ['meter_power.pv1TodayEnergy'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'pv2TodayEnergy',
      capabilities: ['meter_power.pv2TodayEnergy'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'totalEnergy',
      capabilities: ['meter_power'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'pv1TotalEnergy',
      capabilities: ['meter_power.pv1TotalEnergy'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'pv2TotalEnergy',
      capabilities: ['meter_power.pv2TotalEnergy'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'gridVoltage',
      capabilities: ['measure_voltage.meter'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'battvoltage',
      capabilities: ['measure_voltage.battery'],
      valid: (data) => data.value !== 'xxx',
      requireCapabilityCheck: true,
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'batttemperature',
      capabilities: ['measure_temperature.battery'],
      valid: (data) => data.value !== 'xxx',
      requireCapabilityCheck: true,
      transform: (data) => {
        let temp = Number(data.value) * 10 ** Number(data.scale);
        if (temp < 6) {
          temp *= 10;
        }
        return temp;
      },
    },
    {
      resultKey: 'battsoc',
      capabilities: ['measure_battery', 'battery'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
      requireCapabilityCheck: true,
    },
    {
      resultKey: 'bmshealth',
      capabilities: ['batterysoh'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
      requireCapabilityCheck: true,
    },
    {
      resultKey: 'battDischarge',
      capabilities: ['measure_power.batt_discharge'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'battCharge',
      capabilities: ['measure_power.batt_charge'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'bmsstatus',
      capabilities: ['batterystatus'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value),
    },
    {
      resultKey: 'bmscyclecount',
      capabilities: ['batterycycles'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'exportlimitenabled',
      capabilities: ['exportlimitenabled'],
      valid: (data) => this.isValidNumberInRange(data.value, 0, 1),
      transform: (data) => data.value,
    },
    {
      resultKey: 'exportlimitpowerrate',
      capabilities: ['exportlimitpowerrate'],
      valid: (data) => this.isValidNumberInRange(data.value, 0, 1000),
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'priority',
      capabilities: ['priority'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => data.value,
    },
    {
      resultKey: 'totalhouseload',
      capabilities: ['measure_power.houseload'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
      requireCapabilityCheck: true,
    },
    {
      resultKey: 'pactousertotal',
      capabilities: ['measure_power.import'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'pactogridtotal',
      capabilities: ['measure_power.export'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'today_grid_import',
      capabilities: ['meter_power.today_grid_import'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'today_grid_export',
      capabilities: ['meter_power.today_grid_export'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'today_battery_output_energy',
      capabilities: ['meter_power.today_batt_output'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'today_battery_input_energy',
      capabilities: ['meter_power.today_batt_input'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'today_load',
      capabilities: ['meter_power.today_load'],
      valid: (data) => data.value !== 'xxx',
      transform: (data) => Number(data.value) * 10 ** Number(data.scale),
    },
    {
      resultKey: 'gridfirststopsoc',
      capabilities: ['batteryminsoc'],
      valid: (data) => this.isValidNumberInRange(data.value, 10, 100),
      transform: (data) => Number(data.value),
    },
    {
      resultKey: 'gridfirstrate',
      capabilities: ['gfdischargerate'],
      valid: (data) => this.isValidNumberInRange(data.value, 1, 100),
      transform: (data) => Number(data.value),
    },
    {
      resultKey: 'loadfirststopsoc',
      capabilities: ['batteryminsoclf'],
      valid: (data) => this.isValidNumberInRange(data.value, 10, 100),
      transform: (data) => Number(data.value),
    },
    {
      resultKey: 'batfirststopsoc',
      capabilities: ['batterymaxsoc'],
      valid: (data) => data.value !== 'xxx' && Number(data.value) >= 0 && Number(data.value) <= 100,
      transform: (data) => Number(data.value),
    },
    {
      resultKey: 'batfirstrate',
      capabilities: ['bfchargerate'],
      valid: (data) => this.isValidNumberInRange(data.value, 1, 100),
      transform: (data) => Number(data.value),
    },
    {
      resultKey: 'acchargeswitch',
      capabilities: ['battacchargeswitch'],
      valid: (data) => this.isValidNumberInRange(data.value, 0, 1),
      transform: (data) => data.value,
    },
  ];

  private isValidNumberInRange(value: string | number, min: number, max: number): boolean {
    return value !== 'xxx' && Number(value) >= min && Number(value) <= max;
  }

  getMappingAndRegister(
    capability: string,
    holdingRegisters: { [key: string]: RegisterDefinition },
  ): { mapping: CapabilityMapping; registerDefinition: RegisterDefinition } | null {
    const mapping = this.CapabilityMappings.find((m) => m.capabilities.includes(capability));
    if (!mapping) {
      this.log(`Mapping not found for capability: ${capability}`);
      return null;
    }
    const registerDefinition = holdingRegisters[mapping.resultKey];
    if (!registerDefinition) {
      this.log(`Register definition not found for resultKey: ${mapping.resultKey}`);
      return null;
    }
    return { mapping, registerDefinition };
  }

  processRegisterValueCommon(capability: string, registerValue: number, holdingRegisters: { [key: string]: RegisterDefinition }): number | null {
    const result = this.getMappingAndRegister(capability, holdingRegisters);
    if (!result) return null;
    const { mapping, registerDefinition } = result;
    // Use registerDefinition[4] as scale and invert its sign
    const invertedScale = (-1 * registerDefinition[4]).toString();
    // Convert the numeric registerValue to a string for processing, if needed.
    const data: GrowattData = { value: registerValue.toString(), scale: invertedScale };
    const transformedValue = mapping.transform ? mapping.transform(data) : data.value;
    if (transformedValue === null) {
      this.log(`Transformed value is null for capability: ${capability}`);
      return null;
    }
    if (mapping.valid && !mapping.valid({ value: transformedValue.toString(), scale: data.scale })) {
      this.log(`Validation failed for capability: ${capability}`);
      return null;
    }
    return typeof transformedValue === 'number' ? transformedValue : Number(transformedValue);
  }

  castToCapabilityType(capability: string, value: unknown): string | number | boolean {
    const currentValue = this.getCapabilityValue(capability);
    const expectedType = typeof currentValue;

    this.log(`Casting '${capability}' to capability: ${expectedType}, raw value:`, value);

    switch (expectedType) {
      case 'number':
        return Number(value);
      case 'string':
        return String(value);
      case 'boolean':
        return value === true || value === 'true' || value === 1;
      default:
        throw new Error(`Unsupported or unknown capability: ${expectedType}`);
    }
  }

  getSlotCapabilityValue(startTime: number, stopTime: number, enabled?: number): string {
    const formatTime = (hour: number, minute: number): string => `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const priorityMap: Record<number, string> = {
      0: 'Load',
      1: 'Battery',
      2: 'Grid',
    };
    const startminute = startTime & 0xff;
    const starthour = (startTime >> 8) & 0x1f;
    const stopminute = stopTime & 0xff;
    const stophour = (stopTime >> 8) & 0x1f;
    if (enabled !== undefined) {
      return `${formatTime(starthour, startminute)}~${formatTime(stophour, stopminute)}/${enabled === 1 ? 'Enabled' : 'Disabled'}`;
    }
    return `${formatTime(starthour, startminute)}~${formatTime(stophour, stopminute)}/${
      ((startTime >> 15) & 1) === 1 ? 'Enabled' : 'Disabled'
    } priority: ${priorityMap[(startTime >> 13) & 0x3] || 'unknown'}`;
  }

  processResult(result: Record<string, Measurement>, maxpeakpower: number) {
    const context = { maxpeakpower };
    const slots = ['battfirst1', 'battfirst2', 'battfirst3', 'gridfirst1', 'gridfirst2', 'gridfirst3'];

    if (result) {
      // result
      for (const [key, { value, scale, label }] of Object.entries(result)) {
        this.log(key, value, scale, label);
      }

      for (const mapping of this.CapabilityMappings) {
        const data = result[mapping.resultKey];

        if (data && (!mapping.valid || mapping.valid(data, context))) {
          if (mapping.requireCapabilityCheck && !this.hasCapability(mapping.capabilities[0])) {
            continue;
          }

          const transformedValue = mapping.transform?.(data, context);
          if (transformedValue === null || transformedValue === undefined) continue;
          for (const cap of mapping.capabilities) {
            this.addCapability(cap).catch(this.error);
            this.setCapabilityValue(cap, transformedValue).catch(this.error);
          }
        }
      }

      slots.forEach((slot) => {
        const startKey = `${slot}starttime`;
        const stopKey = `${slot}stoptime`;
        const switchKey = `${slot}switch`;

        if (result[startKey] && result[startKey].value !== 'xxx' && this.hasCapability(slot)) {
          const startTime = Number(result[startKey].value);
          const stopTime = Number(result[stopKey].value);
          const enabled = Number(result[switchKey].value);
          const capabilityStr = this.getSlotCapabilityValue(startTime, stopTime, enabled);
          this.log(`${slot}: `, capabilityStr);
          this.setCapabilityValue(slot, capabilityStr).catch(this.error);
        }
      });

      for (let i = 1; i <= 4; i++) {
        const startKey = `period${i}start`;
        const stopKey = `period${i}stop`;
        const capKey = `period${i}`;

        if (result[startKey] && result[startKey].value !== 'xxx' && this.hasCapability(capKey)) {
          const startTime = Number(result[startKey].value);
          const stopTime = Number(result[stopKey].value);
          const capabilityStr = this.getSlotCapabilityValue(startTime, stopTime);
          this.log(`period${i}: `, capabilityStr);
          this.setCapabilityValue(capKey, capabilityStr).catch(this.error);
        }
      }
    }
  }
}
