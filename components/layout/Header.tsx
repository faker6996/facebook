// components/Header.tsx
import { useEffect, useState, useRef } from "react";
import { Menu, X, Search, Home, Tv, Store, Users, Gamepad2, Bell } from "lucide-react";
import BsMessengerIcon from "../icons/BsMessengerIcon";
import FaThIcon from "../icons/FaThIcon";
import { FacebookIcon } from "../icons/SocialIcons";
import Button from "../ui/Button";
import Input from "../ui/Input";
import MessengerDropdown from "@/components/messenger/MessengerDropdown";
import MessengerContainer from "@/components/messenger/MessengerContainer";
import Avatar from "@/components/ui/Avatar";
import { User } from "@/lib/models/user";
import { loadFromLocalStorage } from "@/lib/utils/local-storage";
import AvatarMenuItemContainer from "@/components/AvatarMenuItem/AvatarMenuItemContainer";
import { callApi } from "@/lib/utils/api-client";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessengerPreview } from "@/lib/models/messenger_review";
import { useResponsive } from "@/lib/utils/responsive";
import { cn } from "@/lib/utils/cn";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import ThemeToggle from "../ui/ThemeToggle";
import { useTranslations } from "next-intl";

const MAX_MESSENGER_WINDOWS = 3; // Define the maximum number of chat windows

export default function Header() {
  const [showMessenger, setShowMessenger] = useState(false);
  const messengerButtonRef = useRef<HTMLButtonElement>(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [user, setUser] = useState(new User());
  const [openConversations, setOpenConversations] = useState<MessengerPreview[]>([]);
  const { isMobile, isHydrated } = useResponsive();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "vi";
  const t = useTranslations('Common');

  useEffect(() => {
    // Load from localStorage first for immediate display
    const cachedUser = loadFromLocalStorage("user", User);
    setUser(cachedUser);
    
    // Then fetch fresh data from API - only if authenticated
    const fetchUserData = async () => {
      // Skip API call on public pages
      if (typeof window !== 'undefined' && 
          (window.location.pathname.includes('/login') || 
           window.location.pathname.includes('/register') ||
           window.location.pathname.includes('/forgot-password') ||
           window.location.pathname.includes('/reset-password'))) {
        return;
      }

      // Check if user is authenticated before calling API
      if (typeof document !== 'undefined' && !document.cookie.includes('access_token=')) {
        return;
      }

      try {
        const freshUser = await callApi<User>(API_ROUTES.AUTH.ME, HTTP_METHOD_ENUM.GET);
        if (freshUser) {
          setUser(freshUser);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    
    fetchUserData();
  }, []);

  const toggleMessenger = () => {
    setShowMessenger((prev) => !prev);
  };

  const handleClickAvatar = () => {
    setShowAvatarMenu((prev) => !prev);
  };

  const handleDoubleClickAvatar = () => {
    window.location.href = `/${locale}/profile`;
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
                <Input type="text" placeholder={t('search')} className="h-9 text-sm" />
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowMobileMenu(!showMobileMenu)} className="w-9 h-9 flex-shrink-0">
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>

            {/* Mobile Right: Language + Theme + Messenger + Avatar */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <div className="relative">
                <Button size="icon" variant="ghost" onClick={() => setShowMessenger(!showMessenger)} className="w-9 h-9">
                  <BsMessengerIcon className="w-5 h-5" />
                </Button>
                {showMessenger && (
                  <MessengerDropdown
                    onClose={() => setShowMessenger(false)}
                    onOpenConversation={handleOpenConversation}
                    triggerRef={messengerButtonRef}
                  />
                )}
              </div>

              <div className="relative">
                <Avatar
                  src={user?.avatar_url ?? "/avatar.png"}
                  size="sm"
                  className="cursor-pointer w-8 h-8"
                  onClick={handleClickAvatar}
                  onDoubleClick={handleDoubleClickAvatar}
                />
                {showAvatarMenu && <AvatarMenuItemContainer onClose={() => setShowAvatarMenu(false)} />}
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
                <Input type="text" placeholder={t('searchOnFacebook')} />
              </div>
            </div>

            {/* Desktop Center: Navigation Icons */}
            <div className="flex gap-6 text-2xl">
              <Button icon={Home} variant="ghost"></Button>
              <Button icon={Tv} variant="ghost"></Button>
              <Button icon={Store} variant="ghost"></Button>
              <Button icon={Users} variant="ghost"></Button>
              <Button icon={Gamepad2} variant="ghost"></Button>
            </div>

            {/* Desktop Right: Actions */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
              <Button icon={FaThIcon} size="icon" className="bg-muted hover:bg-accent"></Button>
              <div className="relative">
                <Button
                  ref={messengerButtonRef}
                  data-messenger-toggle="true"
                  icon={BsMessengerIcon}
                  size="icon"
                  className="bg-muted hover:bg-accent"
                  onClick={() => setShowMessenger(!showMessenger)}
                />
                {showMessenger && (
                  <MessengerDropdown
                    onClose={() => setShowMessenger(false)}
                    onOpenConversation={handleOpenConversation}
                    triggerRef={messengerButtonRef}
                  />
                )}
              </div>
              <Button icon={Bell} size="icon" className="bg-muted hover:bg-accent"></Button>

              <div className="relative">
                <Avatar 
                  onClick={handleClickAvatar} 
                  onDoubleClick={handleDoubleClickAvatar}
                  className="cursor-pointer" 
                  src={user.avatar_url} 
                  size="md" 
                />
                {showAvatarMenu && <AvatarMenuItemContainer onClose={() => setShowAvatarMenu(false)} />}
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
              <Button icon={Home} variant="ghost" className="h-16 flex-col gap-2 text-center">
                {t('home')}
              </Button>
              <Button icon={Tv} variant="ghost" className="h-16 flex-col gap-2 text-center">
                {t('video')}
              </Button>
              <Button icon={Store} variant="ghost" className="h-16 flex-col gap-2 text-center">
                {t('marketplace')}
              </Button>
              <Button icon={Users} variant="ghost" className="h-16 flex-col gap-2 text-center">
                {t('friends')}
              </Button>
              <Button icon={Gamepad2} variant="ghost" className="h-16 flex-col gap-2 text-center">
                {t('gaming')}
              </Button>
              <Button icon={Bell} variant="ghost" className="h-16 flex-col gap-2 text-center">
                {t('notifications')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Render open conversation windows with dynamic positioning */}
      {openConversations.map((conversation, index) => {
        // Calculate the right offset for each window
        // This will only affect desktop due to responsive classes in MessengerContainer
        const rightOffset = 16 + index * 336; // 16px base + index * (320px width + 16px gap)

        return (
          <MessengerContainer
            key={conversation.conversation_id}
            conversation={conversation}
            onClose={handleCloseConversation}
            // Pass a style prop for positioning - only used on desktop
            style={{
              right: `${rightOffset}px`,
            }}
          />
        );
      })}
    </>
  );
}
