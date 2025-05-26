"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { CheckIcon } from "../icons/CheckIcon";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  labelClassName?: string;
  containerClassName?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, labelClassName, containerClassName, checked, defaultChecked, onChange, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked ?? false);

    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <label className={cn("inline-flex items-center gap-2 cursor-pointer select-none", containerClassName)}>
        <input type="checkbox" ref={ref} checked={isChecked} onChange={handleChange} className="hidden" {...props} />
        <div
          className={cn(
            "w-5 h-5 border rounded-sm flex items-center justify-center transition-colors",
            isChecked ? "bg-primary border-primary" : "bg-background border-input"
          )}
        >
          {isChecked && <CheckIcon className="w-4 h-4 text-white" />}
        </div>
        {label && <span className={cn("text-sm text-muted-foreground", labelClassName)}>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
