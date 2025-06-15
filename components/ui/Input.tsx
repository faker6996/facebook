// components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, description, className, required, ...props }, ref) => {
  const [localError, setLocalError] = useState<string | undefined>(error);

  const tv = useTranslations("ValidationInput");
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        ref={ref}
        required={required}
        onInvalid={(e) => {
          e.preventDefault();
          const { validity } = e.currentTarget;
          if (validity.valueMissing) setLocalError(tv("required"));
          else if (validity.typeMismatch) setLocalError(tv("email"));
          else if (validity.patternMismatch) setLocalError(tv("pattern"));
        }}
        onInput={() => setLocalError(undefined)}
        className={cn(
          "w-full px-4 py-2 border rounded-md text-sm transition bg-white dark:bg-neutral-800 text-black dark:text-white",
          "focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
          (error || localError) && "border-red-500",
          className
        )}
        aria-invalid={!!(error || localError)}
        {...props}
      />

      {description && <p className="text-xs text-muted-foreground dark:text-gray-400">{description}</p>}
      {(error || localError) && (
        <p className="text-xs text-red-500" role="alert">
          {error || localError}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
