import { PV, FV, PMT, NPER } from "./finance";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export interface Asset {
  id: string;
  type: string;
  currentValue: number;
  growthRate: number; // annual, as a fraction (0.04 = 4%)
}

export interface EpfInputs {
  currentBalance: number;
  dividend: number; // annual EPF dividend, fraction
  contributionRate: number; // employee + employer, fraction
  bonus: number; // annual bonus added to contribution base
}

export interface RetirementInputs {
  name: string;
  currentAge: number;
  retireAge: number;
  liveUntilAge: number;

  currentSalary: number; // annual
  incrementRate: number; // annual salary increment, fraction
  replacementRatio: number; // % of final salary needed in retirement, fraction

  postRetReturn: number; // post-retirement rate of return, fraction
  postRetInflation: number; // post-retirement inflation, fraction

  investmentReturn: number; // pre-retirement investment return for the savings gap, fraction
  projectedInsurance: number; // insurance maturity / cash value at retirement

  commitToggle: boolean;
  commitSaving: number; // additional committed monthly savings

  assets: Asset[];
  epf: EpfInputs;
}

export interface ProjectionPoint {
  age: number;
  /** Total funds available that year (accumulation curve, then drawdown). */
  funds: number;
  /** EPF component during accumulation. */
  epf: number;
  /** Asset component during accumulation. */
  assets: number;
  /** Additional committed savings component during accumulation. */
  committed: number;
  /** Annual retirement income drawn (outflow). */
  outflow: number;
  /** Constant target capital line. */
  target: number;
}

export interface RetirementResults {
  yearsToRetire: number;
  finalSalary: number;
  retirementIncomeNeeded: number; // annual
  monthlyIncomeNeeded: number;

  iarr: number; // inflation-adjusted rate of return
  yearsInRetirement: number;
  capitalNeeded: number;

  assetsFutureValue: number;
  epfAtRetirement: number;
  fundsAvailable: number;

  isOnTrack: boolean;
  gap: number; // negative = shortfall, positive = surplus
  monthlySavingsRequired: number;

  yearsSustained: number;
  sustainUntilAge: number;

  projection: ProjectionPoint[];
  summary: string;
}

/* ------------------------------------------------------------------ *
 * EPF projection (mirrors the "My EPF Savings" sheet)
 * ------------------------------------------------------------------ */

export function projectEpf(
  epf: EpfInputs,
  years: number,
  incrementRate: number,
  contributionBase: number
): number {
  // (A) Future value of current balance
  const fvCurrent = epf.currentBalance * Math.pow(1 + epf.dividend, years);

  // (B) Future value of projected future contributions
  const contributionAmount = (contributionBase + epf.bonus) * epf.contributionRate;
  const adjustedRate = (1 + epf.dividend) / (1 + incrementRate) - 1;
  const pv = PV(adjustedRate, years, -contributionAmount, 0, 1);
  const fvContributions = pv * Math.pow(1 + epf.dividend, years);

  return fvCurrent + fvContributions;
}

/* ------------------------------------------------------------------ *
 * Asset projection (mirrors the "My Assets Value" sheet)
 * ------------------------------------------------------------------ */

export function projectAssets(assets: Asset[], years: number): number {
  return assets.reduce(
    (sum, a) => sum + a.currentValue * Math.pow(1 + a.growthRate, years),
    0
  );
}

/* ------------------------------------------------------------------ *
 * Main calculation
 * ------------------------------------------------------------------ */

