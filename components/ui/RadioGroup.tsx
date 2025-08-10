"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface RadioGroupContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "button";
}

const RadioGroupContext = React.createContext<RadioGroupContextType | undefined>(undefined);

const useRadioGroup = () => {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup");
  }
  return context;
};

interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "button";
  className?: string;
  children: React.ReactNode;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    value, 
    defaultValue, 
    onValueChange, 
    name, 
    disabled = false, 
    orientation = "vertical",
    size = "md",
    variant = "default",
    className, 
    children,
    required = false,
    error = false,
    errorMessage
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "");
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleValueChange = (newValue: string) => {
      if (!disabled) {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      }
    };

    // Generate unique name if not provided
    const radioName = name || `radio-group-${React.useId()}`;

    return (
      <RadioGroupContext.Provider
        value={{
          value: currentValue,
          onValueChange: handleValueChange,
          name: radioName,
          disabled,
          size,
          variant
        }}
      >
        <div className="space-y-2">
          <div
            ref={ref}
            className={cn(
              "grid gap-2",
              orientation === "horizontal" ? "grid-flow-col auto-cols-max" : "grid-cols-1",
              error && "ring-2 ring-destructive/20 rounded-md p-2",
              className
            )}
            role="radiogroup"
            aria-disabled={disabled}
            aria-required={required}
            aria-invalid={error}
          >
            {children}
          </div>
          {error && errorMessage && (
            <p className="text-sm text-destructive mt-1">{errorMessage}</p>
          )}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps {
  value: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  label?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const sizeStyles = {
  sm: {
    radio: "h-3 w-3",
    dot: "w-1.5 h-1.5",
    text: "text-xs",
    padding: "p-2"
  },
  md: {
    radio: "h-4 w-4", 
    dot: "w-2 h-2",
    text: "text-sm",
    padding: "p-3"
  },
  lg: {
    radio: "h-5 w-5",
    dot: "w-2.5 h-2.5", 
    text: "text-base",
    padding: "p-4"
  }
};

export const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ value, id, disabled, className, children, label, description, icon }, ref) => {
    const { 
      value: selectedValue, 
      onValueChange, 
      name, 
      disabled: groupDisabled,
      size = "md",
      variant = "default"
    } = useRadioGroup();
    
    const isDisabled = disabled || groupDisabled;
    const isSelected = selectedValue === value;
    const Icon = icon;

    const radioId = id || `radio-${value}`;

    if (variant === "card") {
      return (
        <div
          className={cn(
            "relative rounded-lg border transition-all duration-200 cursor-pointer",
            "hover:bg-accent/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            isSelected && "border-primary bg-primary/5 ring-1 ring-primary/20",
            isDisabled && "cursor-not-allowed opacity-50",
            sizeStyles[size].padding,
            className
          )}
        >
          <div className="flex items-start gap-3">
            <button
              ref={ref}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-state={isSelected ? "checked" : "unchecked"}
              value={value}
              id={radioId}
              disabled={isDisabled}
              className={cn(
                "aspect-square rounded-full border border-primary text-primary ring-offset-background",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "transition-all duration-200 mt-0.5",
                sizeStyles[size].radio
              )}
              onClick={() => onValueChange?.(value)}
            >
              <span 
                className={cn(
                  "flex items-center justify-center w-full h-full rounded-full transition-all duration-200",
                  isSelected && "bg-primary"
                )}
              >
                {isSelected && (
                  <span className={cn("bg-primary-foreground rounded-full", sizeStyles[size].dot)} />
                )}
              </span>
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-foreground" />}
                <label 
                  htmlFor={radioId}
                  className={cn(
                    "font-medium text-foreground cursor-pointer",
                    sizeStyles[size].text
                  )}
                >
                  {label || children}
                </label>
              </div>
              {description && (
                <p className="text-muted-foreground mt-1 text-xs">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          <input
            type="radio"
            name={name}
            value={value}
            checked={isSelected}
            onChange={() => {}} // Controlled by button click
            className="sr-only"
            tabIndex={-1}
          />
        </div>
      );
    }

    if (variant === "button") {
      return (
        <button
          ref={ref}
          type="button"
          role="radio"
          aria-checked={isSelected}
          data-state={isSelected ? "checked" : "unchecked"}
          value={value}
          id={radioId}
          disabled={isDisabled}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isSelected 
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-background hover:bg-accent hover:text-accent-foreground",
            sizeStyles[size].padding,
            sizeStyles[size].text,
            className
          )}
          onClick={() => onValueChange?.(value)}
        >
          {Icon && <Icon className="h-4 w-4" />}
          {label || children}
          <input
            type="radio"
            name={name}
            value={value}
            checked={isSelected}
            onChange={() => {}} // Controlled by button click
            className="sr-only"
            tabIndex={-1}
          />
        </button>
      );
    }

    // Default variant
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          ref={ref}
          type="button"
          role="radio"
          aria-checked={isSelected}
          data-state={isSelected ? "checked" : "unchecked"}
          value={value}
          id={radioId}
          disabled={isDisabled}
          className={cn(
            "aspect-square rounded-full border border-primary text-primary ring-offset-background",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200 hover:border-primary/80",
            sizeStyles[size].radio
          )}
          onClick={() => onValueChange?.(value)}
        >
          <span 
            className={cn(
              "flex items-center justify-center w-full h-full rounded-full transition-all duration-200",
              isSelected && "bg-primary"
            )}
          >
            {isSelected && (
              <span className={cn("bg-primary-foreground rounded-full", sizeStyles[size].dot)} />
            )}
          </span>
        </button>
        
        {(label || children) && (
          <label 
            htmlFor={radioId}
            className={cn(
              "font-medium text-foreground cursor-pointer flex-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              sizeStyles[size].text,
              isDisabled && "cursor-not-allowed opacity-50"
            )}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              <span>{label || children}</span>
            </div>
            {description && (
              <p className="text-muted-foreground mt-0.5 text-xs">
                {description}
              </p>
            )}
          </label>
        )}
        
        <input
          type="radio"
          name={name}
          value={value}
          checked={isSelected}
          onChange={() => {}} // Controlled by button click
          className="sr-only"
          tabIndex={-1}
        />
      </div>
    );
  }
);

