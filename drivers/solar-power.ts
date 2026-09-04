export default function calculateSolarPanelPower(
  inverterDcPower: number,
  inverterAcPower: number | undefined,
  batteryPowers: number[],
): number {
  const batteryPower = batteryPowers.reduce((total, power) => total + power, 0);

  // Some inverter firmware does not expose reverse DC power while charging the
  // battery from AC. In that case, use the signed AC power to remove the grid
  // contribution from the signed battery charging power.
  const inverterPower = batteryPower > 0
    && inverterDcPower >= 0
    && inverterAcPower !== undefined
    && inverterAcPower < 0
    ? inverterAcPower
    : inverterDcPower;

  return Math.max(0, Math.round(inverterPower + batteryPower));
}
