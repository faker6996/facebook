"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface Tab {
  label: string;
  value: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultValue, className }) => {
  const [active, setActive] = React.useState<string>(defaultValue || tabs[0]?.value);

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="flex space-x-2 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActive(tab.value)}
            className={cn(
              "py-2 px-4 text-sm font-medium transition-colors duration-200 cursor-pointer",
              active === tab.value ? "text-white border-b-2 border-white" : "text-gray-400 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-lg text-gray-200">
        {tabs.find((tab) => tab.value === active)?.content}
      </div>
    </div>
  );
};
