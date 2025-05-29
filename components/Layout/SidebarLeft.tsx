// app/components/LeftSidebar.tsx
import React from "react";

import { MenuIcon } from "../icons/menu_icon/MenuIcon";
import { getMenuList } from "@/lib/modules/system/menu/repositories/menu_repo";
import { Menu } from "@/lib/models/menu";

interface LeftSidebarProp {
  menus?: Menu[];
}

export default async function LeftSidebar({ menus }: LeftSidebarProp) {
  return (
    <aside className="w-64 bg-gray-800 text-white">
      <nav>
        <ul>
          {menus?.map((m) => (
            <li key={m.id} className="px-4 py-2 hover:bg-gray-700">
              <a href={m.slug} className="flex items-center space-x-2">
                {/* Thay vì tự mapping, chỉ gọi <MenuIcon> */}
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
