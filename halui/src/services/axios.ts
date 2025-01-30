import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types/error';
import { storage } from '../utils/storage';

const config: AxiosRequestConfig = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const AGENT_ID = import.meta.env.VITE_BASE_AGENT_ID;
const baseURL = `${import.meta.env.VITE_API_BASE_URL}/${AGENT_ID}`;

const api: AxiosInstance = axios.create({ baseURL, ...config });

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

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.status === 401) {
      storage.clear();
      window.location.href = '/';
      return response;
    }
    return response;
  },
  (error: AxiosError<ApiError>): Promise<never> => {
    if (error.response?.status == 401) {
      storage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
