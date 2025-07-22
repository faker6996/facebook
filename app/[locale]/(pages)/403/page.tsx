"use client";

import { useTranslations } from "next-intl";

export default function ForbiddenPage() {
  const t = useTranslations("ForbiddenPage");

  return (
    <div style={{ textAlign: 'center', paddingTop: '10%' }}>
      <h1 style={{ fontSize: '48px', color: 'red' }}>{t("heading")}</h1>
      <p style={{ fontSize: '18px' }}>{t("message")}</p>
    </div>
  );
}
  