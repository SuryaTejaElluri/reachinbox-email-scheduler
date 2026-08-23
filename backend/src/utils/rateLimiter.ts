import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  lazyConnect: true,
});

const WINDOW_SECONDS = 60 * 60;

export async function checkHourlyRateLimit(
  senderKey: string
) {
  const maxEmails = Number(
    process.env.MAX_EMAILS_PER_HOUR || 200
  );

  const now = new Date();
  const hourWindow = now.toISOString().slice(0, 13);
  const key = `email-rate:${senderKey}:${hourWindow}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS + 60);
  }

  if (count > maxEmails) {
    await redis.decr(key);

    return {
      allowed: false,
      retryAt: new Date(
        Date.now() +
          (60 * 60 - now.getMinutes() * 60 - now.getSeconds()) * 1000
      ),
    };
  }

  return {
    allowed: true,
    retryAt: null,
  };
}

export async function acquireRateLimit(
  senderKey: string,
  hourlyLimit: number
): Promise<boolean> {
  const now = new Date();
  const hourWindow = now.toISOString().slice(0, 13);
  const key = `email-rate:${senderKey}:${hourWindow}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS + 60);
  }

  if (count > hourlyLimit) {
    await redis.decr(key);

    return false;
  }

  return true;
}

export async function closeRateLimiterRedis() {
  await redis.quit();
}