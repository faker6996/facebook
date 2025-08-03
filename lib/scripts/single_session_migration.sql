-- ============================================
-- Single Session Management Migration
-- ============================================

-- Tạo bảng để track active sessions của users
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(500) NOT NULL UNIQUE,
    device_info JSONB, -- Thông tin device/browser
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_user_sessions_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes để optimize performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active, expires_at);

-- Function để auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger để auto-update updated_at
DROP TRIGGER IF EXISTS trigger_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER trigger_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_sessions_updated_at();

-- Function để cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP OR is_active = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure để invalidate tất cả sessions của một user (trừ session hiện tại)
CREATE OR REPLACE FUNCTION invalidate_user_sessions(
    p_user_id INTEGER,
    p_current_session_token VARCHAR(500) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE user_sessions 
    SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id 
      AND is_active = TRUE
      AND (p_current_session_token IS NULL OR session_token != p_current_session_token);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure để tạo session mới và invalidate sessions cũ
CREATE OR REPLACE FUNCTION create_single_session(
    p_user_id INTEGER,
    p_session_token VARCHAR(500),
    p_device_info JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_expires_at TIMESTAMP DEFAULT NULL
)
RETURNS TABLE(
    session_id INTEGER,
    invalidated_count INTEGER
) AS $$
DECLARE
    v_session_id INTEGER;
    v_invalidated_count INTEGER;
    v_expires_at TIMESTAMP;
BEGIN
    -- Set default expiration time if not provided (2 hours from now)
    v_expires_at := COALESCE(p_expires_at, CURRENT_TIMESTAMP + INTERVAL '2 hours');
    
    -- Invalidate all existing active sessions for this user
    SELECT invalidate_user_sessions(p_user_id) INTO v_invalidated_count;
    
    -- Create new session
    INSERT INTO user_sessions (
        user_id, session_token, device_info, ip_address, user_agent, expires_at
    )
    VALUES (
        p_user_id, p_session_token, p_device_info, p_ip_address, p_user_agent, v_expires_at
    )
    RETURNING id INTO v_session_id;
    
    -- Return results
    session_id := v_session_id;
    invalidated_count := v_invalidated_count;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function để validate session
CREATE OR REPLACE FUNCTION validate_session(
    p_session_token VARCHAR(500)
)
RETURNS TABLE(
    user_id INTEGER,
    is_valid BOOLEAN,
    expires_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.user_id,
        (us.is_active AND us.expires_at > CURRENT_TIMESTAMP) as is_valid,
        us.expires_at
    FROM user_sessions us
    WHERE us.session_token = p_session_token;
END;
$$ LANGUAGE plpgsql;

-- Function để extend session expiration
CREATE OR REPLACE FUNCTION extend_session(
    p_session_token VARCHAR(500),
    p_extend_minutes INTEGER DEFAULT 120
)
RETURNS BOOLEAN AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE user_sessions 
    SET expires_at = CURRENT_TIMESTAMP + (p_extend_minutes || ' minutes')::INTERVAL,
        updated_at = CURRENT_TIMESTAMP
    WHERE session_token = p_session_token 
      AND is_active = TRUE 
      AND expires_at > CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Tạo view để xem active sessions
CREATE OR REPLACE VIEW active_user_sessions AS
SELECT 
    us.id,
    us.user_id,
    u.name as user_name,
    u.email,
    us.device_info,
    us.ip_address,
    us.user_agent,
    us.created_at as login_time,
    us.expires_at,
    us.updated_at as last_activity
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.is_active = TRUE 
  AND us.expires_at > CURRENT_TIMESTAMP
ORDER BY us.updated_at DESC;

-- Grant permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO your_app_user;
-- GRANT USAGE ON SEQUENCE user_sessions_id_seq TO your_app_user;

COMMENT ON TABLE user_sessions IS 'Tracks active user sessions for single session management';
COMMENT ON COLUMN user_sessions.session_token IS 'JWT token or session identifier';
COMMENT ON COLUMN user_sessions.device_info IS 'JSON object containing device/browser information';
COMMENT ON FUNCTION invalidate_user_sessions(INTEGER, VARCHAR) IS 'Invalidates all sessions for a user except optionally specified session';
COMMENT ON FUNCTION create_single_session IS 'Creates new session and invalidates all existing sessions for user';
COMMENT ON FUNCTION validate_session(VARCHAR) IS 'Validates if a session token is still active and not expired';