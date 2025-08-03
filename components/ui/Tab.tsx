"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface Tab {
  label: string;
  value: string;
  content: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  className?: string;
  variant?: "default" | "pills" | "underline" | "card";
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
  onTabChange?: (value: string) => void;
}

const sizeStyles = {
  sm: {
    tab: "py-1.5 px-3 text-xs",
    content: "mt-3 p-3",
  },
  md: {
    tab: "py-2 px-4 text-sm",
    content: "mt-4 p-4",
  },
  lg: {
    tab: "py-3 px-6 text-base",
    content: "mt-6 p-6",
  },
};

const variantStyles = {
  default: {
    container: "border-b border-border",
    tab: "border-b-2 border-transparent hover:border-border/60",
    activeTab: "border-primary text-primary",
    inactiveTab: "text-muted-foreground hover:text-foreground",
  },
  pills: {
    container: "bg-muted p-1 rounded-lg",
    tab: "rounded-md transition-all duration-200",
    activeTab: "bg-background text-foreground shadow-sm",
    inactiveTab: "text-muted-foreground hover:text-foreground hover:bg-background/50",
  },
  underline: {
    container: "relative",
    tab: "relative transition-colors duration-200",
    activeTab: "text-primary",
    inactiveTab: "text-muted-foreground hover:text-foreground",
  },
  card: {
    container: "space-y-1",
    tab: "rounded-lg border border-transparent transition-all duration-200",
    activeTab: "bg-primary text-primary-foreground border-primary shadow-sm",
    inactiveTab: "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:border-border",
  },
};

export const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  defaultValue, 
  className,
  variant = "default",
  size = "md",
  orientation = "horizontal",
  onTabChange 
}) => {
  const [active, setActive] = React.useState<string>(defaultValue || tabs[0]?.value);
  const [underlineStyle, setUnderlineStyle] = React.useState<React.CSSProperties>({});
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabChange = (value: string) => {
    setActive(value);
    onTabChange?.(value);
  };

  // Update underline position for underline variant
  React.useEffect(() => {
    if (variant === "underline" && orientation === "horizontal") {
      const activeIndex = tabs.findIndex(tab => tab.value === active);
      const activeTab = tabRefs.current[activeIndex];
      
      if (activeTab) {
        const { offsetLeft, offsetWidth } = activeTab;
        setUnderlineStyle({
          left: offsetLeft,
          width: offsetWidth,
        });
      }
    }
  }, [active, variant, orientation, tabs]);

  const containerClasses = cn(
    "w-full",
    orientation === "horizontal" ? "flex space-x-1" : "flex flex-col space-y-1",
    variantStyles[variant].container,
    className
  );

  const activeTab = tabs.find((tab) => tab.value === active);

  return (
    <div className={cn("w-full", orientation === "vertical" && "flex gap-6")}>
      {/* Tab List */}
      <div className={containerClasses}>
        {tabs.map((tab, index) => {
          const isActive = active === tab.value;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.value}
              ref={(el) => { tabRefs.current[index] = el; }}
              onClick={() => !tab.disabled && handleTabChange(tab.value)}
              disabled={tab.disabled}
              className={cn(
                "font-medium transition-all duration-200 cursor-pointer flex items-center gap-2",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded-md",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                sizeStyles[size].tab,
                variantStyles[variant].tab,
                isActive 
                  ? variantStyles[variant].activeTab 
                  : variantStyles[variant].inactiveTab,
                orientation === "vertical" && "justify-start w-full"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.label}
            </button>
          );
        })}
        
        {/* Underline indicator for underline variant */}
        {variant === "underline" && orientation === "horizontal" && (
          <div 
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
            style={underlineStyle}
          />
        )}
      </div>

      {/* Tab Content */}
      <div className={cn(
        "bg-card rounded-lg border border-border shadow-sm text-card-foreground transition-all duration-200",
        sizeStyles[size].content,
        orientation === "vertical" && "flex-1"
      )}>
        {activeTab?.content}
      </div>
    </div>
  );
};

// Additional Tab components for specific use cases
interface SimpleTabsProps {
  tabs: Array<{
    label: string;
    value: string;
    content: React.ReactNode;
  }>;
  defaultValue?: string;
  className?: string;
}

export const SimpleTabs: React.FC<SimpleTabsProps> = ({ tabs, defaultValue, className }) => {
  return (
    <Tabs 
      tabs={tabs} 
      defaultValue={defaultValue} 
      className={className}
      variant="default"
      size="sm"
    />
  );
};

interface PillTabsProps extends TabsProps {
  contained?: boolean;
}

export const PillTabs: React.FC<PillTabsProps> = ({ contained = true, ...props }) => {
  return (
    <Tabs 
      {...props}
      variant="pills"
      className={cn(contained && "max-w-fit", props.className)}
    />
  );
};

interface VerticalTabsProps extends TabsProps {
  sidebarWidth?: string;
}

export const VerticalTabs: React.FC<VerticalTabsProps> = ({ 
  sidebarWidth = "w-48", 
  className,
  ...props 
}) => {
  return (
    <div className={cn("flex gap-6", className)}>
      <div className={cn(sidebarWidth, "flex-shrink-0")}>
        <Tabs 
          {...props}
          orientation="vertical"
          variant="card"
          className="w-full"
        />
      </div>
    </div>
  );
};
