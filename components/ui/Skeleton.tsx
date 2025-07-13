import React from "react";
import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "rectangular" | "circular" | "rounded" | "text";
  animation?: "pulse" | "wave" | "none";
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  variant = "rectangular",
  animation = "pulse",
  lines = 1
}) => {
  const variantClasses = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    rounded: "rounded-lg", 
    text: "rounded"
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",
    none: ""
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-4 bg-muted",
              variantClasses[variant],
              animationClasses[animation],
              index === lines - 1 && "w-3/4" // Last line is shorter
            )}
            style={{
              width: index === lines - 1 ? undefined : width,
              height: height
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-muted",
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{ width, height }}
    />
  );
};

// Pre-built skeleton components for common use cases
export const SkeletonAvatar: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = ({ 
  size = "md", 
  className 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClasses[size], className)}
    />
  );
};

export const SkeletonButton: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = ({ 
  size = "md", 
  className 
}) => {
  const sizeClasses = {
    sm: "h-8 w-20",
    md: "h-10 w-24",
    lg: "h-12 w-28"
  };

  return (
    <Skeleton
      variant="rounded"
      className={cn(sizeClasses[size], className)}
    />
  );
};

export const SkeletonText: React.FC<{ 
  lines?: number; 
  className?: string;
  width?: string;
}> = ({ 
  lines = 3, 
  className,
  width = "100%"
}) => {
  return (
    <Skeleton
      variant="text"
      lines={lines}
      width={width}
      className={className}
    />
  );
};

// Complex skeleton layouts
export const SkeletonCard: React.FC<{ 
  showAvatar?: boolean;
  showImage?: boolean;
  textLines?: number;
  className?: string;
}> = ({ 
  showAvatar = true,
  showImage = false, 
  textLines = 3,
  className
}) => {
  return (
    <div className={cn("p-4 space-y-4 rounded-lg border bg-card", className)}>
      {/* Header with avatar */}
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <SkeletonAvatar />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      )}

      {/* Image */}
      {showImage && (
        <Skeleton className="h-48 w-full rounded-md" />
      )}

      {/* Text content */}
      <SkeletonText lines={textLines} />

      {/* Actions */}
      <div className="flex space-x-2">
        <SkeletonButton size="sm" />
        <SkeletonButton size="sm" />
      </div>
    </div>
  );
};

export const SkeletonPost: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("p-6 space-y-4 rounded-xl border bg-card", className)}>
      {/* Post header */}
      <div className="flex items-center space-x-3">
        <SkeletonAvatar size="lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Post content */}
      <SkeletonText lines={2} />

      {/* Post image */}
      <Skeleton className="h-64 w-full rounded-lg" />

      {/* Post stats */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>

      {/* Post actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex space-x-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonMessage: React.FC<{ 
  own?: boolean; 
  showAvatar?: boolean;
  className?: string;
}> = ({ 
  own = false, 
  showAvatar = true,
  className 
}) => {
  return (
    <div className={cn(
      "flex items-end space-x-2",
      own && "flex-row-reverse space-x-reverse",
      className
    )}>
      {showAvatar && !own && <SkeletonAvatar size="sm" />}
      <div className={cn(
        "max-w-xs space-y-1",
        own ? "items-end" : "items-start"
      )}>
        <Skeleton className={cn(
          "h-10 rounded-2xl",
          own ? "w-32 bg-primary/20" : "w-40 bg-muted"
        )} />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
};

export const SkeletonList: React.FC<{ 
  items?: number;
  itemHeight?: number;
  showAvatar?: boolean;
  className?: string;
}> = ({ 
  items = 5, 
  itemHeight = 60,
  showAvatar = true,
  className 
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg">
          {showAvatar && <SkeletonAvatar />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ 
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ 
  rows = 5, 
  columns = 4,
  className 
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex space-x-4 p-3 border-b border-border">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 p-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;