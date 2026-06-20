"use client";

import * as React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
  Target,
  PiggyBank,
} from "lucide-react";

import {
  calculateRetirement,
  defaultInputs,
  type Asset,
  type RetirementInputs,
} from "@/lib/retirement";
import { formatRM } from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NumberField, PercentField } from "@/components/field";
import { RetirementChart } from "@/components/retirement-chart";

const ASSET_TYPES = [
  "Unit Trust",
  "Stocks",
  "Robo Advisor",
  "Index Funds / ETFs",
  "Bank Savings",
  "Investment Property",
  "Jewellery / Watches",
  "Gold",
  "Insurance",
  "Other",
];

export function Calculator() {
  const [inputs, setInputs] = React.useState<RetirementInputs>(defaultInputs);

  const results = React.useMemo(() => calculateRetirement(inputs), [inputs]);

  const set = <K extends keyof RetirementInputs>(
    key: K,
    value: RetirementInputs[K]
  ) => setInputs((prev) => ({ ...prev, [key]: value }));

  const setEpf = <K extends keyof RetirementInputs["epf"]>(
    key: K,
    value: RetirementInputs["epf"][K]
  ) => setInputs((prev) => ({ ...prev, epf: { ...prev.epf, [key]: value } }));

  const updateAsset = (id: string, patch: Partial<Asset>) =>
    setInputs((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));

  const addAsset = () =>
    setInputs((prev) => ({
      ...prev,
      assets: [
        ...prev.assets,
        {
          id: `a${Date.now()}`,
          type: "Other",
          currentValue: 0,
          growthRate: 0.04,
        },
      ],
    }));

  const removeAsset = (id: string) =>
    setInputs((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a.id !== id),
    }));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
      {/* ---------------- Inputs ---------------- */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>
            Fill in your details to see whether you&apos;re on track for
            retirement, and how much to set aside if not.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basics">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="epf">EPF</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basics */}
            <TabsContent value="basics" className="mt-5 space-y-5">
              <div className="grid gap-1.5">
                <Label>Your name</Label>
                <Input
                  value={inputs.name}
                  placeholder="Optional"
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NumberField
                  label="Current age"
                  value={inputs.currentAge}
                  onChange={(v) => set("currentAge", v)}
                  min={1}
                />
                <NumberField
                  label="Retire at"
                  value={inputs.retireAge}
                  onChange={(v) => set("retireAge", v)}
                  min={1}
                />
                <NumberField
                  label="Live until"
                  value={inputs.liveUntilAge}
                  onChange={(v) => set("liveUntilAge", v)}
                  min={1}
                />
              </div>
              <NumberField
                label="Current annual salary"
                value={inputs.currentSalary}
                onChange={(v) => set("currentSalary", v)}
                prefix="RM"
                step={1000}
              />
              <div className="grid grid-cols-2 gap-3">
                <PercentField
                  label="Salary increment / year"
                  value={inputs.incrementRate}
                  onChange={(v) => set("incrementRate", v)}
                />
                <PercentField
                  label="Income replacement"
                  value={inputs.replacementRatio}
                  onChange={(v) => set("replacementRatio", v)}
                  hint="% of final salary needed in retirement"
                />
              </div>
            </TabsContent>

            {/* Assets */}
            <TabsContent value="assets" className="mt-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Assets you plan to liquidate to fund retirement. Each is grown
                to your retirement age at its growth rate.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-28">Value</TableHead>
                    <TableHead className="w-20">Growth</TableHead>
                    <TableHead className="w-28 text-right">
                      At retirement
                    </TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inputs.assets.map((asset, i) => {
                    const fv =
                      asset.currentValue *
                      Math.pow(1 + asset.growthRate, results.yearsToRetire);
                    return (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <Select
                            value={asset.type}
                            onValueChange={(v) =>
                              updateAsset(asset.id, { type: v })
                            }
                          >
                            <SelectTrigger size="sm" className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ASSET_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="h-8"
                            value={asset.currentValue || ""}
                            onChange={(e) =>
                              updateAsset(asset.id, {
                                currentValue: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="relative">
                            <Input
                              type="number"
                              className="h-8 pr-6"
                              value={Number(
                                (asset.growthRate * 100).toFixed(2)
                              )}
                              onChange={(e) =>
                                updateAsset(asset.id, {
                                  growthRate:
                                    (parseFloat(e.target.value) || 0) / 100,
                                })
                              }
                            />
                            <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">
                              %
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm">
                          {formatRM(fv)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeAsset(asset.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {inputs.assets.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-6 text-center text-sm text-muted-foreground"
                      >
                        No assets added yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Button variant="outline" size="sm" onClick={addAsset}>
                <Plus className="size-4" /> Add asset
              </Button>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Total asset value at retirement
                </span>
                <span className="font-semibold tabular-nums">
                  {formatRM(results.assetsFutureValue)}
                </span>
              </div>
            </TabsContent>

            {/* EPF */}
            <TabsContent value="epf" className="mt-5 space-y-5">
              <p className="text-sm text-muted-foreground">
                Projected Employees Provident Fund balance at retirement.
              </p>
              <NumberField
                label="Current EPF balance"
                value={inputs.epf.currentBalance}
                onChange={(v) => setEpf("currentBalance", v)}
                prefix="RM"
                step={1000}
              />
              <div className="grid grid-cols-2 gap-3">
                <PercentField
                  label="EPF dividend / year"
                  value={inputs.epf.dividend}
                  onChange={(v) => setEpf("dividend", v)}
                />
                <PercentField
                  label="Contribution rate"
                  value={inputs.epf.contributionRate}
                  onChange={(v) => setEpf("contributionRate", v)}
                  hint="Employee + employer"
                />
              </div>
              <NumberField
                label="Annual bonus (EPF eligible)"
                value={inputs.epf.bonus}
                onChange={(v) => setEpf("bonus", v)}
                prefix="RM"
                step={1000}
              />
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Projected EPF at retirement
                </span>
                <span className="font-semibold tabular-nums">
                  {formatRM(results.epfAtRetirement)}
                </span>
              </div>
            </TabsContent>

            {/* Advanced */}
            <TabsContent value="advanced" className="mt-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <PercentField
                  label="Post-retirement return"
                  value={inputs.postRetReturn}
                  onChange={(v) => set("postRetReturn", v)}
                />
                <PercentField
                  label="Post-retirement inflation"
                  value={inputs.postRetInflation}
                  onChange={(v) => set("postRetInflation", v)}
                />
              </div>
              <PercentField
                label="Pre-retirement investment return"
                value={inputs.investmentReturn}
                onChange={(v) => set("investmentReturn", v)}
                hint="Used to compute the monthly savings needed to close any gap"
              />
              <NumberField
                label="Projected insurance maturity / cash value"
                value={inputs.projectedInsurance}
                onChange={(v) => set("projectedInsurance", v)}
                prefix="RM"
                step={1000}
              />
              <Separator />
              <div className="grid gap-1.5">
                <Label>Additional committed monthly savings?</Label>
                <div className="flex gap-3">
                  <Select
                    value={inputs.commitToggle ? "yes" : "no"}
                    onValueChange={(v) => set("commitToggle", v === "yes")}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                  {inputs.commitToggle && (
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                        RM
                      </span>
                      <Input
                        type="number"
                        className="pl-10"
                        value={inputs.commitSaving || ""}
                        placeholder="per month"
                        onChange={(e) =>
                          set("commitSaving", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ---------------- Results ---------------- */}
      <div className="space-y-6">
        <StatusBanner results={results} />

        <div className="grid grid-cols-2 gap-4">
          <Stat
            icon={<Target className="size-4" />}
            label="Retirement capital needed"
            value={formatRM(results.capitalNeeded)}
          />
          <Stat
            icon={<Wallet className="size-4" />}
            label="Funds available at retirement"
            value={formatRM(results.fundsAvailable)}
          />
          <Stat
            icon={<TrendingUp className="size-4" />}
            label="Income needed in retirement"
            value={`${formatRM(results.monthlyIncomeNeeded)}/mo`}
            sub={`${formatRM(results.retirementIncomeNeeded)} / year`}
          />
          <Stat
            icon={<PiggyBank className="size-4" />}
            label={results.isOnTrack ? "Projected surplus" : "Monthly savings required"}
            value={
              results.isOnTrack
                ? formatRM(results.fundsAvailable - results.capitalNeeded)
                : `${formatRM(results.monthlySavingsRequired)}/mo`
            }
            highlight={!results.isOnTrack}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Retirement funds projection</CardTitle>
            <CardDescription>
              Funds accumulate until age {inputs.retireAge}, then are drawn down
              for retirement income. The dashed line is your target capital.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RetirementChart
              data={results.projection}
              retireAge={inputs.retireAge}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funds available breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2.5 text-sm">
              <Row
                label="Assets at liquidation"
                value={formatRM(results.assetsFutureValue)}
              />
              <Row
                label="Projected EPF"
                value={formatRM(results.epfAtRetirement)}
              />
              <Row
                label="Insurance maturity / cash value"
                value={formatRM(inputs.projectedInsurance)}
              />
              <Separator />
              <Row
                label="Total funds available"
                value={formatRM(results.fundsAvailable)}
                bold
              />
              <Row
                label="Less: capital needed"
                value={`(${formatRM(results.capitalNeeded)})`}
              />
              <Separator />
              <Row
                label={results.isOnTrack ? "Surplus" : "Funding gap"}
                value={formatRM(
                  results.fundsAvailable - results.capitalNeeded
                )}
                bold
                tone={results.isOnTrack ? "positive" : "negative"}
              />
            </dl>
          </CardContent>
        </Card>

        <p className="text-xs leading-relaxed text-muted-foreground">
          This calculator provides simple, projected figures based on the
          information you entered. The results are for illustration purposes
          only and do not constitute financial advice. For a comprehensive
          analysis, please consult a qualified financial planner.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function StatusBanner({
  results,
}: {
  results: ReturnType<typeof calculateRetirement>;
}) {
  const onTrack = results.isOnTrack;
  return (
    <Card
      className={cn(
        "border-l-4",
        onTrack ? "border-l-emerald-500" : "border-l-amber-500"
      )}
    >
      <CardContent className="flex gap-3">
        <div
          className={cn(
            "mt-0.5 shrink-0",
            onTrack ? "text-emerald-500" : "text-amber-500"
          )}
        >
          {onTrack ? (
            <CheckCircle2 className="size-5" />
          ) : (
            <AlertTriangle className="size-5" />
          )}
        </div>
        <div className="space-y-1">
          <p className="font-semibold">
            {onTrack ? "You're on track" : "There's a retirement funding gap"}
          </p>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {results.summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn(highlight && "bg-amber-50 dark:bg-amber-950/30")}>
      <CardContent className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className="text-xl font-semibold tabular-nums">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  bold,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={cn("text-muted-foreground", bold && "text-foreground")}>
        {label}
      </dt>
      <dd
        className={cn(
          "tabular-nums",
          bold && "font-semibold",
          tone === "positive" && "text-emerald-600 dark:text-emerald-400",
          tone === "negative" && "text-amber-600 dark:text-amber-400"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
