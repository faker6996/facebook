"use client";

import React, { useEffect } from "react";
import { 
  useFloating, 
  useDismiss, 
  useRole, 
  useInteractions,
  FloatingFocusManager,
  FloatingPortal,
  FloatingOverlay
} from "@floating-ui/react";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  contentClassName?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  variant?: "default" | "blur" | "clean";
}

const sizeClasses = {
  sm: "w-full h-full md:w-auto md:h-auto md:max-w-sm",
  md: "w-full h-full md:w-auto md:h-auto md:max-w-md", 
  lg: "w-full h-full md:w-auto md:h-auto md:max-w-lg",
  xl: "w-full h-full md:w-auto md:h-auto md:max-w-xl",
  full: "w-full h-full md:w-[90vw] md:h-[90vh]"
};

const variantStyles = {
  default: {
    overlay: "bg-background/80 backdrop-blur-sm",
    content: "bg-card text-card-foreground border-border shadow-xl"
  },
  blur: {
    overlay: "bg-background/40 backdrop-blur-md",
    content: "bg-card/95 text-card-foreground border-border/60 shadow-2xl backdrop-blur-sm"
  },
  clean: {
    overlay: "bg-background/60 backdrop-blur-none",
    content: "bg-card text-card-foreground border-border shadow-lg"
  }
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
  contentClassName,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  variant = "default"
}) => {
  // Floating UI setup
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: onClose,
  });

  // Interactions
  const dismiss = useDismiss(context, {
    outsidePress: closeOnOverlayClick,
    escapeKey: closeOnEscape,
  });
  const role = useRole(context, { role: "dialog" });
  
  const { getFloatingProps } = useInteractions([
    dismiss,
    role,
  ]);

  // Body overflow management
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const styles = variantStyles[variant];

  return (
    <FloatingPortal>
      <FloatingOverlay
        className={cn(
          "fixed inset-0 z-[9999] flex items-center justify-center p-4",
          "animate-in fade-in-0 duration-300",
          styles.overlay
        )}
        lockScroll
      >
        <FloatingFocusManager context={context}>
          <div
            ref={refs.setFloating}
            {...getFloatingProps()}
            className={cn(
              "relative rounded-none md:rounded-xl border-0 md:border transition-all duration-300",
              "animate-in fade-in-0 zoom-in-95 duration-300",
              "max-h-[calc(100vh-2rem)] overflow-hidden",
              sizeClasses[size],
              styles.content,
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/60 bg-card/50 backdrop-blur-sm">
                {title && (
                  <h2 className="text-lg md:text-xl font-semibold leading-none tracking-tight text-foreground">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    icon={X}
                    className="bg-muted/40 hover:bg-muted/80"
                    aria-label="Close modal"
                  />
                )}
              </div>
            )}
            
            {/* Body */}
            <div className={cn(
              "overflow-auto max-h-[calc(100vh-12rem)] md:max-h-[calc(90vh-8rem)]",
              title || showCloseButton ? "p-4 md:p-6" : "p-4 md:p-6",
              contentClassName
            )}>
              {children}
            </div>
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
};

// Convenience components for common Modal patterns
export const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("p-4 md:p-6 border-b border-border/60 bg-card/50 backdrop-blur-sm", className)}>
    {children}
  </div>
);

export const ModalTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <h2 className={cn("text-lg md:text-xl font-semibold leading-none tracking-tight text-foreground", className)}>
    {children}
  </h2>
);

export const ModalDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <p className={cn("text-sm text-muted-foreground mt-1.5", className)}>
    {children}
  </p>
);

export const ModalBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("p-4 md:p-6 overflow-auto", className)}>
    {children}
  </div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn(
    "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-4 md:p-6",
    "border-t border-border/60 bg-card/30 backdrop-blur-sm",
    "gap-2 sm:gap-0",
    className
  )}>
    {children}
  </div>
);

// Preset Modal variants for common use cases
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm" variant="blur">
    <ModalHeader>
      <ModalTitle>{title}</ModalTitle>
      {description && <ModalDescription>{description}</ModalDescription>}
    </ModalHeader>
    <ModalFooter>
      <Button
        onClick={onClose}
        disabled={loading}
        variant="outline"
      >
        {cancelText}
      </Button>
      <Button
        onClick={onConfirm}
        disabled={loading}
        loading={loading}
        variant={variant === "destructive" ? "danger" : "primary"}
      >
        {confirmText}
      </Button>
    </ModalFooter>
  </Modal>
);

export default Modal;