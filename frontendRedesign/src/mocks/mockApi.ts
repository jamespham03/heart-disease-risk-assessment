/**
 * Mock API Service for Heart Disease Risk Assessment
 * 
 * This service simulates the backend API endpoints with realistic delays
 * and responses. Use this for frontend development without the actual backend.
 * 
 * Features:
 * - Simulates network delay (configurable)
 * - Implements the same prediction logic as the backend
 * - Provides realistic error handling
 * - Maintains session state in memory
 */

import type {
  User,
  Assessment,
  Prediction,
  AuthTokens,
} from '../types';

import {
  mockUsers,
  mockAssessments,
  mockPredictions,
  mockRecommendations,
  mockModelInfo,
  mockHealthCheck,
  actionItemsByRisk,
  type PredictRequest,
  type PredictResponse,
} from './mockData';

// ==================== CONFIGURATION ====================
const MOCK_DELAY_MS = 500; // Simulate network latency
const ENABLE_RANDOM_ERRORS = false; // Set to true to test error handling
const ERROR_RATE = 0.1; // 10% chance of error when enabled

// ==================== HELPER FUNCTIONS ====================

/**
 * Simulate network delay
 */
const delay = (ms: number = MOCK_DELAY_MS): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate unique IDs
 */
let idCounter = 100;
const generateId = (): number => ++idCounter;

/**
 * Generate unique session/token strings
 */
