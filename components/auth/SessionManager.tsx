/**
 * Session Manager Component
 * Displays active sessions and allows user to manage them
 */

'use client';

import React, { useState, useEffect } from 'react';
import { callApi } from '@/lib/utils/api-client';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

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

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionManager({ isOpen, onClose }: SessionManagerProps) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await callApi<{
        sessions: SessionInfo[];
        totalSessions: number;
      }>('/api/auth/sessions', 'GET');

      if (response.sessions) {
        // Mark current session (usually the most recent one with matching IP)
        const sessionsWithCurrentFlag = response.sessions.map((session, index) => ({
          ...session,
          isCurrentSession: index === 0 // Simplify: first session is current
        }));
        
        setSessions(sessionsWithCurrentFlag);
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error Loading Sessions',
        message: error.message || 'Failed to load session information',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const logoutOtherSessions = async () => {
    setActionLoading('others');
    try {
      await callApi('/api/auth/sessions?action=others', 'DELETE');
      
      addToast({
        type: 'success',
        title: 'Sessions Closed',
        message: 'All other sessions have been closed successfully.',
        duration: 4000
      });

      await loadSessions();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to close other sessions',
        duration: 5000
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceIcon = (deviceInfo: any) => {
    if (!deviceInfo) return '🖥️';
    if (deviceInfo.isMobile) return '📱';
    return '🖥️';
  };

  const getBrowserName = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const getTimeLeft = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Active Sessions">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Manage your active login sessions across different devices
          </p>
          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={logoutOtherSessions}
              disabled={actionLoading === 'others'}
            >
              {actionLoading === 'others' ? 'Closing...' : 'Close Other Sessions'}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading sessions...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sessions.length === 0 ? (
              <Card className="p-4 text-center text-gray-500">
                No active sessions found
              </Card>
            ) : (
              sessions.map((session) => (
                <Card key={session.sessionId} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">
                        {getDeviceIcon(session.deviceInfo)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">
                            {getBrowserName(session.userAgent)}
                          </h3>
                          {session.isCurrentSession && (
                            <Badge variant="success" size="sm">
                              Current Session
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1 mt-1">
                          <p>IP: {session.ipAddress}</p>
                          <p>Login: {formatDate(session.createdAt)}</p>
                          <p>Last Activity: {formatDate(session.lastActivity)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Expires in: {getTimeLeft(session.expiresAt)}
                      </div>
                      {session.deviceInfo?.isMobile && (
                        <Badge variant="info" size="sm" className="mt-1">
                          Mobile
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Only one session is allowed per account for security</p>
            <p>• Logging in from a new device will close other sessions</p>
            <p>• Sessions are automatically extended with activity</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={loadSessions} disabled={loading}>
            Refresh
          </Button>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}