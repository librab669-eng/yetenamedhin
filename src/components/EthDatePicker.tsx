"use client";

import { useMemo } from "react";
import { todayEth, ethMonthName, ethDaysInMonth } from "@/lib/ethcal";
import { useLang } from "@/lib/lang-context";

interface Props {
  year: number;
  month: number;
  day: number;
  onChange: (year: number, month: number, day: number) => void;
  maxYear?: number;
  minYear?: number;
  disabled?: boolean;
}

export default function EthDatePicker({ year, month, day, onChange, maxYear, minYear, disabled }: Props) {
  const { lang } = useLang();

  const today = useMemo(() => todayEth(), []);

  const years = useMemo(() => {
    const max = maxYear ?? today.year + 100;
    const min = minYear ?? today.year - 200;
    const list: number[] = [];
    for (let y = max; y >= min; y--) list.push(y);
    return list;
  }, [today.year, maxYear, minYear]);

  const days = useMemo(() => {
    const n = ethDaysInMonth(year, month);
    return Array.from({ length: n }, (_, i) => i + 1);
  }, [year, month]);

  return (
    <div className="row" style={{ flexWrap: "wrap" }}>
      <select
        className="select"
        style={{ flex: 1, minWidth: 90 }}
        value={month}
        onChange={(e) => {
          const m = Number(e.target.value);
          const maxDay = ethDaysInMonth(year, m);
          onChange(year, m, Math.min(day, maxDay));
        }}
        aria-label="month"
        disabled={disabled}
      >
        {Array.from({ length: 13 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>
            {ethMonthName(year, m, lang)} ({m})
          </option>
        ))}
      </select>

      <select
        className="select"
        style={{ flex: 1, minWidth: 80 }}
        value={day}
        onChange={(e) => onChange(year, month, Number(e.target.value))}
        aria-label="day"
        disabled={disabled}
      >
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        className="select"
        style={{ flex: 1, minWidth: 100 }}
        value={year}
        onChange={(e) => {
          const y = Number(e.target.value);
          onChange(y, month, Math.min(day, ethDaysInMonth(y, month)));
        }}
        aria-label="year"
        disabled={disabled}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="btn btn-sm"
        onClick={() => onChange(today.year, today.month, today.day)}
        disabled={disabled}
      >
        {lang === "en" ? "Today" : "ዛሬ"}
      </button>
    </div>
  );
}