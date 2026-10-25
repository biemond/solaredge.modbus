import { EventEmitter } from 'events';
import type Homey from 'homey';

export interface BatterySource {
  id: string;
  label: string;
  scope: 'battery' | 'bank';
  values: Record<string, number | string>;
}

export interface BatterySnapshot extends BatterySource {
  masterDriverId: string;
  masterDeviceId: string;
  updatedAt: number;
  staleAfterMs: number;
}

type Result = Record<string, { value: string | number | null; scale?: string | number }>;
type Listener = (snapshot: BatterySnapshot | null) => void;

const SUPPORTED_DRIVERS = new Set([
  'invertorwithbatt', 'growattwithbatt', 'growattwithbatt_tl', 'growattwithbatt_tls',
]);

class BatteryService {
  readonly snapshots = new Map<string, BatterySnapshot>();
  readonly events = new EventEmitter();

  constructor() {
    this.events.setMaxListeners(0);
  }

  publish(key: string, snapshot: BatterySnapshot) {
    this.snapshots.set(key, snapshot);
    this.events.emit(key, snapshot);
  }

  subscribe(key: string, listener: Listener) {
    this.events.on(key, listener);
    const latest = this.snapshots.get(key);
    if (latest) listener(latest);
    return () => this.events.removeListener(key, listener);
  }

  remove(key: string) {
    this.snapshots.delete(key);
    this.events.emit(key, null);
  }
}

// One service per app runtime, shared by masters and virtual devices.
const services = new WeakMap<Homey.Device['homey'], BatteryService>();
function batteryService(homey: Homey.Device['homey']): BatteryService {
  if (!services.has(homey)) services.set(homey, new BatteryService());
  return services.get(homey)!;
}

function sourceKey(masterDriverId: string, masterDeviceId: string, batteryId: string) {
  return JSON.stringify([masterDriverId, masterDeviceId, batteryId]);
}

// Growatt supplies a decimal exponent. SolarEdge battery floats are already scaled.
function readNumber(result: Result, key: string, scaled = false): number | undefined {
  const entry = result[key];
  if (!entry || entry.value === null || entry.value === undefined
    || String(entry.value).trim() === '' || entry.value === 'xxx') return undefined;
  const value = Number(entry.value) * (scaled ? 10 ** Number(entry.scale) : 1);
  return Number.isFinite(value) ? value : undefined;
}

function put(values: Record<string, number | string>, capability: string, value: number | undefined, min = -Infinity, max = Infinity) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max) values[capability] = value;
}

function solarEdgeBatteries(result: Result): BatterySource[] {
  return [1, 2].flatMap((slot) => {
    const get = (name: string) => {
      const value = readNumber(result, `batt${slot}-${name}`);
      // Unavailable SolarEdge readings can be finite Float32 limit values.
      // Reject both signs before any field conversion, including signed current/power.
      return value !== undefined && Math.abs(value) < 3.4e38 ? value : undefined;
    };
    const power = get('instantaneous_power');
    const soc = get('soe');
    if (power === undefined || soc === undefined || soc < 0 || soc > 100) return [];
    const values: Record<string, number | string> = { measure_power: power, measure_battery: soc };
    put(values, 'batterysoh', get('soh'), 0, 100);
    put(values, 'measure_temperature', get('average_temperature'), -100, 150);
    put(values, 'measure_voltage', get('instantaneous_voltage'), 0);
    put(values, 'measure_current', get('instantaneous_current'));
    put(values, 'batterycap', (get('available_energy') ?? NaN) / 1000, 0);
    put(values, 'batterymaxcap', (get('maximum_energy') ?? NaN) / 1000, 0);
    put(values, 'batteryratedcap', (get('rated_energy') ?? NaN) / 1000, 0);
    const status = get('status');
    if (status !== undefined && Number.isInteger(status) && status >= 0) values.battstatus = String(status);
    // Lifetime counters intentionally omitted until SolarEdge UINT64 decoding is verified.
    return [{
      id: `slot:${slot}`, label: `Battery ${slot}`, scope: 'battery', values,
    }];
  });
}

function growattBatteries(result: Result): BatterySource[] {
  const get = (name: string) => readNumber(result, name, true);
  const charge = get('battCharge');
  const discharge = get('battDischarge');
  const soc = get('battsoc');
  if (charge === undefined || charge < 0 || discharge === undefined || discharge < 0
    || soc === undefined || soc < 0 || soc > 100) return [];
  const values: Record<string, number> = { measure_power: charge - discharge, measure_battery: soc };
  put(values, 'batterysoh', get('bmshealth'), 0, 100);
  put(values, 'measure_temperature', get('batttemperature'), -100, 150);
  put(values, 'measure_voltage', get('battvoltage'), 0);
  put(values, 'batterycycles', get('bmscyclecount'), 0);
  put(values, 'battery_status_code', readNumber(result, 'bmsstatus'), 0);
  put(values, 'meter_power.charged', get('total_battery_intput_energy'), 0);
  put(values, 'meter_power.discharged', get('total_battery_output_energy'), 0);
  // Do not copy the legacy temperature <6 correction: it also changes valid cold readings.
  return [{
    id: 'bank:1', label: 'Battery bank', scope: 'bank', values,
  }];
}

function publishBatteries(master: Homey.Device, result: Result, brand: 'solaredge' | 'growatt') {
  const driverId = master.driver.id;
  if (!SUPPORTED_DRIVERS.has(driverId)) return;
  const sources = brand === 'solaredge' ? solarEdgeBatteries(result) : growattBatteries(result);
  const interval = Number(master.getSetting('pollinginterval')) || 30;
  const service = batteryService(master.homey);
  for (const source of sources) {
    const key = sourceKey(driverId, master.getData().id, source.id);
    service.publish(key, {
      ...source,
      masterDriverId: driverId,
      masterDeviceId: master.getData().id,
      updatedAt: Date.now(),
      staleAfterMs: Math.max(120000, interval * 3000),
    });
  }
}

export {
  BatteryService, batteryService, sourceKey, readNumber,
  solarEdgeBatteries, growattBatteries, publishBatteries, SUPPORTED_DRIVERS,
};
