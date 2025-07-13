// components/Header.tsx
import { useEffect, useState } from "react";
import { Menu, X, Search } from "lucide-react";
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
import { useResponsive } from "@/lib/utils/responsive";
import { cn } from "@/lib/utils/cn";

const MAX_MESSENGER_WINDOWS = 3; // Define the maximum number of chat windows

export default function Header() {
  const [showMessenger, setShowMessenger] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [user, setUser] = useState(new User());
  const [openConversations, setOpenConversations] = useState<MessengerPreview[]>([]);
  const { isMobile, isHydrated } = useResponsive();

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
      {/* Main Header */}
      <header className="fixed top-0 z-50 w-full h-16 flex items-center justify-between px-4 py-2 bg-card text-card-foreground shadow-md">
        {/* Mobile Layout */}
        {isHydrated && isMobile ? (
          <div className="flex items-center justify-between w-full">
            {/* Mobile Left: Logo + Search + Hamburger */}
            <div className="flex items-center gap-2 flex-1">
              <FacebookIcon className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1 max-w-xs">
                <Input 
                  type="text" 
                  placeholder="Tìm kiếm" 
                  className="h-9 text-sm"
                />
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="w-9 h-9 flex-shrink-0"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>

            {/* Mobile Right: Messenger + Avatar */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowMessenger(!showMessenger)}
                  className="w-9 h-9"
                >
                  <BsMessengerIcon className="w-5 h-5" />
                </Button>
                {showMessenger && (
                  <MessengerDropdown
                    onClose={() => setShowMessenger(false)}
                    onOpenConversation={handleOpenConversation}
                  />
                )}
              </div>

              <div className="relative">
                <Avatar
                  src={user?.avatar_url ?? "/avatar.png"}
                  size="sm"
                  className="cursor-pointer w-8 h-8"
                  onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                />
                {showAvatarMenu && (
                  <AvatarMenuItemContainer onClose={() => setShowAvatarMenu(false)} />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <>
            {/* Desktop Left: Logo + Search */}
            <div className="flex items-center gap-2">
              <FacebookIcon className="w-10 h-10" />
              <div className="relative w-64">
                <Input type="text" placeholder="Tìm kiếm trên Facebook" />
              </div>
            </div>

            {/* Desktop Center: Navigation Icons */}
            <div className="flex gap-6 text-2xl">
              <Button icon={HomeIcon} iConClassName="w-8 h-8" variant="ghost"></Button>
              <Button icon={TvIcon} iConClassName="w-8 h-8" variant="ghost"></Button>
              <Button icon={StoreIcon} variant="ghost"></Button>
              <Button icon={UsersIcon} variant="ghost"></Button>
              <Button icon={GamepadIcon} variant="ghost"></Button>
            </div>

            {/* Desktop Right: Actions */}
            <div className="flex items-center gap-3">
              <Button icon={FaThIcon} size="icon" className="bg-muted hover:bg-accent"></Button>
              <div className="relative">
                <Button 
                  icon={BsMessengerIcon} 
                  size="icon" 
                  className="bg-muted hover:bg-accent" 
                  onClick={() => setShowMessenger(!showMessenger)} 
                />
                {showMessenger && (
                  <MessengerDropdown 
                    onClose={() => setShowMessenger(false)} 
                    onOpenConversation={handleOpenConversation} 
                  />
                )}
              </div>
              <Button icon={FaBellIcon} size="icon" className="bg-muted hover:bg-accent"></Button>

              <div className="relative">
                <Avatar 
                  onClick={() => setShowAvatarMenu(!showAvatarMenu)} 
                  className="cursor-pointer" 
                  src={user.avatar_url} 
                  size="md"
                />
                {showAvatarMenu && (
                  <AvatarMenuItemContainer onClose={() => setShowAvatarMenu(false)} />
                )}
              </div>
            </div>
          </>
        )}
      </header>


      {/* Mobile Navigation Menu */}
      {isHydrated && isMobile && showMobileMenu && (
        <div className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-card">
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                icon={HomeIcon} 
                variant="ghost" 
                className="h-16 flex-col gap-2 text-center"
              >
                Trang chủ
              </Button>
              <Button 
                icon={TvIcon} 
                variant="ghost" 
                className="h-16 flex-col gap-2 text-center"
              >
                Video
              </Button>
              <Button 
                icon={StoreIcon} 
                variant="ghost" 
                className="h-16 flex-col gap-2 text-center"
              >
                Marketplace
              </Button>
              <Button 
                icon={UsersIcon} 
                variant="ghost" 
                className="h-16 flex-col gap-2 text-center"
              >
                Bạn bè
              </Button>
              <Button 
                icon={GamepadIcon} 
                variant="ghost" 
                className="h-16 flex-col gap-2 text-center"
              >
                Gaming
              </Button>
              <Button 
                icon={FaBellIcon} 
                variant="ghost" 
                className="h-16 flex-col gap-2 text-center"
              >
                Thông báo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Render open conversation windows with dynamic positioning */}
      {openConversations.map((conversation, index) => {
        // Calculate the right offset for each window
        // This will only affect desktop due to responsive classes in MessengerContainer
        const rightOffset = 16 + index * (336); // 16px base + index * (320px width + 16px gap)

        return (
          <MessengerContainer
            key={conversation.conversation_id}
            conversation={conversation}
            onClose={handleCloseConversation}
            // Pass a style prop for positioning - only used on desktop
            style={{ 
              right: `${rightOffset}px`
            }}
          />
        );
      })}
    </>
  );
}
