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
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <div className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      <div
        className={cn(
          "absolute z-50 rounded-md bg-popover text-popover-foreground border border-border text-xs px-2 py-1 shadow-lg transition-opacity duration-150",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
          side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-1",
          side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-1",
          side === "left" && "right-full top-1/2 -translate-y-1/2 mr-1",
          side === "right" && "left-full top-1/2 -translate-y-1/2 ml-1"
        )}
      >
        {content}
      </div>
    </div>
  );
};
