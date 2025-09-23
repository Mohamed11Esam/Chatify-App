import { create } from "zustand";
import axiosInstance from "./../lib/axios";
import toast from "react-hot-toast";

const useAuthStore = create((set) => ({
  authUser: false,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      set({ authUser: res.data });
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
    try {
      const res = await axiosInstance.post("/auth/login", formData);
      set({ authUser: res.data });
      toast.success("Login successful");
    } catch (error) {
      console.log("Error logging in:", error);
      set({ authUser: null });
      toast.error("Login failed");
    }
    finally {
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
    }
    finally {
      set({ isLoggingOut: false });
    }
  },
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error checking auth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
}));

export default useAuthStore;
