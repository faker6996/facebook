"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { getMessages } from "@/lib/i18n/getMessages";
import Button from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "vi";

  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    getMessages(locale as any).then(setMessages);
  }, [locale]);

  if (!messages) return null;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ErrorContent error={error} reset={reset} />
    </NextIntlClientProvider>
  );
}

function ErrorContent({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("ErrorPage");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-card text-card-foreground px-6">
      <div className="text-7xl mb-4">🚨</div>
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-muted-foreground mb-4">{t("message")}</p>
      <p className="text-destructive font-mono text-sm">{error.message}</p>

      <Button onClick={reset} className="mt-6 px-6 py-2 bg-destructive text-destructive-foreground hover:opacity-90 transition">
        {t("retry")} 🔄
      </Button>
    </div>
  );
}
