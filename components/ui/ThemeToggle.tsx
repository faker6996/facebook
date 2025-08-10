"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import Button from "./Button";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Common');

  const themes = [
    {
      value: 'light' as const,
      label: t('lightTheme'),
      icon: Sun,
    },
    {
      value: 'dark' as const,
      label: t('darkTheme'),
      icon: Moon,
    },
    {
      value: 'system' as const,
      label: t('systemTheme'),
      icon: Monitor,
    },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-muted hover:bg-accent"
      >
        <CurrentIcon className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            <div className="p-2">
              <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border mb-2">
                {t('theme')}
              </div>
              
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                return (
                  <Button
                    key={themeOption.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTheme(themeOption.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full justify-start gap-3 h-auto py-2 px-3",
                      theme === themeOption.value && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{themeOption.label}</span>
                    {theme === themeOption.value && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}