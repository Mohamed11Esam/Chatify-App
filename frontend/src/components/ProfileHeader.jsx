import { useState, useRef } from "react";
import { LogOut, VolumeOffIcon, Volume2Icon } from "lucide-react";
import useAuthStore from "../store/useAuthStore.js";
import { useChatStore } from "../store/useChatStore.js";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, isLoggingOut, updateProfile, authUser } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const fileInputRef = useRef(null);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result;
        setSelectedImg(base64data);
        await updateProfile({ profilePicture: base64data })
    };
  };
  return (
    <div className="p-4 border-b border-slate-700/50">
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-3">
          {/* avatar */}
          <div className="avatar online">
            <button
              className="size-14 rounded-full overflow-hidden relative group"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={selectedImg || authUser?.user.profilePicture || "/avatar.png"}
                alt="avatar image"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">Change</span>
              </div>
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden"
            />
          </div>
          <div>
            {/* userName and online text */}
            <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">
              {authUser?.user.fullName}
            </h3>
            <p className="text-slate-400 text-sm">Online</p>
          </div>
        </div>
        {/* buttons */}
        <div className="flex gap-4 items-center">
          <button onClick={()=>{
            mouseClickSound.currentTime = 0;
            mouseClickSound.play().catch((error) => {console.log("Error playing sound:", error);});
            toggleSound();
          }} className="size-5">
            {isSoundEnabled ? <Volume2Icon /> : <VolumeOffIcon />}
          </button>
          <button onClick={logout} disabled={isLoggingOut} className="size-5">
            <LogOut />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
