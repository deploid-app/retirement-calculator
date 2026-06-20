export function formatRM(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return "RM 0";
  return `RM ${value.toLocaleString("en-MY", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** Compact RM for chart axes, e.g. RM 1.2M, RM 950k. */
export function formatRMCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}RM ${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}RM ${(abs / 1_000).toFixed(0)}k`;
  return `${sign}RM ${abs.toFixed(0)}`;
}

/** Fraction (0.05) → "5%" for display. */
export function fractionToPct(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
