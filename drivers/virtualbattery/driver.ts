import Homey from 'homey';
// eslint-disable-next-line node/no-missing-import
import { batteryService, sourceKey, SUPPORTED_DRIVERS } from '../../lib/battery-data';

class VirtualBatteryDriver extends Homey.Driver {
  async onPairListDevices() {
    const service = batteryService(this.homey);
    const paired = new Set(this.getDevices().map((device) => device.getData().id));
    const devices = [];
    for (const driverId of SUPPORTED_DRIVERS) {
      const driver = this.homey.drivers.getDriver(driverId);
      await driver.ready();
      for (const master of driver.getDevices()) {
        for (const snapshot of service.snapshots.values()) {
          if (snapshot.masterDriverId !== driverId
            || snapshot.masterDeviceId !== master.getData().id
            || Date.now() - snapshot.updatedAt > snapshot.staleAfterMs) continue;
          const id = sourceKey(driverId, master.getData().id, snapshot.id);
          if (paired.has(id)) continue;
          devices.push({
            name: `${master.getName()} — ${snapshot.label}`,
            data: {
              id, masterDriverId: driverId, masterDeviceId: master.getData().id, batteryId: snapshot.id,
            },
          });
        }
      }
    }
    return devices;
  }
}

module.exports = VirtualBatteryDriver;
