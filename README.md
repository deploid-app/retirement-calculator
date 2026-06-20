# Retirement Calculator

A Next.js retirement-funding calculator that tells you whether you're on track
for retirement and, if not, how much to set aside each month to close the gap.
The financial model is a faithful port of the **CFE Retirement Calculator**
spreadsheet (Malaysian context — RM currency and EPF).

## What it does

Given your age, salary, expected returns, assets, and EPF, it computes:

- **Final salary at retirement** — grown by your annual increment rate.
- **Retirement income needed** — a percentage (replacement ratio) of final salary.
- **Retirement capital needed** — the present value of that income stream over
  your retirement years, discounted by an *inflation-adjusted rate of return*
  `(1 + return) / (1 + inflation) − 1`.
- **Funds available at retirement** — projected assets + EPF + insurance.
- **Funding gap** and the **monthly savings** required to close it.
- A **year-by-year projection chart**: funds accumulate to retirement, then
  draw down as inflation-adjusted retirement income.

### A note on the source spreadsheet

In the original file, the income-replacement cell was entered as `50` rather
than `0.5`, so the formula multiplied final salary by 50× instead of 50%,
producing inflated figures (e.g. "RM 1.1 billion needed"). This app treats the
replacement ratio as a true percentage, so results are realistic. All other
formulas (EPF projection, capital PV, savings PMT) reproduce the spreadsheet
**exactly** — e.g. projected EPF of `RM 8,044,375` matches the source cell.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives)
- **Recharts** for the projection chart

## Project structure

```
src/
  app/
    page.tsx              # Landing page + header
    layout.tsx
    globals.css           # Tailwind v4 theme tokens
  components/
    calculator.tsx        # Main client component (inputs + results)
    retirement-chart.tsx  # Recharts projection
    field.tsx             # Number / percent input helpers
    ui/                   # shadcn/ui components
  lib/
    finance.ts            # Excel-compatible PV / FV / PMT / NPER
    retirement.ts         # The retirement model + projection
    format.ts             # RM / percent formatting
```

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Disclaimer

The results are projected figures for illustration only and do not constitute
financial advice. Consult a qualified financial planner for personalised advice.
