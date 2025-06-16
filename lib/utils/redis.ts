import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | undefined;
}

export const redis =
  global.redis ??
  new Redis(process.env.REDIS_URL!, {
    lazyConnect: true, // mở kết nối khi lần đầu dùng
    maxRetriesPerRequest: null, // tránh lỗi trong môi trường serverless
    enableReadyCheck: false,
  });

if (process.env.NODE_ENV !== "production") global.redis = redis;
