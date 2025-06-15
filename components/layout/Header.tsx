import { useState } from "react";
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
import Avatar from "@/components/ui/Avatar";

export default function Header() {
  const [showMessenger, setShowMessenger] = useState(false);

  const toggleMessenger = () => {
    setShowMessenger((prev) => !prev);
  };

  return (
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
        <Button icon={FaThIcon} size="icon" className="bg-gray-300"></Button>
        <div className="relative">
          <Button icon={BsMessengerIcon} size="icon" className="bg-gray-300" onClick={toggleMessenger} />
          {showMessenger && <MessengerDropdown />}
        </div>
        <Button icon={FaBellIcon} size="icon" className="bg-gray-300"></Button>
        <Avatar src="" size="sm"></Avatar>
      </div>
    </header>
  );
}
