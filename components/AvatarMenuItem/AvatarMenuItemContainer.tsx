"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import Avatar from "@/components/ui/Avatar";
import { User } from "@/lib/models/user";
import { loadFromLocalStorage } from "@/lib/utils/local-storage";

interface MenuItem {
  key: string;
  label: string;
  href?: string;
  shortcut?: string;
  icon: React.ReactNode;
}

const QuestionIcon = () => (
  <svg className="h-5 w-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
    <path d="..." />
  </svg>
);
const MonitorIcon = () => (
  <svg className="h-5 w-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
    <path d="..." />
  </svg>
);
const CommentIcon = () => (
  <svg className="h-5 w-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
    <path d="..." />
  </svg>
);
const LogoutIcon = () => (
  <svg className="h-5 w-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
    <path d="..." />
  </svg>
);

const menu: MenuItem[] = [
  {
    key: "settings",
    label: "Cài đặt và quyền riêng tư",
    icon: <GearIcon />,
  },
  {
    key: "help",
    label: "Trợ giúp và hỗ trợ",
    icon: <QuestionIcon />,
  },
  {
    key: "display",
    label: "Màn hình & trợ năng",
    icon: <MonitorIcon />,
  },
  {
    key: "feedback",
    label: "Đóng góp ý kiến",
    icon: <CommentIcon />,
  },
  {
    key: "logout",
    label: "Đăng xuất",
    icon: <LogoutIcon />,
  },
];

export default function AvatarMenuItemContainer() {
  const [open, setOpen] = useState(true); // mặc định mở, dùng toggle nếu cần
  const [user, setUser] = useState(new User());
  useEffect(() => {
    setUser(loadFromLocalStorage("user", User));
  }, []);

  if (!open) return null;

  return (
    <aside className="absolute top-14 right-0 z-50 w-96 bg-card text-card-foreground rounded-md shadow-lg border border-border">
      {/* Profile section */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-5">
        <Avatar className="cursor-pointer" src={user.avatar_url} size="md"></Avatar>
        <div>
          <p className="font-medium text-foreground">Tran Van Bach</p>
          <Link href="#" className="text-sm text-muted-foreground hover:underline">
            Xem tất cả trang cá nhân
          </Link>
        </div>
      </div>

      {/* Menu items */}
      <nav className="flex flex-col gap-1 px-2 py-4">
        {menu.map(({ key, label, href = "#", shortcut, icon }) => (
          <Link key={key} href={href} className="group flex items-center gap-3 rounded-md px-4 py-2 hover:bg-muted transition-colors">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted group-hover:bg-accent">{icon}</span>
            <span className="flex-1 text-sm font-medium text-foreground break-words">{label}</span>
            {shortcut && <span className="text-xs text-muted-foreground">{shortcut}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-2 px-6 pb-6 text-[11px] text-muted-foreground">
        <p className="flex flex-wrap gap-x-2 gap-y-1 leading-4">
          {["Quyền riêng tư", "Điều khoản", "Quảng cáo", "Lựa chọn quảng cáo", "Cookie", "Xem thêm"].map((text, i) => (
            <span key={text} className="flex items-center gap-1">
              <a href="#" className="hover:underline">
                {text}
              </a>
              {i < 5 && <span className="hidden sm:inline">·</span>}
            </span>
          ))}
        </p>
        <p className="text-xs">Meta © 2025</p>
      </div>
    </aside>
  );
}

function GearIcon() {
  return (
    <svg className="h-5 w-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 15.6a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Zm10.2-3.6c0-.56-.46-1.02-1.02-1.02h-1.14a8.013 8.013 0 0 0-1.26-3.04l.81-.8a1.02 1.02 0 0 0 0-1.44l-1.44-1.44a1.02 1.02 0 0 0-1.44 0l-.8.8A8.013 8.013 0 0 0 14.4 3.96V2.82A1.02 1.02 0 0 0 13.38 1.8h-2.76A1.02 1.02 0 0 0 9.6 2.82v1.14a8.013 8.013 0 0 0-3.04 1.26l-.8-.81a1.02 1.02 0 0 0-1.44 0L2.88 5.85a1.02 1.02 0 0 0 0 1.44l.8.8A8.013 8.013 0 0 0 2.4 10.98H1.26A1.02 1.02 0 0 0 .24 12v2.04c0 .56.46 1.02 1.02 1.02h1.14a8.013 8.013 0 0 0 1.26 3.04l-.81.8a1.02 1.02 0 0 0 0 1.44l1.44 1.44a1.02 1.02 0 0 0 1.44 0l.8-.8a8.013 8.013 0 0 0 3.04 1.26v1.14c0 .56.46 1.02 1.02 1.02h2.76c.56 0 1.02-.46 1.02-1.02v-1.14a8.013 8.013 0 0 0 3.04-1.26l.8.81c.4.4 1.04.4 1.44 0l1.44-1.44a1.02 1.02 0 0 0 0-1.44l-.8-.8a8.013 8.013 0 0 0 1.26-3.04h1.14c.56 0 1.02-.46 1.02-1.02V12Z" />
    </svg>
  );
}

// Tương tự thêm các icon khác:
