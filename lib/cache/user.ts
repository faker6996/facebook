import { User } from "@/lib/models/user";
import { redis } from "@/lib/utils/redis";

const ONE_DAY = 60 * 60 * 24; // TTL 24h

export async function cacheUser(user: User) {
  // Khóa: user:<id>
  await redis.set(`user:${user.id}`, JSON.stringify(user), "EX", ONE_DAY);
}

export async function getCachedUser(id: number) {
  const raw = await redis.get(`user:${id}`);
  return raw ? (JSON.parse(raw) as Record<string, any>) : null;
}

export async function invalidateUser(id: number) {
  await redis.del(`user:${id}`);
}
