import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import {
  pubClient,
  subClient,
  REDIS_CHANNELS,
  publishMessage,
  setUserOnline,
  setUserOffline,
} from "./redis.service";
import { Message, Community, User, MessageType } from "../models";
import { sendMessageSchema } from "../schema/message.schema";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

interface MessagePayload {
  content: string;
  communityId: string;
  type?: MessageType;
  replyTo?: string;
}

interface TypingPayload {
  communityId: string;
  isTyping: boolean;
}

export const setupSocketHandlers = async (io: Server) => {

  io.adapter(createAdapter(pubClient, subClient));

  const subscriber = subClient.duplicate();

  await subscriber.subscribe(
    REDIS_CHANNELS.COMMUNITY_MESSAGE,
    REDIS_CHANNELS.USER_TYPING,
    REDIS_CHANNELS.MESSAGE_DELETED,
    REDIS_CHANNELS.MESSAGE_EDITED
  );

  subscriber.on("message", (channel, message) => {
    const data = JSON.parse(message);

    switch (channel) {
      case REDIS_CHANNELS.COMMUNITY_MESSAGE:
        io.to(`community:${data.communityId}`).emit("new-message", data);
        break;
      case REDIS_CHANNELS.USER_TYPING:
        io.to(`community:${data.communityId}`).emit("user-typing", data);
        break;
      case REDIS_CHANNELS.MESSAGE_DELETED:
        io.to(`community:${data.communityId}`).emit("message-deleted", data);
        break;
      case REDIS_CHANNELS.MESSAGE_EDITED:
        io.to(`community:${data.communityId}`).emit("message-edited", data);
        break;
    }
  });

  io.on("connection", async (socket: AuthenticatedSocket) => {
    console.log("User connected:", socket.id);

    // Handle user authentication
    socket.on("authenticate", async (data: { userId: string }) => {
      try {
        const user = await User.findById(data.userId);
        if (!user) {
          socket.emit("error", { message: "User not found" });
          return;
        }

        socket.userId = data.userId;
        socket.username = user.username;

        // Set user online in Redis
        await setUserOnline(data.userId, socket.id);

        // Update user status in database
        await User.findByIdAndUpdate(data.userId, { isOnline: true });

        // Join user's community rooms
        for (const communityId of (user.communities || [])) {
          socket.join(`community:${communityId.toString()}`);
        }

        socket.emit("authenticated", {
          userId: data.userId,
          username: user.username,
          communities: user.communities,
        });

        console.log(`User ${user.username} authenticated`);
      } catch (error) {
        console.error("Authentication error:", error);
        socket.emit("error", { message: "Authentication failed" });
      }
    });

    // Handle joining a community room
    socket.on("join-community", async (data: { communityId: string }) => {
      try {
        if (!socket.userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        const community = await Community.findById(data.communityId);
        if (!community) {
          socket.emit("error", { message: "Community not found" });
          return;
        }

        // Check if user is a member
        if (!community.members.some((m) => m.toString() === socket.userId)) {
          socket.emit("error", {
            message: "You are not a member of this community",
          });
          return;
        }

        socket.join(`community:${data.communityId}`);
        socket.emit("joined-community", { communityId: data.communityId });

        // Notify others in the community
        socket
          .to(`community:${data.communityId}`)
          .emit("user-joined-community", {
            userId: socket.userId,
            username: socket.username,
            communityId: data.communityId,
          });
      } catch (error) {
        console.error("Join community error:", error);
        socket.emit("error", { message: "Failed to join community" });
      }
    });

    // Handle leaving a community room
    socket.on("leave-community", (data: { communityId: string }) => {
      socket.leave(`community:${data.communityId}`);
      socket.emit("left-community", { communityId: data.communityId });
    });

    // Handle sending messages
    socket.on("send-message", async (data: MessagePayload) => {
      try {
        if (!socket.userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        // Validate input
        const validationResult = sendMessageSchema.safeParse({
          ...data,
          type: data.type || MessageType.TEXT,
        });

        if (!validationResult.success) {
          socket.emit("error", {
            message: "Validation failed",
            errors: validationResult.error.issues,
          });
          return;
        }

        // Check if user is a member of the community
        const community = await Community.findById(data.communityId);
        if (
          !community ||
          !community.members.some((m) => m.toString() === socket.userId)
        ) {
          socket.emit("error", {
            message: "You are not a member of this community",
          });
          return;
        }

        // Create and save message
        const message = new Message({
          content: data.content,
          type: data.type || MessageType.TEXT,
          sender: socket.userId,
          community: data.communityId,
          replyTo: data.replyTo || null,
        });

        await message.save();

        // Populate sender info
        await message.populate("sender", "username avatar");

        const messageData = {
          _id: message._id,
          content: message.content,
          type: message.type,
          sender: message.sender,
          community: message.community,
          communityId: data.communityId,
          replyTo: message.replyTo,
          createdAt: message.createdAt,
          isEdited: message.isEdited,
          isDeleted: message.isDeleted,
        };

        // Publish to Redis for horizontal scaling
        await publishMessage(REDIS_CHANNELS.COMMUNITY_MESSAGE, messageData);

        // Also emit directly for the current server instance
        socket.emit("message-sent", messageData);
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicator
    socket.on("typing", async (data: TypingPayload) => {
      if (!socket.userId) return;

      await publishMessage(REDIS_CHANNELS.USER_TYPING, {
        userId: socket.userId,
        username: socket.username || "",
        communityId: data.communityId,
        isTyping: data.isTyping,
      });
    });

    // Handle message deletion
    socket.on("delete-message", async (data: { messageId: string }) => {
      try {
        if (!socket.userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        const message = await Message.findById(data.messageId);
        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        // Check if user is the sender or a community admin
        const community = await Community.findById(message.community);
        const isAdmin = community?.admins.some(
          (a) => a.toString() === socket.userId
        );
        const isSender = message.sender.toString() === socket.userId;

        if (!isAdmin && !isSender) {
          socket.emit("error", {
            message: "Not authorized to delete this message",
          });
          return;
        }

        message.isDeleted = true;
        message.content = "[Message deleted]";
        await message.save();

        await publishMessage(REDIS_CHANNELS.MESSAGE_DELETED, {
          messageId: data.messageId,
          communityId: message.community.toString(),
        });
      } catch (error) {
        console.error("Delete message error:", error);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });

    // Handle message editing
    socket.on(
      "edit-message",
      async (data: { messageId: string; content: string }) => {
        try {
          if (!socket.userId) {
            socket.emit("error", { message: "Not authenticated" });
            return;
          }

          const message = await Message.findById(data.messageId);
          if (!message) {
            socket.emit("error", { message: "Message not found" });
            return;
          }

          if (message.sender.toString() !== socket.userId) {
            socket.emit("error", {
              message: "Not authorized to edit this message",
            });
            return;
          }

          message.content = data.content;
          message.isEdited = true;
          await message.save();

          await publishMessage(REDIS_CHANNELS.MESSAGE_EDITED, {
            messageId: data.messageId,
            content: data.content,
            communityId: message.community.toString(),
            isEdited: true,
          });
        } catch (error) {
          console.error("Edit message error:", error);
          socket.emit("error", { message: "Failed to edit message" });
        }
      }
    );

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      if (socket.userId) {
        await setUserOffline(socket.userId);
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
      }
    });
  });

  console.log("📡 Socket handlers initialized with Redis Pub/Sub");
};

