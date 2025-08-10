// components/ui/Input.tsx
"use client";

import React, { forwardRef, InputHTMLAttributes, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { Eye, EyeOff, Search, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Button from "./Button";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  description?: string;
  variant?: "default" | "filled" | "outlined" | "minimal";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  clearable?: boolean;
  loading?: boolean;
  success?: boolean;
  onClear?: () => void;
  hint?: string;
  counter?: boolean;
  maxLength?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  error, 
  description, 
  className, 
  required, 
  variant = "default",
  size = "md",
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  clearable = false,
  loading = false,
  success = false,
  onClear,
  hint,
  counter = false,
  type = "text",
  value,
  maxLength,
  ...rest 
}, ref) => {
  const [localError, setLocalError] = useState<string | undefined>(error);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const tv = useTranslations("ValidationInput");

  const errMsg = error || localError;
  const hasValue = value !== undefined && value !== null && value !== "";
  const charCount = typeof value === "string" ? value.length : 0;

  // Variant styles
  const variantStyles = {
    default: {
      container: "bg-background border border-input hover:border-accent-foreground/20",
      focus: "focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-ring",
      error: "border-destructive focus:ring-destructive/20 focus:border-destructive"
    },
    filled: {
      container: "bg-muted/50 border border-transparent hover:bg-muted/70",
      focus: "focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2",
      error: "bg-destructive/10 border-destructive focus:ring-destructive/20 focus:border-destructive"
    },
    outlined: {
      container: "bg-transparent border-2 border-border hover:border-accent-foreground/30",
      focus: "focus:border-ring focus:ring-0",
      error: "border-destructive focus:border-destructive"
    },
    minimal: {
      container: "bg-transparent border-0 border-b border-border hover:border-accent-foreground/30",
      focus: "focus:border-ring focus:ring-0 rounded-none",
      error: "border-destructive focus:border-destructive"
    }
  };

  // Size styles
  const sizeStyles = {
    sm: {
      input: "px-3 py-2 text-sm h-9",
      icon: "w-4 h-4",
      button: "h-7 w-7"
    },
    md: {
      input: "px-4 py-3 text-sm h-11",
      icon: "w-5 h-5", 
      button: "h-9 w-9"
    },
    lg: {
      input: "px-5 py-4 text-base h-12",
      icon: "w-6 h-6",
      button: "h-10 w-10"
    }
  };

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

  // Status icon
  const getStatusIcon = () => {
    if (loading) return <Loader2 className={cn("animate-spin text-muted-foreground", sizeStyles[size].icon)} />;
    if (success) return <CheckCircle className={cn("text-success", sizeStyles[size].icon)} />;
    if (errMsg) return <AlertCircle className={cn("text-destructive", sizeStyles[size].icon)} />;
    return null;
  };

  // Password toggle for password inputs
  const showPasswordToggle = type === "password";
  const actualType = showPasswordToggle && showPassword ? "text" : type;

  return (
    <div className="w-full space-y-2">
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label 
            className={cn(
              "text-sm font-medium transition-colors duration-200",
              isFocused || success ? "text-primary" : "text-foreground",
              errMsg && "text-destructive"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
          
          {counter && maxLength && (
            <span className={cn(
              "text-xs transition-colors duration-200",
              charCount > maxLength * 0.9 ? "text-warning" : "text-muted-foreground",
              charCount >= maxLength && "text-destructive"
            )}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      {/* Input Container */}
      <div className="relative group">
        {/* Left Icon */}
        {LeftIcon && (
          <div className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 z-10",
            "text-muted-foreground transition-colors duration-200",
            isFocused && "text-primary"
          )}>
            <LeftIcon className={sizeStyles[size].icon} />
          </div>
        )}

        <input
          ref={ref}
          type={actualType}
          value={value}
          maxLength={maxLength}
          required={required}
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : rest.autoComplete}
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
            "w-full rounded-lg text-foreground transition-all duration-200 ease-out",
            "placeholder:text-muted-foreground focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            
            // Size styles
            sizeStyles[size].input,
            
            // Icon padding adjustments
            LeftIcon && "pl-10",
            (RightIcon || showPasswordToggle || clearable || loading || success || errMsg) && "pr-10",
            
            // Variant styles
            variantStyles[variant].container,
            errMsg ? variantStyles[variant].error : variantStyles[variant].focus,
            
            // Focus enhancement
            isFocused && "shadow-md",
            variant !== "minimal" && "shadow-sm",
            
            className
          )}
          {...rest}
        />

        {/* Right Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Status Icon */}
          {getStatusIcon()}
          
          {/* Custom Right Icon */}
          {RightIcon && !loading && !success && !errMsg && (
            <RightIcon className={cn("text-muted-foreground", sizeStyles[size].icon)} />
          )}
          
          {/* Clear Button */}
          {clearable && hasValue && !loading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClear}
              className={cn("text-muted-foreground hover:text-foreground", sizeStyles[size].button)}
            >
              <X className={sizeStyles[size].icon} />
            </Button>
          )}
          
          {/* Password Toggle */}
          {showPasswordToggle && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className={cn("text-muted-foreground hover:text-foreground", sizeStyles[size].button)}
            >
              {showPassword ? (
                <EyeOff className={sizeStyles[size].icon} />
              ) : (
                <Eye className={sizeStyles[size].icon} />
              )}
            </Button>
          )}
        </div>

        {/* Focus Indicator for minimal variant */}
        {variant === "minimal" && (
          <div 
            className={cn(
              "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/60 transition-all duration-300",
              isFocused ? "w-full opacity-100" : "w-0 opacity-0"
            )}
          />
        )}
      </div>

      {/* Error Message */}
      {errMsg && (
        <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errMsg}</span>
        </div>
      )}

      {/* Description/Hint */}
      {(description || hint) && !errMsg && (
        <p className={cn(
          "text-xs transition-colors duration-200",
          isFocused ? "text-primary/70" : "text-muted-foreground"
        )}>
          {hint || description}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

// Search Input - specialized for search functionality
interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (value: string) => void;
  searchDelay?: number;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  onSearch,
  searchDelay = 300,
  placeholder = "Search...",
  ...props
}, ref) => {
  const [searchValue, setSearchValue] = useState(props.value || "");
  
  // Debounced search
  React.useEffect(() => {
    if (!onSearch) return;
    
    const timer = setTimeout(() => {
      onSearch(searchValue as string);
    }, searchDelay);
    
    return () => clearTimeout(timer);
  }, [searchValue, onSearch, searchDelay]);

  return (
    <Input
      ref={ref}
      type="search"
      leftIcon={Search}
      placeholder={placeholder}
      clearable
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      onClear={() => setSearchValue("")}
      {...props}
    />
  );
});

