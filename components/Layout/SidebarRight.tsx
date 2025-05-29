"use client";
import React from "react";
import { cn } from "@/lib/utils/cn"; // nếu bạn dùng clsx/tailwind-merge

interface SidebarRightProps {
  className?: string;
}

export default function SidebarRight({ className }: SidebarRightProps) {
  return (
    <aside className={cn("hidden xl:block w-[320px] shrink-0 overflow-y-auto border-l bg-neutral-900 text-white", className)}>
      <div className="p-4 space-y-3">
        <div className="font-bold text-xl">Được tài trợ</div>
        <div className="bg-neutral-800 p-2 rounded">🎯 Ads 1</div>
        <div className="bg-neutral-800 p-2 rounded">🎯 Ads 2</div>

        <div className="font-bold text-xl mt-4">💬 Chat</div>
        <div className="bg-neutral-800 p-2 rounded">👤 red flag</div>
      </div>
    </aside>
  );
}
