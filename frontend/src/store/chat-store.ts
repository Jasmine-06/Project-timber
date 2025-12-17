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
  messagesByCommunity: {
    [communityId: string]: Message[];
  };
  typingUsers: {
    [communityId: string]: { userId: string; username: string }[];
  };
  setMyCommunities: (communities: ICommunity[]) => void;
  addCommunity: (community: ICommunity) => void;
  removeCommunity: (communityId: string) => void;
  updateCommunity: (communityId: string, updates: Partial<ICommunity>) => void;
  setActiveCommunity: (community: ICommunity | null) => void;
  setMessages: (messages: Message[]) => void;
  setMessagesForCommunity: (communityId: string, messages: Message[]) => void;
  getMessagesForCommunity: (communityId: string) => Message[];
  isUserMemberOfCommunity: (communityId: string, userId: string) => boolean;
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

export const useChatStore = create<ChatState>((set, get) => ({
  myCommunities: [],
  activeCommunity: null,
  messages: [],
  messagesByCommunity: {},
  typingUsers: {},

  setMyCommunities: (myCommunities) => set({ myCommunities }),

  addCommunity: (community) =>
    set((state) => {
      // Check if community already exists
      const existingIndex = state.myCommunities.findIndex((c) => c._id === community._id);
      
      if (existingIndex >= 0) {
        // Update existing community
        const updatedCommunities = [...state.myCommunities];
        updatedCommunities[existingIndex] = community;
        return { myCommunities: updatedCommunities };
      } else {
        // Add new community
        return { myCommunities: [...state.myCommunities, community] };
      }
    }),

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
    set((state) => {
      const communityId = activeCommunity?._id;
      const messages = communityId ? (state.messagesByCommunity[communityId] || []) : [];
      return {
        activeCommunity,
        messages,
      };
    }),

  setMessages: (messages) => set({ messages }),

  setMessagesForCommunity: (communityId, messages) =>
    set((state) => ({
      messagesByCommunity: {
        ...state.messagesByCommunity,
        [communityId]: messages,
      },
      messages: state.activeCommunity?._id === communityId ? messages : state.messages,
    })),

  getMessagesForCommunity: (communityId) => {
    const state = get();
    return state.messagesByCommunity[communityId] || [];
  },

  isUserMemberOfCommunity: (communityId, userId) => {
    const state = get();
    const community = state.myCommunities.find(c => c._id === communityId) || state.activeCommunity;
    if (!community || community._id !== communityId) return false;
    
    return community.members.some(member => member._id === userId) ||
           community.admins.some(admin => admin._id === userId);
  },

  addMessage: (message) =>
    set((state) => {
      const communityId = message.community || message.communityId;
      if (!communityId) {
        console.warn('Message missing community ID:', message);
        return state;
      }

      // Get current messages for this community
      const communityMessages = state.messagesByCommunity[communityId] || [];
      
      // Prevent duplicate messages by checking if message with same _id already exists
      const messageExists = communityMessages.some((m) => m._id === message._id);
      if (messageExists) {
        console.log('Duplicate message ignored:', message._id);
        return state; // Don't add duplicate
      }

      const updatedCommunityMessages = [...communityMessages, message];
      const isActiveComm = state.activeCommunity?._id === communityId;
      
      console.log('Adding message to community:', communityId, 'Active community:', state.activeCommunity?._id, 'Is active:', isActiveComm);
      
      return {
        messagesByCommunity: {
          ...state.messagesByCommunity,
          [communityId]: updatedCommunityMessages,
        },
        // Only update the main messages array if this is the active community
        messages: isActiveComm ? updatedCommunityMessages : state.messages,
      };
    }),

  updateMessage: (messageId, updates) =>
    set((state) => {
      const updatedMessages = state.messages.map((m) =>
        m._id === messageId ? { ...m, ...updates } : m
      );
      
      // Also update in messagesByCommunity
      const updatedMessagesByCommunity = { ...state.messagesByCommunity };
      Object.keys(updatedMessagesByCommunity).forEach((communityId) => {
        updatedMessagesByCommunity[communityId] = updatedMessagesByCommunity[communityId].map((m) =>
          m._id === messageId ? { ...m, ...updates } : m
        );
      });

      return {
        messages: updatedMessages,
        messagesByCommunity: updatedMessagesByCommunity,
      };
    }),

  removeMessage: (messageId) =>
    set((state) => {
      const updatedMessages = state.messages.filter((m) => m._id !== messageId);
      
      // Also remove from messagesByCommunity
      const updatedMessagesByCommunity = { ...state.messagesByCommunity };
      Object.keys(updatedMessagesByCommunity).forEach((communityId) => {
        updatedMessagesByCommunity[communityId] = updatedMessagesByCommunity[communityId].filter((m) => m._id !== messageId);
      });

      return {
        messages: updatedMessages,
        messagesByCommunity: updatedMessagesByCommunity,
      };
    }),

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
