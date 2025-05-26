"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, label, className, ...props }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative inline-block w-10 h-6">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} {...props} />
        {/* Background track */}
        <div className={cn("block w-full h-full rounded-full transition-colors", checked ? "bg-primary" : "bg-muted")} />
        {/* Handle */}
        <div
          className={cn(
            "absolute left-0 top-0 w-6 h-6 bg-background border border-input rounded-full shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </div>
      {label && <span className="text-sm text-foreground select-none">{label}</span>}
    </label>
  );
};
Switch.displayName = "Switch";
export default Switch;
