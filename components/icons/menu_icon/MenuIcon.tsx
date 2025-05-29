import React from "react";
import FriendsIcon from "./FriendsIcon";
import MemoriesIcon from "./MemoriesIcon";
import SavedIcon from "./SavedIcon";
import GroupsIcon from "./GroupsIcon";
import VideoIcon from "./VideoIcon";
import MarketplaceIcon from "./MarketplaceIcon";
import FeedIcon from "./FeedIcon";
import FundraisersIcon from "./FundraisersIcon";
import GamesIcon from "./GamesIcon";
import OrdersIcon from "./OrdersIcon";
import DatingIcon from "./DatingIcon";
import AdActivityIcon from "./AdActivityIcon";
import MessengerIcon from "./MessengerIcon";
import MessengerKidsIcon from "./MessengerKidsIcon";
import ReelsIcon from "./ReelsIcon";
import BirthdaysIcon from "./BirthdaysIcon";

// Icon map để dễ tra cứu
const MenuIconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  friends: FriendsIcon,
  memories: MemoriesIcon,
  saved: SavedIcon,
  groups: GroupsIcon,
  video: VideoIcon,
  marketplace: MarketplaceIcon,
  feed: FeedIcon,
  fundraisers: FundraisersIcon,
  games: GamesIcon,
  orders: OrdersIcon,
  dating: DatingIcon,
  ad_activity: AdActivityIcon,
  messenger: MessengerIcon,
  messenger_kids: MessengerKidsIcon,
  reels: ReelsIcon,
  birthdays: BirthdaysIcon,
};

// Component render icon theo iconCode
export const MenuIcon = ({ iconCode, className }: { iconCode: string; className?: string }) => {
  const IconComponent = MenuIconMap[iconCode];
  return IconComponent ? <IconComponent className={className} /> : null;
};
