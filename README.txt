Homey app to receive realtime data from your SolarEdge, Growatt, Sungrow, Huawei, Solax & Wattsonic solar installation using local Modbus TCP

Purpose
The difference of this app and the already existing solar panels app is that this app reads the data directly from the inverter.
The SolarEdge api is for example limited to 300 calls a day, so you get only updates every 10-15 minutes.

The modbus app receives data every few 20 seconds.
If you have an energy monitor installed you can maximize your self-consumption and limit your exported power by consuming it. You can make flows based on your generated solar power, exported power, imported power or current power consumption.

Following devices are supported
- Solaredge Inverters with SetApp and with display with or without Modbus energy Meter
- Solaredge StorEdge devices (DC connected battery storage)
- Growatt - SPA, SPH or TL-X XXX Hybrid Inverter and others in the same range using local Modbus TCP, follow this doc https://www.dropbox.com/s/584915enkxc508u/Setup%20Growatt.pdf?dl=0
- Wattsonic gen3 inverter and their clones (sunways, solinteg, A-Tronix, St-ems). following this blog Wattsonic Hybrid Inverter Gen3 Modbus RTU Protocol https://smarthome.exposed/wattsonic-hybrid-inverter-gen3-modbus-rtu-protocol/
- Sungrow Hybrid with battery
- Huawei Hybrid with battery
- Solax with battery