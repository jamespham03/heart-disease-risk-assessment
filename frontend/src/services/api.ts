import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type { 
  Assessment, 
  Prediction, 
  ChatSession, 
  ChatMessage, 
  ChatHistory,
  AuthTokens,
  User
} from '../types';
import { mockApi } from '../mocks';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Enable mock mode via environment variable
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

class ApiService {
  private api: AxiosInstance;
  private useMock: boolean = USE_MOCK;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh and network errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Log network errors for debugging
        if (error.code === 'ERR_NETWORK' && !this.useMock) {
          console.warn('Network error - backend may be unavailable. Enable mock mode with VITE_USE_MOCK=true');
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.access_token);
              localStorage.setItem('refresh_token', response.refresh_token);
              
              originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.logout();
            window.location.href = '/';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Method to toggle mock mode at runtime
  setMockMode(enabled: boolean) {
    this.useMock = enabled;
    console.log(`Mock mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  isMockMode(): boolean {
    return this.useMock;
  }

  // ==================== AUTH ENDPOINTS ====================
  async register(userData: {
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    terms_accepted: boolean;
  }): Promise<AuthTokens> {
    if (this.useMock) {
      return mockApi.register(userData);
    }
    const response = await this.api.post<AuthTokens>('/api/auth/register', userData);
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    if (this.useMock) {
      return mockApi.login(email, password);
    }
    const response = await this.api.post<AuthTokens>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (this.useMock) {
      return mockApi.refreshToken(refreshToken);
    }
    const response = await this.api.post<AuthTokens>(
      '/api/auth/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    if (this.useMock) {
      return mockApi.getCurrentUser();
    }
    const response = await this.api.get<User>('/api/auth/me');
    return response.data;
  }

  logout() {
    if (this.useMock) {
      mockApi.logout();
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // ==================== ASSESSMENT ENDPOINTS ====================
  async startAssessment(sessionId: string, termsAccepted: boolean): Promise<Assessment> {
    if (this.useMock) {
      return mockApi.startAssessment(sessionId, termsAccepted);
    }
    const response = await this.api.post<Assessment>('/api/assessments/start', {
      session_id: sessionId,
      accepted: termsAccepted,
    });
    return response.data;
  }

  async getAssessment(sessionId: string): Promise<Assessment> {
    if (this.useMock) {
      return mockApi.getAssessment(sessionId);
    }
    const response = await this.api.get<Assessment>(`/api/assessments/${sessionId}`);
    return response.data;
  }

  async updateAssessment(sessionId: string, data: Partial<Assessment>): Promise<Assessment> {
    if (this.useMock) {
      return mockApi.updateAssessment(sessionId, data);
    }
    const response = await this.api.put<Assessment>(`/api/assessments/${sessionId}`, data);
    return response.data;
  }

  async completeAssessment(sessionId: string, data: Partial<Assessment>): Promise<Assessment> {
    if (this.useMock) {
      return mockApi.completeAssessment(sessionId, data);
    }
    const response = await this.api.post<Assessment>(
      `/api/assessments/${sessionId}/complete`,
      data
    );
    return response.data;
  }

  async getUserAssessments(skip = 0, limit = 10): Promise<Assessment[]> {
    if (this.useMock) {
      return mockApi.getUserAssessments(skip, limit);
    }
    const response = await this.api.get<Assessment[]>('/api/assessments/user/history', {
      params: { skip, limit },
    });
    return response.data;
  }

  // ==================== PREDICTION ENDPOINTS ====================
  async createPrediction(assessmentId: number): Promise<Prediction> {
    if (this.useMock) {
      return mockApi.createPrediction(assessmentId);
    }
    const response = await this.api.post<Prediction>('/api/predictions/predict', {
      assessment_id: assessmentId,
    });
    return response.data;
  }

  async getPrediction(predictionId: number): Promise<Prediction> {
    if (this.useMock) {
      return mockApi.getPrediction(predictionId);
    }
    const response = await this.api.get<Prediction>(`/api/predictions/${predictionId}`);
    return response.data;
  }

  async getPredictionByAssessment(assessmentId: number): Promise<Prediction> {
    if (this.useMock) {
      return mockApi.getPredictionByAssessment(assessmentId);
    }
    const response = await this.api.get<Prediction>(
      `/api/predictions/assessment/${assessmentId}`
    );
    return response.data;
  }

  // ==================== CHAT ENDPOINTS ====================
  async createChatSession(assessmentId: number): Promise<ChatSession> {
    if (this.useMock) {
      return mockApi.createChatSession(assessmentId);
    }
    const response = await this.api.post<ChatSession>('/api/chat/sessions', {
      assessment_id: assessmentId,
    });
    return response.data;
  }

  async sendChatMessage(sessionToken: string, content: string): Promise<ChatMessage> {
    if (this.useMock) {
      return mockApi.sendChatMessage(sessionToken, content);
    }
    const response = await this.api.post<ChatMessage>(
      `/api/chat/sessions/${sessionToken}/messages`,
      { content }
    );
    return response.data;
  }

  async getChatHistory(sessionToken: string): Promise<ChatHistory> {
    if (this.useMock) {
      return mockApi.getChatHistory(sessionToken);
    }
    const response = await this.api.get<ChatHistory>(`/api/chat/sessions/${sessionToken}`);
    return response.data;
  }

  async endChatSession(sessionToken: string): Promise<void> {
    if (this.useMock) {
      return mockApi.endChatSession(sessionToken);
    }
    await this.api.post(`/api/chat/sessions/${sessionToken}/end`);
  }

  // ==================== HEALTH CHECK ====================
  async healthCheck(): Promise<{ status: string }> {
    if (this.useMock) {
      return mockApi.healthCheck();
    }
    const response = await this.api.get('/api/health');
    return response.data;
  }

  // ==================== MODEL INFO ====================
  async getModelInfo(): Promise<any> {
    if (this.useMock) {
      return mockApi.getModelInfo();
    }
    const response = await this.api.get('/api/model-info');
    return response.data;
  }
}

export const api = new ApiService();
export default api;