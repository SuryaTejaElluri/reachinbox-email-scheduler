import { ConnectionOptions } from "bullmq";

function getRedisOptions(): ConnectionOptions {
  if (process.env.REDIS_URL) {
    try {
      const parsedUrl = new URL(process.env.REDIS_URL);
      const isTls = parsedUrl.protocol === "rediss:";

      const options: ConnectionOptions = {
        host: parsedUrl.hostname || "127.0.0.1",
        port: parsedUrl.port ? Number(parsedUrl.port) : 6379,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      };

      if (parsedUrl.username) {
        options.username = decodeURIComponent(parsedUrl.username);
      }
      if (parsedUrl.password) {
        options.password = decodeURIComponent(parsedUrl.password);
      }
      if (isTls) {
        options.tls = {
          rejectUnauthorized: false,
        };
      }

      return options;
    } catch (err) {
      console.warn("Failed to parse REDIS_URL, falling back to host/port settings:", err);
    }
  }

  const host = process.env.REDIS_HOST || "127.0.0.1";
  const port = Number(process.env.REDIS_PORT || 6379);
  const username = process.env.REDIS_USERNAME;
  const password = process.env.REDIS_PASSWORD;
  const isTls =
    process.env.REDIS_TLS === "true" ||
    host.includes("upstash.io");

  const options: ConnectionOptions = {
    host,
    port,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };

  if (username) {
    options.username = username;
  }
  if (password) {
    options.password = password;
  }
  if (isTls) {
    options.tls = {
      rejectUnauthorized: false,
    };
  }

  return options;
}

export const bullRedisConnection: ConnectionOptions = getRedisOptions();