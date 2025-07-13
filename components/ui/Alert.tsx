// components/ui/Alert.tsx
import { cn } from "@/lib/utils/cn";
import { ReactNode } from "react";
import { InfoIcon, WarningIcon, CheckCircleIcon, ErrorIcon } from "@/components/icons/AlertIcons";

import { VARIANT_STYLES_ALERT } from "@/lib/constants/constants-ui/alert";

type AlertVariant = "default" | "info" | "success" | "warning" | "error";

const variantIcons: Record<AlertVariant, ReactNode> = {
  default: <InfoIcon className="h-4 w-4 text-muted-foreground" />,
  info: <InfoIcon className="h-4 w-4 text-info" />,
  success: <CheckCircleIcon className="h-4 w-4 text-success" />,
  warning: <WarningIcon className="h-4 w-4 text-warning" />,
  error: <ErrorIcon className="h-4 w-4 text-destructive" />,
};

interface AlertProps {
  title?: string;
  description?: string;
  variant?: AlertVariant;
  className?: string;
}

const Alert = ({ title, description, variant = "default", className }: AlertProps) => {
  return (
    <div className={cn("w-full p-4 rounded-md flex items-start gap-3", VARIANT_STYLES_ALERT[variant], className)}>
      <div className="pt-1">{variantIcons[variant]}</div>
      <div>
        {title && <p className="font-semibold text-sm">{title}</p>}
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
};

export default Alert;
