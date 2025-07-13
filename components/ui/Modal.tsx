"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeClasses = {
  sm: "w-full h-full md:w-auto md:h-auto md:max-w-sm md:mx-4",
  md: "w-full h-full md:w-auto md:h-auto md:max-w-md md:mx-4", 
  lg: "w-full h-full md:w-auto md:h-auto md:max-w-lg md:mx-4",
  xl: "w-full h-full md:w-auto md:h-auto md:max-w-xl md:mx-4",
  full: "w-full h-full md:max-w-full md:mx-4"
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true
}) => {
  useEffect(() => {
    if (!closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-background/80 backdrop-blur-sm transition-all duration-300",
          "bg-black/20 dark:bg-black/40"
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div
        className={cn(
          "relative rounded-none md:rounded-xl border-0 md:border bg-card text-card-foreground shadow-lg transition-all duration-300 ease-soft",
          "backdrop-blur-sm bg-white/95 dark:bg-neutral-900/95",
          "border-gray-200/60 dark:border-gray-800/60",
          "animate-in fade-in-0 zoom-in-95 duration-300",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
            {title && (
              <h2 className="text-lg md:text-xl font-semibold leading-none tracking-tight">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  "rounded-md p-2 md:p-1.5 hover:bg-accent hover:text-accent-foreground",
                  "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "min-h-11 min-w-11 md:min-h-auto md:min-w-auto" // Touch-friendly on mobile
                )}
                aria-label="Close modal"
              >
                <X className="h-5 w-5 md:h-4 md:w-4" />
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="p-4 md:p-6 overflow-auto max-h-[calc(100vh-8rem)] md:max-h-none">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;