"use client";

import { callApi } from "@/lib/utils/api-client";
import { GoogleIcon, FacebookIcon } from "../icons/SocialIcons";
import Link from "next/link";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";

interface SsoReq {
  redirectUrl: string;
}

export default function LoginContainer() {
  const handleLoginWithFacebook = async () => {
    try {
      const res = await callApi<SsoReq>(API_ROUTES.AUTH.SSO_FACEBOOK, HTTP_METHOD_ENUM.POST);
      window.location.href = res.redirectUrl;
    } catch (err) {
      console.error("Facebook SSO error:", err);
      alert("Không thể đăng nhập bằng Facebook. Vui lòng thử lại.");
    }
  };
  const handleLoginWithGoogle = async () => {
    try {
      const res = await callApi<SsoReq>(API_ROUTES.AUTH.SSO_GOOGLE, HTTP_METHOD_ENUM.POST);
      window.location.href = res.redirectUrl;
    } catch (err) {
      console.error("Google SSO error:", err);
      alert("Không thể đăng nhập bằng Goolge. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo + Heading */}
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-lg">N</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in to your account</h2>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-white dark:bg-neutral-900 px-6 py-8 shadow sm:px-10">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="ml-2">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 py-2 px-4 text-white hover:bg-indigo-700 font-medium shadow-sm transition"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />

            <div className="px-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Or continue with</div>

            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>

          {/* Social Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleLoginWithGoogle()}
              className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
            >
              <GoogleIcon className="w-5 h-5" />
              Google
            </button>

            <button
              type="button"
              onClick={() => handleLoginWithFacebook()}
              className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
            >
              <FacebookIcon className="w-5 h-5" />
              Facebook
            </button>
          </div>

          {/* Bottom Trial Link */}
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
            Not a member?{" "}
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Start a 14 day free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
