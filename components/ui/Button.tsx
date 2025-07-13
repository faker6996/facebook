import React from "react";
import { VARIANT_STYLES_BTN, SIZE_STYLES_BTN } from "@/lib/constants/constants-ui/button";
import { cn } from "@/lib/utils/cn";

// Khai báo kiểu cho props
interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  icon?: React.ComponentType<{ className?: string }>;
  iconRight?: React.ComponentType<{ className?: string }>;
  variant?: keyof typeof VARIANT_STYLES_BTN;
  size?: keyof typeof SIZE_STYLES_BTN;
  className?: string;
  iConClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

// Sử dụng kiểu trong component
const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  type = "button",
  icon: Icon,
  iconRight: IconRight,
  variant = "default",
  size = "md",
  className = "",
  iConClassName = "",
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const baseStyles =
    "relative inline-flex items-center justify-center gap-2 rounded-md font-medium overflow-hidden transition-all duration-200 ease-soft focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 active:scale-[0.98] transform-gpu";

  const variantStyle = VARIANT_STYLES_BTN[variant] || VARIANT_STYLES_BTN.default;
  const sizeStyle = SIZE_STYLES_BTN[size] || SIZE_STYLES_BTN.md;

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        baseStyles,
        variantStyle,
        sizeStyle,
        "group",
        {
          "cursor-pointer hover:shadow-lg hover:-translate-y-0.5": !disabled && !loading,
          "opacity-50 cursor-not-allowed transform-none": disabled || loading,
          "w-full": fullWidth,
        },
        className
      )}
      disabled={disabled || loading}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      {loading ? (
        <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        Icon && <Icon className={cn("transition-transform duration-200", iConClassName ? iConClassName : "w-5 h-5")} />
      )}
      {!loading && children}
      {!loading && IconRight && <IconRight className="w-4 h-4 transition-transform duration-200" />}
    </button>
  );
};

export default Button;
