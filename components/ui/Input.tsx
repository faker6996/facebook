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
  const tv = useTranslations("ValidationInput"); // ⇒ locales/*.json

  /* gộp lỗi prop + local */
  const errMsg = error || localError;

  /* Helper map validity → khóa dịch */
  const getErrorKey = (v: ValidityState) => {
    if (v.valueMissing) return "required";
    if (v.typeMismatch) return "typeMismatch"; // email, url…
    if (v.patternMismatch) return "pattern";
    if (v.tooShort) return "tooShort";
    if (v.tooLong) return "tooLong";
    if (v.rangeUnderflow) return "rangeUnderflow";
    if (v.rangeOverflow) return "rangeOverflow";
    if (v.stepMismatch) return "stepMismatch";
    if (v.badInput) return "badInput";
    return "invalid"; // fallback chung
  };

  return (
    <div className="w-full space-y-1">
      {/* Label + error cùng hàng */}
      {label && (
        <div className="flex items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <span className={cn("text-xs text-red-500 ml-auto", !errMsg && "opacity-0")} aria-live="polite" role="alert">
            {errMsg || " "}
          </span>
        </div>
      )}

      {/* Input */}
      <input
        ref={ref}
        required={required}
        onInvalid={(e) => {
          e.preventDefault();
          const key = getErrorKey(e.currentTarget.validity);
          setLocalError(tv(key));
        }}
        onInput={() => setLocalError(undefined)}
        aria-invalid={!!errMsg}
        className={cn(
          "w-full px-4 py-2 border rounded-md text-sm transition",
          "bg-white dark:bg-neutral-800 text-black dark:text-white",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          errMsg && "border-red-500",
          className
        )}
        {...rest}
      />

      {description && <p className="text-xs text-muted-foreground dark:text-gray-400">{description}</p>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
