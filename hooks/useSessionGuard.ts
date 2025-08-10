/**
 * Session Guard Hook
 * Monitors session validity and handles session conflicts
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { callApi } from '@/lib/utils/api-client';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

interface SessionInfo {
  sessionId: number;
  deviceInfo: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isCurrentSession: boolean;
}

interface UseSessionGuardOptions {
  checkInterval?: number; // in milliseconds, default 5 minutes
  warningThreshold?: number; // minutes before expiry to show warning, default 10
  autoExtend?: boolean; // auto extend session on activity, default true
  onSessionExpired?: () => void;
  onSessionConflict?: (sessions: SessionInfo[]) => void;
}

export function useSessionGuard(options: UseSessionGuardOptions = {}) {
  const {
    checkInterval = 5 * 60 * 1000, // 5 minutes
    warningThreshold = 10,
    autoExtend = true,
    onSessionExpired,
    onSessionConflict
  } = options;

  const [isValid, setIsValid] = useState(true);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [isNearExpiry, setIsNearExpiry] = useState(false);
  const [lastValidationTime, setLastValidationTime] = useState<number>(Date.now());
  
  const { addToast } = useToast();
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Check if we have a token
  const hasToken = useCallback(() => {
    if (typeof document !== 'undefined') {
      return document.cookie.includes('access_token=');
    }
    return false;
  }, []);

  // Check session validity
  const checkSession = useCallback(async () => {
    // Don't check session if no token exists
    if (!hasToken()) {
      setIsValid(false);
      setSessionsCount(0);
      setExpiresAt(null);
      setIsNearExpiry(false);
      return;
    }

    try {
      const response = await callApi<{
        sessions: SessionInfo[];
        totalSessions: number;
      }>('/api/auth/sessions', 'GET', null, { silent: true });

      if (response.sessions) {
        const currentSession = response.sessions[0]; // First session is usually current
        setSessionsCount(response.totalSessions);
        
        if (currentSession?.expiresAt) {
          const expiryDate = new Date(currentSession.expiresAt);
          setExpiresAt(expiryDate);
          
          const minutesLeft = (expiryDate.getTime() - Date.now()) / (1000 * 60);
          setIsNearExpiry(minutesLeft <= warningThreshold);
          
          // Show warning if near expiry (only once when it first goes below threshold)
          if (minutesLeft <= warningThreshold && minutesLeft > 0 && !isNearExpiry) {
            addToast({
              type: 'warning',
              title: 'Session Expiring',
              message: `Your session will expire in ${Math.round(minutesLeft)} minutes. Activity will extend it automatically.`,
              duration: 5000
            });
          }
        }

        // Check for multiple sessions (potential conflict)
        if (response.totalSessions > 1) {
          onSessionConflict?.(response.sessions);
        }

        setIsValid(true);
        setLastValidationTime(Date.now());
      }
    } catch (error: any) {
      // Session invalid or expired
      if (error?.response?.status === 401 || (error.message && error.message.includes('hết hạn'))) {
        setIsValid(false);
        onSessionExpired?.();
        
        // Clear cookie immediately
        if (typeof document !== 'undefined') {
          document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        
        addToast({
          type: 'error',
          title: 'Phiên đăng nhập hết hạn',
          message: 'Tài khoản này đã được đăng nhập từ thiết bị khác. Bạn sẽ được chuyển về trang đăng nhập.',
          duration: 0 // Persistent until manually closed
        });

        // Redirect to login immediately
        setTimeout(() => {
          router.push('/login?reason=session_invalidated');
        }, 2000);
      }
    }
  }, [warningThreshold, onSessionExpired, onSessionConflict, addToast, router, hasToken]);

  // Extend session
  const extendSession = useCallback(async () => {
    try {
      await callApi('/api/auth/sessions/extend', 'POST', null, { silent: true });
      
      // Update last activity
      lastActivityRef.current = Date.now();
      
      // Refresh session info
      await checkSession();
    } catch (error) {
      console.error('❌ Failed to extend session:', error);
    }
  }, [checkSession]);

  // Track user activity
  const trackActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // If it's been more than 1 minute since last activity, consider extending
    if (timeSinceLastActivity > 60 * 1000 && autoExtend) {
      lastActivityRef.current = now;
      
      // Only extend if we're within warning threshold
      if (isNearExpiry) {
        extendSession();
      }
    }
  }, [autoExtend, isNearExpiry, extendSession]);

  // Logout from all other sessions
  const logoutOtherSessions = useCallback(async () => {
    try {
      await callApi('/api/auth/sessions?action=others', 'DELETE');
      
      addToast({
        type: 'success',
        title: 'Sessions Closed',
        message: 'All other sessions have been closed successfully.',
        duration: 4000
      });

      // Refresh session info
      await checkSession();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to close other sessions. Please try again.',
        duration: 5000
      });
    }
  }, [addToast, checkSession]);

  // Setup session monitoring
  useEffect(() => {
    // Initial check
    checkSession();

    // Setup periodic checks
    intervalRef.current = setInterval(checkSession, checkInterval);

    // Setup activity tracking
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
    };
  }, [checkSession, checkInterval, trackActivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isValid,
    expiresAt,
    sessionsCount,
    isNearExpiry,
    extendSession,
    logoutOtherSessions,
    checkSession
  };
}