// app/forgot-password/page.tsx
"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, LOCALE } from "@/lib/constants/enum";
import { usePathname } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const pathname = usePathname();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Đang gửi...");
    const locale = pathname.split("/")[1] || LOCALE.VI;
    const res = await fetch(API_ROUTES.RESET_PASSWORD.REQUEST, {
      method: HTTP_METHOD_ENUM.POST,
      body: JSON.stringify({ email, locale }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      setStatus("Hướng dẫn đặt lại mật khẩu đã được gửi về email.");
    } else {
      const errorData = await res.json();
      setStatus(errorData.message || "Gửi thất bại.");
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Quên mật khẩu</h2>
      <Input type="userName" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập email của bạn" required />
      <Button type="submit">Gửi</Button>
      <p className="text-sm text-muted-foreground">{status}</p>
    </form>
  );
}
