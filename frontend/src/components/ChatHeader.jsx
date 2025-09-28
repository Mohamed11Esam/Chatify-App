import { XIcon, ArrowLeftIcon } from "lucide-react";
import useChatStore from "../store/useChatStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { useEffect } from "react";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers?.includes(selectedUser?._id);
  
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setSelectedUser(null);
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [setSelectedUser]);
  
  return (
    <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 p-3 md:p-4 px-4 md:px-6">
      <div className="flex items-center space-x-3">
        {/* Mobile back button */}
        <button 
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-200 transition-colors"
          onClick={() => setSelectedUser(null)}
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="size-10 md:size-12 rounded-full overflow-hidden">
            <img
              src={selectedUser?.profilePicture || "/avatar.png"}
              alt={selectedUser?.fullName || "User Avatar"}
            />
          </div>
        </div>
        <div>
          <h3 className="text-slate-200 font-medium text-sm md:text-base">
            {selectedUser?.fullName || "Unknown User"}
          </h3>
          <p className="text-slate-400 text-xs md:text-sm">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      
      {/* Desktop close button */}
      <button className="hidden md:block">
        <XIcon
          className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          onClick={() => setSelectedUser(null)}
        />
      </button>
    </div>
  );
}

export default ChatHeader;
