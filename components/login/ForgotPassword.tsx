"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, LOCALE } from "@/lib/constants/enum";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ForgotPassword() {
  /* ---------- hooks ---------- */
  const pathname = usePathname();
  const locale = (pathname.split("/")[1] as LOCALE) || LOCALE.VI;
  const t = useTranslations("ForgotPassword");

  /* ---------- state ---------- */
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  /* ---------- submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(t("sending"));

    const res = await fetch(API_ROUTES.RESET_PASSWORD.REQUEST, {
      method: HTTP_METHOD_ENUM.POST,
      body: JSON.stringify({ email, locale }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setStatus(t("sentSuccess"));
    } else {
      const errorData = await res.json();
      setStatus(errorData.message || t("errorDefault"));
    }
  };

  /* ---------- UI ---------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold">{t("heading")}</h2>

      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailPlaceholder")} required />

      <Button type="submit">{t("submitButton")}</Button>

      <p className="text-sm text-muted-foreground break-words">{status}</p>
    </form>
  );
}
