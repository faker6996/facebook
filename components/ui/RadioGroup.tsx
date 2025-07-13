"use client";

import React, { createContext, useContext, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface RadioGroupContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined);

const useRadioGroup = () => {
  const context = useContext(RadioGroupContext);
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
  className?: string;
  children: React.ReactNode;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    value, 
    defaultValue, 
    onValueChange, 
    name, 
    disabled = false, 
    orientation = "vertical",
    className, 
    children 
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

    return (
      <RadioGroupContext.Provider
        value={{
          value: currentValue,
          onValueChange: handleValueChange,
          name,
          disabled
        }}
      >
        <div
          ref={ref}
          className={cn(
            "grid gap-2",
            orientation === "horizontal" ? "grid-flow-col auto-cols-max" : "grid-cols-1",
            className
          )}
          role="radiogroup"
          aria-disabled={disabled}
        >
          {children}
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
}

export const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ value, id, disabled, className, children }, ref) => {
    const { value: selectedValue, onValueChange, name, disabled: groupDisabled } = useRadioGroup();
    const isDisabled = disabled || groupDisabled;
    const isSelected = selectedValue === value;

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isSelected}
        data-state={isSelected ? "checked" : "unchecked"}
        value={value}
        id={id}
        disabled={isDisabled}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          className
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
            <span className="w-2 h-2 bg-primary-foreground rounded-full" />
          )}
        </span>
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
);

RadioGroupItem.displayName = "RadioGroupItem";

// Radio Group with Label Component
interface RadioGroupWithLabelProps {
  items: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
  itemClassName?: string;
  variant?: "default" | "card";
}

export const RadioGroupWithLabel: React.FC<RadioGroupWithLabelProps> = ({
  items,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled = false,
  orientation = "vertical",
  className,
  itemClassName,
  variant = "default"
}) => {
  return (
    <RadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      disabled={disabled}
      orientation={orientation}
      className={className}
    >
      {items.map((item) => (
        <div
          key={item.value}
          className={cn(
            "flex items-center space-x-2",
            variant === "card" && [
              "rounded-lg border p-4 hover:bg-accent/50 transition-colors",
              "has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            ],
            itemClassName
          )}
        >
          <RadioGroupItem
            value={item.value}
            id={item.value}
            disabled={item.disabled || disabled}
          />
          <label
            htmlFor={item.value}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              "cursor-pointer flex-1",
              variant === "card" && "space-y-1"
            )}
          >
            <div>{item.label}</div>
            {item.description && variant === "card" && (
              <div className="text-muted-foreground text-xs">
                {item.description}
              </div>
            )}
          </label>
          {item.description && variant === "default" && (
            <span className="text-xs text-muted-foreground">
              {item.description}
            </span>
          )}
        </div>
      ))}
    </RadioGroup>
  );
};

// Radio Button Group (looks like buttons)
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
  variant?: "default" | "outline";
  className?: string;
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
  className
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
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variantClasses = {
    default: {
      base: "bg-background border-border hover:bg-accent",
      selected: "bg-primary text-primary-foreground border-primary"
    },
    outline: {
      base: "bg-transparent border-border hover:bg-accent", 
      selected: "bg-primary text-primary-foreground border-primary"
    }
  };

  return (
    <div className={cn("inline-flex rounded-md border border-border overflow-hidden", className)}>
      {items.map((item, index) => {
        const isSelected = currentValue === item.value;
        const isDisabled = item.disabled || disabled;
        const Icon = item.icon;

        return (
          <button
            key={item.value}
            type="button"
            disabled={isDisabled}
            className={cn(
              "relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:z-10",
              "disabled:cursor-not-allowed disabled:opacity-50",
              sizeClasses[size],
              isSelected 
                ? variantClasses[variant].selected 
                : variantClasses[variant].base,
              index > 0 && "border-l border-border"
            )}
            onClick={() => handleValueChange(item.value)}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {item.label}
            <input
              type="radio"
              name={name}
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

export default RadioGroup;