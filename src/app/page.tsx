import { Calculator } from "@/components/calculator";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Retirement Funding · FNA
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Retirement Calculator
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Estimate the capital you&apos;ll need for retirement, see what your
          assets and EPF are projected to provide, and find out how much to set
          aside each month to close any gap.
        </p>
      </header>
      <Calculator />
    </main>
  );
}
