-- ============================================
-- Chat Module Schema (ID auto-increment + nâng cao)
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    password VARCHAR(150) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    email VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    created_by INTEGER,
    is_sso BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    is_group BOOLEAN NOT NULL DEFAULT FALSE,
    name VARCHAR(100),
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    conversation_id INTEGER,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) DEFAULT 'member'
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER,
    sender_id INTEGER,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, file
    reply_to_message_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER
);

CREATE TABLE message_status (
    id SERIAL PRIMARY KEY,
    message_id INTEGER,
    user_id INTEGER,
    status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, seen
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER,
    user_id INTEGER,
    emoji VARCHAR(20),
    reacted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message_edit_history (
    id SERIAL PRIMARY KEY,
    message_id INTEGER,
    old_content TEXT,
    edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message_deleted (
    id SERIAL PRIMARY KEY,
    message_id INTEGER,
    user_id INTEGER,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pinned_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER,
    message_id INTEGER,
    pinned_by INTEGER,
    pinned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu (
    id SERIAL PRIMARY KEY,
    icon VARCHAR(100),         -- Tên icon (Ví dụ: "friends", "video", "marketplace")
    slug VARCHAR(100),         -- Route hoặc slug dùng để điều hướng (VD: /friends, /groups)
    order_index INTEGER,       -- Thứ tự hiển thị
    is_active BOOLEAN DEFAULT true, -- Có hiển thị không
    parent_id INTEGER  -- Hỗ trợ menu lồng nhau nếu cần
);


CREATE TABLE menu_translations (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER,
  locale VARCHAR(10), -- 'vi', 'en'
  name VARCHAR(100)
);
