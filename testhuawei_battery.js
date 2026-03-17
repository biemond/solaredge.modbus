/**
 * Manual test script for the Huawei LUNA2000 battery driver.
 *
 * Usage:
 *   node testhuawei_battery.js [host] [port] [unitId]
 *
 * Defaults:
 *   host   = 192.168.1.1   (change to your SUN2000 inverter IP)
 *   port   = 502
 *   unitId = 3             (battery slave address; 1 = inverter, 3 = battery)
 *
 * The script reads every register that the huawei_battery driver polls,
 * decodes the raw value, applies the gain/scale, and prints a human-readable
 * table so you can validate register offsets and scaling before deploying
 * the driver to a real Homey.
 */

console.log('-------------------');
console.log('Huawei LUNA2000 Battery – register validation script');
console.log('-------------------\n');

const modbus = require('jsmodbus');
const net = require('net');

// ── CLI args ──────────────────────────────────────────────────────────────────
const HOST    = process.argv[2] || '192.168.1.1';
const PORT    = parseInt(process.argv[3], 10) || 502;
const UNIT_ID = process.argv[4] !== undefined ? parseInt(process.argv[4], 10) : 3;

console.log(`Connecting to ${HOST}:${PORT}  unitId=${UNIT_ID}\n`);

// ── Register definitions ──────────────────────────────────────────────────────
// Format: [address, count, type, label, scale, unit]
//   scale: power of 10 applied to raw value  (e.g. -1 → divide by 10)
//   type:  UINT16 | UINT32 | INT16 | INT32 | STRING
const registers = {
  // ── Core battery telemetry (polled by device.ts) ──────────────────────────
  STORAGE_STATE_OF_CAPACITY:           [37760, 1, 'UINT16', 'State of Charge',                    -1, '%'],
  STORAGE_RUNNING_STATUS:              [37762, 1, 'UINT16', 'Running Status',                       0, '(enum)'],
  STORAGE_CHARGE_DISCHARGE_POWER:      [37765, 2, 'INT32',  'Charge/Discharge Power (+=charge)',    0, 'W'],

  // ── Capacity & energy throughput ──────────────────────────────────────────
  STORAGE_RATED_CAPACITY:              [37758, 2, 'UINT32', 'Rated Capacity',                       0, 'Wh'],
  STORAGE_MAXIMUM_CHARGE_POWER:        [37046, 2, 'UINT32', 'Max Charge Power',                     0, 'W'],
  STORAGE_MAXIMUM_DISCHARGE_POWER:     [37048, 2, 'UINT32', 'Max Discharge Power',                  0, 'W'],

  // ── Daily & lifetime counters ─────────────────────────────────────────────
  STORAGE_TOTAL_CHARGE:                [37780, 2, 'UINT32', 'Total Charge (lifetime)',              -2, 'kWh'],
  STORAGE_TOTAL_DISCHARGE:             [37782, 2, 'UINT32', 'Total Discharge (lifetime)',           -2, 'kWh'],
  STORAGE_CURRENT_DAY_CHARGE_CAPACITY: [37784, 2, 'UINT32', 'Today Charge',                        -2, 'kWh'],
  STORAGE_CURRENT_DAY_DISCHARGE_CAPACITY: [37786, 2, 'UINT32', 'Today Discharge',                  -2, 'kWh'],

  // ── Control / mode registers ──────────────────────────────────────────────
  ACTIVE_POWER_CONTROL_MODE:           [47415, 1, 'UINT16', 'Active Power Control Mode',            0, '(enum)'],
  REMOTE_CHARGE_DISCHARGE_CONTROL_MODE:[47589, 1, 'INT16',  'Remote Charge/Discharge Control Mode', 0, '(enum)'],
  STORAGE_FORCIBLE_CHARGE_DISCHARGE_SOC: [47101, 1, 'UINT16', 'Forcible Charge/Discharge SOC',     -1, '%'],
  STORAGE_FORCIBLE_CHARGE_DISCHARGE_WRITE: [47100, 1, 'UINT16', 'Forcible Charge/Discharge Write',  0, '(enum)'],
};

// ── Human-readable enum decoders ──────────────────────────────────────────────
const RUNNING_STATUS = {
  0: 'Offline',
  1: 'Standby',
  2: 'Running',
  3: 'Fault',
  4: 'Sleep',
};

