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
    MESSAGES_PAGINATED: (conversationId: number, page: number, limit: number = 30) => 
      `/api/messenger/messages?conversationId=${conversationId}&page=${page}&limit=${limit}`,
    SYNC: `/api/messenger/messages_sync`,
  },
  SEARCH: {
    USER_NAME: (user_name: string) => `/api/search/user?user_name=${user_name}`,
    USER_FOR_GROUP: (query: string) => `/api/search/user?user_name=${query}&mode=group`,
    USER_FOR_GROUP_INVITE: (query: string, groupId: number) => `/api/search/user?user_name=${query}&mode=group-invite&groupId=${groupId}`,
  },
  CHAT_SERVER: {
    SENT_MESSAGE: `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/messages`,
    UPLOAD_FILE: `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/upload`,
    ADD_REACTION: `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/reactions/add`,
    REMOVE_REACTION: `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/reactions/remove`,

    // Group management
    CREATE_GROUP: `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groups`,
    UPDATE_GROUP: (id: number) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groups/${id}`,
    GROUP_INFO: (id: number) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groups/${id}/info`,
    GROUP_MEMBERS: (id: number) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groups/${id}/members`,
    ADD_MEMBERS: (id: number) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groups/${id}/members`,
    REMOVE_MEMBER: (id: number, userId: number) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groups/${id}/members/${userId}`,
    LEAVE_GROUP: (id: number) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groups/${id}/leave`,
    PROMOTE_MEMBER: (id: number) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groups/${id}/promote`,
    GET_INVITE_LINK: (id: number) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groups/${id}/invite-link`,

    // Join requests
    JOIN_GROUP: (id: number) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groups/${id}/requests`,
    GET_JOIN_REQUESTS: (id: number) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groups/${id}/requests`,
    HANDLE_JOIN_REQUEST: (groupId: number, requestId: number) =>
      `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groups/${groupId}/requests/${requestId}`,
    JOIN_VIA_INVITE: (inviteCode: string) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groups/join/${inviteCode}`,

    // Group calls
    GET_ACTIVE_GROUP_CALL: (groupId: number) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groupcalls/${groupId}/active`,
    START_GROUP_CALL: (groupId: number) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groupcalls/${groupId}/start`,
    JOIN_GROUP_CALL: (callId: string) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groupcalls/${callId}/join`,
    LEAVE_GROUP_CALL: (callId: string) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groupcalls/${callId}/leave`,
    END_GROUP_CALL: (callId: string) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groupcalls/${callId}/end`,
    TOGGLE_GROUP_CALL_MEDIA: (callId: string) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groupcalls/${callId}/media`,
    GET_GROUP_CALL_PARTICIPANTS: (callId: string) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groupcalls/${callId}/participants`,
    UPDATE_CONNECTION_QUALITY: (callId: string) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groupcalls/${callId}/connection-quality`,
    GET_GROUP_CALL_HISTORY: (groupId: number) => `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/api/groupcalls/history/${groupId}`,
  },
  RESET_PASSWORD: {
    REQUEST: `/api/forgot-password`,
    RESET: "/api/reset-password",
  },
};
