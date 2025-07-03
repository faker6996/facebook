import { User, UserInfoSso } from "@/lib/models/user";
import { baseRepo } from "../../common/base_repo";
import { hashPassword } from "@/lib/utils/hash";
import { messengerRepo } from "@/lib/modules/messenger/repositories/messenger_app";

export const messengerApp = {
  async getAll() {
    return await messengerRepo.getAll();
  },
  async getRecentConversations(userId: number) {
    return await messengerRepo.getRecentConversations(userId);
  },
  async getMessagesByConversationId(conversationId: number) {
    return await messengerRepo.getMessagesByConversationId(conversationId);
  },
  async getMessagesAfterIdAsync(conversationId: number, lastMessageId: number) {
    return await messengerRepo.getMessagesAfterIdAsyncRepo(conversationId, lastMessageId);
  },
};
