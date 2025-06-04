// app/components/LeftSidebar.tsx
import React from "react";
import { MenuIcon } from "../icons/menu_icon/MenuIcon";
import { getMenuList } from "@/lib/modules/system/menu/repositories/menu_repo";
import { Menu } from "@/lib/models/menu";
import { cn } from "@/lib/utils/cn"; // nếu bạn có hàm merge className

interface LeftSidebarProps {
  menus?: Menu[];
  className?: string;
}

export default function LeftSidebar({ menus, className }: LeftSidebarProps) {
  return (
    <aside className={cn("w-64 bg-gray-800 text-white", className)}>
      <nav>
        <ul>
          {menus?.map((m) => (
            <li key={m.id} className="px-4 py-2 hover:bg-gray-700">
              <a href={m.slug} className="flex items-center space-x-2">
                <MenuIcon iconCode={m.icon ?? ""} className="w-6 h-6" />
                <span>{m.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
