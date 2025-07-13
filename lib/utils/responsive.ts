// lib/utils/responsive.ts
import { useState, useEffect } from 'react';

/**
 * Responsive breakpoints matching Tailwind CSS defaults
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Device categories for easier responsive logic
 */
export const DEVICE_TYPES = {
  mobile: { min: 0, max: BREAKPOINTS.md - 1 },
  tablet: { min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 },
  desktop: { min: BREAKPOINTS.lg, max: Infinity },
} as const;

/**
 * Hook to detect current device type and screen size
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
  });

  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Set hydrated flag to prevent hydration mismatch
    setIsHydrated(true);
    
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      // Determine device type
      if (width < BREAKPOINTS.md) {
        setDeviceType('mobile');
      } else if (width < BREAKPOINTS.lg) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    // Initial call
    updateSize();

    // Add event listener
    window.addEventListener('resize', updateSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return {
    screenSize,
    deviceType,
    isHydrated,
    isMobile: isHydrated && deviceType === 'mobile',
    isTablet: isHydrated && deviceType === 'tablet', 
    isDesktop: isHydrated && deviceType === 'desktop',
    // Breakpoint checks
    isSmUp: isHydrated && screenSize.width >= BREAKPOINTS.sm,
    isMdUp: isHydrated && screenSize.width >= BREAKPOINTS.md,
    isLgUp: isHydrated && screenSize.width >= BREAKPOINTS.lg,
    isXlUp: isHydrated && screenSize.width >= BREAKPOINTS.xl,
    is2xlUp: isHydrated && screenSize.width >= BREAKPOINTS['2xl'],
  };
};

/**
 * Hook to detect if device supports hover (non-touch devices)
 */
export const useHoverCapable = () => {
  const [canHover, setCanHover] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    // Check if device supports hover
    const mediaQuery = window.matchMedia('(hover: hover)');
    setCanHover(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setCanHover(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHydrated ? canHover : false;
};

/**
 * Responsive utility classes for common patterns
 */
export const RESPONSIVE_CLASSES = {
  // Container classes
  container: {
    default: "w-full max-w-sm mx-auto md:max-w-2xl lg:max-w-4xl xl:max-w-6xl",
    tight: "w-full max-w-xs mx-auto md:max-w-lg lg:max-w-2xl xl:max-w-4xl",
    wide: "w-full max-w-lg mx-auto md:max-w-4xl lg:max-w-6xl xl:max-w-7xl",
  },
  
  // Typography responsive classes
  text: {
    responsive: "text-sm md:text-base lg:text-lg",
    heading: "text-xl md:text-2xl lg:text-3xl xl:text-4xl",
    subheading: "text-lg md:text-xl lg:text-2xl",
    body: "text-sm md:text-base",
    caption: "text-xs md:text-sm",
  },
  
  // Spacing responsive classes
  spacing: {
    section: "py-8 md:py-12 lg:py-16",
    component: "p-4 md:p-6 lg:p-8",
    compact: "p-2 md:p-3 lg:p-4",
    gap: "gap-4 md:gap-6 lg:gap-8",
  },
  
  // Grid responsive classes
  grid: {
    auto: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    cards: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    posts: "grid-cols-1 md:grid-cols-2",
    sidebar: "grid-cols-1 lg:grid-cols-4", // 3 cols for main, 1 for sidebar
  },
  
  // Touch target classes
  touch: {
    button: "min-h-11 min-w-11 md:min-h-10 md:min-w-10",
    icon: "w-6 h-6 md:w-5 md:h-5",
    interactive: "p-3 md:p-2",
  },
} as const;

/**
 * Utility function to get responsive class based on device type
 */
export const getResponsiveClass = (
  mobile: string,
  tablet?: string,
  desktop?: string
) => {
  const classes = [mobile];
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  return classes.join(' ');
};

/**
 * Helper to conditionally apply styles based on screen size
 */
export const responsiveValue = <T>(
  values: {
    mobile: T;
    tablet?: T;
    desktop?: T;
  },
  currentDevice: 'mobile' | 'tablet' | 'desktop'
): T => {
  switch (currentDevice) {
    case 'desktop':
      return values.desktop ?? values.tablet ?? values.mobile;
    case 'tablet':
      return values.tablet ?? values.mobile;
    case 'mobile':
    default:
      return values.mobile;
  }
};

/**
 * Check if current screen size matches a breakpoint
 */
export const matchesBreakpoint = (
  breakpoint: keyof typeof BREAKPOINTS,
  width: number
): boolean => {
  return width >= BREAKPOINTS[breakpoint];
};

/**
 * Get current breakpoint based on screen width
 */
export const getCurrentBreakpoint = (
  width: number
): keyof typeof BREAKPOINTS | 'xs' => {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

/**
 * Responsive image sizes utility
 */
export const getResponsiveImageSizes = (
  breakpoints: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  } = {}
): string => {
  const {
    mobile = '100vw',
    tablet = '50vw',
    desktop = '33vw'
  } = breakpoints;

  return [
    `(max-width: ${BREAKPOINTS.md - 1}px) ${mobile}`,
    `(max-width: ${BREAKPOINTS.lg - 1}px) ${tablet}`,
    desktop
  ].join(', ');
};

/**
 * Export responsive CSS variables
 */
export const RESPONSIVE_CSS_VARS = `
  :root {
    --mobile-max: ${BREAKPOINTS.md - 1}px;
    --tablet-min: ${BREAKPOINTS.md}px;
    --tablet-max: ${BREAKPOINTS.lg - 1}px;
    --desktop-min: ${BREAKPOINTS.lg}px;
  }
` as const;