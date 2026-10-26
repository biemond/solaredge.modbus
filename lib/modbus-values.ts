interface ScaledMeasurement {
  value?: string | number | null;
  scale?: string | number | null;
}

// Missing readings and scales must stay unknown rather than turning into zero or NaN.
export default function readScaledNumber(entry: ScaledMeasurement | undefined): number | undefined {
  const raw = [entry?.value, entry?.scale];
  if (raw.some((value) => value === null || value === undefined || String(value).trim() === '')) return undefined;
  const value = Number(entry?.value) * 10 ** Number(entry?.scale);
  return Number.isFinite(value) ? value : undefined;
}
