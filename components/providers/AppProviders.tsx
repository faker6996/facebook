"use client";

import { ToastProvider } from "@/components/ui/Toast";
import { SignalRProvider } from "@/contexts/SignalRContext";
import { SignalRInit } from "./SignalRInit";
import GlobalVideoCallManager from "./GlobalVideoCallManager";

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
        {children}
      </SignalRProvider>
    </ToastProvider>
  );
};