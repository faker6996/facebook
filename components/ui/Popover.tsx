"use client";

import * as React from "react";
import { 
  useFloating, 
  autoUpdate, 
  offset, 
  flip, 
  shift, 
  useClick, 
  useDismiss, 
  useRole, 
  useInteractions,
  useMergeRefs,
  FloatingFocusManager,
  FloatingPortal
} from "@floating-ui/react";
import { cn } from "@/lib/utils/cn";

interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  placement?: "top" | "bottom" | "left" | "right" | "top-start" | "bottom-start" | "top-end" | "bottom-end";
  modal?: boolean;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Popover: React.FC<PopoverProps> = ({ 
  trigger, 
  children, 
  className,
  contentClassName,
  placement = "bottom",
  modal = false,
  disabled = false,
  open,
  onOpenChange
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
  });

  const click = useClick(context, {
    enabled: !disabled,
  });
  const dismiss = useDismiss(context, {
    outsidePress: true,
    escapeKey: true,
  });
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  // Merge refs with child's ref if it exists
  const ref = useMergeRefs([refs.setReference, (trigger as any).ref]);

  const floatingContent = (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      {...getFloatingProps()}
      className={cn(
        "z-[9999] w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-lg outline-none",
        "backdrop-blur-sm bg-popover/95 border-border/60",
        contentClassName
      )}
    >
      {children}
    </div>
  );

  return (
    <>
      {React.cloneElement(trigger, {
        ref,
        ...getReferenceProps(),
        className: cn((trigger.props as any)?.className, className),
      } as any)}
      {isOpen && (
        <>
          {modal ? (
            <FloatingFocusManager context={context} modal={modal}>
              <FloatingPortal>
                {floatingContent}
              </FloatingPortal>
            </FloatingFocusManager>
          ) : (
            <FloatingPortal>
              {floatingContent}
            </FloatingPortal>
          )}
        </>
      )}
    </>
  );
};