export function calculateRetirement(input: RetirementInputs): RetirementResults {
  const yearsToRetire = Math.max(0, input.retireAge - input.currentAge);
  const yearsInRetirement = Math.max(0, input.liveUntilAge - input.retireAge);

  // --- Income needed ---
  const finalSalary =
    input.currentSalary * Math.pow(1 + input.incrementRate, yearsToRetire);
  const retirementIncomeNeeded = finalSalary * input.replacementRatio;
  const monthlyIncomeNeeded = retirementIncomeNeeded / 12;

  // --- Capital needed (inflation-adjusted PV of the income stream) ---
  const iarr = (1 + input.postRetReturn) / (1 + input.postRetInflation) - 1;
  const capitalNeeded = PV(
    iarr,
    yearsInRetirement,
    -retirementIncomeNeeded,
    0,
    1 // annuity due — income drawn at the start of each year
  );

  // --- Funds available ---
  const assetsFutureValue = projectAssets(input.assets, yearsToRetire);
  const epfAtRetirement = projectEpf(
    input.epf,
    yearsToRetire,
    input.incrementRate,
    input.currentSalary
  );
  const fundsAvailable =
    assetsFutureValue + input.projectedInsurance + epfAtRetirement;

  // --- Gap & monthly savings required ---
  const rawGap = fundsAvailable - capitalNeeded;
  const isOnTrack = rawGap >= 0;
  const gap = isOnTrack ? 0 : rawGap; // shortfall is negative
  const monthsBeforeRetirement = yearsToRetire * 12;
  const monthlySavingsRequired = isOnTrack
    ? 0
    : PMT(input.investmentReturn / 12, monthsBeforeRetirement, 0, gap, 0);

  // --- How long the funds last in retirement ---
  const yearsSustained =
    retirementIncomeNeeded > 0
      ? NPER(iarr, -retirementIncomeNeeded, fundsAvailable, 0, 0)
      : 0;
  const sustainUntilAge =
    input.retireAge + Math.max(0, Math.floor(yearsSustained));

  const projection = buildProjection(input, capitalNeeded);

  const summary = buildSummary({
    input,
    isOnTrack,
    gap,
    capitalNeeded,
    monthlySavingsRequired,
    yearsToRetire,
    yearsSustained,
    sustainUntilAge,
  });

  return {
    yearsToRetire,
    finalSalary,
    retirementIncomeNeeded,
    monthlyIncomeNeeded,
    iarr,
    yearsInRetirement,
    capitalNeeded,
    assetsFutureValue,
    epfAtRetirement,
    fundsAvailable,
    isOnTrack,
    gap,
    monthlySavingsRequired,
    yearsSustained,
    sustainUntilAge,
    projection,
    summary,
  };
}

/* ------------------------------------------------------------------ *
 * Year-by-year projection (mirrors the "Calculations" sheet)
 * ------------------------------------------------------------------ */

function buildProjection(
  input: RetirementInputs,
  capitalNeeded: number
): ProjectionPoint[] {
  const {
    currentAge,
    retireAge,
    liveUntilAge,
    incrementRate,
    investmentReturn: preROR,
    postRetReturn: postROR,
    postRetInflation: postInf,
    commitToggle,
    commitSaving,
    projectedInsurance,
    epf,
  } = input;

  const contributionAmount =
    (input.currentSalary + epf.bonus) * epf.contributionRate;
  const retirementIncome =
    input.currentSalary *
    Math.pow(1 + incrementRate, retireAge - currentAge) *
    input.replacementRatio;

  const points: ProjectionPoint[] = [];

  // Per-year component series
  let prevEpf = 0;
  let prevPot = 0; // the "D" column — drawdown pot
  let prevE = 0;
  let prevF = 0;
  let prevG = 0;
  let prevH = 0;

  for (let i = 0, age = currentAge; age <= liveUntilAge; i++, age++) {
    const accumulating = age <= retireAge;

    // EPF (F)
    let epfVal: number;
    if (accumulating) {
      if (i === 0) {
        epfVal =
          epf.currentBalance * (1 + epf.dividend) + contributionAmount;
      } else {
        epfVal =
          prevEpf * (1 + epf.dividend) +
          (age < retireAge
            ? contributionAmount * Math.pow(1 + incrementRate, i)
            : 0);
      }
    } else {
      epfVal = 0;
    }

    // Assets (G)
    const assetsVal = accumulating
      ? projectAssets(input.assets, i)
      : 0;

    // Insurance (H)
    const insuranceVal = age === retireAge ? projectedInsurance : 0;

    // Additional committed savings (E)
    const committedVal =
      accumulating && commitToggle
        ? FV(preROR / 12, i * 12, -commitSaving, 0, 0)
        : 0;

    // Outflow (J) — drawdown of inflation-adjusted income during retirement
    const yearsIntoRetirement = age - retireAge;
    const outflow =
      age > retireAge && age <= liveUntilAge
        ? retirementIncome * Math.pow(1 + postInf, yearsIntoRetirement)
        : 0;

    // Drawdown pot (D)
    let pot: number;
    if (i === 0) {
      pot = 0 - outflow;
    } else {
      pot =
        prevPot * (age < retireAge ? 1 + preROR : 1 + postROR) +
        (accumulating ? 0 : prevE + prevF + prevG + prevH) -
        outflow;
    }

    // Total funds (K) — accumulation curve then drawdown
    const funds = pot + committedVal + epfVal + assetsVal + insuranceVal;

    points.push({
      age,
      funds,
      epf: epfVal,
      assets: assetsVal,
      committed: committedVal,
      outflow,
      target: capitalNeeded,
    });

    prevEpf = epfVal;
    prevPot = pot;
    prevE = committedVal;
    prevF = epfVal;
    prevG = assetsVal;
    prevH = insuranceVal;
  }

  return points;
}

