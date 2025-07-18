import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void; // 👈 thêm onClick rõ ràng
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-lg",
};

export const Avatar = ({ src, alt = "avatar", fallback = "?", size = "md", className, onClick, ...props }: AvatarProps) => {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(!!src);
  const [imageError, setImageError] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (src) {
      setIsLoading(true);
      setImageError(false);
      setLoaded(false);
    }
  }, [src]);

  const handleImageLoad = () => {
    setLoaded(true);
    setIsLoading(false);
  };

  const handleImageError = () => {
    setLoaded(false);
    setIsLoading(false);
    setImageError(true);
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted text-foreground select-none transition-all duration-200 ease-soft",
        onClick && "cursor-pointer hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:shadow-lg active:scale-95",
        sizeClasses[size],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {/* Skeleton loading animation */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded-full" />
      )}
      
      {/* Shimmer effect during loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-full" />
      )}

      {src && !imageError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={cn(
            "absolute inset-0 h-full w-full object-cover rounded-full transition-all duration-300",
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
          )}
        />
      )}
      
      {/* Fallback text with better styling */}
      {(!src || imageError || !loaded) && !isLoading && (
        <span className={cn(
          "font-bold uppercase bg-gradient-to-br from-primary to-primary/80 bg-clip-text text-transparent",
          "transition-all duration-200 animate-fade-in"
        )}>
          {fallback}
        </span>
      )}
      
      {/* Online indicator (optional) */}
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
};

export default Avatar;
