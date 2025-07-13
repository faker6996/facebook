// components/ui/Card.tsx
import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const Card = ({ 
  title, 
  description, 
  children, 
  footer, 
  className, 
  hoverable = false,
  clickable = false,
  onClick 
}: CardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        "rounded-lg md:rounded-xl border bg-card text-card-foreground transition-all duration-300 ease-soft",
        "shadow-sm hover:shadow-lg mx-2 md:mx-0",
        hoverable && "md:hover:-translate-y-1 hover:shadow-xl hover:border-primary/20",
        clickable && "cursor-pointer active:scale-[0.98] md:hover:bg-accent/5",
        "backdrop-blur-sm border-border",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-xl">
        {(hoverable || clickable) && (
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          />
        )}
        
        {(title || description) && (
          <div className="relative flex flex-col space-y-2 p-4 md:p-6">
            {title && (
              <h3 className={cn(
                "text-base md:text-lg font-semibold leading-none tracking-tight transition-colors duration-200",
                isHovered && hoverable && "text-primary"
              )}>
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        
        {children && (
          <div className="relative p-4 md:p-6 pt-0">
            {children}
          </div>
        )}
        
        {footer && (
          <div className="relative flex items-center p-4 md:p-6 pt-0 border-t border-border mt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
