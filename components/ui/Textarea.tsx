"use client";

import { forwardRef, TextareaHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
  variant?: "default" | "filled" | "outlined";
  size?: "sm" | "md" | "lg";
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, description, className, required, variant = "default", size = "md", ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const sizeClasses = {
      sm: "px-3 py-2 text-sm min-h-[80px]",
      md: "px-4 py-3 text-sm min-h-[100px]", 
      lg: "px-5 py-4 text-base min-h-[120px]"
    };

    const variantClasses = {
      default: cn(
        "border border-input bg-background",
        "hover:border-accent-foreground/20",
        "focus:border-primary focus:ring-2 focus:ring-primary/20"
      ),
      filled: cn(
        "border-0 bg-muted",
        "hover:bg-muted/80",
        "focus:bg-background focus:ring-2 focus:ring-primary/20"
      ),
      outlined: cn(
        "border-2 border-border bg-transparent",
        "hover:border-primary/50",
        "focus:border-primary focus:ring-0"
      )
    };

    return (
      <div className="w-full space-y-2">
        {label && (
          <div className="flex items-center">
            <label className={cn(
              "text-sm font-medium transition-colors duration-200",
              isFocused ? "text-primary" : "text-foreground",
              error && "text-destructive"
            )}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
            {error && (
              <span className="text-xs text-destructive ml-auto animate-in slide-in-from-right-2 duration-200" aria-live="polite" role="alert">
                {error}
              </span>
            )}
          </div>
        )}

        <div className="relative group">
          <textarea
            ref={ref}
            required={required}
            aria-invalid={!!error}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "w-full rounded-lg transition-all duration-200 ease-soft resize-y",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none shadow-sm focus:shadow-md",
              "backdrop-blur-sm",
              sizeClasses[size],
              error 
                ? "border-destructive focus:ring-destructive/20 focus:border-destructive" 
                : variantClasses[variant],
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            {...rest}
          />
          
          {/* Focus indicator line */}
          {variant === "default" && (
            <div className={cn(
              "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/60 transition-all duration-300 ease-soft",
              isFocused ? "w-full opacity-100" : "w-0 opacity-0"
            )} />
          )}
          
          {/* Focus glow effect */}
          {isFocused && variant !== "outlined" && (
            <div className="absolute inset-0 rounded-lg bg-primary/5 -z-10 animate-pulse" />
          )}
        </div>

        {description && (
          <p className={cn(
            "text-xs transition-colors duration-200",
            isFocused ? "text-primary/70" : "text-muted-foreground",
            error && "text-destructive/70"
          )}>
            {description}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;