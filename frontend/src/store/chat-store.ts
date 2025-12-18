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
  readBy?: string[];
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
  joinCommunity: (communityId: string) => Promise<ICommunity>;
  clearMessagesCache: (communityId?: string) => void;
  addMessage: (message: Message) => void;
  deleteMessage: (messageId: string) => void;
  editMessage: (messageId: string, content: string) => void;
  markMessageAsRead: (messageId: string, userId: string) => void;
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

    // Check if user is in members or admins array
    const isInMembers = community.members?.some(member => member._id === userId) || false;
    const isInAdmins = community.admins?.some(admin => admin._id === userId) || false;

    return isInMembers || isInAdmins;
  },

  joinCommunity: async (communityId) => {
    const { CommunityActions } = await import("@/api-actions/community-actions");

    // Join the community
    await CommunityActions.JoinCommunityAction(communityId);

    // Fetch updated community data
    const fullCommunity = await CommunityActions.GetCommunityByIdAction(communityId);

    // Update store
    const state = get();
    const existingIndex = state.myCommunities.findIndex((c) => c._id === communityId);

    if (existingIndex >= 0) {
      // Update existing community
      const updatedCommunities = [...state.myCommunities];
      updatedCommunities[existingIndex] = fullCommunity;
      set({ myCommunities: updatedCommunities });
    } else {
      // Add new community
      set({ myCommunities: [...state.myCommunities, fullCommunity] });
    }

    // Update active community if it's the one being joined
    if (state.activeCommunity?._id === communityId) {
      set({ activeCommunity: fullCommunity });
    }

    // Join the socket room
    const { socketService } = await import("@/lib/socket");
    socketService.joinCommunity(communityId);

    return fullCommunity;
  },

  clearMessagesCache: (communityId) => {
    set((state) => {
      if (communityId) {
        // Clear cache for specific community
        const { [communityId]: _, ...rest } = state.messagesByCommunity;
        return {
          messagesByCommunity: rest,
          messages: state.activeCommunity?._id === communityId ? [] : state.messages,
        };
      } else {
        // Clear all message cache
        return {
          messagesByCommunity: {},
          messages: [],
        };
      }
    });
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

  deleteMessage: async (messageId) => {
    const { socketService } = await import("@/lib/socket");
    socketService.deleteMessage(messageId);
  },

  editMessage: async (messageId, content) => {
    const { socketService } = await import("@/lib/socket");
    socketService.editMessage(messageId, content);
  },

  markMessageAsRead: async (messageId, userId) => {
    // Optimistically update the UI
    set((state) => {
      const updateMessageReadBy = (message: Message) => {
        if (message._id === messageId && !message.readBy?.includes(userId)) {
          return {
            ...message,
            readBy: [...(message.readBy || []), userId]
          };
        }
        return message;
      };

      const updatedMessages = state.messages.map(updateMessageReadBy);

      // Also update in messagesByCommunity
      const updatedMessagesByCommunity = { ...state.messagesByCommunity };
      Object.keys(updatedMessagesByCommunity).forEach((communityId) => {
        updatedMessagesByCommunity[communityId] = updatedMessagesByCommunity[communityId].map(updateMessageReadBy);
      });

      return {
        messages: updatedMessages,
        messagesByCommunity: updatedMessagesByCommunity,
      };
    });

    // Send to server
    try {
      const { socketService } = await import("@/lib/socket");
      socketService.markMessageAsRead(messageId);
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  },

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
