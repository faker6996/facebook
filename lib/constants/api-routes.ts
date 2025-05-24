export const API_ROUTES = {
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
      SSO_FACEBOOK: '/api/auth/sso_facebook',
      SSO_GOOGLE: '/api/auth/sso_google',
    },
    USER: {
      LIST: '/api/users',
      DETAIL: (id: string | number) => `/api/users/${id}`,
    },
    PROJECT: {
      LIST: '/api/projects',
      DETAIL: (id: string) => `/api/projects/${id}`,
    },
  };
  