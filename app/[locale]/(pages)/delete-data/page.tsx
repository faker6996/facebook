"use client";

import { useTranslations } from "next-intl";

export default function DeleteDataPage() {
  const t = useTranslations("DeleteDataPage");

  return (
    <div>
      <h1>{t("heading")}</h1>
      <p>{t("message")}</p>
    </div>
  );
}
  