SearchInput.displayName = "SearchInput";

// Password Input - enhanced password field
interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showStrength?: boolean;
  strengthLabels?: string[];
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  showStrength = false,
  strengthLabels = ["Weak", "Fair", "Good", "Strong"],
  ...props
}, ref) => {
  const getPasswordStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  };

  const strength = showStrength && typeof props.value === "string" ? getPasswordStrength(props.value) : 0;
  const strengthColors = ["bg-destructive", "bg-warning", "bg-warning", "bg-success"];
  const strengthLabel = strengthLabels[strength - 1];

  return (
    <div className="space-y-2">
      <Input ref={ref} type="password" {...props} />
      
      {showStrength && props.value && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  level <= strength ? strengthColors[strength - 1] : "bg-muted"
                )}
              />
            ))}
          </div>
          {strengthLabel && (
            <p className={cn(
              "text-xs font-medium",
              strength <= 1 ? "text-destructive" : 
              strength <= 2 ? "text-warning" :
              strength <= 3 ? "text-warning" : "text-success"
            )}>
              {strengthLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

// Number Input - enhanced numeric input
interface NumberInputProps extends Omit<InputProps, 'type'> {
  min?: number;
  max?: number;
  step?: number;
  showSteppers?: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(({
  min,
  max,
  step = 1,
  showSteppers = true,
  onIncrement,
  onDecrement,
  ...props
}, ref) => {
  const currentValue = Number(props.value) || 0;
  
  const handleIncrement = () => {
    if (onIncrement) {
      onIncrement();
    } else if (props.onChange) {
      const newValue = Math.min(currentValue + step, max ?? Infinity);
      props.onChange({ target: { value: newValue.toString() } } as any);
    }
  };

  const handleDecrement = () => {
    if (onDecrement) {
      onDecrement();
    } else if (props.onChange) {
      const newValue = Math.max(currentValue - step, min ?? -Infinity);
      props.onChange({ target: { value: newValue.toString() } } as any);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={ref}
        type="number"
        min={min}
        max={max}
        step={step}
        rightIcon={showSteppers ? undefined : props.rightIcon}
        {...props}
        className={cn(
          showSteppers && [
            "pr-12",
            // Hide native browser steppers
            "[&::-webkit-outer-spin-button]:appearance-none",
            "[&::-webkit-inner-spin-button]:appearance-none",
            "[&::-webkit-inner-spin-button]:m-0",
            "appearance-none"
          ],
          props.className
        )}
      />
      {showSteppers && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
          <button
            type="button"
            onClick={handleIncrement}
            disabled={max !== undefined && currentValue >= max}
            className={cn(
              "flex items-center justify-center w-4 h-4 rounded-sm transition-colors",
              "hover:bg-accent focus:outline-none focus:bg-accent",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
              "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Increase value"
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              className="flex-shrink-0"
            >
              <path
                d="M4 2L6 6H2L4 2Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={min !== undefined && currentValue <= min}
            className={cn(
              "flex items-center justify-center w-4 h-4 rounded-sm transition-colors",
              "hover:bg-accent focus:outline-none focus:bg-accent",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
              "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Decrease value"
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              className="flex-shrink-0"
            >
              <path
                d="M4 6L2 2H6L4 6Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
});

NumberInput.displayName = "NumberInput";

// Textarea - multi-line text input
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
  variant?: "default" | "filled" | "outlined" | "minimal";
  resize?: "none" | "vertical" | "horizontal" | "both";
  counter?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  description,
  variant = "default",
  resize = "vertical",
  counter = false,
  className,
  required,
  value,
  maxLength,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const charCount = typeof value === "string" ? value.length : 0;

  const variantStyles = {
    default: "bg-background border border-input hover:border-accent-foreground/20 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-ring",
    filled: "bg-muted/50 border border-transparent hover:bg-muted/70 focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2",
    outlined: "bg-transparent border-2 border-border hover:border-accent-foreground/30 focus:border-ring focus:ring-0",
    minimal: "bg-transparent border-0 border-b border-border hover:border-accent-foreground/30 focus:border-ring focus:ring-0 rounded-none"
  };

  const resizeClasses = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x", 
    both: "resize"
  };

  return (
    <div className="w-full space-y-2">
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label className={cn(
            "text-sm font-medium transition-colors duration-200",
            isFocused ? "text-primary" : "text-foreground",
            error && "text-destructive"
          )}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
          
          {counter && maxLength && (
            <span className={cn(
              "text-xs transition-colors duration-200",
              charCount > maxLength * 0.9 ? "text-warning" : "text-muted-foreground",
              charCount >= maxLength && "text-destructive"
            )}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        maxLength={maxLength}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "w-full rounded-lg px-4 py-3 text-sm text-foreground transition-all duration-200",
          "placeholder:text-muted-foreground focus:outline-none min-h-[80px]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          error && "border-destructive focus:ring-destructive/20 focus:border-destructive",
          resizeClasses[resize],
          isFocused && "shadow-md",
          variant !== "minimal" && "shadow-sm",
          className
        )}
        {...props}
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Description */}
      {description && !error && (
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

Textarea.displayName = "Textarea";

export default Input;
