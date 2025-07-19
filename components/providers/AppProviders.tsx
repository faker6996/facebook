"use client";

import { ToastProvider } from "@/components/ui/Toast";
import { SignalRProvider } from "@/contexts/SignalRContext";
import { SignalRInit } from "./SignalRInit";
import GlobalVideoCallManager from "./GlobalVideoCallManager";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { GlobalLoading } from "@/components/ui/GlobalLoading";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Tổng hợp tất cả providers cho app
 * Bao gồm Toast, SignalR và auto-initialization
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <LoadingProvider>
      <ToastProvider position="top-right" maxToasts={5}>
        <SignalRProvider>
          <SignalRInit />
          <GlobalVideoCallManager />
          <GlobalLoading />
          {children}
        </SignalRProvider>
      </ToastProvider>
    </LoadingProvider>
  );
};