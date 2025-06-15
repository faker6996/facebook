import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface MenuItem {
  key: string;
  label: string;
  href?: string;
  shortcut?: string;
  icon: React.ReactNode;
}

/**
 * Sidebar component inspired by Facebook mobile drawer.
 * - Pure TailwindCSS – NO external UI libraries.
 * - Accessible keyboard navigation & focussing.
 * - Fully typed with TypeScript.
 */
const AvatarMenuItemContainer: React.FC = () => {
  const [open, setOpen] = useState(false);

  const menu: MenuItem[] = [
    {
      key: "settings",
      label: "Cài đặt và quyền riêng tư",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 15.6a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Zm10.2-3.6c0-.56-.46-1.02-1.02-1.02h-1.14a8.013 8.013 0 0 0-1.26-3.04l.81-.8a1.02 1.02 0 0 0 0-1.44l-1.44-1.44a1.02 1.02 0 0 0-1.44 0l-.8.8A8.013 8.013 0 0 0 14.4 3.96V2.82A1.02 1.02 0 0 0 13.38 1.8h-2.76A1.02 1.02 0 0 0 9.6 2.82v1.14a8.013 8.013 0 0 0-3.04 1.26l-.8-.81a1.02 1.02 0 0 0-1.44 0L2.88 5.85a1.02 1.02 0 0 0 0 1.44l.8.8A8.013 8.013 0 0 0 2.4 10.98H1.26A1.02 1.02 0 0 0 .24 12v2.04c0 .56.46 1.02 1.02 1.02h1.14a8.013 8.013 0 0 0 1.26 3.04l-.81.8a1.02 1.02 0 0 0 0 1.44l1.44 1.44a1.02 1.02 0 0 0 1.44 0l.8-.8a8.013 8.013 0 0 0 3.04 1.26v1.14c0 .56.46 1.02 1.02 1.02h2.76c.56 0 1.02-.46 1.02-1.02v-1.14a8.013 8.013 0 0 0 3.04-1.26l.8.81c.4.4 1.04.4 1.44 0l1.44-1.44a1.02 1.02 0 0 0 0-1.44l-.8-.8a8.013 8.013 0 0 0 1.26-3.04h1.14c.56 0 1.02-.46 1.02-1.02V12Z" />
        </svg>
      ),
    },
    {
      key: "help",
      label: "Trợ giúp và hỗ trợ",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.25 15.5h-1.5v-1.5h1.5v1.5Zm1.2-5.55-.86.88c-.66.68-.99 1.24-.99 2.17h-1.5v-.25c0-.97.34-1.79 1.07-2.55l1.12-1.14c.46-.48.7-1.04.7-1.63 0-1.26-1.02-2.28-2.28-2.28S8.74 8.17 8.74 9.43H7.24a3.76 3.76 0 0 1 7.5 0c0 1.05-.4 1.9-1.29 2.62Z" />
        </svg>
      ),
    },
    {
      key: "display",
      label: "Màn hình & trợ năng",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v8h16V7H4Zm-1 12h18v2H3v-2Z" />
        </svg>
      ),
    },
    {
      key: "feedback",
      label: "Đóng góp ý kiến",
      shortcut: "⌘ B",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M2 3h20v14H6l-4 4V3Zm14 4H8v2h8V7Zm0 4H8v2h8v-2Z" />
        </svg>
      ),
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M14 17v2H3V5h11v2h2V5a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2h-2Zm5-10-1.4 1.4L20.17 11H8v2h12.17l-2.57 2.6L19 17l5-5-5-5Z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-80 max-w-full transform bg-zinc-900 text-gray-200 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Toggle button for mobile */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="absolute -right-10 top-4 inline-flex h-10 w-10 items-center justify-center rounded-r-md bg-zinc-800 text-white lg:hidden"
        aria-label="Toggle menu"
      >
        {/* Hamburger */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
        </svg>
      </button>

      {/* Profile */}
      <div className="flex items-center gap-4 border-b border-zinc-700 px-6 py-5">
        <Image
          src="https://picsum.photos/seed/bach/96"
          alt="Tran Van Bach"
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
          priority
        />
        <div>
          <p className="font-medium">Tran Van Bach</p>
          <Link href="#" className="text-sm text-zinc-400 hover:text-zinc-100">
            Xem tất cả trang cá nhân
          </Link>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-1 px-2 py-4">
        {menu.map(({ key, label, href = "#", shortcut, icon }) => (
          <Link
            key={key}
            href={href}
            className="group flex items-center gap-4 rounded-md px-4 py-3 hover:bg-zinc-800 focus:bg-zinc-800 focus:outline-none"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 group-hover:bg-zinc-700">{icon}</span>
            <span className="flex-1 text-sm font-medium">{label}</span>
            {shortcut && <span className="text-xs text-zinc-500">{shortcut}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-2 px-6 pb-6 text-[11px] text-zinc-500">
        <p className="flex flex-wrap gap-x-2 gap-y-1 leading-4">
          <a href="#" className="hover:underline">
            Quyền riêng tư
          </a>
          <span className="hidden sm:inline">·</span>
          <a href="#" className="hover:underline">
            Điều khoản
          </a>
          <span className="hidden sm:inline">·</span>
          <a href="#" className="hover:underline">
            Quảng cáo
          </a>
          <span className="hidden sm:inline">·</span>
          <a href="#" className="hover:underline">
            Lựa chọn quảng cáo
          </a>
          <span className="hidden sm:inline">·</span>
          <a href="#" className="hover:underline">
            Cookie
          </a>
          <span className="hidden sm:inline">·</span>
          <a href="#" className="hover:underline">
            Xem thêm
          </a>
        </p>
        <p className="text-xs">Meta © 2025</p>
      </div>
    </aside>
  );
};

export default AvatarMenuItemContainer;
