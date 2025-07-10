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
      SELECT
        c.id AS conversation_id,
        u.id AS other_user_id,
        u.name AS other_user_name,
        u.avatar_url,
        m.content AS last_message,
        m.created_at AS last_message_at,
        cp1.last_seen_at AS last_seen_at,
        cp2.user_id AS target_id
      FROM conversations c
      JOIN conversation_participants cp1
          ON cp1.conversation_id = c.id
          AND cp1.user_id = $1                 -- <-- khóa chặt cp1 là “mình”
      JOIN conversation_participants cp2
          ON cp2.conversation_id = c.id
          AND cp2.user_id <> cp1.user_id       -- người còn lại
      JOIN users u       ON u.id = cp2.user_id
      LEFT JOIN LATERAL (
        SELECT *
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) m ON true
      ORDER BY m.created_at DESC NULLS LAST
    `;

    var data = await safeQuery(sql, [userId]);
    if (!data || !data.rows) {
      return [];
    }
    return data.rows;
  },

  async getMessagesByConversationId(conversationId: number): Promise<any[]> {
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
      ORDER BY m.created_at ASC
    `;

    console.log("🔍 SQL Query (Simple):", sql);
    console.log("🔍 Parameters:", [conversationId]);

    try {
      const messages = await safeQuery(sql, [conversationId]);
      console.log("✅ Query result:", messages?.rows?.length, "messages");
      if (!messages || !messages.rows) {
        return [];
      }
      // Lấy replied messages riêng để tránh JOIN phức tạp
      const messagesWithReplies = await Promise.all(
        messages.rows.map(async (message) => {
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
      
      return messagesWithReplies;
    } catch (error) {
      console.error("❌ SQL Error in getMessagesByConversationId:", error);
      console.error("❌ SQL Query that failed:", sql);
      console.error("❌ Parameters:", [conversationId]);
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
