import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound.js";
import useChatStore from "../store/useChatStore.js";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, isSoundEnabled } = useChatStore();
  const handleSendMessage = async (e) => {
    e?.preventDefault(); // Prevent form submission

    if (!text.trim() && !imagePreview) {
      return;
    }

    if (isSoundEnabled) {
      playRandomKeyStrokeSound();
    }

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form only after successful send
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };
  return (
    <div className="p-3 md:p-4 border-t border-slate-700/50 bg-slate-800/30">
      {imagePreview && (
        <div className="max-w-4xl mx-auto mb-3 flex items-center px-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
              type="button"
            >
              <XIcon className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSendMessage}
        className="max-w-4xl mx-auto flex space-x-2 md:space-x-4 px-2"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            isSoundEnabled && playRandomKeyStrokeSound();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 md:py-3 px-3 md:px-4 text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          placeholder="Type your message..."
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-3 md:px-4 py-2 md:py-3 transition-colors ${
            imagePreview ? "text-cyan-500" : ""
          }`}
        >
          <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-3 md:px-4 py-2 md:py-3 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] flex items-center justify-center"
        >
          <SendIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
