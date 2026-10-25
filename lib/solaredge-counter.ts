// SolarEdge battery counters: big-endian bytes within each 16-bit register,
// least-significant register first. Copy before swapping to preserve the response.
export function decodeSolarEdgeUint64(buffer: Buffer): string {
  if (buffer.length !== 8) return 'xxx';
  const value = Buffer.from(buffer).swap16().readBigUInt64LE();
  return value === 0xffffffffffffffffn ? 'xxx' : value.toString();
}

export function solarEdgeCounterKWh(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined || !/^\d+$/.test(String(value))) return undefined;
  const wh = BigInt(value);
  // Homey capability values are JS numbers. Reject corrupt or inexact integer totals.
  if (wh > BigInt(Number.MAX_SAFE_INTEGER)) return undefined;
  return Number(wh) / 1000;
}
