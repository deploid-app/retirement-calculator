/**
 * Excel-compatible time-value-of-money functions.
 * `type` = 0 → payments at end of period (ordinary annuity)
 * `type` = 1 → payments at beginning of period (annuity due)
 */

/** Present value of a series of future payments. Mirrors Excel PV(). */
export function PV(
  rate: number,
  nper: number,
  pmt: number,
  fv = 0,
  type: 0 | 1 = 0
): number {
  if (rate === 0) return -(fv + pmt * nper);
  const pow = Math.pow(1 + rate, nper);
  return -(fv + pmt * (1 + rate * type) * ((pow - 1) / rate)) / pow;
}

/** Future value of an investment. Mirrors Excel FV(). */
export function FV(
  rate: number,
  nper: number,
  pmt: number,
  pv = 0,
  type: 0 | 1 = 0
): number {
  if (rate === 0) return -(pv + pmt * nper);
  const pow = Math.pow(1 + rate, nper);
  return -(pv * pow + pmt * (1 + rate * type) * ((pow - 1) / rate));
}

/** Periodic payment for a loan/annuity. Mirrors Excel PMT(). */
export function PMT(
  rate: number,
  nper: number,
  pv: number,
  fv = 0,
  type: 0 | 1 = 0
): number {
  if (nper === 0) return 0;
  if (rate === 0) return -(pv + fv) / nper;
  const pow = Math.pow(1 + rate, nper);
  return (-(pv * pow + fv) * rate) / ((1 + rate * type) * (pow - 1));
}

/** Number of periods. Mirrors Excel NPER(). Returns 0 when not solvable. */
export function NPER(
  rate: number,
  pmt: number,
  pv: number,
  fv = 0,
  type: 0 | 1 = 0
): number {
  if (rate === 0) {
    if (pmt === 0) return 0;
    return -(pv + fv) / pmt;
  }
  const z = pmt * (1 + rate * type);
  const num = z - fv * rate;
  const den = z + pv * rate;
  if (num <= 0 || den <= 0) return 0;
  return Math.log(num / den) / Math.log(1 + rate);
}
