"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({ trigger, children, className }) => {
  const [open, setOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div onClick={() => setOpen((prev) => !prev)}>{trigger}</div>
      <div
        className={cn(
          "absolute z-50 mt-2 w-auto rounded-md border bg-popover text-popover-foreground shadow-md transition-all duration-200 ease-out origin-top transform",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
