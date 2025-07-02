// components/Header.tsx
import { useEffect, useState } from "react";
import BsMessengerIcon from "../icons/BsMessengerIcon";
import FaBellIcon from "../icons/FaBellIcon";
import FaThIcon from "../icons/FaThIcon";
import GamepadIcon from "../icons/GamepadIcon";
import HomeIcon from "../icons/HomeIcon";
import { FacebookIcon } from "../icons/SocialIcons";
import StoreIcon from "../icons/StoreIcon";
import TvIcon from "../icons/TvIcon";
import UsersIcon from "../icons/UsersIcon";
import Button from "../ui/Button";
import Input from "../ui/Input";
import MessengerDropdown from "@/components/messenger/MessengerDropdown";
import MessengerContainer from "@/components/messenger/MessengerContainer";
import Avatar from "@/components/ui/Avatar";
import { User } from "@/lib/models/user";
import { loadFromLocalStorage } from "@/lib/utils/local-storage";
import AvatarMenuItemContainer from "@/components/AvatarMenuItem/AvatarMenuItemContainer";
import { MessengerPreview } from "@/lib/models/messenger_review";

const MAX_MESSENGER_WINDOWS = 3; // Define the maximum number of chat windows

export default function Header() {
  const [showMessenger, setShowMessenger] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [user, setUser] = useState(new User());
  const [openConversations, setOpenConversations] = useState<MessengerPreview[]>([]);

  useEffect(() => {
    setUser(loadFromLocalStorage("user", User));
  }, []);

  const toggleMessenger = () => {
    setShowMessenger((prev) => !prev);
  };

  const handleClickAvatar = () => {
    setShowAvatarMenu((prev) => !prev);
  };

  const handleOpenConversation = (conversation: MessengerPreview) => {
    setOpenConversations((prev) => {
      // Check if conversation is already open
      const isAlreadyOpen = prev.some((conv) => conv.conversation_id === conversation.conversation_id);

      if (isAlreadyOpen) {
        // If already open, bring it to the "most recent" position by moving it to the end
        const filtered = prev.filter((conv) => conv.conversation_id !== conversation.conversation_id);
        return [...filtered, conversation];
      } else {
        // If not open, add it
        let newConversations = [...prev, conversation];
        // If exceeding the limit, remove the oldest (first in array)
        if (newConversations.length > MAX_MESSENGER_WINDOWS) {
          newConversations = newConversations.slice(newConversations.length - MAX_MESSENGER_WINDOWS);
        }
        return newConversations;
      }
    });
    setShowMessenger(false); // Close the dropdown when a conversation is opened
  };

  const handleCloseConversation = (conversationId: number) => {
    setOpenConversations((prev) => prev.filter((conv) => conv.conversation_id !== conversationId));
  };

  return (
    <>
      <header className="fixed top-0 z-50 w-full h-16 flex items-center justify-between px-4 py-2 bg-card text-card-foreground shadow-md">
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-2">
          <FacebookIcon className="w-10 h-10" />
          <div className="relative w-64">
            <Input type="text" placeholder="Tìm kiếm trên Facebook" />
          </div>
        </div>

        {/* Center: Navigation Icons */}
        <div className="flex gap-6 text-2xl">
          <Button icon={HomeIcon} iConClassName="w-8 h-8" variant="ghost"></Button>
          <Button icon={TvIcon} iConClassName="w-8 h-8" variant="ghost"></Button>
          <Button icon={StoreIcon} variant="ghost"></Button>
          <Button icon={UsersIcon} variant="ghost"></Button>
          <Button icon={GamepadIcon} variant="ghost"></Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Button icon={FaThIcon} size="icon" className="bg-muted hover:bg-accent"></Button>
          <div className="relative">
            <Button icon={BsMessengerIcon} size="icon" className="bg-muted hover:bg-accent" onClick={toggleMessenger} />
            {showMessenger && <MessengerDropdown onCloseDropdown={() => setShowMessenger(false)} onOpenConversation={handleOpenConversation} />}
          </div>
          <Button icon={FaBellIcon} size="icon" className="bg-muted hover:bg-accent"></Button>

          <div className="relative">
            <Avatar onClick={() => handleClickAvatar()} className="cursor-pointer" src={user.avatar_url} size="md"></Avatar>
            {showAvatarMenu && <AvatarMenuItemContainer />}
          </div>
        </div>
      </header>

      {/* Render open conversation windows with dynamic positioning */}
      {openConversations.map((conversation, index) => {
        // Calculate the right offset for each window
        // Assuming each window has a width of 320px and a gap of ~16px (right-4, and we can add more if needed)
        const rightOffset = 16 + index * (320 + 16); // 16px from right + index * (width + gap)

        return (
          <MessengerContainer
            key={conversation.conversation_id}
            conversation={conversation}
            onClose={handleCloseConversation}
            // Pass a style prop for positioning
            style={{ right: `${rightOffset}px` }}
          />
        );
      })}
    </>
  );
}
