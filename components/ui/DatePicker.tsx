"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  size,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingFocusManager,
  FloatingPortal,
} from "@floating-ui/react";
import { cn } from "@/lib/utils/cn";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  placement?: "top" | "bottom" | "left" | "right" | "top-start" | "bottom-start" | "top-end" | "bottom-end";
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  placement = "bottom-start",
}) => {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Date | undefined>(value);
  const [viewDate, setViewDate] = React.useState<Date>(value || new Date());

  // Floating UI setup
  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: setOpen,
    strategy: "fixed",
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          // Make dropdown width match reference element exactly
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            minWidth: `${rects.reference.width}px`,
          });
        },
      }),
    ],
  });

  // Interactions
  const click = useClick(context, {
    enabled: !disabled,
  });
  const dismiss = useDismiss(context, {
    ancestorScroll: false,
    outsidePress: true,
    escapeKey: true,
  });
  const role = useRole(context, { role: "dialog" });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  // Update selected when value prop changes
  React.useEffect(() => {
    setSelected(value);
    if (value) {
      setViewDate(value);
    }
  }, [value]);

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
    <div className={cn("relative inline-block w-[260px]", className)}>
      <Button
        ref={refs.setReference}
        type="button"
        {...getReferenceProps()}
        variant="outline"
        disabled={disabled}
        className={cn("w-full justify-between text-left font-normal", !selected && "text-muted-foreground", open && "ring-2 ring-ring ring-offset-2")}
        iconRight={Calendar}
      >
        {selected ? formatDate(selected) : placeholder}
      </Button>

      {open &&
        createPortal(
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className={cn(
                "z-[9999] rounded-md border bg-popover p-4 text-popover-foreground shadow-lg",
                "backdrop-blur-sm bg-popover/95 border-border/60"
              )}
              data-side={placement.split('-')[0]}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <Button type="button" onClick={prevMonth} variant="ghost" size="sm" icon={ChevronLeft} className="h-8 w-8 p-0" />
                <div className="text-sm font-semibold text-foreground">
                  {monthName} {year}
                </div>
                <Button type="button" onClick={nextMonth} variant="ghost" size="sm" icon={ChevronRight} className="h-8 w-8 p-0" />
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-xs mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="text-center font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-sm">
                {generateCalendar().map((date, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={!date}
                    onClick={() => {
                      if (date) {
                        setSelected(date);
                        onChange(date);
                        setOpen(false);
                      }
                    }}
                    className={cn(
                      "aspect-square w-full rounded-md text-center transition-colors cursor-pointer",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                      "disabled:pointer-events-none disabled:opacity-0",
                      date && isSameDate(date, selected) && "bg-primary text-primary-foreground hover:bg-primary/90",
                      date && isSameDate(date, today) && !isSameDate(date, selected) && "border border-primary/50 text-primary"
                    )}
                  >
                    {date ? date.getDate() : ""}
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 flex justify-between items-center pt-3 border-t border-border/60">
                <Button type="button" onClick={goToToday} variant="ghost" size="sm" className="text-xs">
                  Today
                </Button>
                <Button type="button" onClick={() => setOpen(false)} variant="outline" size="sm" className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          </FloatingFocusManager>,
          document.body
        )}
    </div>
  );
};

// Date Range Picker Component
interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  className?: string;
  disabled?: boolean;
  placement?: "top" | "bottom" | "left" | "right" | "top-start" | "bottom-start" | "top-end" | "bottom-end";
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
  disabled = false,
  placement = "bottom-start",
}) => {
  return (
    <div className={cn("flex gap-2", className)}>
      <DatePicker
        value={startDate}
        onChange={onStartDateChange}
        placeholder="Start date"
        disabled={disabled}
        placement={placement}
        className="flex-1"
      />
      <DatePicker value={endDate} onChange={onEndDateChange} placeholder="End date" disabled={disabled} placement={placement} className="flex-1" />
    </div>
  );
};

// Compact DatePicker with just icon trigger
interface CompactDatePickerProps extends DatePickerProps {
  iconOnly?: boolean;
}

export const CompactDatePicker: React.FC<CompactDatePickerProps> = ({ iconOnly = false, className, ...props }) => {
  if (iconOnly) {
    return <DatePicker {...props} className={cn("w-auto [&>button]:w-auto [&>button]:px-2", className)} placeholder="" />;
  }

  return <DatePicker {...props} className={className} />;
};
