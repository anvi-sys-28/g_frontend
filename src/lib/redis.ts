import { Redis } from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | null | undefined;
};

function createRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy() {
        return null; // Don't retry indefinitely during build
      },
    });

    client.on('error', () => {
      // Gracefully silence errors so Redis never crashes static generation or build
    });

    return client;
  } catch {
    return null;
  }
}

export const redis =
  globalForRedis.redisClient !== undefined
    ? globalForRedis.redisClient
    : createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redisClient = redis;
}
