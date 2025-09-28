import useChatStore from "../store/useChatStore.js";

function ActiveTabSwitch() {
  const { activeTabs, setActiveTab } = useChatStore();
  return (
    <div className="tabs tabs-boxed bg-transparent p-2 m-2">
      <button
        onClick={() => setActiveTab("chats")}
        className={`tab text-sm md:text-base touch-manipulation ${
          activeTabs === "chats"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-slate-400"
        }`}
      >
        Chats
      </button>
      <button
        onClick={() => setActiveTab("contacts")}
        className={`tab text-sm md:text-base touch-manipulation ${
          activeTabs === "contacts"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-slate-400"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}

export default ActiveTabSwitch;
