import { create } from "zustand";
import axiosInstance from "./../lib/axios";
import toast from "react-hot-toast";

const useAuthStore = create((set) => ({
  authUser: false,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  onlineUsers: [], // Temporary: will be populated when Socket.io is implemented
  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      set({ authUser: res.data.user });
      toast.success("Signup successful");
    } catch (error) {
      console.log("Error signing up:", error);
      set({ authUser: null });
      toast.error("Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", formData);
      set({ authUser: res.data.user });
      toast.success("Login successful");
    } catch (error) {
      console.log("Error logging in:", error);
      set({ authUser: null });
      toast.error("Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("Error logging out:", error);
      toast.error("Logout failed");
    } finally {
      set({ isLoggingOut: false });
    }
  },
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data.user || res.data });
    } catch (error) {
      console.log("Error checking auth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  updateProfile: async (profileData) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", profileData);
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error updating profile:", error);
      toast.error("Profile update failed");
    }
  },

  setOnlineUsers: (users) => {
    set({ onlineUsers: users });
  },
}));

export default useAuthStore;
