import React from "react";
import { cn } from "@/lib/utils/cn";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
}

const variantStyles = {
  default: "bg-muted-foreground",
  primary: "bg-primary",
  success: "bg-success", 
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info"
};

const sizeStyles = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3"
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  variant = "primary",
  size = "md",
  showValue = false,
  label,
  animated = false,
  striped = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {showValue && (
            <span className="text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            "transition-all duration-500 ease-out rounded-full",
            variantStyles[variant],
            striped && "bg-stripes",
            animated && "bg-animated-stripes"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Circular Progress Component
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  showValue?: boolean;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  className,
  variant = "primary",
  showValue = false,
  children
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const offset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: "stroke-muted-foreground",
    primary: "stroke-primary",
    success: "stroke-success",
    warning: "stroke-warning", 
    danger: "stroke-destructive",
    info: "stroke-info"
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted opacity-20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-all duration-500 ease-out",
            variantColors[variant]
          )}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showValue && (
          <span className="text-sm font-medium text-foreground">
            {Math.round(percentage)}%
          </span>
        ))}
      </div>
    </div>
  );
};

// Multi-step Progress Component
interface StepProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  className,
  variant = "primary",
  size = "md"
}) => {
  const stepSizes = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm", 
    lg: "w-10 h-10 text-base"
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "current";
    return "upcoming";
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          
          return (
            <div key={step} className="flex items-center">
              {/* Step Circle */}
              <div
                className={cn(
                  "rounded-full border-2 flex items-center justify-center font-medium transition-all duration-200",
                  stepSizes[size],
                  status === "completed" && [
                    "border-transparent",
                    variantStyles[variant],
                    "text-white"
                  ],
                  status === "current" && [
                    `border-${variant}`,
                    `text-${variant}`,
                    "bg-background"
                  ],
                  status === "upcoming" && [
                    "border-muted",
                    "text-muted-foreground",
                    "bg-background"
                  ]
                )}
              >
                {status === "completed" ? "✓" : index + 1}
              </div>
              
              {/* Step Label */}
              <span
                className={cn(
                  "ml-2 text-sm font-medium transition-colors duration-200",
                  status === "completed" && variantStyles[variant].replace("bg-", "text-"),
                  status === "current" && "text-foreground",
                  status === "upcoming" && "text-muted-foreground"
                )}
              >
                {step}
              </span>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors duration-200",
                    index < currentStep ? variantStyles[variant] : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Progress;