RadioGroupItem.displayName = "RadioGroupItem";

// Simplified Radio Group with predefined items
interface SimpleRadioGroupProps {
  items: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "button";
  className?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export const SimpleRadioGroup: React.FC<SimpleRadioGroupProps> = ({
  items,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled = false,
  orientation = "vertical",
  size = "md",
  variant = "default",
  className,
  required = false,
  error = false,
  errorMessage
}) => {
  return (
    <RadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      disabled={disabled}
      orientation={orientation}
      size={size}
      variant={variant}
      className={className}
      required={required}
      error={error}
      errorMessage={errorMessage}
    >
      {items.map((item) => (
        <RadioGroupItem
          key={item.value}
          value={item.value}
          label={item.label}
          description={item.description}
          disabled={item.disabled}
          icon={item.icon}
        />
      ))}
    </RadioGroup>
  );
};

// Legacy component for backward compatibility
export const RadioGroupWithLabel = SimpleRadioGroup;

// Button-style Radio Group (connected buttons)
interface RadioButtonGroupProps {
  items: Array<{
    value: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
  }>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "solid";
  className?: string;
  fullWidth?: boolean;
}

export const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  items,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled = false,
  size = "md",
  variant = "default",
  className,
  fullWidth = false
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleValueChange = (newValue: string) => {
    if (!disabled) {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variantClasses = {
    default: {
      container: "bg-muted rounded-md p-1",
      base: "bg-transparent hover:bg-background/50",
      selected: "bg-background text-foreground shadow-sm"
    },
    outline: {
      container: "border border-border rounded-md overflow-hidden",
      base: "bg-background border-r border-border hover:bg-accent",
      selected: "bg-primary text-primary-foreground border-primary"
    },
    solid: {
      container: "border border-border rounded-md overflow-hidden",
      base: "bg-background hover:bg-accent",
      selected: "bg-primary text-primary-foreground"
    }
  };

  const radioName = name || `radio-button-group-${React.useId()}`;

  return (
    <div 
      className={cn(
        "inline-flex",
        variantClasses[variant].container,
        fullWidth && "w-full",
        className
      )}
      role="radiogroup"
    >
      {items.map((item, index) => {
        const isSelected = currentValue === item.value;
        const isDisabled = item.disabled || disabled;
        const Icon = item.icon;
        const isLast = index === items.length - 1;

        return (
          <button
            key={item.value}
            type="button"
            disabled={isDisabled}
            role="radio"
            aria-checked={isSelected}
            className={cn(
              "relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              sizeClasses[size],
              isSelected 
                ? variantClasses[variant].selected 
                : variantClasses[variant].base,
              variant === "outline" && !isLast && "border-r border-border",
              variant === "default" && "rounded-sm",
              fullWidth && "flex-1"
            )}
            onClick={() => handleValueChange(item.value)}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {item.label}
            <input
              type="radio"
              name={radioName}
              value={item.value}
              checked={isSelected}
              onChange={() => {}} // Controlled by button click
              className="sr-only"
              tabIndex={-1}
            />
          </button>
        );
      })}
    </div>
  );
};

// Segmented Control (iOS-style)
interface SegmentedControlProps extends Omit<RadioButtonGroupProps, 'variant'> {}

export const SegmentedControl: React.FC<SegmentedControlProps> = (props) => {
  return <RadioButtonGroup {...props} variant="default" />;
};

// Toggle Group (Connected outline buttons)
interface ToggleGroupProps extends Omit<RadioButtonGroupProps, 'variant'> {}

export const ToggleGroup: React.FC<ToggleGroupProps> = (props) => {
  return <RadioButtonGroup {...props} variant="outline" />;
};

export default RadioGroup;