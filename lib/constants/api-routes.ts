export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    SSO_FACEBOOK: "/api/auth/sso_facebook",
    SSO_GOOGLE: "/api/auth/sso_google",
    SSO_GOOGLE_GET_TOKEN: "https://oauth2.googleapis.com/token",
    SSO_GOOGLE_GET_INFO: "https://www.googleapis.com/oauth2/v2/userinfo",
    SSO_FACEBOOK_GET_TOKEN: "https://graph.facebook.com/v12.0/oauth/access_token",
    SSO_FACEBOOK_GET_INFO: "https://graph.facebook.com/me",
  },
  USER: {
    LIST: "/api/users",
    DETAIL: (id: string | number) => `/api/users/${id}`,
  },
  PROJECT: {
    LIST: "/api/projects",
    DETAIL: (id: string) => `/api/projects/${id}`,
  },
  MESSENGER: {
    RECENT: (id: number) => `/api/messenger/conversations?userId=${id}`,
    MESSAGES: (conversationId: number) => `/api/messenger/messages?conversationId=${conversationId}`,
    SEND_MESSAGE: `/api/messages`,
  },
  SEARCH: {
    USER_NAME: (user_name: string) => `/api/search/user?user_name=${user_name}`,
  },
  CHAT_SERVER: {
    SENT_MESSAGE: `${process.env.CHAT_SERVER_URL}/api/messages`,
  },
};
