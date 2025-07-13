// components/ui/Input.tsx
"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, description, className, required, ...rest }, ref) => {
  const [localError, setLocalError] = useState<string | undefined>(error);
  const [isFocused, setIsFocused] = useState(false);
  const tv = useTranslations("ValidationInput");

  const errMsg = error || localError;

  const getErrorKey = (v: ValidityState) => {
    if (v.valueMissing) return "required";
    if (v.typeMismatch) return "typeMismatch";
    if (v.patternMismatch) return "pattern";
    if (v.tooShort) return "tooShort";
    if (v.tooLong) return "tooLong";
    if (v.rangeUnderflow) return "rangeUnderflow";
    if (v.rangeOverflow) return "rangeOverflow";
    if (v.stepMismatch) return "stepMismatch";
    if (v.badInput) return "badInput";
    return "invalid";
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex items-center">
          <label 
            className={cn(
              "text-sm font-medium transition-colors duration-200",
              isFocused ? "text-primary" : "text-foreground",
              errMsg && "text-destructive"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
          <span 
            className={cn(
              "text-xs ml-auto transition-all duration-300 transform",
              errMsg ? "text-destructive opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
            )} 
            aria-live="polite" 
            role="alert"
          >
            {errMsg || " "}
          </span>
        </div>
      )}

      <div className="relative group">
        <input
          ref={ref}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onInvalid={(e) => {
            e.preventDefault();
            const key = getErrorKey(e.currentTarget.validity);
            setLocalError(tv(key));
          }}
          onInput={() => setLocalError(undefined)}
          aria-invalid={!!errMsg}
          className={cn(
            "w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 ease-soft",
            "bg-background text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "hover:border-accent-foreground/20",
            errMsg 
              ? "border-destructive focus:ring-destructive/20 focus:border-destructive" 
              : "border-input",
            "shadow-sm focus:shadow-md backdrop-blur-sm",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...rest}
        />
        
        <div 
          className={cn(
            "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/60 transition-all duration-300 ease-soft",
            isFocused ? "w-full opacity-100" : "w-0 opacity-0"
          )}
        />
        
        {isFocused && (
          <div className="absolute inset-0 rounded-lg bg-primary/5 -z-10 animate-pulse" />
        )}
      </div>

      {description && (
        <p className={cn(
          "text-xs transition-colors duration-200",
          isFocused ? "text-primary/70" : "text-muted-foreground"
        )}>
          {description}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
