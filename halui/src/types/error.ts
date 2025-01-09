export interface ApiError {
  message: string;
  status?: number;
  data?: {
    message: string;
    [key: string]: unknown;
  };
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
} 