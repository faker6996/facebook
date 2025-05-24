export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    SSO_FACEBOOK: "/api/auth/sso_facebook",
    SSO_GOOGLE: "/api/auth/sso_google/login",
    SSO_GOOGLE_CALLBACK: "/api/auth/sso_google/callback",
    SSO_GOOGLE_TOKEN: "https://oauth2.googleapis.com/token",
    SSO_GOOGLE_INFO: "https://www.googleapis.com/oauth2/v2/userinfo",
  },
  USER: {
    LIST: "/api/users",
    DETAIL: (id: string | number) => `/api/users/${id}`,
  },
  PROJECT: {
    LIST: "/api/projects",
    DETAIL: (id: string) => `/api/projects/${id}`,
  },
};
