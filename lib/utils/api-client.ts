// lib/utils/api-client.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";

// Function to get JWT token from cookie
function getJwtToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
  
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  
  return null;
}

const api = axios.create({
  baseURL: "", // process.env.NEXT_PUBLIC_API_URL (nếu có)
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Add request interceptor to include JWT token in Authorization header
api.interceptors.request.use((config) => {
  const token = getJwtToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Gửi request và **chỉ** trả `payload` (data) khi backend trả `success: true`.
 * Nếu backend trả `success: false` (lỗi nghiệp vụ) **hoặc** gặp lỗi hệ thống (network/5xx):
 *   • Hiển thị `window.alert` (trừ auth endpoints)
 *   • Ném lỗi để caller tự `try/catch` khi cần
 */
export async function callApi<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  data?: any,
  config?: AxiosRequestConfig & { 
    silent?: boolean; // Add silent option
  }
): Promise<T> {
  try {
    const res = await api.request({
      url,
      method,
      ...(method === "GET" ? { params: data } : { data }),
      ...config,
    });

    // Backend chuẩn hóa { success, message, data }
    const { success, message, data: payload } = res.data;

    // Don't show alert for auth endpoints or when silent flag is set
    const isAuthEndpoint = url.includes('/auth/');
    const shouldShowAlert = !config?.silent && !isAuthEndpoint;
    
    if (!success) {
      if (shouldShowAlert) {
        alert(message);
      }
      throw new Error(message); // Always throw error for failed API calls
    }

    return payload as T;

    /* ---------- LỖI NGHIỆP VỤ (HTTP 200, success=false) ---------- */
  } catch (err) {
    /* ---------- LỖI HỆ THỐNG (network, 5xx, timeout, JSON sai) ---------- */
    const axiosErr = err as AxiosError;
    const msg = (axiosErr.response?.data as any)?.message || axiosErr.message || "Internal Server Error";

    console.error(`❌ API Error: ${method} ${url}`, err);
    console.error("Error response:", axiosErr.response?.data);
    console.error("Error status:", axiosErr.response?.status);
    
    throw new Error(msg);
  }
}
