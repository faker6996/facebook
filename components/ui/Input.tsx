// components/ui/Input.tsx
import { cn } from "@/lib/utils/cn";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>}
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-2 border rounded-md text-sm bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
