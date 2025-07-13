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
              isFocused ? "text-primary" : "text-gray-700 dark:text-gray-200",
              errMsg && "text-red-500"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <span 
            className={cn(
              "text-xs ml-auto transition-all duration-300 transform",
              errMsg ? "text-red-500 opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
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
            "bg-white dark:bg-neutral-800 text-black dark:text-white",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
            "hover:border-gray-300 dark:hover:border-gray-600",
            errMsg 
              ? "border-red-500 focus:ring-red-500/50 focus:border-red-500" 
              : "border-gray-200 dark:border-gray-700",
            "shadow-sm focus:shadow-md",
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
          isFocused ? "text-primary/70" : "text-muted-foreground dark:text-gray-400"
        )}>
          {description}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
