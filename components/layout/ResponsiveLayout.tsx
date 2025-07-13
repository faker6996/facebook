"use client";

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useResponsive, RESPONSIVE_CLASSES } from '@/lib/utils/responsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'tight' | 'wide';
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
  rightSidebarContent?: React.ReactNode;
}

/**
 * ResponsiveLayout Component
 * 
 * Provides responsive layout patterns:
 * - Mobile: Single column, full width
 * - Tablet: Two column with collapsible sidebar
 * - Desktop: Multi-column with persistent sidebars
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  variant = 'default',
  showSidebar = false,
  sidebarContent,
  rightSidebarContent
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Mobile layout: Single column
  if (isMobile) {
    return (
      <div className={cn(
        "w-full min-h-screen bg-background",
        "flex flex-col",
        className
      )}>
        {/* Mobile sidebar drawer would go here if needed */}
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    );
  }

  // Tablet layout: Two column with collapsible sidebar
  if (isTablet) {
    return (
      <div className={cn(
        RESPONSIVE_CLASSES.container[variant],
        "min-h-screen bg-background",
        "grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6",
        className
      )}>
        {showSidebar && sidebarContent && (
          <aside className="md:col-span-1 order-2 md:order-1">
            <div className="sticky top-4">
              {sidebarContent}
            </div>
          </aside>
        )}
        
        <main className={cn(
          "order-1 md:order-2",
          showSidebar ? "md:col-span-3" : "md:col-span-4"
        )}>
          {children}
        </main>
      </div>
    );
  }

  // Desktop layout: Multi-column with both sidebars
  if (isDesktop) {
    const hasLeftSidebar = showSidebar && sidebarContent;
    const hasRightSidebar = rightSidebarContent;
    
    let gridCols = "lg:grid-cols-4";
    let mainSpan = "lg:col-span-4";
    
    if (hasLeftSidebar && hasRightSidebar) {
      gridCols = "lg:grid-cols-6";
      mainSpan = "lg:col-span-4";
    } else if (hasLeftSidebar || hasRightSidebar) {
      gridCols = "lg:grid-cols-4";
      mainSpan = "lg:col-span-3";
    }

    return (
      <div className={cn(
        RESPONSIVE_CLASSES.container[variant],
        "min-h-screen bg-background",
        "grid grid-cols-1 md:grid-cols-4",
        gridCols,
        "gap-4 md:gap-6 lg:gap-8",
        className
      )}>
        {hasLeftSidebar && (
          <aside className="order-2 md:order-1 lg:col-span-1">
            <div className="sticky top-4">
              {sidebarContent}
            </div>
          </aside>
        )}
        
        <main className={cn(
          "order-1 md:order-2",
          hasLeftSidebar ? "md:col-span-3" : "md:col-span-4",
          mainSpan
        )}>
          {children}
        </main>
        
        {hasRightSidebar && (
          <aside className="order-3 lg:col-span-1 hidden lg:block">
            <div className="sticky top-4">
              {rightSidebarContent}
            </div>
          </aside>
        )}
      </div>
    );
  }

  // Fallback
  return (
    <div className={cn(RESPONSIVE_CLASSES.container[variant], className)}>
      {children}
    </div>
  );
};

/**
 * ResponsiveGrid Component
 * 
 * Auto-responsive grid for cards, posts, etc.
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'auto' | 'cards' | 'posts';
  gap?: 'sm' | 'md' | 'lg';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  variant = 'auto',
  gap = 'md'
}) => {
  const gapClasses = {
    sm: 'gap-2 md:gap-3 lg:gap-4',
    md: 'gap-4 md:gap-6 lg:gap-8', 
    lg: 'gap-6 md:gap-8 lg:gap-10'
  };

  return (
    <div className={cn(
      "grid",
      RESPONSIVE_CLASSES.grid[variant],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

/**
 * ResponsiveContainer Component
 * 
 * Simple responsive container with max-width constraints
 */
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'tight' | 'wide' | 'full';
  padding?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  size = 'default',
  padding = true
}) => {
  const sizeClasses = {
    full: 'w-full',
    tight: RESPONSIVE_CLASSES.container.tight,
    default: RESPONSIVE_CLASSES.container.default,
    wide: RESPONSIVE_CLASSES.container.wide,
  };

  return (
    <div className={cn(
      sizeClasses[size],
      padding && RESPONSIVE_CLASSES.spacing.component,
      className
    )}>
      {children}
    </div>
  );
};

/**
 * ResponsiveText Component
 * 
 * Text that scales appropriately across devices
 */
interface ResponsiveTextProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  variant?: 'heading' | 'subheading' | 'body' | 'caption' | 'responsive';
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  as: Component = 'p',
  variant = 'responsive',
  className
}) => {
  return (
    <Component className={cn(
      RESPONSIVE_CLASSES.text[variant],
      className
    )}>
      {children}
    </Component>
  );
};

/**
 * MobileOnly Component
 * 
 * Only renders children on mobile devices
 */
export const MobileOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isMobile, isHydrated } = useResponsive();
  if (!isHydrated) return null;
  return isMobile ? <>{children}</> : null;
};

/**
 * TabletOnly Component
 * 
 * Only renders children on tablet devices
 */
export const TabletOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isTablet, isHydrated } = useResponsive();
  if (!isHydrated) return null;
  return isTablet ? <>{children}</> : null;
};

/**
 * DesktopOnly Component
 * 
 * Only renders children on desktop devices
 */
export const DesktopOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDesktop, isHydrated } = useResponsive();
  if (!isHydrated) return null;
  return isDesktop ? <>{children}</> : null;
};

/**
 * MobileDesktopOnly Component
 * 
 * Only renders children on mobile or desktop (skips tablet)
 */
export const MobileDesktopOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isMobile, isDesktop } = useResponsive();
  return (isMobile || isDesktop) ? <>{children}</> : null;
};

export default ResponsiveLayout;