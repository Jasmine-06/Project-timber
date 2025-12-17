import { create } from "zustand";

interface Message {
  _id: string;
  content: string;
  type: string;
  sender: { _id: string; username: string; profile_picture?: string };
  community: string;
  communityId?: string;
  replyTo?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
}

interface ChatState {
  myCommunities: ICommunity[];
  activeCommunity: ICommunity | null;
  messages: Message[];
  typingUsers: {
    [communityId: string]: { userId: string; username: string }[];
  };
  setMyCommunities: (communities: ICommunity[]) => void;
  addCommunity: (community: ICommunity) => void;
  removeCommunity: (communityId: string) => void;
  updateCommunity: (communityId: string, updates: Partial<ICommunity>) => void;
  setActiveCommunity: (community: ICommunity | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
  setTypingUser: (
    communityId: string,
    userId: string,
    username: string,
    isTyping: boolean
  ) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  myCommunities: [],
  activeCommunity: null,
  messages: [],
  typingUsers: {},

  setMyCommunities: (myCommunities) => set({ myCommunities }),

  addCommunity: (community) =>
    set((state) => ({
      myCommunities: [...state.myCommunities, community],
    })),

  removeCommunity: (communityId) =>
    set((state) => ({
      myCommunities: state.myCommunities.filter((c) => c._id !== communityId),
      activeCommunity: state.activeCommunity?._id === communityId ? null : state.activeCommunity,
    })),

  updateCommunity: (communityId, updates) =>
    set((state) => ({
      myCommunities: state.myCommunities.map((c) =>
        c._id === communityId ? { ...c, ...updates } : c
      ),
      activeCommunity: state.activeCommunity?._id === communityId
        ? { ...state.activeCommunity, ...updates }
        : state.activeCommunity,
    })),

  setActiveCommunity: (activeCommunity) =>
    set({ activeCommunity, messages: [] }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => {
      // Prevent duplicate messages by checking if message with same _id already exists
      const messageExists = state.messages.some((m) => m._id === message._id);
      if (messageExists) {
        return state; // Don't add duplicate
      }
      return {
        messages: [...state.messages, message],
      };
    }),

  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId ? { ...m, ...updates } : m
      ),
    })),

  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m._id !== messageId),
    })),

  setTypingUser: (communityId, userId, username, isTyping) =>
    set((state) => {
      const current = state.typingUsers[communityId] || [];
      const filtered = current.filter((u) => u.userId !== userId);
      return {
        typingUsers: {
          ...state.typingUsers,
          [communityId]: isTyping
            ? [...filtered, { userId, username }]
            : filtered,
        },
      };
    }),
}));
