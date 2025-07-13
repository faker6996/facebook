import React from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children?: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  dot?: boolean;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  pulse?: boolean;
}

const variantStyles = {
  default: "bg-muted text-muted-foreground border-transparent",
  primary: "bg-primary text-primary-foreground border-transparent",
  success: "bg-success text-success-foreground border-transparent", 
  warning: "bg-warning text-warning-foreground border-transparent",
  danger: "bg-destructive text-destructive-foreground border-transparent",
  info: "bg-info text-info-foreground border-transparent",
  outline: "bg-transparent text-foreground border-border",
  ghost: "bg-accent/50 text-accent-foreground border-transparent"
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs font-medium",
  md: "px-2.5 py-1 text-xs font-medium", 
  lg: "px-3 py-1.5 text-sm font-medium"
};

const dotSizeStyles = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3"
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className,
  dot = false,
  count,
  maxCount = 99,
  showZero = false,
  pulse = false
}) => {
  const isCountBadge = typeof count === "number";
  const shouldShowCount = isCountBadge && (count > 0 || showZero);
  const displayCount = count && count > maxCount ? `${maxCount}+` : count;

  if (dot) {
    return (
      <span
        className={cn(
          "inline-flex rounded-full border",
          dotSizeStyles[size],
          variantStyles[variant],
          pulse && "animate-pulse",
          className
        )}
      />
    );
  }

  if (shouldShowCount) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full border transition-all duration-200",
          sizeStyles[size],
          variantStyles[variant],
          pulse && "animate-pulse",
          "min-w-[1.5rem] h-6 px-1.5 text-xs font-bold",
          className
        )}
      >
        {displayCount}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border transition-all duration-200",
        sizeStyles[size],
        variantStyles[variant],
        pulse && "animate-pulse",
        className
      )}
    >
      {children}
    </span>
  );
};

// Notification Badge component - wrapper for positioning badges over other elements
interface NotificationBadgeProps {
  children: React.ReactNode;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  dot?: boolean;
  variant?: BadgeProps["variant"];
  size?: BadgeProps["size"];
  className?: string;
  badgeClassName?: string;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  pulse?: boolean;
}

const positionStyles = {
  "top-right": "-top-1 -right-1",
  "top-left": "-top-1 -left-1", 
  "bottom-right": "-bottom-1 -right-1",
  "bottom-left": "-bottom-1 -left-1"
};

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  children,
  count,
  maxCount = 99,
  showZero = false,
  dot = false,
  variant = "danger",
  size = "sm",
  className,
  badgeClassName,
  position = "top-right",
  pulse = false
}) => {
  const shouldShow = dot || (typeof count === "number" && (count > 0 || showZero));

  return (
    <div className={cn("relative inline-flex", className)}>
      {children}
      {shouldShow && (
        <Badge
          count={count}
          maxCount={maxCount}
          showZero={showZero}
          dot={dot}
          variant={variant}
          size={size}
          pulse={pulse}
          className={cn(
            "absolute transform scale-100 transition-transform duration-200",
            positionStyles[position],
            "shadow-sm",
            badgeClassName
          )}
        />
      )}
    </div>
  );
};

export default Badge;