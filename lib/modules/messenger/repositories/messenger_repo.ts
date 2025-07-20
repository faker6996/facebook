import { safeQuery } from "@/lib/modules/common/safe_query";
import { User } from "@/lib/models/user";
import { baseRepo } from "../../common/base_repo";
import { MessengerPreview } from "@/lib/models/messenger_review";
import { Message } from "@/lib/models/message";

export const messengerRepo = {
  async getAll(): Promise<User[]> {
    return baseRepo.getAll<User>(User);
  },
  async getRecentConversations(userId: number): Promise<MessengerPreview[]> {
    const sql = `
      WITH user_conversations AS (
        -- Get all conversations where current user is participant
        SELECT DISTINCT c.id AS conversation_id
        FROM conversations c
        JOIN conversation_participants cp ON cp.conversation_id = c.id
        WHERE cp.user_id = $1
      ),
      conversation_info AS (
        SELECT 
          c.id AS conversation_id,
          c.is_group,
          c.name AS group_name,
          c.avatar_url AS group_avatar_url,
          -- Count ALL participants in this conversation
          (SELECT COUNT(*)::integer FROM conversation_participants cp WHERE cp.conversation_id = c.id) AS member_count,
          -- For private conversations, get the other user info
          CASE 
            WHEN c.is_group = false THEN 
              (SELECT u.id FROM users u 
               JOIN conversation_participants cp ON cp.user_id = u.id 
               WHERE cp.conversation_id = c.id AND u.id != $1 LIMIT 1)
            ELSE NULL 
          END AS other_user_id,
          CASE 
            WHEN c.is_group = false THEN 
              (SELECT u.name FROM users u 
               JOIN conversation_participants cp ON cp.user_id = u.id 
               WHERE cp.conversation_id = c.id AND u.id != $1 LIMIT 1)
            ELSE NULL 
          END AS other_user_name,
          CASE 
            WHEN c.is_group = false THEN 
              (SELECT u.avatar_url FROM users u 
               JOIN conversation_participants cp ON cp.user_id = u.id 
               WHERE cp.conversation_id = c.id AND u.id != $1 LIMIT 1)
            ELSE NULL 
          END AS avatar_url
        FROM conversations c
        WHERE c.id IN (SELECT conversation_id FROM user_conversations)
      ),
      latest_messages AS (
        SELECT DISTINCT ON (m.conversation_id)
          m.conversation_id,
          m.content AS last_message_content,
          m.created_at AS last_message_at,
          u.name AS last_message_sender
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.conversation_id IN (SELECT conversation_id FROM conversation_info)
        ORDER BY m.conversation_id, m.created_at DESC
      )
      SELECT 
        ci.conversation_id,
        ci.is_group,
        -- Group fields
        ci.group_name AS name,
        ci.group_avatar_url,
        ci.member_count,
        -- Private conversation fields  
        ci.other_user_id,
        ci.other_user_name,
        ci.avatar_url,
        -- Latest message info
        lm.last_message_content,
        lm.last_message_at,
        lm.last_message_sender,
        0 AS unread_count, -- TODO: implement unread count logic
        false AS other_is_online -- TODO: implement online status
      FROM conversation_info ci
      LEFT JOIN latest_messages lm ON lm.conversation_id = ci.conversation_id
      ORDER BY lm.last_message_at DESC NULLS LAST, ci.conversation_id DESC
    `;

    console.log("🔍 Getting conversations for user:", userId);
    const data = await safeQuery(sql, [userId]);
    
    if (!data || !data.rows) {
      return [];
    }
    
    console.log("✅ Retrieved conversations count:", data.rows.length);
    
    // Debug member counts
    data.rows.forEach(row => {
      if (row.is_group) {
        console.log(`📊 Group "${row.name}" member_count from query:`, row.member_count);
      }
    });
    
    // Map results to proper format
    return data.rows.map(row => ({
      conversation_id: row.conversation_id,
      is_group: row.is_group,
      // Group properties
      name: row.is_group ? row.name : row.other_user_name,
      member_count: row.is_group ? row.member_count : 2,
      group_avatar_url: row.group_avatar_url,
      // Private conversation properties
      other_user_id: row.is_group ? null : row.other_user_id,
      other_user_name: row.is_group ? null : row.other_user_name,
      other_is_online: row.is_group ? null : row.other_is_online,
      avatar_url: row.is_group ? null : row.avatar_url,
      // Message properties
      last_message_content: row.last_message_content,
      last_message_at: row.last_message_at,
      last_message_sender: row.is_group ? row.last_message_sender : null,
      unread_count: row.unread_count
    }));
  },

  async getMessagesByConversationId(
    conversationId: number, 
    page: number = 1, 
    limit: number = 30
  ): Promise<{
    messages: any[];
    hasMore: boolean;
    totalCount: number;
    currentPage: number;
  }> {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // First get total count
    const countSql = `
      SELECT COUNT(*) as total_count
      FROM messages m
      WHERE m.conversation_id = $1
    `;
    
    // Main query with pagination - ORDER BY DESC để lấy tin nhắn mới nhất trước, sau đó reverse
    const sql = `
     SELECT 
        m.id, 
        m.conversation_id, 
        m.sender_id, 
        m.content, 
        m.created_at,
        m.status,
        m.content_type,
        m.message_type,
        m.reply_to_message_id,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', a.id,
              'file_name', a.file_name,
              'file_url', a.file_url,
              'file_type', a.file_type,
              'file_size', a.file_size,
              'created_at', a.created_at
            )
          ) FILTER (WHERE a.id IS NOT NULL), 
          '[]'
        ) AS attachments,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', r.id,
              'message_id', r.message_id,
              'user_id', r.user_id,
              'emoji', r.emoji,
              'reacted_at', r.reacted_at
            )
          ) FILTER (WHERE r.id IS NOT NULL), 
          '[]'
        ) AS reactions
      FROM messages m
      LEFT JOIN attachments a ON m.id = a.message_id
      LEFT JOIN message_reactions r ON m.id = r.message_id
      WHERE m.conversation_id = $1
      GROUP BY m.id, m.conversation_id, m.sender_id, m.content, m.created_at, m.status, m.content_type, m.message_type, m.reply_to_message_id
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    console.log("🔍 SQL Pagination Query:", sql);
    console.log("🔍 Count Query:", countSql);
    console.log("🔍 Parameters:", { conversationId, limit, offset, page });

    try {
      // Get total count first
      const countResult = await safeQuery(countSql, [conversationId]);
      const totalCount = parseInt(countResult?.rows?.[0]?.total_count || '0');
      
      // Get paginated messages
      const messages = await safeQuery(sql, [conversationId, limit, offset]);
      console.log("✅ Query result:", {
        messagesCount: messages?.rows?.length,
        totalCount,
        page,
        limit,
        offset
      });
      
      if (!messages || !messages.rows) {
        return {
          messages: [],
          hasMore: false,
          totalCount: 0,
          currentPage: page
        };
      }
      
      // Reverse messages để có thứ tự ASC (cũ nhất lên trên, mới nhất xuống dưới)
      const reversedMessages = messages.rows.reverse();
      
      // Lấy replied messages riêng để tránh JOIN phức tạp
      const messagesWithReplies = await Promise.all(
        reversedMessages.map(async (message) => {
          if (message.reply_to_message_id) {
            try {
              const repliedQuery = `
                SELECT id, content, sender_id, content_type, created_at 
                FROM messages 
                WHERE id = $1
              `;
              const repliedResult = await safeQuery(repliedQuery, [message.reply_to_message_id]);
              if (repliedResult && repliedResult.rows && repliedResult.rows.length > 0) {
                message.replied_message = repliedResult.rows[0];
              }
            } catch (err) {
              console.error('Error fetching replied message:', err);
            }
          }
          return message;
        })
      );
      
      // Calculate if there are more messages
      const hasMore = (page * limit) < totalCount;
      
      return {
        messages: messagesWithReplies,
        hasMore,
        totalCount,
        currentPage: page
      };
    } catch (error) {
      console.error("❌ SQL Error in getMessagesByConversationId:", error);
      console.error("❌ SQL Query that failed:", sql);
      console.error("❌ Parameters:", { conversationId, limit, offset });
      throw error;
    }
  },
  async getMessagesAfterIdAsyncRepo(conversationId: number, lastMessageId: number): Promise<Message[]> {
    const sql = `
      SELECT 
        m.id, 
        m.conversation_id, 
        m.sender_id, 
        m.content, 
        m.created_at,
        m.status,
        m.content_type,
        m.message_type,
        m.reply_to_message_id,
        COALESCE(
          JSON_AGG(
            DISTINCT JSON_BUILD_OBJECT(
              'id', a.id,
              'file_name', a.file_name,
              'file_url', a.file_url,
              'file_type', a.file_type,
              'file_size', a.file_size,
              'created_at', a.created_at
            )
          ) FILTER (WHERE a.id IS NOT NULL), 
          '[]'
        ) AS attachments
      FROM messages m
      LEFT JOIN attachments a ON m.id = a.message_id
      WHERE m.conversation_id = $1 AND m.id > $2
      GROUP BY m.id, m.conversation_id, m.sender_id, m.content, m.created_at, m.status, m.content_type, m.message_type, m.reply_to_message_id
      ORDER BY m.created_at ASC
    `;
    // Thêm lastMessageId vào mảng tham số cho câu lệnh query
    const messages = await safeQuery(sql, [conversationId, lastMessageId]);

    if (!messages || !messages.rows) {
      return [];
    }
    return messages.rows;
  },
};
