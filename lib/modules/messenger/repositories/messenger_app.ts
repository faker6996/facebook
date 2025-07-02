import { safeQuery } from "@/lib/modules/common/safe_query";
import { User } from "@/lib/models/user";
import { baseRepo } from "../../common/base_repo";
import { MessengerPreview } from "@/lib/models/messenger_review";
import { query } from "@/lib/db";
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
        id, 
        conversation_id, 
        sender_id, 
        content, 
        created_at
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `;
    const messages = await safeQuery(sql, [conversationId]);
    if (!messages || !messages.rows) {
      return [];
    }
    return messages.rows;
  },
  async getMessagesAfterIdAsyncRepo(conversationId: number, lastMessageId: number): Promise<Message[]> {
    const sql = `
      SELECT 
        id, 
        conversation_id, 
        sender_id, 
        content, 
        created_at
      FROM messages
      WHERE conversation_id = $1 AND id > $2
      ORDER BY created_at ASC
    `;
    // Thêm lastMessageId vào mảng tham số cho câu lệnh query
    const messages = await safeQuery(sql, [conversationId, lastMessageId]);

    if (!messages || !messages.rows) {
      return [];
    }
    return messages.rows;
  },
};
