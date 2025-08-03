"use client";

import { usePathname } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import { SignalRProvider } from "@/contexts/SignalRContext";
import { SignalRInit } from "./SignalRInit";
import GlobalVideoCallManager from "./GlobalVideoCallManager";
import { GlobalLoading } from "@/components/ui/GlobalLoading";
import { GlobalGroupVideoCallManager } from "./GlobalGroupVideoCallManager";
import { SessionGuardProvider } from "./SessionGuardProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Tổng hợp tất cả providers cho app
 * Bao gồm Toast, SignalR và auto-initialization
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Check if we're on a public page that doesn't need auth-related providers
  const isPublicPage = pathname?.includes('/login') || 
                      pathname?.includes('/register') || 
                      pathname?.includes('/forgot-password') || 
                      pathname?.includes('/reset-password');

  return (
    <ToastProvider position="top-right" maxToasts={5}>
      <SignalRProvider>
        {isPublicPage ? (
          // Public pages: Only basic providers, NO auth-related components
          <>
            <GlobalLoading />
            {children}
          </>
        ) : (
          // Private pages: Full providers with auth components
          <SessionGuardProvider>
            <SignalRInit />
            <GlobalVideoCallManager />
            <GlobalGroupVideoCallManager />
            <GlobalLoading />
            {children}
          </SessionGuardProvider>
        )}
      </SignalRProvider>
    </ToastProvider>
  );
};