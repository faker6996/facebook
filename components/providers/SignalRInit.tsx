"use client";

import { useEffect, useState } from "react";
import { useGlobalSignalR } from "@/hooks/useGlobalSignalR";
import { User } from "@/lib/models/user";
import { callApi } from "@/lib/utils/api-client";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";

/**
 * Component để tự động khởi tạo SignalR khi user đã login
 * Đặt trong layout để đảm bảo SignalR hoạt động toàn cục
 */
export const SignalRInit: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { isConnected } = useGlobalSignalR(currentUser);

  // Lấy thông tin user hiện tại
  useEffect(() => {
    const getCurrentUser = async () => {
      // Skip API call on public pages
      if (typeof window !== 'undefined' && 
          (window.location.pathname.includes('/login') || 
           window.location.pathname.includes('/register') ||
           window.location.pathname.includes('/forgot-password') ||
           window.location.pathname.includes('/reset-password'))) {
        setCurrentUser(null);
        return;
      }

      // Check if user is authenticated before calling /api/auth/me
      if (typeof document !== 'undefined' && !document.cookie.includes('access_token=')) {
        setCurrentUser(null);
        return;
      }

      try {
        const user = await callApi<User>(API_ROUTES.AUTH.ME, HTTP_METHOD_ENUM.GET);
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.log('SignalRInit: Failed to get current user:', error);
        setCurrentUser(null);
      }
    };

    getCurrentUser();

    // Listen cho auth changes (có thể từ login/logout events)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_change") {
        getCurrentUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Log connection status for debugging
  useEffect(() => {
    if (currentUser) {
    }
  }, [currentUser, isConnected]);

  // Component này không render gì, chỉ quản lý connection
  return null;
};

/**
 * Helper function để trigger auth change event
 * Gọi sau khi login/logout thành công
 */
export const triggerAuthChange = () => {
  // Trigger storage event để SignalRInit refresh user
  localStorage.setItem("auth_change", Date.now().toString());
  localStorage.removeItem("auth_change");
};