const ACTIVE_POWER_CONTROL_MODE = {
  0: 'Unlimited (default)',
  1: 'DI Active Scheduling',
  5: 'Zero Power Grid Connection',
  6: 'Power Limited – Watt',
  7: 'Power Limited – Percent',
};

const REMOTE_CHARGE_DISCHARGE_CONTROL_MODE = {
  0: 'Local Control',
  1: 'Remote – Max Self-Consumption',
  2: 'Remote – Fully Fed to Grid',
  3: 'Remote – TOU',
  4: 'Remote – AI Control',
};

const FORCIBLE_CHARGE_DISCHARGE_WRITE = {
  0xCC: 'Force Charge',
  0xAA: 'Force Discharge',
  0xFF: 'Stop (default)',
};

const ENUM_DECODERS = {
  STORAGE_RUNNING_STATUS: RUNNING_STATUS,
  ACTIVE_POWER_CONTROL_MODE: ACTIVE_POWER_CONTROL_MODE,
  REMOTE_CHARGE_DISCHARGE_CONTROL_MODE: REMOTE_CHARGE_DISCHARGE_CONTROL_MODE,
  STORAGE_FORCIBLE_CHARGE_DISCHARGE_WRITE: FORCIBLE_CHARGE_DISCHARGE_WRITE,
};

// ── Modbus decode helpers ─────────────────────────────────────────────────────
function decodeBuffer(buf, type) {
  switch (type) {
    case 'UINT16': return buf.readUInt16BE();
    case 'INT16':  return buf.readInt16BE();
    case 'UINT32': return buf.readUInt32BE();
    case 'INT32':  return buf.readInt32BE();
    case 'STRING': return Buffer.from(buf, 'hex').toString().replace(/\0/g, '').trim();
    default:       throw new Error(`Unknown type: ${type}`);
  }
}

function formatValue(key, raw, scale, unit) {
  const scaled = raw * Math.pow(10, scale);

  // For enum fields, show decoded label alongside raw value
  if (ENUM_DECODERS[key]) {
    const label = ENUM_DECODERS[key][raw] ?? `Unknown (${raw})`;
    return `${raw}  →  ${label}`;
  }

  // For scaled values, show both
  if (scale !== 0) {
    return `${raw} (raw)  →  ${scaled.toFixed(Math.abs(scale))} ${unit}`;
  }

  return `${scaled} ${unit}`;
}

// ── Connection & polling ──────────────────────────────────────────────────────
const socket = new net.Socket();
const client = new modbus.client.TCP(socket, UNIT_ID, 5000);

const options = {
  host: HOST,
  port: PORT,
  timeout: 30,
  autoReconnect: false,
};

socket.setKeepAlive(true);
socket.connect(options);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

socket.on('connect', async () => {
  console.log(`Connected. Waiting 2 s before polling...\n`);
  await sleep(2000);

  const colKey   = 'REGISTER'.padEnd(44);
  const colLabel = 'LABEL'.padEnd(38);
  const colValue = 'VALUE';
  console.log(`${colKey}${colLabel}${colValue}`);
  console.log('-'.repeat(120));

  let errCount = 0;

  for (const [key, [address, count, type, label, scale, unit]] of Object.entries(registers)) {
    await sleep(400); // small delay between reads to avoid flooding the inverter

    try {
      const resp = await client.readHoldingRegisters(address, count);
      const buf  = resp.response._body._valuesAsBuffer;
      const raw  = decodeBuffer(buf, type);
      const display = formatValue(key, raw, scale, unit);

      const colKey2   = key.padEnd(44);
      const colLabel2 = label.padEnd(38);
      console.log(`${colKey2}${colLabel2}${display}`);
    } catch (err) {
      errCount++;
      const colKey2   = key.padEnd(44);
      const colLabel2 = label.padEnd(38);
      const errMsg = err.err ?? err.message ?? String(err);
      console.log(`${colKey2}${colLabel2}ERROR: ${errMsg}`);
    }
  }

  console.log('\n' + '-'.repeat(120));
  console.log(`Done. ${Object.keys(registers).length} registers read, ${errCount} error(s).`);

  client.socket.end();
  socket.end();
});

socket.on('close', () => {
  console.log('\nConnection closed.');
});

socket.on('timeout', () => {
  console.error('Socket timed out.');
  client.socket.end();
  socket.end();
});

socket.on('error', (err) => {
  console.error('Socket error:', err.message ?? err);
  socket.end();
});
