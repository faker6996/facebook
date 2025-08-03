import { cn } from "@/lib/utils/cn";
import { forwardRef, HTMLAttributes } from "react";

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-border scrollbar-track-transparent", className)}
      {...props}
    >
      {children}
    </div>
  );
});

ScrollArea.displayName = "ScrollArea";
