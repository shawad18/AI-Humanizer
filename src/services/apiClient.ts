// Enhanced API Client with Real Backend Integration
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, REQUEST_CONFIG, ENDPOINTS } from '../config/api';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
  timestamp: string;
}

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.CURRENT.BASE_URL,
      ...REQUEST_CONFIG,
    });

    this.setupInterceptors();
    this.loadAuthToken();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        // Add API key if available
        const apiKey = localStorage.getItem('ai-humanizer-api-key');
        if (apiKey) {
          config.headers['X-API-Key'] = apiKey;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.handleTokenRefresh();
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private loadAuthToken() {
    this.authToken = localStorage.getItem('ai-humanizer-token');
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async handleTokenRefresh() {
    try {
      const refreshToken = localStorage.getItem('ai-humanizer-refresh-token');
      if (!refreshToken) {
        this.logout();
        return;
      }

      const response = await this.client.post(ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      });

      const { token, refreshToken: newRefreshToken } = response.data.data;
      this.setAuthToken(token);
      localStorage.setItem('ai-humanizer-refresh-token', newRefreshToken);
    } catch (error) {
      this.logout();
    }
  }

  private formatError(error: any): ApiError {
    return {
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.data?.code || error.code || 'UNKNOWN_ERROR',
      details: error.response?.data?.details,
      timestamp: new Date().toISOString(),
    };
  }

  public setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('ai-humanizer-token', token);
  }

  public logout() {
    this.authToken = null;
    localStorage.removeItem('ai-humanizer-token');
    localStorage.removeItem('ai-humanizer-refresh-token');
    localStorage.removeItem('ai-humanizer-user');
  }

  // Generic HTTP methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // File upload with progress
  public async uploadFile<T>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Batch requests
  public async batch<T>(requests: Array<{ method: string; url: string; data?: any }>): Promise<ApiResponse<T[]>> {
    const response = await this.client.post<ApiResponse<T[]>>('/batch', { requests });
    return response.data;
  }

  // Health check
  public async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/health');
  }

  // Get health status (alias for healthCheck to match test expectations)
  public async getHealth(): Promise<any> {
    const response = await this.get('/health');
    return response.data;
  }

  // Humanize text
  public async humanizeText(text: string, settings: any): Promise<any> {
    const response = await this.post('/humanize', { text, settings });
    return response.data;
  }

  // Detect AI-generated text
  public async detectAI(text: string): Promise<any> {
    const response = await this.post('/detect', { text });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;