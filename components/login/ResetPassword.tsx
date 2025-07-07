import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { LOCALE } from "@/lib/constants/enum";
import { useTranslations } from "next-intl";

export default function ResetPassword() {
  /* ---------- hooks ---------- */
  const pathname = usePathname();
  const locale = (pathname?.split("/")[1] as LOCALE) || LOCALE.VI;

  const t = useTranslations("ResetPassword"); // namespace mới
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  /* ---------- state ---------- */
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  /* ---------- submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.ok) {
      setSuccess(true);
    } else {
      setMessage(data.message || t("errorDefault")); // dùng bản dịch
    }
  };

  /* ---------- UI ---------- */
  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4 text-center">
        <h2 className="text-xl font-semibold text-emerald-600">{t("successTitle")}</h2>

        {/* Button bọc Link với asChild */}
        <Button>
          <Link href={`/${locale}/login`}>{t("backToLogin")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-6">
      <h2 className="text-xl font-semibold">{t("heading")}</h2>

      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("passwordPlaceholder")} required />

      <Button type="submit">{t("submitButton")}</Button>

      {message && <p className="text-sm text-destructive break-words">{message}</p>}
    </form>
  );
}
