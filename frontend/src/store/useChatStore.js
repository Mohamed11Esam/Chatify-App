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
}));
export default useChatStore;
