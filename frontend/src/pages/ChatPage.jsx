import ActiveTabSwitch from "../components/ActiveTabSwitch.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import ChatList from "../components/ChatList.jsx";
import ContactList from "../components/ContactList.jsx";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder.jsx";
import ProfileHeader from "../components/ProfileHeader.jsx";
import useAuthStore from "../store/useAuthStore.js";
import BorderAnimatedContainer from "./../components/BorderAnimete";
import { useChatStore } from "./../store/useChatStore";

function ChatPage() {
  const { logout, isLoggingOut } = useAuthStore();
  const { activeTabs, selectedUser, setSelectedUser } = useChatStore();

  return (
    <div className="relative w-full max-w-7xl mx-auto h-screen md:h-[800px]">
      <BorderAnimatedContainer>
        {/* Mobile: Show either sidebar or chat, Desktop: Show both */}

        {/* Sidebar - Hidden on mobile when chat is selected, always visible on desktop */}
        <div
          className={`
                   w-full md:w-80 lg:w-96 
                   bg-slate-800/50 backdrop-blur-sm flex flex-col
                   ${selectedUser ? "hidden md:flex" : "flex"}
               `}
        >
          <ProfileHeader />
          <ActiveTabSwitch />
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
            {activeTabs === "chats" ? <ChatList /> : <ContactList />}
          </div>
        </div>

        {/* Chat Area - Hidden on mobile when no chat selected, always visible when chat selected */}
        <div
          className={`
                   flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm
                   ${selectedUser ? "flex" : "hidden md:flex"}
               `}
        >
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}

export default ChatPage;
