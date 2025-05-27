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
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";

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
        {
          "cursor-pointer": !disabled && !loading, // chỉ khi có thể click
          "opacity-50 cursor-not-allowed": disabled || loading,
          "w-full": fullWidth,
        },
        className
      )}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        Icon && <Icon className={iConClassName ? iConClassName : "w-6 h-6"} />
      )}
      {!loading && children}
      {!loading && IconRight && <IconRight className="w-5 h-5" />}
    </button>
  );
};

export default Button;
