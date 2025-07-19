"use client";

import { FacebookIcon, GoogleIcon } from "@/components/icons/SocialIcons";
import Input from "@/components/ui/Input";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, LOCALE } from "@/lib/constants/enum";
import { callApi } from "@/lib/utils/api-client";
import { triggerAuthChange } from "@/components/providers/SignalRInit";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "../ui/Button";
import { useToast } from "../ui/Toast";

interface SsoReq {
  redirectUrl: string;
}

export default function LoginContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || LOCALE.VI;
  const t = useTranslations("LoginPage");
  const { addToast } = useToast();

  const handleLoginWithFacebook = async () => {
    try {
      const res = await callApi<SsoReq>(API_ROUTES.AUTH.SSO_FACEBOOK, HTTP_METHOD_ENUM.POST, { locale });
      window.location.href = res?.redirectUrl!;
    } catch (err: any) {
      console.error("Facebook SSO error:", err);
      addToast({
        type: "error",
        message: err?.message || "Facebook đăng nhập thất bại"
      });
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      const res = await callApi<SsoReq>(API_ROUTES.AUTH.SSO_GOOGLE, HTTP_METHOD_ENUM.POST, { locale });
      window.location.href = res?.redirectUrl!;
    } catch (err: any) {
      console.error("Google SSO error:", err);
      addToast({
        type: "error",
        message: err?.message || "Google đăng nhập thất bại"
      });
    }
  };
  const handleEmailPasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      await callApi<void>(API_ROUTES.AUTH.LOGIN, HTTP_METHOD_ENUM.POST, { email, password });

      // Trigger SignalR initialization
      triggerAuthChange();
      
      router.push(`/${locale}`);
    } catch (err: any) {
      console.error(err);
      addToast({
        type: "error",
        message: err?.message || "Đăng nhập thất bại"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo + Heading */}
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
            A
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t("heading")}</h2>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-card text-card-foreground px-6 py-8 shadow sm:px-10">
          <form className="space-y-6" onSubmit={handleEmailPasswordLogin}>
            <Input
              label={t("emailLabel")}
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-border bg-input text-foreground px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />

            <Input
              label={t("passwordLabel")}
              type="password"
              name="password"
              required
              className="mt-1 block w-full rounded-md border border-border bg-input text-foreground px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                <span className="ml-2">{t("rememberMe")}</span>
              </label>
              <Link href={`/${locale}/forgot-password`} className="text-sm text-primary hover:underline font-medium">
                {t("forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full rounded-md bg-primary text-primary-foreground hover:brightness-110 font-medium shadow-sm transition"
            >
              {t("signInButton")}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center">
            <div className="w-full border-t border-border" />
            <div className="px-4 text-sm text-muted-foreground whitespace-nowrap">{t("dividerText")}</div>
            <div className="w-full border-t border-border" />
          </div>

          {/* Social Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button onClick={handleLoginWithGoogle} icon={GoogleIcon}>
              {t("social.google")}
            </Button>
            <Button onClick={handleLoginWithFacebook} icon={FacebookIcon}>
              {t("social.facebook")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
