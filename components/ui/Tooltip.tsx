"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, side = "top", delay = 0 }) => {
  const [visible, setVisible] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(true);
      setVisible(true);
    }, delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    
    setVisible(false);
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 200);
  };

  const getArrowClasses = () => {
    const baseArrow = "absolute w-2 h-2 bg-popover border border-border transform rotate-45";
    switch (side) {
      case "top":
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-t-transparent border-l-transparent`;
      case "bottom":
        return `${baseArrow} bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-b-transparent border-r-transparent`;
      case "left":
        return `${baseArrow} left-full top-1/2 -translate-y-1/2 -translate-x-1/2 border-t-transparent border-l-transparent`;
      case "right":
        return `${baseArrow} right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-b-transparent border-r-transparent`;
      default:
        return baseArrow;
    }
  };

  return (
    <div className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {(visible || isAnimating) && (
        <div
          className={cn(
            "absolute z-50 rounded-lg bg-popover text-popover-foreground border border-border text-xs px-3 py-2",
            "shadow-xl backdrop-blur-sm bg-white/95 dark:bg-neutral-900/95",
            "transition-all duration-200 ease-soft transform-gpu",
            visible 
              ? "opacity-100 scale-100 translate-y-0" 
              : "opacity-0 scale-95 translate-y-1 pointer-events-none",
            side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
            side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
            side === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
            side === "right" && "left-full top-1/2 -translate-y-1/2 ml-2"
          )}
        >
          {/* Tooltip arrow */}
          <div className={getArrowClasses()} />
          
          {/* Content with fade-in animation */}
          <div className={cn(
            "relative z-10 transition-opacity duration-150 delay-75",
            visible ? "opacity-100" : "opacity-0"
          )}>
            {content}
          </div>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
        </div>
      )}
    </div>
  );
};
