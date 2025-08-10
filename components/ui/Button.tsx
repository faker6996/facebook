import React, { forwardRef } from "react";
import { VARIANT_STYLES_BTN, SIZE_STYLES_BTN } from "@/lib/constants/constants-ui/button";
import { cn } from "@/lib/utils/cn";
import { Activity } from "lucide-react";

// Khai báo kiểu cho props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
  title?: string;
}

// Sử dụng forwardRef để chuyển tiếp ref
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
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
      title,
      ...rest
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center gap-2 rounded-md font-medium overflow-hidden transition-all duration-200 ease-soft focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 active:scale-[0.98] transform-gpu";

    const variantStyle = VARIANT_STYLES_BTN[variant] || VARIANT_STYLES_BTN.default;
    const sizeStyle = SIZE_STYLES_BTN[size] || SIZE_STYLES_BTN.md;

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        title={title}
        className={cn(
          baseStyles,
          variantStyle,
          sizeStyle,
          "group",
          {
            "cursor-pointer transform translate-y-0 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200": !disabled && !loading,
            "opacity-50 cursor-not-allowed": disabled || loading,
            "w-full": fullWidth,
          },
          className
        )}
        disabled={disabled || loading}
        {...rest}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-primary-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        {loading ? (
          <Activity className="w-4 h-4 animate-spin" />
        ) : (
          Icon && <Icon className={cn("transition-transform duration-200", iConClassName ? iConClassName : "w-5 h-5")} />
        )}
        {!loading && children}
        {!loading && IconRight && <IconRight className="w-4 h-4 transition-transform duration-200" />}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
