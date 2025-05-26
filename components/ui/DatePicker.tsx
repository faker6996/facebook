"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = "Pick a date" }) => {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Date | undefined>(value);
  const [viewDate, setViewDate] = React.useState<Date>(value || new Date());
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const monthName = viewDate.toLocaleDateString("en-US", { month: "long" });
  const year = viewDate.getFullYear();
  const today = new Date();

  const isSameDate = (a?: Date, b?: Date) => a && b && a.toDateString() === b.toDateString();

  const generateCalendar = () => {
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const dates = [];
    const weekday = start.getDay();

    for (let i = 0; i < weekday; i++) dates.push(null);
    for (let d = 1; d <= end.getDate(); d++) {
      dates.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
    }
    return dates;
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setViewDate(today);
    setSelected(today);
    onChange(today);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block w-[260px]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full cursor-pointer border border-input rounded-md bg-background px-3 py-2 text-sm text-left shadow-sm"
      >
        {selected ? formatDate(selected) : <span className="text-muted-foreground">{placeholder}</span>}
      </button>

      <div
        className={cn(
          "absolute z-50 mt-2 w-full rounded-md border bg-popover p-4 text-popover-foreground shadow-md transform transition-all duration-200 ease-out origin-top",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="cursor-pointer px-2 py-1 text-sm hover:opacity-80">
            ❮
          </button>
          <div className="text-sm font-medium">
            {monthName} {year}
          </div>
          <button onClick={nextMonth} className="cursor-pointer px-2 py-1 text-sm hover:opacity-80">
            ❯
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-center font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          {generateCalendar().map((date, i) => (
            <button
              key={i}
              disabled={!date}
              onClick={() => {
                if (date) {
                  setSelected(date);
                  onChange(date);
                  setOpen(false);
                }
              }}
              className={cn(
                "aspect-square w-full rounded text-center hover:bg-accent hover:text-accent-foreground cursor-pointer",
                date && isSameDate(date, selected) && "bg-primary text-white hover:bg-primary",
                date && isSameDate(date, today) && !isSameDate(date, selected) && "border border-muted"
              )}
            >
              {date ? date.getDate() : ""}
            </button>
          ))}
        </div>
        <div className="mt-3 text-right">
          <button onClick={goToToday} className="text-sm text-blue-500 hover:underline cursor-pointer">
            Today
          </button>
        </div>
      </div>
    </div>
  );
};
