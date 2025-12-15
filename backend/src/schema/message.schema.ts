import { z } from "zod";
import { MessageType } from "../models/message.model";

const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be at most 2000 characters"),
  type: z.nativeEnum(MessageType).default(MessageType.TEXT),
  communityId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid community ID"),
  replyTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid message ID")
    .optional(),
});

const editMessageSchema = z.object({
  messageId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid message ID"),
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be at most 2000 characters"),
});

const deleteMessageSchema = z.object({
  messageId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid message ID"),
});

const getMessagesSchema = z.object({
  communityId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid community ID"),
  limit: z.number().min(1).max(100).default(50),
  before: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid message ID")
    .optional(),
});



type SendMessageInput = z.infer<typeof sendMessageSchema>;
type EditMessageInput = z.infer<typeof editMessageSchema>;
type DeleteMessageInput = z.infer<typeof deleteMessageSchema>;
type GetMessagesInput = z.infer<typeof getMessagesSchema>;

export {
  sendMessageSchema,
  editMessageSchema,
  deleteMessageSchema,
  getMessagesSchema,
};

export type {
  SendMessageInput,
  EditMessageInput,
  DeleteMessageInput,
  GetMessagesInput,
};