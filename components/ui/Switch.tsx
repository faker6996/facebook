"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ 
  checked, 
  onCheckedChange, 
  label, 
  size = "md",
  variant = "default",
  disabled = false,
  className, 
  ...props 
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const sizeClasses = {
    sm: {
      track: "w-8 h-4",
      handle: "w-3 h-3",
      translate: "translate-x-4"
    },
    md: {
      track: "w-11 h-6", 
      handle: "w-5 h-5",
      translate: "translate-x-5"
    },
    lg: {
      track: "w-14 h-8",
      handle: "w-7 h-7", 
      translate: "translate-x-6"
    }
  };

  const variantClasses = {
    default: {
      trackActive: "bg-primary",
      trackInactive: "bg-input",
      handle: "bg-background"
    },
    success: {
      trackActive: "bg-success",
      trackInactive: "bg-input", 
      handle: "bg-background"
    },
    warning: {
      trackActive: "bg-warning",
      trackInactive: "bg-input",
      handle: "bg-background" 
    },
    danger: {
      trackActive: "bg-destructive",
      trackInactive: "bg-input",
      handle: "bg-background"
    }
  };

  return (
    <label 
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <div className={cn("relative inline-block", sizeClasses[size].track)}>
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={checked} 
          disabled={disabled}
          onChange={(e) => !disabled && onCheckedChange(e.target.checked)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props} 
        />
        
        {/* Background track */}
        <div 
          className={cn(
            "block w-full h-full rounded-full transition-all duration-300 ease-out",
            // Enhanced track visibility with stronger borders and contrast
            "border-2 shadow-inner",
            checked 
              ? [
                  variantClasses[variant].trackActive, 
                  "border-primary-foreground/20 shadow-lg",
                  variant === "default" && "shadow-primary/30",
                  variant === "success" && "shadow-success/30", 
                  variant === "warning" && "shadow-warning/30",
                  variant === "danger" && "shadow-destructive/30"
                ]
              : [
                  variantClasses[variant].trackInactive,
                  "border-border/40 shadow-inner"
                ],
            !disabled && "hover:shadow-md hover:border-border/60",
            isFocused && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background",
            disabled && "opacity-50"
          )} 
        />
        
        {/* Handle with enhanced contrast */}
        <div
          className={cn(
            "absolute top-0.5 left-0.5 rounded-full transition-all duration-300 ease-out",
            // Much stronger border and shadow for better visibility
            "border-2 shadow-xl",
            sizeClasses[size].handle,
            // Enhanced handle colors with better contrast
            checked 
              ? [
                  "bg-primary-foreground border-primary-foreground/90",
                  "shadow-2xl shadow-foreground/20",
                  // Add subtle colored glow based on variant
                  variant === "default" && "ring-1 ring-primary/30",
                  variant === "success" && "ring-1 ring-success/30",
                  variant === "warning" && "ring-1 ring-warning/30", 
                  variant === "danger" && "ring-1 ring-destructive/30"
                ]
              : [
                  "bg-background border-border",
                  "shadow-lg shadow-foreground/10"
                ],
            checked ? sizeClasses[size].translate : "translate-x-0",
            !disabled && "hover:shadow-2xl hover:scale-105",
            isPressed && "scale-95",
            disabled && "opacity-70"
          )}
          onMouseDown={() => !disabled && setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
        >
          {/* Enhanced inner effects for better visibility */}
          {checked && (
            <>
              {/* Bright inner glow when active */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-foreground/60 via-primary-foreground/20 to-transparent" />
              {/* Subtle colored indicator */}
              <div className={cn(
                "absolute inset-1 rounded-full opacity-20",
                variant === "default" && "bg-primary",
                variant === "success" && "bg-success", 
                variant === "warning" && "bg-warning",
                variant === "danger" && "bg-destructive"
              )} />
            </>
          )}
          
          {/* Always visible shine effect for depth */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-foreground/50 via-transparent to-foreground/5" />
          
          {/* Subtle shadow inside handle for depth */}
          <div className="absolute inset-0 rounded-full shadow-inner shadow-foreground/5" />
        </div>

        {/* Track inner shadow for depth */}
        <div className="absolute inset-0.5 rounded-full shadow-inner shadow-foreground/10 pointer-events-none" />
        
        {/* Active state track indicator */}
        {checked && (
          <div className={cn(
            "absolute inset-1 rounded-full opacity-30 animate-pulse",
            "bg-gradient-to-r from-primary-foreground/10 to-transparent"
          )} />
        )}
      </div>
      
      {label && (
        <span className={cn(
          "text-sm font-medium text-foreground transition-colors",
          disabled && "text-muted-foreground"
        )}>
          {label}
        </span>
      )}
    </label>
  );
};

Switch.displayName = "Switch";
export default Switch;
