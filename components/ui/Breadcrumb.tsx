import * as React from "react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { ChevronRight, Home, MoreHorizontal } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ComponentType<{ className?: string }> | string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "simple" | "slash" | "arrow" | "pill";
  maxItems?: number;
  showHome?: boolean;
  homeHref?: string;
  collapsible?: boolean;
}

const sizeStyles = {
  sm: {
    text: "text-xs",
    spacing: "space-x-0.5",
    padding: "px-1.5 py-0.5",
    icon: "h-3 w-3"
  },
  md: {
    text: "text-sm", 
    spacing: "space-x-1",
    padding: "px-2 py-1",
    icon: "h-4 w-4"
  },
  lg: {
    text: "text-base",
    spacing: "space-x-1.5", 
    padding: "px-3 py-1.5",
    icon: "h-5 w-5"
  }
};

const variantStyles = {
  default: "text-muted-foreground hover:text-foreground",
  simple: "text-muted-foreground hover:text-foreground underline-offset-4 hover:underline",
  slash: "text-muted-foreground hover:text-foreground",
  arrow: "text-muted-foreground hover:text-foreground",
  pill: "text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  separator = ChevronRight,
  size = "md",
  variant = "default",
  maxItems = 5,
  showHome = false,
  homeHref = "/",
  collapsible = true
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  React.useEffect(() => {
    if (collapsible && items.length > maxItems) {
      setIsCollapsed(true);
    }
  }, [items.length, maxItems, collapsible]);

  const getSeparator = () => {
    if (typeof separator === 'string') {
      return <span className="text-muted-foreground">{separator}</span>;
    }
    
    if (variant === "slash") {
      return <span className="text-muted-foreground">/</span>;
    }
    
    if (variant === "arrow") {
      return <span className="text-muted-foreground">→</span>;
    }
    
    const SeparatorComponent = separator;
    return <SeparatorComponent className={cn("text-muted-foreground", sizeStyles[size].icon)} />;
  };

  const processedItems = React.useMemo(() => {
    let finalItems = [...items];
    
    if (showHome && finalItems[0]?.href !== homeHref) {
      finalItems.unshift({
        label: "Home",
        href: homeHref,
        icon: Home
      });
    }

    if (isCollapsed && finalItems.length > maxItems) {
      const firstItems = finalItems.slice(0, 1);
      const lastItems = finalItems.slice(-(maxItems - 2));
      finalItems = [...firstItems, { label: "...", disabled: true }, ...lastItems];
    }

    return finalItems;
  }, [items, showHome, homeHref, isCollapsed, maxItems]);

  const handleCollapseToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <nav 
      className={cn("flex w-full items-center", sizeStyles[size].text, className)} 
      aria-label="Breadcrumb navigation"
    >
      <ol className={cn("flex items-center", sizeStyles[size].spacing)}>
        {processedItems.map((item, index) => {
          const isLast = index === processedItems.length - 1;
          const isCollapsedIndicator = item.label === "...";
          const Icon = item.icon;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {isCollapsedIndicator ? (
                <button
                  onClick={handleCollapseToggle}
                  className={cn(
                    "inline-flex items-center gap-1 transition-all duration-200",
                    "hover:bg-accent rounded-md",
                    sizeStyles[size].padding,
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  )}
                  aria-label="Show all breadcrumb items"
                >
                  <MoreHorizontal className={sizeStyles[size].icon} />
                </button>
              ) : item.href && !isLast && !item.disabled ? (
                <Link 
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1 font-medium transition-all duration-200",
                    variantStyles[variant],
                    variant === "pill" && sizeStyles[size].padding,
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded-sm"
                  )}
                >
                  {Icon && <Icon className={sizeStyles[size].icon} />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span 
                  className={cn(
                    "inline-flex items-center gap-1 font-medium",
                    isLast 
                      ? "text-foreground" 
                      : item.disabled 
                        ? "text-muted-foreground/60 cursor-not-allowed"
                        : "text-muted-foreground",
                    variant === "pill" && !isLast && sizeStyles[size].padding
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {Icon && <Icon className={sizeStyles[size].icon} />}
                  <span>{item.label}</span>
                </span>
              )}

              {!isLast && (
                <span 
                  className={cn("mx-1", sizeStyles[size].spacing)} 
                  role="presentation"
                  aria-hidden="true"
                >
                  {getSeparator()}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Specialized Breadcrumb components
interface SimpleBreadcrumbProps {
  items: string[];
  baseHref?: string;
  className?: string;
}

export const SimpleBreadcrumb: React.FC<SimpleBreadcrumbProps> = ({
  items,
  baseHref = "",
  className
}) => {
  const breadcrumbItems = items.map((item, index) => ({
    label: item,
    href: index < items.length - 1 ? `${baseHref}/${item.toLowerCase()}` : undefined
  }));

  return (
    <Breadcrumb 
      items={breadcrumbItems}
      variant="simple"
      className={className}
    />
  );
};

interface IconBreadcrumbProps extends Omit<BreadcrumbProps, 'items'> {
  items: Array<{
    label: string;
    href?: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

export const IconBreadcrumb: React.FC<IconBreadcrumbProps> = ({
  items,
  ...props
}) => {
  return <Breadcrumb items={items} {...props} />;
};

interface CompactBreadcrumbProps extends BreadcrumbProps {
  alwaysShowFirst?: boolean;
  alwaysShowLast?: boolean;
}

export const CompactBreadcrumb: React.FC<CompactBreadcrumbProps> = ({
  alwaysShowFirst = true,
  alwaysShowLast = true,
  maxItems = 3,
  ...props
}) => {
  return (
    <Breadcrumb 
      {...props}
      maxItems={maxItems}
      collapsible={true}
      size="sm"
      variant="pill"
    />
  );
};

export default Breadcrumb;
