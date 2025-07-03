import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { LOCALE } from "@/lib/constants/enum";

export default function ResetPassword() {
  /* ---------- hooks ở cấp component (đúng quy tắc React) ---------- */
  const pathname = usePathname(); // <-- di chuyển ra đây
  const locale = (pathname?.split("/")[1] as LOCALE) || LOCALE.VI; // xác định locale
  const searchParams = useSearchParams(); // hook khác
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
      setMessage(data.message || "Đã có lỗi xảy ra");
    }
  };

  /* ---------- UI ---------- */
  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4 text-center">
        <h2 className="text-xl font-semibold text-emerald-600">Đổi mật khẩu thành công!</h2>

        {/* Button bọc Link với asChild (chuẩn shadcn/ui) */}
        <Button>
          <Link href={`/${locale}/login`}>Quay về trang đăng nhập</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-6">
      <h2 className="text-xl font-semibold">Đặt lại mật khẩu</h2>

      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu mới" required />

      <Button type="submit">Cập nhật</Button>

      {message && <p className="text-sm text-destructive break-words">{message}</p>}
    </form>
  );
}
