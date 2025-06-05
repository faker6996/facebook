import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// Optional: cấu hình mặc định cho axios
const api = axios.create({
  baseURL: "", // hoặc process.env.NEXT_PUBLIC_API_URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Các loại method phân biệt theo kiểu
type MethodWithBody = "POST" | "PUT" | "PATCH";
type MethodWithoutBody = "GET" | "DELETE";

// ✅ Overload 1: GET / DELETE → chỉ có params
export function callApi<TResponse>(
  url: string,
  method: MethodWithoutBody,
  params?: Record<string, any>,
  config?: AxiosRequestConfig
): Promise<TResponse>;

// ✅ Overload 2: POST / PUT / PATCH → có data và params
export function callApi<TResponse>(
  url: string,
  method: MethodWithBody,
  data?: any,
  params?: Record<string, any>,
  config?: AxiosRequestConfig
): Promise<TResponse>;

// ✅ Thực thi chung
export async function callApi<TResponse>(url: string, method: string, arg1?: any, arg2?: any, config?: AxiosRequestConfig): Promise<TResponse> {
  const isBodyMethod = ["POST", "PUT", "PATCH"].includes(method);

  const data = isBodyMethod ? arg1 : undefined;
  const params = isBodyMethod ? arg2 : arg1;

  const response: AxiosResponse<TResponse> = await api.request({
    url,
    method,
    data,
    params,
    ...config,
  });

  return response.data;
}
