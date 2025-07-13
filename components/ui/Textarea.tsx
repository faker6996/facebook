"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, description, className, required, ...rest }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <div className="flex items-center">
            <label className="text-sm font-medium text-foreground">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
            {error && (
              <span className="text-xs text-destructive ml-auto" aria-live="polite" role="alert">
                {error}
              </span>
            )}
          </div>
        )}

        <textarea
          ref={ref}
          required={required}
          aria-invalid={!!error}
          className={cn(
            "w-full px-4 py-2 border border-input rounded-md text-sm transition resize-y",
            "bg-background text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            error && "border-destructive",
            className
          )}
          {...rest}
        />

        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;