// lib/utils/api-client.ts

import axios, { AxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: '', // hoặc process.env.NEXT_PUBLIC_API_URL nếu gọi API ngoài
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm gọi API chung
export const callApi = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await api.request<T>({
      url,
      method,
      data,
      ...config,
    });

    return response.data;
  } catch (err: any) {
    console.error('[API ERROR]', err?.response?.data || err.message);
    throw err;
  }
};
