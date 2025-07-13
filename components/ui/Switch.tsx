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
        <div className={cn(
          "block w-full h-full rounded-full transition-all duration-200 ease-soft", 
          checked ? "bg-primary shadow-md" : "bg-muted hover:bg-muted/80"
        )} />
        {/* Handle */}
        <div
          className={cn(
            "absolute left-0 top-0 w-6 h-6 bg-background border rounded-full shadow-sm transition-all duration-200 ease-soft",
            "hover:shadow-md active:scale-95",
            checked 
              ? "translate-x-4 border-primary/20 shadow-primary/20" 
              : "translate-x-0 border-input hover:border-accent-foreground/30"
          )}
        />
      </div>
      {label && <span className="text-sm text-foreground select-none">{label}</span>}
    </label>
  );
};
Switch.displayName = "Switch";
export default Switch;
