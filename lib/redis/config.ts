import { Redis } from '@upstash/redis'

export type RedisConfig = {
  upstashRedisRestUrl: string
  upstashRedisRestToken: string
}

export const redisConfig: RedisConfig = {
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL!,
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN!
}

let redisWrapper: RedisWrapper | null = null

export class RedisWrapper {
  private client: Redis

  constructor(client: Redis) {
    this.client = client
  }

  async zrange(
    key: string,
    start: number,
    stop: number,
    options?: { rev: boolean }
  ): Promise<string[]> {
    return this.client.zrange(key, start, stop, options)
  }

  async hgetall<T extends Record<string, unknown>>(
    key: string
  ): Promise<T | null> {
    return (await this.client.hgetall(key)) as T | null
  }

  pipeline() {
    return new UpstashPipelineWrapper(this.client.pipeline())
  }

  async hmset(key: string, value: Record<string, any>): Promise<'OK' | number> {
    return this.client.hmset(key, value)
  }

  async zadd(
    key: string,
    score: number,
    member: string
  ): Promise<number | null> {
    return this.client.zadd(key, { score, member })
  }

  async del(key: string): Promise<number> {
    return this.client.del(key)
  }

  async zrem(key: string, member: string): Promise<number> {
    return this.client.zrem(key, member)
  }

  async close(): Promise<void> {
    // Upstash does not require an explicit close
  }
}

class UpstashPipelineWrapper {
  private pipeline: ReturnType<Redis['pipeline']>

  constructor(pipeline: ReturnType<Redis['pipeline']>) {
    this.pipeline = pipeline
  }

  hgetall(key: string) {
    this.pipeline.hgetall(key)
    return this
  }

  del(key: string) {
    this.pipeline.del(key)
    return this
  }

  zrem(key: string, member: string) {
    this.pipeline.zrem(key, member)
    return this
  }

  hmset(key: string, value: Record<string, any>) {
    this.pipeline.hmset(key, value)
    return this
  }

  zadd(key: string, score: number, member: string) {
    this.pipeline.zadd(key, { score, member })
    return this
  }

  async exec() {
    return await this.pipeline.exec()
  }
}

export async function getRedisClient(): Promise<RedisWrapper> {
  if (redisWrapper) return redisWrapper

  if (!redisConfig.upstashRedisRestUrl || !redisConfig.upstashRedisRestToken) {
    throw new Error('Upstash Redis configuration is missing.')
  }

  try {
    const client = new Redis({
      url: redisConfig.upstashRedisRestUrl,
      token: redisConfig.upstashRedisRestToken
    })
    redisWrapper = new RedisWrapper(client)
    return redisWrapper
  } catch (error) {
    console.error('Failed to connect to Upstash Redis:', error)
    throw new Error('Could not initialize Upstash Redis client.')
  }
}

export async function closeRedisConnection(): Promise<void> {
  if (redisWrapper) {
    await redisWrapper.close()
    redisWrapper = null
  }
}
