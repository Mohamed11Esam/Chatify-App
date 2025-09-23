import useAuthStore from "../store/useAuthStore.js";

function ChatPage() {
    const {logout , isLoggingOut} = useAuthStore();
    return (
        <div className="z-10">
            chat page
            <button onClick={logout} disabled={isLoggingOut}>
                logout
            </button>
        </div>
    )
}

export default ChatPage
