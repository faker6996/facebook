"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";
import Button from "./Button";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  variant?: "default" | "overlay" | "push";
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  showClose?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const sizeStyles = {
  sm: {
    right: "w-[300px]",
    left: "w-[300px]", 
    top: "h-[200px]",
    bottom: "h-[200px]"
  },
  md: {
    right: "w-[400px]",
    left: "w-[400px]",
    top: "h-[300px]", 
    bottom: "h-[300px]"
  },
  lg: {
    right: "w-[500px]",
    left: "w-[500px]",
    top: "h-[400px]",
    bottom: "h-[400px]"
  },
  xl: {
    right: "w-[600px]",
    left: "w-[600px]",
    top: "h-[500px]",
    bottom: "h-[500px]"
  },
  full: {
    right: "w-full",
    left: "w-full",
    top: "h-full",
    bottom: "h-full"
  }
};

const positionStyles = {
  right: "right-0 top-0 h-full",
  left: "left-0 top-0 h-full", 
  top: "top-0 left-0 w-full",
  bottom: "bottom-0 left-0 w-full"
};

const animationStyles = {
  right: {
    initial: "translate-x-full",
    animate: "translate-x-0",
    exit: "translate-x-full"
  },
  left: {
    initial: "-translate-x-full", 
    animate: "translate-x-0",
    exit: "-translate-x-full"
  },
  top: {
    initial: "-translate-y-full",
    animate: "translate-y-0", 
    exit: "-translate-y-full"
  },
  bottom: {
    initial: "translate-y-full",
    animate: "translate-y-0",
    exit: "translate-y-full"
  }
};

export const Sheet: React.FC<SheetProps> = ({ 
  open, 
  onOpenChange, 
  side = "right", 
  size = "md",
  variant = "default",
  children, 
  title, 
  description, 
  className,
  showClose = true,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  header,
  footer
}) => {
  const [mounted, setMounted] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEscape, onOpenChange]);

  // Prevent body scroll when sheet is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Animation handling
  React.useEffect(() => {
    if (open) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!mounted || !open) return null;

  const sheetContent = (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 transition-opacity duration-300 ease-out",
          variant === "overlay" ? "bg-background/95 backdrop-blur-sm" : "bg-background/80 backdrop-blur-sm",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={handleOverlayClick}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed flex flex-col bg-background text-foreground shadow-2xl transition-all duration-300 ease-out",
          "border-border",
          positionStyles[side],
          sizeStyles[size][side],
          // Borders based on side
          side === "right" && "border-l",
          side === "left" && "border-r", 
          side === "top" && "border-b",
          side === "bottom" && "border-t",
          // Animation classes
          open ? animationStyles[side].animate : animationStyles[side].exit,
          className
        )}
      >
        {/* Header */}
        {(title || description || header || showClose) && (
          <div className="flex-shrink-0 border-b border-border">
            {header || (
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  {title && (
                    <h2 className="text-lg font-semibold text-foreground">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {description}
                    </p>
                  )}
                </div>
                {showClose && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-8 w-8 p-0 rounded-md"
                    icon={X}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-border p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(sheetContent, document.body);
};

// Specialized Sheet components
interface DrawerProps extends Omit<SheetProps, 'side'> {
  placement?: "left" | "right";
}

export const Drawer: React.FC<DrawerProps> = ({ 
  placement = "right", 
  ...props 
}) => {
  return (
    <Sheet 
      {...props} 
      side={placement}
      variant="overlay"
    />
  );
};

interface SlideOverProps extends Omit<SheetProps, 'side' | 'variant'> {}

export const SlideOver: React.FC<SlideOverProps> = (props) => {
  return (
    <Sheet 
      {...props} 
      side="right"
      variant="overlay"
      size="lg"
    />
  );
};

interface BottomSheetProps extends Omit<SheetProps, 'side'> {
  snapPoints?: string[];
  defaultSnap?: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ 
  snapPoints = ["25%", "50%", "90%"],
  defaultSnap = 1,
  ...props 
}) => {
  return (
    <Sheet 
      {...props} 
      side="bottom"
      variant="overlay"
      className={cn("rounded-t-lg", props.className)}
    />
  );
};

interface SidebarSheetProps extends Omit<SheetProps, 'side' | 'variant'> {
  navigation?: React.ReactNode;
}

export const SidebarSheet: React.FC<SidebarSheetProps> = ({ 
  navigation, 
  children,
  ...props 
}) => {
  return (
    <Sheet 
      {...props} 
      side="left"
      variant="push"
      size="md"
    >
      {navigation && (
        <div className="border-b border-border pb-4 mb-4">
          {navigation}
        </div>
      )}
      {children}
    </Sheet>
  );
};
