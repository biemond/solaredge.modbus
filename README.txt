Homey app to receive realtime data from your SolarEdge solar installation using local Modbus TCP

Purpose
The difference of this app and the already existing solar panels app is that this app reads the data directly from the inverter.
The SolarEdge api is limited to 300 calls a day, so you get only updates every 10-15 minutes.

The modbus app receives data every few 20 seconds.
If you have the SolarEdge energy monitor installed you can maximize your self-consumption and limit your exported power by consuming it. You can make flows based on your generated solar power, exported power, imported power or current power consumption.

Supported devices
Following devices are supported
- Inverters with SetApp and with display
- Modbus energy Meter
- StorEdge devices (DC connected battery storage)
