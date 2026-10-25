import Homey from 'homey';
// eslint-disable-next-line node/no-missing-import
import { batteryService, sourceKey, BatterySnapshot } from '../../lib/battery-data';

class VirtualBatteryDevice extends Homey.Device {
  private unsubscribe?: () => void;
  private availabilityTimer?: NodeJS.Timeout;
  private updates: Promise<void> = Promise.resolve();
  private stopped = false;
  private latest: BatterySnapshot | null = null;
  private applied?: BatterySnapshot;

  async onInit() {
    this.stopped = false;
    await this.setUnavailable('Waiting for battery data from the inverter');
    const data = this.getData();
    // Migrate devices paired with the first virtual battery patch.
    if (data.masterDriverId === 'invertorwithbatt' && this.hasCapability('battery_status_code')) {
      await this.removeCapability('battery_status_code');
    }
    const key = sourceKey(data.masterDriverId, data.masterDeviceId, data.batteryId);
    this.unsubscribe = batteryService(this.homey).subscribe(key, (snapshot: BatterySnapshot | null) => {
      this.latest = snapshot;
      this.enqueueRefresh();
    });
    // This timer checks availability only. It never reads Modbus or requests a poll.
    this.availabilityTimer = this.homey.setInterval(() => this.enqueueRefresh(), 15000);
  }

  private enqueueRefresh() {
    this.updates = this.updates.then(() => this.refresh()).catch(async (error) => {
      this.error(error);
      if (!this.stopped) await this.setUnavailable('Unable to update battery measurements').catch(this.error);
    });
  }

  private async refresh() {
    if (this.stopped) return;
    const data = this.getData();
    const master = this.homey.drivers.getDriver(data.masterDriverId).getDevices()
      .find((device) => device.getData().id === data.masterDeviceId);
    if (!master) {
      await this.setUnavailable('Linked inverter was removed');
      return;
    }
    const snapshot = this.latest;
    if (!snapshot || Date.now() - snapshot.updatedAt > snapshot.staleAfterMs) {
      await this.setUnavailable('Waiting for fresh battery data from the inverter');
      return;
    }
    if (this.applied === snapshot) {
      await this.setAvailable();
      return;
    }
    const values = { ...snapshot.values };
    for (const [capability, value] of Object.entries(values)) {
      const definition = this.homey.manifest.capabilities?.[capability];
      // Use the existing capability enum as the authority for supported status IDs.
      if (definition?.type === 'enum'
        && !definition.values.some((option: { id: string }) => option.id === value)) {
        delete values[capability];
        continue;
      }
      if (!this.hasCapability(capability)) await this.addCapability(capability);
      await this.setCapabilityValue(capability, value);
    }
    // Clear unavailable optional readings instead of retaining an old value as current.
    for (const capability of this.getCapabilities()) {
      if (!(capability in values)) await this.setCapabilityValue(capability, null);
    }
    const hasCounters = this.hasCapability('meter_power.charged')
      && this.hasCapability('meter_power.discharged');
    const energy = hasCounters ? {
      homeBattery: true,
      meterPowerImportedCapability: 'meter_power.charged',
      meterPowerExportedCapability: 'meter_power.discharged',
    } : { homeBattery: true };
    if (JSON.stringify(this.getEnergy()) !== JSON.stringify(energy)) await this.setEnergy(energy);
    this.applied = snapshot;
    await this.setAvailable();
  }

  private stop() {
    this.stopped = true;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    if (this.availabilityTimer) this.homey.clearInterval(this.availabilityTimer);
    this.availabilityTimer = undefined;
  }

  async onDeleted() {
    this.stop();
  }

  async onUninit() {
    this.stop();
  }
}

module.exports = VirtualBatteryDevice;
