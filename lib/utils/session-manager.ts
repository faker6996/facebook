/**
 * Session Management Service
 * Handles single session per user functionality
 */

import { safeQuery } from "../modules/common/safe_query";
import { signJwt, verifyJwt, JwtPayload } from "./jwt";
import { ApiError } from "./error";

export interface SessionInfo {
  sessionId: number;
  userId: number;
  sessionToken: string;
  deviceInfo?: any;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface CreateSessionOptions {
  userId: number;
  deviceInfo?: any;
  ipAddress?: string;
  userAgent?: string;
  rememberMe?: boolean;
}

export interface SessionValidationResult {
  isValid: boolean;
  userId?: number;
  expiresAt?: Date;
  sessionInfo?: SessionInfo;
}

class SessionManager {
  /**
   * Tạo session mới và hủy tất cả sessions cũ của user
   */
  async createSingleSession(options: CreateSessionOptions): Promise<{
    sessionToken: string;
    sessionId: number;
    invalidatedCount: number;
  }> {
    const { userId, deviceInfo, ipAddress, userAgent, rememberMe = false } = options;

    // Generate JWT token
    const tokenExpiry = rememberMe ? "30d" : "2h";
    const expiresAt = new Date();
    if (rememberMe) {
      expiresAt.setDate(expiresAt.getDate() + 30);
    } else {
      expiresAt.setHours(expiresAt.getHours() + 2);
    }

    // Create session token with additional session metadata
    const sessionToken = signJwt(
      { 
        sub: userId.toString(),
        id: userId,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'session'
      }, 
      tokenExpiry
    );

    try {
      // Use stored procedure to create session and invalidate old ones
      const result = await safeQuery(
        `SELECT * FROM create_single_session($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          sessionToken,
          deviceInfo ? JSON.stringify(deviceInfo) : null,
          ipAddress,
          userAgent,
          expiresAt
        ]
      );

      if (!result?.rows?.[0]) {
        throw new ApiError("Failed to create session", 500);
      }

      const { session_id, invalidated_count } = result.rows[0];

      // Send SignalR notification if sessions were invalidated
      if (invalidated_count > 0) {
        console.log('🔔 Sessions invalidated during creation, sending notification');
        try {
          await this.notifySessionInvalidated(userId, 'new_login', 
            'Tài khoản này đã được đăng nhập từ thiết bị khác. Phiên làm việc hiện tại sẽ được đóng.');
          console.log('✅ Notification sent successfully');
        } catch (error) {
          console.error('❌ Failed to send session invalidation notification:', error);
          // Don't throw - session creation still succeeded
        }
      }

      return {
        sessionToken,
        sessionId: session_id,
        invalidatedCount: invalidated_count
      };
    } catch (error) {
      console.error("❌ Failed to create single session:", error);
      throw new ApiError("Session creation failed", 500);
    }
  }

  /**
   * Validate session token
   */
  async validateSession(sessionToken: string): Promise<SessionValidationResult> {
    if (!sessionToken) {
      console.log("❌ No session token provided");
      return { isValid: false };
    }

    try {
      // First verify JWT structure
      const jwtPayload = verifyJwt(sessionToken) as JwtPayload;
      if (!jwtPayload?.sub) {
        console.log("❌ Invalid JWT payload");
        return { isValid: false };
      }

      console.log("🔍 Validating session for user:", jwtPayload.sub);

      // Then check database session
      const result = await safeQuery(
        `SELECT * FROM validate_session($1)`,
        [sessionToken]
      );

      console.log("🔍 Database validation result:", result?.rows?.[0]);

      if (!result?.rows?.[0]) {
        console.log("❌ No session found in database");
        return { isValid: false };
      }

      const { user_id, is_valid, expires_at } = result.rows[0];

      console.log("🔍 Session validation:", { user_id, is_valid, expires_at });

      return {
        isValid: is_valid,
        userId: user_id,
        expiresAt: expires_at ? new Date(expires_at) : undefined
      };
    } catch (error) {
      console.error("❌ Session validation failed:", error);
      return { isValid: false };
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateUserSessions(userId: number, exceptSessionToken?: string): Promise<number> {
    try {
      const result = await safeQuery(
        `SELECT invalidate_user_sessions($1, $2)`,
        [userId, exceptSessionToken || null]
      );

      const invalidatedCount = result?.rows?.[0]?.invalidate_user_sessions || 0;
      
      // Send SignalR notification to invalidated sessions
      console.log('🔄 Checking if need to send notification:', { invalidatedCount });
      if (invalidatedCount > 0) {
        console.log('📢 About to call notifySessionInvalidated');
        try {
          await this.notifySessionInvalidated(userId, 'new_login', 
            'Tài khoản này đã được đăng nhập từ thiết bị khác. Phiên làm việc hiện tại sẽ được đóng.');
          console.log('📢 notifySessionInvalidated completed successfully');
        } catch (error) {
          console.error('❌ Failed to send session invalidation notification:', error);
          // Don't throw - invalidation still succeeded
        }
      } else {
        console.log('📢 No sessions to invalidate, skipping notification');
      }

      return invalidatedCount;
    } catch (error) {
      console.error("❌ Failed to invalidate user sessions:", error);
      throw new ApiError("Failed to invalidate sessions", 500);
    }
  }

  /**
   * Invalidate specific session
   */
  async invalidateSession(sessionToken: string): Promise<boolean> {
    try {
      const result = await safeQuery(
        `UPDATE user_sessions 
         SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
         WHERE session_token = $1 AND is_active = TRUE`,
        [sessionToken]
      );

      return (result?.rowCount || 0) > 0;
    } catch (error) {
      console.error("❌ Failed to invalidate session:", error);
      return false;
    }
  }

  /**
   * Extend session expiration
   */
  async extendSession(sessionToken: string, extendMinutes: number = 120): Promise<boolean> {
    try {
      const result = await safeQuery(
        `SELECT extend_session($1, $2)`,
        [sessionToken, extendMinutes]
      );

      return result?.rows?.[0]?.extend_session || false;
    } catch (error) {
      console.error("❌ Failed to extend session:", error);
      return false;
    }
  }

  /**
   * Get active sessions for user
   */
  async getUserActiveSessions(userId: number): Promise<SessionInfo[]> {
    try {
      const result = await safeQuery(
        `SELECT 
           id, user_id, session_token, device_info, ip_address, user_agent,
           is_active, created_at, updated_at, expires_at
         FROM user_sessions 
         WHERE user_id = $1 AND is_active = TRUE AND expires_at > CURRENT_TIMESTAMP
         ORDER BY updated_at DESC`,
        [userId]
      );

      return result?.rows?.map(row => ({
        sessionId: row.id,
        userId: row.user_id,
        sessionToken: row.session_token,
        deviceInfo: row.device_info,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        isActive: row.is_active,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        expiresAt: new Date(row.expires_at)
      })) || [];
    } catch (error) {
      console.error("❌ Failed to get user sessions:", error);
      return [];
    }
  }

  /**
   * Cleanup expired sessions (can be run periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await safeQuery(`SELECT cleanup_expired_sessions()`);
      return result?.rows?.[0]?.cleanup_expired_sessions || 0;
    } catch (error) {
      console.error("❌ Failed to cleanup expired sessions:", error);
      return 0;
    }
  }

  /**
   * Extract device info from request
   */
  extractDeviceInfo(request: Request): any {
    const userAgent = request.headers.get('user-agent') || '';
    
    // Simple device detection (you can use a library like 'ua-parser-js' for more detailed info)
    const deviceInfo = {
      userAgent,
      isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
      browser: this.detectBrowser(userAgent),
      timestamp: new Date().toISOString()
    };

    return deviceInfo;
  }

  private detectBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Get client IP from request
   */
  getClientIP(request: Request): string {
    // Try to get real IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    if (cfConnectingIP) {
      return cfConnectingIP;
    }
    
    return 'unknown';
  }

  /**
   * Notify chat server to send session invalidation to user
   */
  private async notifySessionInvalidated(userId: number, reason: string, message: string): Promise<void> {
    console.log('🔔 notifySessionInvalidated called:', { userId, reason, message });
    
    const chatServerUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL;
    console.log('🔗 Chat server URL:', chatServerUrl);
    
    if (!chatServerUrl) {
      console.warn('⚠️ CHAT_SERVER_URL not configured, skipping SignalR notification');
      return;
    }

    const requestPayload = {
      userId,
      reason,
      message
    };
    
    console.log('📤 Sending request to chat server:', {
      url: `${chatServerUrl}/api/session/notify-session-invalidated`,
      payload: requestPayload
    });

    try {
      const response = await fetch(`${chatServerUrl}/api/session/notify-session-invalidated`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      console.log('📥 Chat server response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Chat server error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.text();
      console.log('✅ Session invalidation notification sent via SignalR:', responseData);
    } catch (error) {
      console.error('❌ Failed to notify chat server:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
export { SessionManager };