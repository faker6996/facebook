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

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-4 py-2 bg-background text-white shadow-md">
      {/* Left: Logo + Search */}
      <div className="flex items-center gap-2">
        <FacebookIcon className="w-10 h-10" />
        <div className="relative w-64">
          <Input type="text" placeholder="Tìm kiếm trên Facebook" />
        </div>
      </div>

      {/* Center: Navigation Icons */}
      <div className="flex gap-6 text-2xl">
        <Button icon={HomeIcon} variant="ghost"></Button>
        <Button icon={TvIcon} variant="ghost"></Button>
        <Button icon={StoreIcon} variant="ghost"></Button>
        <Button icon={UsersIcon} variant="ghost"></Button>
        <Button icon={GamepadIcon} variant="ghost"></Button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Button icon={FaThIcon} variant="circle"></Button>
        <Button icon={BsMessengerIcon} variant="circle"></Button>
        <Button icon={FaBellIcon} variant="circle"></Button>

        <img src="/avatar.jpg" alt="avatar" className="w-8 h-8 rounded-full cursor-pointer" />
      </div>
    </header>
  );
}
