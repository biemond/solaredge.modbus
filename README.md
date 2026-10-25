Homey app to receive realtime data from your SolarEdge, Growatt, Sungrow, Huawei, Kostal, Solax & Wattsonic solar installation using local Modbus TCP

## Purpose

The difference of this app and the already existing solar panels app is that this app reads the data directly from the inverter.
The SolarEdge api is only limited to 300 calls/ day, so you get only updates every 10-15 minutes.

The modbus app receives data every few seconds.
If you have an energy monitor installed you can maximize your self-consumption and limit your exported power by using it. You can make flows based on your generated solar power, exported power, imported power or current power consumption.

The iOS / android app from SolarEdge or Growatt are fine, so it is not the purpose to create this app again.

## Supported devices

Following devices are supported

- Inverters with SetApp and with display
- Modbus energy Meter
- Storedge devices (DC connected battery storage)
- Growatt - SPA, SPH or TL-X XXX Hybrid Inverter and others in the same range
- Wattsonic gen3 inverter and their clones (sunways, solinteg, A-Tronix, St-ems)
- Sungrow Hybrid and with battery
- Huawei Hybrid and with battery, also double Huawei with s-dongle
- Solax with battery
- Kostal with battery
- Sigenergy with battery

## Inverters

Modbus TCP is disabled by default on all inverters, you have to enable this function
Important: The TCP server idle time is 2 minutes after starting. In order to leave the connection open, the request should be made
within 2 minutes. The connection can remain open without any MODBUS requests.
General information can be found at:

- https://www.SolarEdge.com/sites/default/files/sunspec-implementation-technical-note.pdf
- https://www.photovoltaikforum.com/core/attachment/265072-pdfcoffee-com-growatt-inverter-modbus-rtu-protocolii-v120-english-pdf-free-pdf/

## Solaredge Inverters with SetApp

Enable wifi direct on the inverter. Connect to the inverter access point like you would for a normal wifi network. The wifi password is published at the right side of the inverter. Then open up a browser and go to http://172.16.0.1 . From this webpage you can enable modbus TCP without setApp or installer account.

## Solaredge Inverters with display (without SetApp)

Your CPU firmware has to be at least v 3.xxxx, if this is not the case, upgrade your firmware.
https://www.SolarEdge.com/sites/default/files/upgrading_an_inverter_using_micro_sd_card.pdf
Go to the menu by the following steps:

- Long press the 'OK' button for a few seconds
- Release the 'OK' button
- The screen will ask a password, this is '12312312' (the 2nd button from the left is '1', the 3rd button is '2', etc...)
- Go to Communication --> LAN Conf --> Modbus TCP (the default port is 502).
- To modify the TCP port, select Modbus TCP --> TCP Port, set the port number and long-press Enter

## Growatt inverters

Please do the following on Growatt described in this doc https://www.dropbox.com/s/584915enkxc508u/Setup%20Growatt.pdf?dl=0

## Wattsonic gen3 inverter

following this blog Wattsonic Hybrid Inverter Gen3 Modbus RTU Protocol https://smarthome.exposed/wattsonic-hybrid-inverter-gen3-modbus-rtu-protocol/

## Support topic

For support please use the official support topic on the forum [here](https://community.athom.com/t/app-SolarEdge/45487).

## Virtual batteries (SolarEdge and Growatt)

Add **Virtual Battery** after pairing a supported inverter and letting it finish a
successful battery poll. Pairing lists the inverter name and each battery source.
SolarEdge exposes battery slots 1 and 2 separately; the Growatt battery, TL and
TLS drivers currently expose one battery bank per inverter. Two inverters with
one battery each therefore produce two independent pairing choices. An already
paired source is omitted from the list. If the list is empty, wait for the next
master poll and reopen pairing.

The virtual device receives snapshots from the existing inverter poll. It has no
Modbus connection, IP settings or polling requests. It reports signed battery
power (positive charging, negative discharging), individual SoC, and supported
health, temperature, voltage, current, capacity, status-code and cycle readings.
Missing optional measurements are cleared; zero power and 0% SoC are valid.
SolarEdge reuses the existing `battstatus` enum (for example Idle and Sleep).
Growatt status codes remain vendor-specific numeric diagnostic values.

Growatt lifetime battery input/output counters feed charged/discharged energy in
Homey Energy. SolarEdge lifetime counters are intentionally not exposed yet:
`checkBattery()` currently truncates UINT64 values and their decoding, direction
and units need verification first. This limits Energy features that require
separate charged/discharged totals on SolarEdge.

The virtual battery is monitoring-only. Existing master `measure_power`, solar
Energy reporting, Flows and controls are unchanged. On hybrid inverters the master
may include battery power in its solar reporting, so the combined Homey Energy
view still needs the separately planned PV-only reporting option.

After an app restart the device waits for a fresh master poll. It becomes
unavailable when its master is removed or no complete battery snapshot arrives
for the greater of two minutes and three configured polling intervals. It
recovers automatically on fresh data. A 15-second timer checks availability only.

### Extending battery support

`lib/battery-data.ts` contains the shared in-memory snapshot service and pure
SolarEdge/Growatt adapters. Adapters normalize existing decoded poll results into
per-source capability values; source IDs identify either a physical slot or a
battery bank. Add another master driver to `SUPPORTED_DRIVERS`, implement its
adapter and call `publishBatteries` from its result-processing path. Do not add
Modbus reads to the virtual driver. Unsupported fields should be omitted, never
invented or filled with zero. Use lifetime counters, not resetting daily totals.

### Local checks and hardware trial

Run `npm run test:virtual-battery`, `npm run test:solar-power` and
`homey app validate`. Install the development app through the Homey CLI, then add
Virtual Battery devices for the desired sources. Check idle/charge/discharge
signs, per-slot SoC/SoH and capacity units against the inverter. Test two masters,
app restart, disconnection/recovery and deletion of a master. This feature has
local mocked SDK coverage; live inverter and Homey Energy verification is still
required.
