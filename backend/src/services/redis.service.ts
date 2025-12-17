import Redis from "ioredis";
import type { IMessage } from "../models/message.model";

const redisConfig = process.env.REDIS_HOST
  ? {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
      enableReadyCheck: false, // This might need to be true for some providers, but keeping as was in original
    }
  : process.env.REDIS_URL || "redis://localhost:6379";

// Create Redis clients for Pub/Sub
export const pubClient =
  typeof redisConfig === "string"
    ? new Redis(redisConfig, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      })
    : new Redis(redisConfig);

export const subClient = pubClient.duplicate();

// Event handlers
pubClient.on("connect", () => {
  console.log("📡 Redis Publisher connected");
});

pubClient.on("error", (err) => {
  console.error("Redis Publisher error:", err.message);
});

subClient.on("connect", () => {
  console.log("📡 Redis Subscriber connected");
});

subClient.on("error", (err) => {
  console.error("Redis Subscriber error:", err.message);
});

// Redis channels for different events
export const REDIS_CHANNELS = {
  COMMUNITY_MESSAGE: "community:message",
  USER_TYPING: "community:typing",
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  MESSAGE_DELETED: "community:message:deleted",
  MESSAGE_EDITED: "community:message:edited",
} as const;

export type RedisChannel = (typeof REDIS_CHANNELS)[keyof typeof REDIS_CHANNELS];

export interface RedisPayloads {
  [REDIS_CHANNELS.COMMUNITY_MESSAGE]: {
    _id: string | any;
    content: string;
    type: string;
    sender: any;
    community: string | any;
    replyTo?: string | any;
    createdAt: Date | string;
    isEdited?: boolean;
    isDeleted?: boolean;
    communityId?: string;
  };
  [REDIS_CHANNELS.USER_TYPING]: {
    communityId: string;
    userId: string;
    username: string;
    isTyping: boolean;
  };
  [REDIS_CHANNELS.USER_ONLINE]: { userId: string; socketId: string };
  [REDIS_CHANNELS.USER_OFFLINE]: { userId: string };
  [REDIS_CHANNELS.MESSAGE_DELETED]: { messageId: string; communityId: string };
  [REDIS_CHANNELS.MESSAGE_EDITED]: {
    messageId: string;
    communityId: string;
    content: string;
    isEdited: boolean;
  };
}

// Helper functions for publishing events
export const publishMessage = async <T extends RedisChannel>(
  channel: T,
  data: RedisPayloads[T]
) => {
  await pubClient.publish(channel, JSON.stringify(data));
};

// Store online users in Redis
export const setUserOnline = async (userId: string, socketId: string) => {
  await pubClient.hset("online_users", userId, socketId);
  await pubClient.publish(
    REDIS_CHANNELS.USER_ONLINE,
    JSON.stringify({ userId, socketId })
  );
};

export const setUserOffline = async (userId: string) => {
  await pubClient.hdel("online_users", userId);
  await pubClient.publish(
    REDIS_CHANNELS.USER_OFFLINE,
    JSON.stringify({ userId })
  );
};

export const getOnlineUsers = async (): Promise<Record<string, string>> => {
  return pubClient.hgetall("online_users");
};

export const isUserOnline = async (userId: string): Promise<boolean> => {
  const socketId = await pubClient.hget("online_users", userId);
  return socketId !== null;
};

// Store user's socket room subscriptions
export const addUserToCommunityRoom = async (
  userId: string,
  communityId: string
) => {
  await pubClient.sadd(`user:${userId}:communities`, communityId);
};

export const removeUserFromCommunityRoom = async (
  userId: string,
  communityId: string
) => {
  await pubClient.srem(`user:${userId}:communities`, communityId);
};

export const getUserCommunityRooms = async (
  userId: string
): Promise<string[]> => {
  return pubClient.smembers(`user:${userId}:communities`);
};

export default { pubClient, subClient };
