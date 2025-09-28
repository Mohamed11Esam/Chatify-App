import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import useAuthStore from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTabs: "chats", // or "contacts"
  selectedUser: null,
  isUserLoading: false,
  isMessageLoading: false,
  isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",
  toggleSound: () => {
    const newValue = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", newValue.toString());
    set({ isSoundEnabled: newValue });
  },

  setActiveTab: (tab) => {
    set({ activeTabs: tab });
  },
  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },
  getAllContacts: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/message/contact");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch contacts");
    } finally {
      set({ isUserLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/message/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch chat partners"
      );
    } finally {
      set({ isUserLoading: false });
    }
  },
  getMessagesByUserId: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessageLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    if (!selectedUser || !authUser) {
      toast.error("Please select a user to send message");
      return;
    }

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // Add optimistic message immediately
    const updatedMessages = [...messages, optimisticMessage];
    set({ messages: updatedMessages });

    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );

      // Replace optimistic message with real message from server
      const finalMessages = updatedMessages
        .filter((msg) => msg._id !== tempId)
        .concat(res.data);
      set({ messages: finalMessages });
    } catch (error) {
      // Remove optimistic message on failure
      const revertedMessages = messages.filter((msg) => msg._id !== tempId);
      set({ messages: revertedMessages });
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },
  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("receiveMessage", (newMessage) => {
      console.log("Received message via socket:", newMessage);
      const { messages, selectedUser: currentSelectedUser } = get();

      // Handle populated senderId/receiverId (objects with _id) vs unpopulated (strings)
      const messageSenderId = newMessage.senderId?._id || newMessage.senderId;
      const messageReceiverId =
        newMessage.receiverId?._id || newMessage.receiverId;
      const currentUserId = currentSelectedUser._id;

      console.log("Message IDs check:", {
        messageSenderId,
        messageReceiverId,
        currentUserId,
        shouldAdd:
          messageSenderId === currentUserId ||
          messageReceiverId === currentUserId,
      });

      // Only add message if it's for the currently selected user conversation
      if (
        messageSenderId === currentUserId ||
        messageReceiverId === currentUserId
      ) {
        console.log("Adding message to chat");
        set({ messages: [...messages, newMessage] });
        if (isSoundEnabled) {
          const audio = new Audio("/sounds/notification.mp3");
          audio.play().catch(() => {}); // Ignore audio play errors
        }
      } else {
        console.log("Message not for current conversation, ignoring");
      }
    });
  },
  unSubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("receiveMessage");
    }
  },
}));
export default useChatStore;
