"use client";

import { useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import Button from "./Button";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";
import { useLocale } from "@/hooks/useLocale";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
  // { code: "ko", name: "한국어", flag: "🇰🇷" },
  // { code: "ja", name: "日本語", flag: "🇯🇵" },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Common");
  const currentLocale = useLocale();
  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];

  const switchLanguage = (newLocale: string) => {
    // Replace the locale in the current path
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");

    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="bg-muted hover:bg-accent">
        <Globe className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            <div className="p-2">
              <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border mb-2">{t("language")}</div>

              {languages.map((language) => (
                <Button
                  key={language.code}
                  variant="ghost"
                  size="sm"
                  onClick={() => switchLanguage(language.code)}
                  className={cn("w-full justify-start gap-3 h-auto py-2 px-3", currentLocale === language.code && "bg-primary/10 text-primary")}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span className="flex-1 text-left">{language.name}</span>
                  {currentLocale === language.code && <div className="w-2 h-2 rounded-full bg-primary" />}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
