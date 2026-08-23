import { RedisOptions } from "ioredis";

export const bullRedisConnection: RedisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT || 6379),
  maxRetriesPerRequest: null,
};