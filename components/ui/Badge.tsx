import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children?: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "outline" | "ghost" | "transparent" | "gradient";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  dot?: boolean;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  pulse?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  clickable?: boolean;
  onClick?: () => void;
}

const variantStyles = {
  default: "bg-muted text-muted-foreground border-border/50 hover:bg-muted/80",
  primary: "bg-primary text-primary-foreground border-primary/20 hover:bg-primary/90",
  success: "bg-success text-success-foreground border-success/20 hover:bg-success/90", 
  warning: "bg-warning text-warning-foreground border-warning/20 hover:bg-warning/90",
  danger: "bg-destructive text-destructive-foreground border-destructive/20 hover:bg-destructive/90",
  info: "bg-info text-info-foreground border-info/20 hover:bg-info/90",
  outline: "bg-transparent text-foreground border-border hover:bg-accent/50",
  ghost: "bg-accent/30 text-accent-foreground border-transparent hover:bg-accent/50",
  transparent: "bg-transparent text-foreground border-transparent hover:bg-accent/30",
  gradient: "bg-gradient-to-r from-primary to-secondary text-primary-foreground border-transparent hover:from-primary/90 hover:to-secondary/90"
};

const sizeStyles = {
  xs: "px-1.5 py-0.5 text-xs font-medium min-h-[18px]",
  sm: "px-2 py-0.5 text-xs font-medium min-h-[20px]",
  md: "px-2.5 py-1 text-xs font-medium min-h-[24px]", 
  lg: "px-3 py-1.5 text-sm font-medium min-h-[28px]",
  xl: "px-4 py-2 text-sm font-semibold min-h-[32px]"
};

const dotSizeStyles = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-4 h-4"
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
  pulse = false,
  removable = false,
  onRemove,
  icon,
  clickable = false,
  onClick
}) => {
  const isCountBadge = typeof count === "number";
  const shouldShowCount = isCountBadge && (count > 0 || showZero);
  const displayCount = count && count > maxCount ? `${maxCount}+` : count;
  const Icon = icon;

  const handleClick = (e: React.MouseEvent) => {
    if (clickable && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.();
  };

  const baseClasses = cn(
    "inline-flex items-center border transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
    clickable && "cursor-pointer hover:shadow-sm active:scale-95",
    pulse && "animate-pulse",
    variantStyles[variant]
  );

  if (dot) {
    return (
      <span
        className={cn(
          "inline-flex rounded-full border",
          dotSizeStyles[size],
          variantStyles[variant],
          pulse && "animate-pulse",
          clickable && "cursor-pointer hover:scale-110",
          className
        )}
        onClick={handleClick}
      />
    );
  }

  if (shouldShowCount) {
    return (
      <span
        className={cn(
          baseClasses,
          "justify-center rounded-full",
          "min-w-[1.5rem] h-6 px-1.5 text-xs font-bold",
          size === "xs" && "min-w-[1.25rem] h-5 px-1 text-xs",
          size === "sm" && "min-w-[1.5rem] h-6 px-1.5 text-xs",
          size === "md" && "min-w-[1.75rem] h-7 px-2 text-xs",
          size === "lg" && "min-w-[2rem] h-8 px-2.5 text-sm",
          size === "xl" && "min-w-[2.25rem] h-9 px-3 text-sm",
          className
        )}
        onClick={handleClick}
      >
        {displayCount}
      </span>
    );
  }

  return (
    <span
      className={cn(
        baseClasses,
        "rounded-md gap-1",
        sizeStyles[size],
        className
      )}
      onClick={handleClick}
    >
      {Icon && <Icon className={cn(
        "flex-shrink-0",
        size === "xs" && "h-3 w-3",
        size === "sm" && "h-3 w-3", 
        size === "md" && "h-4 w-4",
        size === "lg" && "h-4 w-4",
        size === "xl" && "h-5 w-5"
      )} />}
      
      {children}
      
      {removable && (
        <button
          onClick={handleRemove}
          className={cn(
            "ml-1 rounded-full hover:bg-accent focus:outline-none focus:bg-accent",
            "transition-colors duration-150 flex-shrink-0",
            size === "xs" && "h-3 w-3",
            size === "sm" && "h-3 w-3",
            size === "md" && "h-4 w-4", 
            size === "lg" && "h-4 w-4",
            size === "xl" && "h-5 w-5"
          )}
          aria-label="Remove badge"
        >
          <svg
            className="h-full w-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
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

// Specialized Badge components
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status?: "online" | "offline" | "busy" | "away" | "idle";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status = "offline", 
  ...props 
}) => {
  const statusVariants = {
    online: "success",
    offline: "default", 
    busy: "danger",
    away: "warning",
    idle: "info"
  } as const;

  return (
    <Badge 
      {...props} 
      variant={statusVariants[status]}
      dot={true}
      pulse={status === "online"}
    />
  );
};

interface TagBadgeProps extends Omit<BadgeProps, 'removable'> {
  tags?: string[];
  onTagRemove?: (tag: string) => void;
  maxTags?: number;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ 
  tags = [], 
  onTagRemove,
  maxTags = 3,
  size = "sm",
  variant = "outline",
  className,
  ...props 
}) => {
  const displayTags = tags.slice(0, maxTags);
  const remainingCount = tags.length - maxTags;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayTags.map((tag, index) => (
        <Badge
          key={`${tag}-${index}`}
          {...props}
          variant={variant}
          size={size}
          removable={!!onTagRemove}
          onRemove={() => onTagRemove?.(tag)}
        >
          {tag}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="ghost" size={size}>
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
};

interface InteractiveBadgeProps extends BadgeProps {
  active?: boolean;
  disabled?: boolean;
}

export const InteractiveBadge: React.FC<InteractiveBadgeProps> = ({
  active = false,
  disabled = false,
  variant = "outline",
  className,
  ...props
}) => {
  return (
    <Badge
      {...props}
      variant={active ? "primary" : variant}
      clickable={!disabled}
      className={cn(
        "select-none",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && !active && "hover:border-primary/50",
        className
      )}
    />
  );
};

interface GradientBadgeProps extends Omit<BadgeProps, 'variant'> {
  from?: string;
  to?: string;
}

export const GradientBadge: React.FC<GradientBadgeProps> = ({ 
  from = "from-primary",
  to = "to-secondary",
  className,
  ...props 
}) => {
  return (
    <Badge
      {...props}
      variant="transparent"
      className={cn(
        `bg-gradient-to-r ${from} ${to} text-primary-foreground border-transparent`,
        "hover:opacity-90",
        className
      )}
    />
  );
};

interface PulseBadgeProps extends BadgeProps {
  speed?: "slow" | "normal" | "fast";
}

export const PulseBadge: React.FC<PulseBadgeProps> = ({ 
  speed = "normal",
  className,
  ...props 
}) => {
  const speedClasses = {
    slow: "animate-pulse [animation-duration:2s]",
    normal: "animate-pulse",
    fast: "animate-pulse [animation-duration:0.5s]"
  };

  return (
    <Badge
      {...props}
      pulse={false}
      className={cn(speedClasses[speed], className)}
    />
  );
};

export default Badge;