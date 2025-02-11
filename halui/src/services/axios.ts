import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types/error';
import { storage } from '../utils/storage';
import { getAccessToken } from '@privy-io/react-auth';

// 使用闭包管理刷新状态和队列
let isRefreshing = false;
let requestQueue: Array<() => void> = []; // 存储待重试请求的队列

const config: AxiosRequestConfig = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const AGENT_ID = import.meta.env.VITE_BASE_AGENT_ID;
const baseURL = `${import.meta.env.VITE_API_BASE_URL}/${AGENT_ID}`;

const api: AxiosInstance = axios.create({ baseURL, ...config });

// 请求拦截器（保持不变）
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// 响应拦截器（关键修改）
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // 处理 401 错误
    if (error.response?.status === 401 && originalRequest) {
      // 如果正在刷新 token，将请求加入队列
      if (isRefreshing) {
        return new Promise((resolve) => {
          requestQueue.push(() => resolve(api(originalRequest)));
        });
      }

      isRefreshing = true;

      try {
        // 获取新 token
        const newToken = await getAccessToken();
        if (!newToken) {
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // 存储新 token
        storage.setToken(newToken);

        // 重试队列中的请求
        requestQueue.forEach(cb => cb());
        requestQueue = []; // 清空队列

        // 重试原始请求
        return api(originalRequest);
      } catch (refreshError) {
        // 刷新 token 失败时跳转登录页
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
