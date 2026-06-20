"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  className?: string;
}

/** Numeric input that keeps an editable string buffer so users can clear it. */
export function NumberField({
  label,
  value,
  onChange,
  hint,
  prefix,
  suffix,
  step,
  min,
  max,
  className,
}: NumberFieldProps) {
  const [buffer, setBuffer] = React.useState(String(value));
  const [focused, setFocused] = React.useState(false);

  // Keep buffer in sync when the value changes externally (and not editing).
  React.useEffect(() => {
    if (!focused) setBuffer(String(value));
  }, [value, focused]);

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label>{label}</Label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          inputMode="decimal"
          value={buffer}
          step={step}
          min={min}
          max={max}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setBuffer(String(value));
          }}
          onChange={(e) => {
            setBuffer(e.target.value);
            const n = parseFloat(e.target.value);
            onChange(Number.isFinite(n) ? n : 0);
          }}
          className={cn(prefix && "pl-10", suffix && "pr-10")}
        />
        {suffix && (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface PercentFieldProps {
  label: string;
  /** Stored as a fraction (0.05 = 5%). */
  value: number;
  onChange: (fraction: number) => void;
  hint?: string;
  step?: number;
  className?: string;
}

/** Percent input that stores a fraction but shows a whole-number percentage. */
export function PercentField({
  label,
  value,
  onChange,
  hint,
  step = 0.1,
  className,
}: PercentFieldProps) {
  return (
    <NumberField
      label={label}
      value={Number((value * 100).toFixed(4))}
      onChange={(pct) => onChange(pct / 100)}
      suffix="%"
      step={step}
      hint={hint}
      className={className}
    />
  );
}
