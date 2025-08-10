"use client";

import * as React from "react";
import { 
  useFloating, 
  autoUpdate, 
  offset, 
  flip, 
  shift, 
  useHover, 
  useFocus, 
  useDismiss, 
  useRole, 
  useInteractions,
  useMergeRefs,
  arrow,
  FloatingArrow
} from "@floating-ui/react";
import { cn } from "@/lib/utils/cn";

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  placement?: "top" | "right" | "bottom" | "left" | "top-start" | "top-end" | "bottom-start" | "bottom-end";
  delay?: number | { open?: number; close?: number };
  className?: string;
  disabled?: boolean;
  variant?: "default" | "info" | "warning" | "error" | "success";
}

const variantStyles = {
  default: "bg-popover text-popover-foreground border-border",
  info: "bg-info text-info-foreground border-info/20",
  warning: "bg-warning text-warning-foreground border-warning/20", 
  error: "bg-destructive text-destructive-foreground border-destructive/20",
  success: "bg-success text-success-foreground border-success/20",
};

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = "top",
  delay = { open: 700, close: 300 },
  className,
  disabled = false,
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const arrowRef = React.useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip({
        fallbackAxisSideDirection: "start",
        padding: 8,
      }),
      shift({ padding: 8 }),
      arrow({
        element: arrowRef,
      }),
    ],
  });

  const hover = useHover(context, {
    move: false,
    delay: typeof delay === "number" ? delay : delay,
    enabled: !disabled,
  });
  const focus = useFocus(context, { enabled: !disabled });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  // Merge refs with child's ref if it exists
  const ref = useMergeRefs([refs.setReference, (children as any).ref]);

  if (disabled || !content) {
    return children;
  }

  return (
    <>
      {React.cloneElement(children, {
        ref,
        ...getReferenceProps(),
      } as any)}
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className={cn(
            "z-[9999] px-3 py-2 text-sm font-medium rounded-lg shadow-lg border",
            "max-w-xs break-words backdrop-blur-sm",
            variantStyles[variant],
            className
          )}
        >
          <FloatingArrow
            ref={arrowRef}
            context={context}
            className={cn(
              "fill-current",
              variant === "default" && "text-popover",
              variant === "info" && "text-info",
              variant === "warning" && "text-warning",
              variant === "error" && "text-destructive",
              variant === "success" && "text-success"
            )}
          />
          {content}
        </div>
      )}
    </>
  );
};
