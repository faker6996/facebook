/**
 * Session Guard Provider
 * Provides session monitoring and protection across the app
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { useToast } from '@/components/ui/Toast';

interface SessionGuardContextType {
  isValid: boolean;
  expiresAt: Date | null;
  sessionsCount: number;
  isNearExpiry: boolean;
  extendSession: () => Promise<void>;
  logoutOtherSessions: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const SessionGuardContext = createContext<SessionGuardContextType | undefined>(undefined);

export const useSessionGuardContext = () => {
  const context = useContext(SessionGuardContext);
  if (!context) {
    throw new Error('useSessionGuardContext must be used within SessionGuardProvider');
  }
  return context;
};

interface SessionGuardProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export function SessionGuardProvider({ children, enabled = true }: SessionGuardProviderProps) {
  const pathname = usePathname();
  const { addToast } = useToast();
  const [hasShownConflictWarning, setHasShownConflictWarning] = useState(false);

  // Don't run session guard on public pages
  const isPublicPage = pathname?.includes('/login') || 
                      pathname?.includes('/register') || 
                      pathname?.includes('/forgot-password') || 
                      pathname?.includes('/reset-password');

  const shouldRunGuard = enabled && !isPublicPage;

  const sessionGuard = useSessionGuard({
    checkInterval: 2 * 60 * 1000, // Check every 2 minutes (SignalR handles real-time invalidation)
    warningThreshold: 10, // Warn when 10 minutes left
    autoExtend: true,
    onSessionExpired: () => {
      // Handle session expiration
      addToast({
        type: 'error',
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again.',
        duration: 0
      });
    },
    onSessionConflict: (sessions) => {
      // Handle multiple sessions
      if (!hasShownConflictWarning && sessions.length > 1) {
        setHasShownConflictWarning(true);
        
        addToast({
          type: 'warning',
          title: 'Multiple Active Sessions',
          message: `You have ${sessions.length} active sessions. For security, only one session is allowed.`,
          duration: 8000
        });

        // Auto-close other sessions after a delay
        setTimeout(() => {
          sessionGuard.logoutOtherSessions();
        }, 5000);
      }
    }
  });

  // Reset conflict warning when sessions count changes
  useEffect(() => {
    if (sessionGuard.sessionsCount <= 1) {
      setHasShownConflictWarning(false);
    }
  }, [sessionGuard.sessionsCount]);

  // Don't render guard if disabled or on public pages
  if (!shouldRunGuard) {
    return <>{children}</>;
  }

  const contextValue: SessionGuardContextType = {
    isValid: sessionGuard.isValid,
    expiresAt: sessionGuard.expiresAt,
    sessionsCount: sessionGuard.sessionsCount,
    isNearExpiry: sessionGuard.isNearExpiry,
    extendSession: sessionGuard.extendSession,
    logoutOtherSessions: sessionGuard.logoutOtherSessions,
    checkSession: sessionGuard.checkSession
  };

  return (
    <SessionGuardContext.Provider value={contextValue}>
      {children}
      
      {/* Session Status Indicator */}
      {sessionGuard.isNearExpiry && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Session expires soon
              </span>
              <button
                onClick={sessionGuard.extendSession}
                className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded"
              >
                Extend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multiple Sessions Warning */}
      {sessionGuard.sessionsCount > 1 && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-2 rounded-lg shadow-lg max-w-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Multiple Sessions Detected</p>
                <p className="text-xs mt-1">
                  You have {sessionGuard.sessionsCount} active sessions. Other sessions will be closed automatically.
                </p>
                <button
                  onClick={sessionGuard.logoutOtherSessions}
                  className="text-xs bg-orange-200 hover:bg-orange-300 px-2 py-1 rounded mt-2"
                >
                  Close Others Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SessionGuardContext.Provider>
  );
}