const generateToken = (): string => 
  `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Simulate random errors for testing
 */
const maybeThrowError = (): void => {
  if (ENABLE_RANDOM_ERRORS && Math.random() < ERROR_RATE) {
    throw new Error('Simulated network error');
  }
};

/**
 * Get current timestamp in ISO format
 */
const now = (): string => new Date().toISOString();

// ==================== IN-MEMORY STATE ====================

// Store for dynamically created data
const state = {
  users: [...mockUsers],
  assessments: [...mockAssessments],
  predictions: [...mockPredictions],
  currentUser: null as User | null,
  accessToken: null as string | null,
};

// ==================== PREDICTION LOGIC (matches backend) ====================

/**
 * Calculate risk prediction based on input features
 * This simulates the backend ML model logic
 */
function calculatePrediction(data: PredictRequest): PredictResponse {
  // Apply defaults for optional fields (matching backend logic)
  const age = Number(data.age);
  const trestbps = data.trestbps ? Number(data.trestbps) : 130;
  const chol = data.chol ? Number(data.chol) : 200;
  const thalch = data.thalch ? Number(data.thalch) : (220 - age);
  const oldpeak = data.oldpeak !== undefined ? Number(data.oldpeak) : 0;
  
  // Normalize exang to boolean
  const exang = data.exang === true || data.exang === 'true';
  
  // Calculate a risk score based on clinical features
  let riskScore = 0;
  
  // Age factor (older = higher risk)
  if (age > 60) riskScore += 25;
  else if (age > 50) riskScore += 15;
  else if (age > 40) riskScore += 8;
  
  // Sex factor (male typically higher risk in studies)
  if (data.sex === 'male') riskScore += 10;
  
  // Chest pain type
  const cpRisk: { [key: string]: number } = {
    'typical angina': 25,
    'atypical angina': 15,
    'non-anginal': 5,
    'asymptomatic': 0,
  };
  riskScore += cpRisk[data.cp.toLowerCase()] || 0;
  
  // Blood pressure
  if (trestbps > 160) riskScore += 20;
  else if (trestbps > 140) riskScore += 12;
  else if (trestbps > 130) riskScore += 6;
  
  // Cholesterol
  if (chol > 280) riskScore += 20;
  else if (chol > 240) riskScore += 12;
  else if (chol > 200) riskScore += 6;
  
  // Exercise-induced angina
  if (exang) riskScore += 20;
  
  // ST depression (oldpeak)
  if (oldpeak > 3) riskScore += 25;
  else if (oldpeak > 2) riskScore += 18;
  else if (oldpeak > 1) riskScore += 10;
  
  // Fasting blood sugar
  const fbs = data.fbs === true || data.fbs === 'true';
  if (fbs) riskScore += 8;
  
  // Max heart rate (lower = higher risk)
  const expectedMaxHR = 220 - age;
  if (thalch < expectedMaxHR * 0.6) riskScore += 15;
  else if (thalch < expectedMaxHR * 0.7) riskScore += 8;
  
  // ST slope
  const slopeRisk: { [key: string]: number } = {
    'downsloping': 20,
    'flat': 10,
    'upsloping': 0,
  };
  riskScore += slopeRisk[(data.slope || 'upsloping').toLowerCase()] || 0;
  
  // Number of major vessels
  const ca = data.ca !== undefined ? parseFloat(String(data.ca)) : 0;
  riskScore += ca * 15;
  
  // Thalassemia
  const thalRisk: { [key: string]: number } = {
    'reversable defect': 25,
    'fixed defect': 20,
    'normal': 0,
  };
  riskScore += thalRisk[(data.thal || 'normal').toLowerCase()] || 0;
  
  // Normalize score to 0-100
  riskScore = Math.min(Math.max(riskScore, 0), 100);
  
  // Determine prediction class based on score
  let prediction: number;
  let probabilities: { '0': number; '1': number; '2': number };
  let riskCategory: string;
  let riskColor: string;
  let actionItems: string[];
  
  if (riskScore < 35) {
    prediction = 0;
    probabilities = {
      '0': 0.70 + Math.random() * 0.20,
      '1': 0.05 + Math.random() * 0.15,
      '2': 0.02 + Math.random() * 0.08,
    };
    riskCategory = 'No Disease';
    riskColor = '#4CAF50';
    actionItems = actionItemsByRisk.noDisease;
  } else if (riskScore < 65) {
    prediction = 1;
    probabilities = {
      '0': 0.10 + Math.random() * 0.20,
      '1': 0.55 + Math.random() * 0.25,
      '2': 0.05 + Math.random() * 0.15,
    };
    riskCategory = 'Mild-Moderate';
    riskColor = '#FF9800';
    actionItems = actionItemsByRisk.mildModerate;
  } else {
    prediction = 2;
    probabilities = {
      '0': 0.03 + Math.random() * 0.10,
      '1': 0.07 + Math.random() * 0.15,
      '2': 0.65 + Math.random() * 0.25,
    };
    riskCategory = 'Severe-Critical';
    riskColor = '#E91E63';
    actionItems = actionItemsByRisk.severeCritical;
  }
  
  // Normalize probabilities to sum to 1
  const total = probabilities['0'] + probabilities['1'] + probabilities['2'];
  probabilities['0'] = Number((probabilities['0'] / total).toFixed(4));
  probabilities['1'] = Number((probabilities['1'] / total).toFixed(4));
  probabilities['2'] = Number((probabilities['2'] / total).toFixed(4));
  
  const confidence = probabilities[String(prediction) as '0' | '1' | '2'];
  
  return {
    success: true,
    data: {
      prediction,
      confidence,
      probabilities,
      risk_category: riskCategory,
      risk_color: riskColor,
      action_items: actionItems,
    },
  };
}

// ==================== MOCK API CLASS ====================

class MockApiService {
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
    await delay();
    maybeThrowError();
    
    // Check if email already exists
    if (state.users.find(u => u.email === userData.email)) {
      throw { response: { data: { detail: 'Email already registered' } } };
    }
    
    const newUser: User = {
      id: generateId(),
      email: userData.email,
      full_name: userData.full_name,
      phone: userData.phone,
      date_of_birth: userData.date_of_birth,
      gender: userData.gender,
      is_active: true,
      created_at: now(),
      terms_accepted: userData.terms_accepted,
    };
    
    state.users.push(newUser);
    state.currentUser = newUser;
    state.accessToken = generateToken();
    
    return {
      access_token: state.accessToken,
      refresh_token: generateToken(),
      token_type: 'bearer',
      user: newUser,
    };
  }
  
  async login(email: string, _password: string): Promise<AuthTokens> {
    await delay();
    maybeThrowError();
    
    // For mock, accept any password for existing users
    const user = state.users.find(u => u.email === email);
    
    if (!user) {
      throw { response: { data: { detail: 'Invalid email or password' } } };
    }
    
    state.currentUser = user;
    state.accessToken = generateToken();
    
    return {
      access_token: state.accessToken,
      refresh_token: generateToken(),
      token_type: 'bearer',
      user,
    };
  }
  
  async refreshToken(_refreshToken: string): Promise<AuthTokens> {
    await delay(200);
    
    if (!state.currentUser) {
      throw { response: { status: 401, data: { detail: 'Invalid refresh token' } } };
    }
    
    state.accessToken = generateToken();
    
    return {
      access_token: state.accessToken,
      refresh_token: generateToken(),
      token_type: 'bearer',
      user: state.currentUser,
    };
  }
  
  async getCurrentUser(): Promise<User> {
    await delay(200);
    
    if (!state.currentUser) {
      throw { response: { status: 401, data: { detail: 'Not authenticated' } } };
    }
    
    return state.currentUser;
  }
  
  logout(): void {
    state.currentUser = null;
    state.accessToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
  
  // ==================== ASSESSMENT ENDPOINTS ====================
  
  async startAssessment(sessionId: string, _termsAccepted: boolean): Promise<Assessment> {
    await delay();
    maybeThrowError();
    
    // Check if assessment already exists
    let assessment = state.assessments.find(a => a.session_id === sessionId);
    
    if (!assessment) {
      assessment = {
        id: generateId(),
        user_id: state.currentUser?.id,
        session_id: sessionId,
        status: 'in_progress',
        started_at: now(),
        current_page: 1,
        total_pages: 5,
      };
      state.assessments.push(assessment);
    }
    
    return assessment;
  }
  
  async getAssessment(sessionId: string): Promise<Assessment> {
    await delay(300);
    maybeThrowError();
    
    const assessment = state.assessments.find(a => a.session_id === sessionId);
    
    if (!assessment) {
      throw { response: { status: 404, data: { detail: 'Assessment not found' } } };
    }
    
    return assessment;
  }
  
  async updateAssessment(sessionId: string, data: Partial<Assessment>): Promise<Assessment> {
    await delay();
    maybeThrowError();
    
    const index = state.assessments.findIndex(a => a.session_id === sessionId);
    
    if (index === -1) {
      throw { response: { status: 404, data: { detail: 'Assessment not found' } } };
    }
    
    state.assessments[index] = {
      ...state.assessments[index],
      ...data,
    };
    
    return state.assessments[index];
  }
  
  async completeAssessment(sessionId: string, data: Partial<Assessment>): Promise<Assessment> {
    await delay(800);
    maybeThrowError();
    
    const index = state.assessments.findIndex(a => a.session_id === sessionId);
    
    if (index === -1) {
      throw { response: { status: 404, data: { detail: 'Assessment not found' } } };
    }
    
    state.assessments[index] = {
      ...state.assessments[index],
      ...data,
      status: 'completed',
      completed_at: now(),
      current_page: 5,
    };
    
    return state.assessments[index];
  }
  
  async getUserAssessments(skip = 0, limit = 10): Promise<Assessment[]> {
    await delay();
    
    const userAssessments = state.currentUser
      ? state.assessments.filter(a => a.user_id === state.currentUser?.id)
      : state.assessments;
    
    return userAssessments.slice(skip, skip + limit);
  }
  
  // ==================== PREDICTION ENDPOINTS ====================
  
  async createPrediction(assessmentId: number): Promise<Prediction> {
    await delay(1200); // Simulate model inference time
    maybeThrowError();
    
    const assessment = state.assessments.find(a => a.id === assessmentId);
    
    if (!assessment) {
      throw { response: { status: 404, data: { detail: 'Assessment not found' } } };
    }
    
    // Calculate risk based on assessment data
    let riskScore = 0;
    
    // Age factor
    if (assessment.age && assessment.age > 55) riskScore += 20;
    else if (assessment.age && assessment.age > 45) riskScore += 10;
    
    // Sex factor
    if (assessment.sex === 1) riskScore += 10; // Male
    
    // Chest pain
    if (assessment.chest_pain_type === 0) riskScore += 25; // Typical angina
    else if (assessment.chest_pain_type === 1) riskScore += 15;
    
    // Blood pressure
    if (assessment.resting_bp && assessment.resting_bp > 140) riskScore += 15;
    
    // Cholesterol
    if (assessment.cholesterol && assessment.cholesterol > 240) riskScore += 15;
    
    // Exercise angina
    if (assessment.exercise_angina === 1) riskScore += 20;
    
    // ST depression
    if (assessment.oldpeak && assessment.oldpeak > 2) riskScore += 20;
    
    // Number of vessels
    if (assessment.num_major_vessels && assessment.num_major_vessels > 0) {
      riskScore += assessment.num_major_vessels * 15;
    }
    
    // Determine risk level
    let predictedClass: number;
    let riskLevel: string;
    let riskColor: string;
    let recommendations;
    
    if (riskScore < 30) {
      predictedClass = 0;
      riskLevel = 'low';
      riskColor = '#4CAF50';
      recommendations = mockRecommendations.low;
    } else if (riskScore < 60) {
      predictedClass = 1;
      riskLevel = 'moderate';
      riskColor = '#FF9800';
      recommendations = mockRecommendations.moderate;
    } else {
      predictedClass = 2;
      riskLevel = 'high';
      riskColor = '#E91E63';
      recommendations = mockRecommendations.high;
    }
    
    const prediction: Prediction = {
      id: generateId(),
      assessment_id: assessmentId,
      predicted_class: predictedClass,
      confidence_score: 0.65 + Math.random() * 0.30,
      probabilities: {
        0: predictedClass === 0 ? 0.7 + Math.random() * 0.2 : Math.random() * 0.2,
        1: predictedClass === 1 ? 0.6 + Math.random() * 0.25 : Math.random() * 0.25,
        2: predictedClass === 2 ? 0.65 + Math.random() * 0.25 : Math.random() * 0.15,
      },
      risk_level: riskLevel,
      risk_score: Math.min(riskScore, 100),
      risk_description: riskLevel === 'low' 
        ? 'Great news! Your assessment indicates no significant heart disease risk.'
        : riskLevel === 'moderate'
          ? 'Your assessment indicates mild to moderate heart disease risk. Some risk factors warrant attention.'
          : 'URGENT: Your assessment indicates severe heart disease risk. Immediate medical attention recommended.',
      risk_color: riskColor,
      model_name: 'Hierarchical Classifier',
      model_version: '2.0.0',
      feature_importance: {
        'age': 0.15 + Math.random() * 0.10,
        'cholesterol': 0.12 + Math.random() * 0.08,
        'max_heart_rate': 0.11 + Math.random() * 0.07,
        'oldpeak': 0.10 + Math.random() * 0.08,
        'chest_pain_type': 0.09 + Math.random() * 0.06,
        'resting_bp': 0.08 + Math.random() * 0.05,
        'exercise_angina': 0.07 + Math.random() * 0.05,
        'thalassemia': 0.06 + Math.random() * 0.04,
        'num_major_vessels': 0.05 + Math.random() * 0.04,
      },
      created_at: now(),
      recommendations,
    };
    
    state.predictions.push(prediction);
    return prediction;
  }
  
  async getPrediction(predictionId: number): Promise<Prediction> {
    await delay(300);
    
    const prediction = state.predictions.find(p => p.id === predictionId);
    
    if (!prediction) {
      throw { response: { status: 404, data: { detail: 'Prediction not found' } } };
    }
    
    return prediction;
  }
  
  async getPredictionByAssessment(assessmentId: number): Promise<Prediction> {
    await delay(300);
    
    const prediction = state.predictions.find(p => p.assessment_id === assessmentId);
    
    if (!prediction) {
      throw { response: { status: 404, data: { detail: 'Prediction not found for assessment' } } };
    }
    
    return prediction;
  }
  
  // ==================== DIRECT PREDICTION (for SimpleAssessment) ====================
  
  async predict(data: PredictRequest): Promise<PredictResponse> {
    await delay(1000); // Simulate model inference
    maybeThrowError();
    
    // Validate required fields
    if (!data.age || !data.sex || !data.cp || data.exang === undefined) {
      return {
        success: false,
        error: 'Missing required fields: age, sex, cp, exang',
      };
    }
    
    return calculatePrediction(data);
  }
  
  // ==================== HEALTH CHECK & MODEL INFO ====================
  
  async healthCheck(): Promise<{ status: string; model_loaded: boolean; model_type: string }> {
    await delay(100);
    return mockHealthCheck;
  }
  
  async getModelInfo(): Promise<typeof mockModelInfo> {
    await delay(200);
    return mockModelInfo;
  }
}

// Export singleton instance
export const mockApi = new MockApiService();
export default mockApi;
