import ActiveTabSwitch from "../components/ActiveTabSwitch.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import ChatList from "../components/ChatList.jsx";
import ContactList from "../components/ContactList.jsx";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder.jsx";
import ProfileHeader from "../components/ProfileHeader.jsx";
import useAuthStore from "../store/useAuthStore.js";
import BorderAnimatedContainer from './../components/BorderAnimete';
import { useChatStore } from './../store/useChatStore';

function ChatPage() {
    const {logout , isLoggingOut} = useAuthStore();
    const {activeTab,selectedUser} = useChatStore();
    return (
        <div className="relative w-full max-w-6xl md:h-[800px]">
           <BorderAnimatedContainer>
               {/* left side   */}
               <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
                   <ProfileHeader/>
                   <ActiveTabSwitch/>
                   <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {activeTab === 'chats' ? (
                            <ChatList/>
                        ) : (
                            <ContactList/>
                        )}
                   </div>
               </div>
               {/* right side */}
               <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
                   {selectedUser? <ChatContainer/> : <NoConversationPlaceholder/>}
               </div>
           </BorderAnimatedContainer>
        </div>
    )
}

export default ChatPage
