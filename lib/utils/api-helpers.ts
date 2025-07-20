/**
 * API Helper functions với loading tích hợp sẵn
 * Sử dụng global loading manager
 */

import { callApi } from "./api-client";
import { LOADING_KEYS } from "./loading-manager";
import { API_ROUTES } from "../constants/api-routes";
import { HTTP_METHOD_ENUM } from "../constants/enum";

// Auth APIs
export const authApi = {
  login: (credentials: any) => callApi(
    API_ROUTES.AUTH.LOGIN,
    HTTP_METHOD_ENUM.POST,
    credentials,
    { loadingKey: LOADING_KEYS.LOGIN }
  ),

  logout: () => callApi(
    API_ROUTES.AUTH.LOGOUT,
    HTTP_METHOD_ENUM.POST,
    undefined,
    { loadingKey: LOADING_KEYS.LOGOUT }
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
    HTTP_METHOD_ENUM.GET,
    undefined,
    { loadingKey: LOADING_KEYS.LOAD_CONVERSATIONS }
  ),

  getMessages: (conversationId: number) => callApi(
    API_ROUTES.MESSENGER.MESSAGES(conversationId),
    HTTP_METHOD_ENUM.GET,
    undefined,
    { loadingKey: LOADING_KEYS.LOAD_MESSAGES }
  ),

  getMessagesPaginated: (conversationId: number, page: number, limit: number = 30) => callApi(
    API_ROUTES.MESSENGER.MESSAGES_PAGINATED(conversationId, page, limit),
    HTTP_METHOD_ENUM.GET,
    undefined,
    { loadingKey: LOADING_KEYS.LOAD_MESSAGES }
  ),

  searchUsers: (query: string) => callApi(
    API_ROUTES.SEARCH.USER_NAME(query),
    HTTP_METHOD_ENUM.GET,
    undefined,
    { loadingKey: LOADING_KEYS.SEARCH_USERS }
  )
};

// Chat Server APIs
export const chatServerApi = {
  sendMessage: (messageData: any) => callApi(
    API_ROUTES.CHAT_SERVER.SENT_MESSAGE,
    HTTP_METHOD_ENUM.POST,
    messageData,
    { loadingKey: LOADING_KEYS.SEND_MESSAGE }
  ),

  uploadFile: (formData: FormData) => {
    return fetch(API_ROUTES.CHAT_SERVER.UPLOAD_FILE, {
      method: "POST",
      body: formData,
    });
  }
};