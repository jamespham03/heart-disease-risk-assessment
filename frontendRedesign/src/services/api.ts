/**
 * API Service for Heart Disease Risk Assessment
 * 
 * This service connects the frontend to the Flask backend API.
 * It supports both real API calls and mock mode for development.
 */

import type { PredictRequest, PredictResponse } from '../types';
import mockApi from '../mocks/mockApi';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * Generic API request handler with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<{
  status: string;
  model_loaded: boolean;
  model_type: string | null;
}> {
  if (USE_MOCK) {
    return mockApi.healthCheck();
  }
  return apiRequest('/api/health');
}

/**
 * Get model information
 */
export async function getModelInfo(): Promise<{
  approach: string;
  model_name: string;
  f1_score: number;
  class_names: string[];
  severity_grouping: string;
  features_used: number;
}> {
  if (USE_MOCK) {
    return mockApi.getModelInfo();
  }
  return apiRequest('/api/model-info');
}

/**
 * Submit assessment for prediction
 */
export async function predict(data: PredictRequest): Promise<PredictResponse> {
  if (USE_MOCK) {
    return mockApi.predict(data);
  }
  
  return apiRequest<PredictResponse>('/api/predict', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Default export as API object
const api = {
  healthCheck,
  getModelInfo,
  predict,
};

export default api;
