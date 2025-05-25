import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-lg",
};

export const Avatar = ({ src, alt = "avatar", fallback = "?", size = "md", className, ...props }: AvatarProps) => {
  const [loaded, setLoaded] = React.useState<boolean>(false);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted text-foreground select-none",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover rounded-full transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
      {!loaded && <span className="font-semibold uppercase">{fallback}</span>}
    </div>
  );
};

export default Avatar;