/* ------------------------------------------------------------------ *
 * Summary text (mirrors the "Financial Summary" cell)
 * ------------------------------------------------------------------ */

function buildSummary(args: {
  input: RetirementInputs;
  isOnTrack: boolean;
  gap: number;
  capitalNeeded: number;
  monthlySavingsRequired: number;
  yearsToRetire: number;
  yearsSustained: number;
  sustainUntilAge: number;
}): string {
  const {
    input,
    isOnTrack,
    gap,
    capitalNeeded,
    monthlySavingsRequired,
    yearsToRetire,
    yearsSustained,
    sustainUntilAge,
  } = args;

  const rm = (n: number) =>
    `RM ${Math.round(n).toLocaleString("en-MY")}`;

  if (isOnTrack) {
    return (
      `Congratulations${input.name ? `, ${input.name}` : ""}! You're on track ` +
      `to achieve your retirement goal of ${rm(capitalNeeded)}. ` +
      `By age ${input.liveUntilAge}, your projected funds are expected to ` +
      `cover your planned retirement income.`
    );
  }

  const years = Math.max(0, Math.floor(yearsSustained));
  return (
    `You need an additional ${rm(Math.abs(gap))} by age ${input.retireAge} ` +
    `to achieve your retirement goal of ${rm(capitalNeeded)}. ` +
    `This can be met by saving ${rm(monthlySavingsRequired)} every month for ` +
    `${yearsToRetire} years.\n\n` +
    `Your projected retirement funds available will last for ± ${years} ` +
    `year${years === 1 ? "" : "s"}, until age ${sustainUntilAge}.`
  );
}

/* ------------------------------------------------------------------ *
 * Defaults (seeded from the source spreadsheet, with the replacement
 * ratio treated as a true percentage)
 * ------------------------------------------------------------------ */

export const defaultInputs: RetirementInputs = {
  name: "",
  currentAge: 26,
  retireAge: 60,
  liveUntilAge: 80,

  currentSalary: 180000,
  incrementRate: 0.05,
  replacementRatio: 0.5,

  postRetReturn: 0.03,
  postRetInflation: 0.05,

  investmentReturn: 0.05,
  projectedInsurance: 0,

  commitToggle: false,
  commitSaving: 0,

  assets: [
    { id: "a1", type: "Unit Trust", currentValue: 0, growthRate: 0.04 },
    { id: "a2", type: "Stocks", currentValue: 0, growthRate: 0.05 },
    { id: "a3", type: "Investment Property", currentValue: 0, growthRate: 0.04 },
  ],
  epf: {
    currentBalance: 0,
    dividend: 0.055,
    contributionRate: 0.23,
    bonus: 0,
  },
};

export { PV, FV, PMT, NPER };
