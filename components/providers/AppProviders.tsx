"use client";

import { ToastProvider } from "@/components/ui/Toast";
import { SignalRProvider } from "@/contexts/SignalRContext";
import { SignalRInit } from "./SignalRInit";
import GlobalVideoCallManager from "./GlobalVideoCallManager";
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
    <ToastProvider position="top-right" maxToasts={5}>
      <SignalRProvider>
        <SignalRInit />
        <GlobalVideoCallManager />
        {/* Global Loading - tự động lắng nghe loading.show() / loading.hide() */}
        <GlobalLoading />
        {children}
      </SignalRProvider>
    </ToastProvider>
  );
};