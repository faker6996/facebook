// lib/utils/api-client.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "", // process.env.NEXT_PUBLIC_API_URL (nếu có)
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/**
 * Gửi request và **chỉ** trả `payload` (data) khi backend trả `success: true`.
 * Nếu backend trả `success: false` (lỗi nghiệp vụ) **hoặc** gặp lỗi hệ thống (network/5xx):
 *   • Hiển thị `window.alert`
 *   • Ném lỗi để caller tự `try/catch` khi cần
 */
export async function callApi<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  data?: any,
  config?: AxiosRequestConfig // ❶ không còn thuộc tính `silent`
): Promise<T> {
  console.log(`🔥 API Call: ${method} ${url}`, data);
  
  try {
    const res = await api.request({
      url,
      method,
      ...(method === "GET" ? { params: data } : { data }),
      ...config,
    });

    console.log(`✅ API Response: ${method} ${url}`, res.data);

    // Backend chuẩn hóa { success, message, data }
    const { success, message, data: payload } = res.data;

    if (!success) alert(message);

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
