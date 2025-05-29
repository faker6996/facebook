// components/ui/Card.tsx
import React from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const Card = ({ title, description, children, footer, className }: CardProps) => {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)}>
      {(title || description) && (
        <div className="flex flex-col space-y-1.5 p-6">
          {title && <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children && <div className="p-6 pt-0">{children}</div>}
      {footer && <div className="flex items-center p-6 pt-0">{footer}</div>}
    </div>
  );
};

export default Card;
