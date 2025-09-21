import { create } from "zustand";

const useAuthStore = create((set) => ({
    authUser: {name : "John Doe", _id: "12345" ,age: 30},
    isLoading : false,
    login: () => {console.log("we just logging") },
}));

export default useAuthStore;
