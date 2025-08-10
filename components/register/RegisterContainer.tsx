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
import { loading } from "@/lib/utils/loading";
import { useState } from "react";

interface SsoReq {
  redirectUrl: string;
}

export default function RegisterContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || LOCALE.VI;
  const t = useTranslations("RegisterPage");
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterWithFacebook = async () => {
    loading.show(t("social.registeringFacebook"));
    try {
      const res = await callApi<SsoReq>(API_ROUTES.AUTH.SSO_FACEBOOK, HTTP_METHOD_ENUM.POST, { locale, register: true });
      window.location.href = res?.redirectUrl!;
    } catch (err: any) {
      console.error("Facebook SSO register error:", err);
      addToast({
        type: "error",
        message: err?.message || t("errors.facebookRegisterFailed"),
      });
    } finally {
      loading.hide();
    }
  };

  const handleRegisterWithGoogle = async () => {
    loading.show(t("social.registeringGoogle"));
    try {
      const res = await callApi<SsoReq>(API_ROUTES.AUTH.SSO_GOOGLE, HTTP_METHOD_ENUM.POST, { locale, register: true });
      window.location.href = res?.redirectUrl!;
    } catch (err: any) {
      console.error("Google SSO register error:", err);
      addToast({
        type: "error",
        message: err?.message || t("errors.googleRegisterFailed"),
      });
    } finally {
      loading.hide();
    }
  };

  const handleEmailPasswordRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      addToast({
        type: "error",
        message: t("errors.passwordMismatch"),
      });
      return;
    }

    if (formData.password.length < 6) {
      addToast({
        type: "error",
        message: t("errors.passwordTooShort"),
      });
      return;
    }

    loading.show(t("registering"));
    try {
      await callApi<any>(API_ROUTES.AUTH.REGISTER, HTTP_METHOD_ENUM.POST, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Trigger SignalR initialization
      triggerAuthChange();

      addToast({
        type: "success",
        message: t("registerSuccess"),
      });

      router.push(`/${locale}`);
    } catch (err: any) {
      console.error(err);
      addToast({
        type: "error",
        message: err?.message || t("errors.registerFailed"),
      });
    } finally {
      loading.hide();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo + Heading */}
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
            F
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t("heading")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-card text-card-foreground px-6 py-8 shadow sm:px-10">
          <form className="space-y-6" onSubmit={handleEmailPasswordRegister}>
            <Input
              label={t("nameLabel")}
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-border bg-input text-foreground px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />

            <Input
              label={t("emailLabel")}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-border bg-input text-foreground px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />

            <Input
              label={t("passwordLabel")}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-border bg-input text-foreground px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />

            <Input
              label={t("confirmPasswordLabel")}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-border bg-input text-foreground px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full rounded-md bg-primary text-primary-foreground hover:brightness-110 font-medium shadow-sm transition"
            >
              {t("signUpButton")}
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
            <Button onClick={handleRegisterWithGoogle} icon={GoogleIcon}>
              {t("social.google")}
            </Button>
            <Button onClick={handleRegisterWithFacebook} icon={FacebookIcon}>
              {t("social.facebook")}
            </Button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("alreadyHaveAccount")}{" "}
              <Link href={`/${locale}/login`} className="text-primary hover:underline font-medium">
                {t("signInLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}