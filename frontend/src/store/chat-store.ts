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
  activeCommunity: ICommunity | null;
  messages: Message[];
  typingUsers: {
    [communityId: string]: { userId: string; username: string }[];
  };
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
  activeCommunity: null,
  messages: [],
  typingUsers: {},
  
  setActiveCommunity: (activeCommunity) =>
    set({ activeCommunity, messages: [] }),
    
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
    
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
