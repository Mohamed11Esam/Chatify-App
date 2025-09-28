import { useEffect, useRef } from "react";
import useAuthStore from "../store/useAuthStore.js";
import useChatStore from "../store/useChatStore.js";
import ChatHeader from "./ChatHeader.jsx";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder.jsx";
import MessageInput from "./MessageInput.jsx";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton.jsx";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unSubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  useEffect(() => {
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
    }
    return () => {
      unSubscribeFromMessages();
    };
  }, [
    selectedUser?._id,
    getMessagesByUserId,
    subscribeToMessages,
    unSubscribeFromMessages,
  ]);
  const messageEndRef = useRef(null); // Ref for scrolling to the bottom

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-3 md:px-6 overflow-y-auto py-4 md:py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            {messages.map((msg) => {
              // Handle populated senderId (object with _id) vs unpopulated (string)
              const messageSenderId = msg.senderId?._id || msg.senderId;
              const isFromCurrentUser =
                messageSenderId?.toString() === authUser?._id?.toString();

              // Debug logging (remove in production)
              if (process.env.NODE_ENV === "development") {
                console.log("Message comparison:", {
                  msgSenderId: msg.senderId,
                  messageSenderIdExtracted: messageSenderId,
                  authUserId: authUser?._id,
                  isFromCurrentUser,
                  msgSenderIdString: messageSenderId?.toString(),
                  authUserIdString: authUser?._id?.toString(),
                });
              }

              return (
                <div
                  key={msg._id}
                  className={`chat ${
                    isFromCurrentUser ? "chat-end" : "chat-start"
                  }`}
                >
                  <div
                    className={`chat-bubble relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg ${
                      isFromCurrentUser
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Shared"
                        className="rounded-lg w-full max-w-xs sm:max-w-sm h-32 sm:h-40 md:h-48 object-cover"
                      />
                    )}
                    {msg.text && <p className="mt-2 text-sm md:text-base break-words">{msg.text}</p>}
                    <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            {/* 👇 scroll target */}
            <div ref={messageEndRef}></div>
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;
