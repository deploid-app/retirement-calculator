"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ProjectionPoint } from "@/lib/retirement";
import { formatRM, formatRMCompact } from "@/lib/format";

interface Props {
  data: ProjectionPoint[];
  retireAge: number;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <div className="mb-1 font-medium">Age {label}</div>
      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="flex items-center justify-between gap-4"
        >
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: item.color }}
            />
            {item.name}
          </span>
          <span className="font-medium tabular-nums">
            {formatRM(item.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RetirementChart({ data, retireAge }: Props) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fundsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="age"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          stroke="var(--muted-foreground)"
          fontSize={12}
        />
        <YAxis
          tickFormatter={formatRMCompact}
          tickLine={false}
          axisLine={false}
          width={64}
          stroke="var(--muted-foreground)"
          fontSize={12}
        />
        <Tooltip content={<ChartTooltip />} />
        <ReferenceLine
          x={retireAge}
          stroke="var(--muted-foreground)"
          strokeDasharray="4 4"
          label={{
            value: `Retire @ ${retireAge}`,
            position: "insideTopRight",
            fill: "var(--muted-foreground)",
            fontSize: 11,
          }}
        />
        <Area
          type="monotone"
          dataKey="funds"
          name="Projected Funds"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#fundsFill)"
        />
        <Line
          type="monotone"
          dataKey="target"
          name="Target Capital"
          stroke="var(--chart-4)"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
