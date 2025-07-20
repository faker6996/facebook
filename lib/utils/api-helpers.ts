/**
 * API Helper functions
 * Không còn tích hợp loading - component tự quản lý
 */

import { callApi } from "./api-client";
import { API_ROUTES } from "../constants/api-routes";
import { HTTP_METHOD_ENUM } from "../constants/enum";

// Auth APIs
export const authApi = {
  login: (credentials: any) => callApi(
    API_ROUTES.AUTH.LOGIN,
    HTTP_METHOD_ENUM.POST,
    credentials
  ),

  logout: () => callApi(
    API_ROUTES.AUTH.LOGOUT,
    HTTP_METHOD_ENUM.POST
  ),

  me: () => callApi(
    API_ROUTES.AUTH.ME,
    HTTP_METHOD_ENUM.GET,
    undefined,
    { silent: true } // Không hiện loading cho API này
  )
};

// Messenger APIs
export const messengerApi = {
  getConversations: (userId: number) => callApi(
    API_ROUTES.MESSENGER.RECENT(userId),
    HTTP_METHOD_ENUM.GET
  ),

  getMessages: (conversationId: number) => callApi(
    API_ROUTES.MESSENGER.MESSAGES(conversationId),
    HTTP_METHOD_ENUM.GET
  ),

  getMessagesPaginated: (conversationId: number, page: number, limit: number = 30) => callApi(
    API_ROUTES.MESSENGER.MESSAGES_PAGINATED(conversationId, page, limit),
    HTTP_METHOD_ENUM.GET
  ),

  searchUsers: (query: string) => callApi(
    API_ROUTES.SEARCH.USER_NAME(query),
    HTTP_METHOD_ENUM.GET
  )
};

// Chat Server APIs
export const chatServerApi = {
  sendMessage: (messageData: any) => callApi(
    API_ROUTES.CHAT_SERVER.SENT_MESSAGE,
    HTTP_METHOD_ENUM.POST,
    messageData
  ),

  uploadFile: (formData: FormData) => {
    return fetch(API_ROUTES.CHAT_SERVER.UPLOAD_FILE, {
      method: "POST",
      body: formData,
    });
  }
};