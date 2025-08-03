import React from "react";
import { cn } from "@/lib/utils/cn";
import { Check, X, Clock, AlertTriangle } from "lucide-react";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg" | "xl";
  showValue?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
  description?: string;
  status?: "normal" | "error" | "complete";
}

const variantStyles = {
  default: "bg-muted-foreground",
  primary: "bg-gradient-to-r from-primary via-primary/90 to-primary",
  success: "bg-gradient-to-r from-success via-success/90 to-success shadow-sm shadow-success/20", 
  warning: "bg-gradient-to-r from-warning via-warning/90 to-warning shadow-sm shadow-warning/20",
  danger: "bg-gradient-to-r from-destructive via-destructive/90 to-destructive shadow-sm shadow-destructive/20",
  info: "bg-gradient-to-r from-info via-info/90 to-info shadow-sm shadow-info/20"
};

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
  xl: "h-4"
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
  striped = false,
  indeterminate = false,
  description,
  status = "normal"
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isComplete = status === "complete" || percentage >= 100;
  const isError = status === "error";

  // Status icon
  const getStatusIcon = () => {
    if (isComplete) return <Check className="w-4 h-4 text-success" />;
    if (isError) return <X className="w-4 h-4 text-destructive" />;
    if (animated || indeterminate) return <Clock className="w-4 h-4 text-muted-foreground animate-spin" />;
    return null;
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Header */}
      {(label || showValue || description) && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {label && <span className="font-medium text-foreground">{label}</span>}
              {getStatusIcon()}
            </div>
            {showValue && !indeterminate && (
              <span className={cn(
                "text-sm font-medium",
                isComplete ? "text-success" : isError ? "text-destructive" : "text-muted-foreground"
              )}>
                {isComplete ? "Complete" : isError ? "Error" : `${Math.round(percentage)}%`}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      
      {/* Progress Bar */}
      <div
        className={cn(
          "w-full bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm",
          "border border-border/50",
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-700 ease-out rounded-full relative",
            "before:absolute before:inset-0 before:rounded-full before:opacity-30",
            indeterminate && "animate-pulse",
            !indeterminate && variantStyles[variant],
            isComplete && "bg-gradient-to-r from-success via-success/90 to-success shadow-sm shadow-success/20",
            isError && "bg-gradient-to-r from-destructive via-destructive/90 to-destructive shadow-sm shadow-destructive/20",
            striped && "bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent bg-[length:1rem_1rem]",
            animated && !indeterminate && "before:animate-pulse",
            // Shimmer effect for indeterminate
            indeterminate && "bg-gradient-to-r from-muted via-primary/50 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite]"
          )}
          style={{ 
            width: indeterminate ? "100%" : `${percentage}%`,
            backgroundImage: striped ? "linear-gradient(45deg, hsl(var(--foreground) / 0.15) 25%, transparent 25%, transparent 50%, hsl(var(--foreground) / 0.15) 50%, hsl(var(--foreground) / 0.15) 75%, transparent 75%, transparent)" : undefined
          }}
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
  indeterminate?: boolean;
  status?: "normal" | "error" | "complete";
  trackColor?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  className,
  variant = "primary",
  showValue = false,
  children,
  indeterminate = false,
  status = "normal",
  trackColor = "stroke-muted/20"
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const offset = circumference - (percentage / 100) * circumference;
  const isComplete = status === "complete" || percentage >= 100;
  const isError = status === "error";

  const variantColors = {
    default: "stroke-muted-foreground",
    primary: "stroke-primary",
    success: "stroke-success",
    warning: "stroke-warning", 
    danger: "stroke-destructive",
    info: "stroke-info"
  };

  const getContentIcon = () => {
    if (isComplete) return <Check className="w-5 h-5 text-success" />;
    if (isError) return <X className="w-5 h-5 text-destructive" />;
    return null;
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className={cn(
          "transform -rotate-90",
          indeterminate && "animate-spin"
        )}
        style={{ animationDuration: indeterminate ? "2s" : undefined }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={trackColor}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? circumference * 0.25 : offset}
          className={cn(
            "transition-all duration-700 ease-out",
            isComplete ? "stroke-success" : isError ? "stroke-destructive" : variantColors[variant],
            "drop-shadow-sm"
          )}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 4px ${
              isComplete ? "hsl(var(--success) / 0.3)" : 
              isError ? "hsl(var(--destructive) / 0.3)" : 
              "hsl(var(--primary) / 0.2)"
            })`
          }}
        />
      </svg>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ? children : (
          <>
            {getContentIcon()}
            {showValue && !indeterminate && (
              <span className={cn(
                "text-sm font-semibold",
                isComplete ? "text-success" : isError ? "text-destructive" : "text-foreground"
              )}>
                {isComplete ? "✓" : isError ? "✗" : `${Math.round(percentage)}%`}
              </span>
            )}
            {indeterminate && (
              <Clock className="w-4 h-4 text-muted-foreground animate-pulse" />
            )}
          </>
        )}
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
                  "rounded-full border-2 flex items-center justify-center font-medium transition-all duration-300",
                  "shadow-sm hover:shadow-md",
                  stepSizes[size],
                  status === "completed" && [
                    "border-success bg-success text-success-foreground",
                    "shadow-success/20"
                  ],
                  status === "current" && [
                    "border-primary bg-primary/10 text-primary",
                    "ring-2 ring-primary/20 ring-offset-2",
                    "shadow-primary/20"
                  ],
                  status === "upcoming" && [
                    "border-muted-foreground/30 text-muted-foreground bg-background",
                    "hover:border-muted-foreground/50"
                  ]
                )}
              >
                {status === "completed" ? <Check className="w-3 h-3" /> : index + 1}
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

// Mini Progress - compact version for tight spaces
interface MiniProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  showValue?: boolean;
}

export const MiniProgress: React.FC<MiniProgressProps> = ({
  value,
  max = 100,
  className,
  variant = "primary",
  showValue = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <span className="text-xs font-medium text-muted-foreground min-w-[2.5rem] text-right">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

// Battery Progress - for battery/power indicators
interface BatteryProgressProps {
  value: number;
  max?: number;
  className?: string;
  charging?: boolean;
  showValue?: boolean;
}

export const BatteryProgress: React.FC<BatteryProgressProps> = ({
  value,
  max = 100,
  className,
  charging = false,
  showValue = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const getVariant = () => {
    if (charging) return "info";
    if (percentage <= 20) return "danger";
    if (percentage <= 50) return "warning";
    return "success";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        {/* Battery outline */}
        <div className="w-6 h-3 border-2 border-foreground/20 rounded-sm relative">
          <div className="absolute -right-1 top-0.5 w-0.5 h-1 bg-foreground/20 rounded-r-sm" />
          {/* Battery fill */}
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-sm",
              variantStyles[getVariant()],
              charging && "animate-pulse"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {charging && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 text-info-foreground">⚡</div>
          </div>
        )}
      </div>
      {showValue && (
        <span className={cn(
          "text-xs font-medium",
          percentage <= 20 ? "text-destructive" : "text-muted-foreground"
        )}>
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

// Segmented Progress - for multi-segment indicators
interface SegmentedProgressProps {
  segments: number;
  activeSegments: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
}

export const SegmentedProgress: React.FC<SegmentedProgressProps> = ({
  segments,
  activeSegments,
  className,
  variant = "primary",
  size = "md"
}) => {
  const segmentSizes = {
    sm: "h-1",
    md: "h-2", 
    lg: "h-3"
  };

  return (
    <div className={cn("flex gap-1", className)}>
      {Array.from({ length: segments }, (_, index) => (
        <div
          key={index}
          className={cn(
            "flex-1 rounded-full transition-all duration-300",
            segmentSizes[size],
            index < activeSegments 
              ? variantStyles[variant]
              : "bg-muted/50"
          )}
        />
      ))}
    </div>
  );
};

// Loading Progress - for file uploads, downloads etc
interface LoadingProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  label?: string;
  status?: "loading" | "complete" | "error" | "paused";
  speed?: string;
  timeRemaining?: string;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  value,
  max = 100,
  className,
  variant = "primary",
  label,
  status = "loading",
  speed,
  timeRemaining
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const getStatusIcon = () => {
    switch (status) {
      case "complete": return <Check className="w-4 h-4 text-success" />;
      case "error": return <X className="w-4 h-4 text-destructive" />;
      case "paused": return <Clock className="w-4 h-4 text-warning" />;
      default: return <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "complete": return "success";
      case "error": return "danger";
      case "paused": return "warning";
      default: return variant;
    }
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {label && <span className="font-medium text-foreground">{label}</span>}
        </div>
        <span className="text-muted-foreground">
          {status === "complete" ? "Complete" : `${Math.round(percentage)}%`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            variantStyles[getStatusColor()],
            status === "loading" && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Footer */}
      {(speed || timeRemaining) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {speed && <span>{speed}</span>}
          {timeRemaining && <span>{timeRemaining}</span>}
        </div>
      )}
    </div>
  );
};

export default Progress;