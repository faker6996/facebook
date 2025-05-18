// lib/constants/app-config.ts

export const AppConfig = {
    APP_NAME: 'ChatZone',
    DEFAULT_LANGUAGE: 'vi',
    API_TIMEOUT: 10000, // timeout cho API
    DATE_FORMAT: 'dd/MM/yyyy',
    MAX_UPLOAD_SIZE_MB: 10,
    SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
    ENABLE_LOGGING: process.env.NODE_ENV !== 'production',
  };
  