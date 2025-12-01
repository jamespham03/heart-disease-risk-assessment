/**
 * Mock Data for Heart Disease Risk Assessment Frontend
 * 
 * This file contains realistic mock data that simulates the backend responses.
 * Use this for frontend development without requiring the actual backend.
 */

import type {
  User,
  Assessment,
  Prediction,
  Recommendation,
} from '../types';

// ==================== SAMPLE USERS ====================
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'john.doe@example.com',
    full_name: 'John Doe',
    phone: '+1 (555) 123-4567',
    date_of_birth: '1970-05-15',
    gender: 'male',
    is_active: true,
    created_at: '2024-01-15T08:30:00Z',
    terms_accepted: true,
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    full_name: 'Jane Smith',
    phone: '+1 (555) 987-6543',
    date_of_birth: '1985-08-22',
    gender: 'female',
    is_active: true,
    created_at: '2024-02-20T14:45:00Z',
    terms_accepted: true,
  },
];

// ==================== SAMPLE ASSESSMENTS ====================
export const mockAssessments: Assessment[] = [
  {
    id: 1,
    user_id: 1,
    session_id: 'session-abc123',
    status: 'completed',
    started_at: '2024-11-28T10:00:00Z',
    completed_at: '2024-11-28T10:15:00Z',
    current_page: 5,
    total_pages: 5,
    age: 55,
    sex: 1,
    chest_pain_type: 0,
    resting_bp: 145,
    cholesterol: 233,
    fasting_bs: 1,
    resting_ecg: 2,
    max_heart_rate: 150,
    exercise_angina: 0,
    oldpeak: 2.3,
    st_slope: 2,
    num_major_vessels: 0,
    thalassemia: 2,
    smoking_status: 'former',
    exercise_frequency: 'light',
    family_history: true,
    diabetes: false,
  },
  {
    id: 2,
    user_id: 2,
    session_id: 'session-def456',
    status: 'completed',
    started_at: '2024-11-28T11:30:00Z',
    completed_at: '2024-11-28T11:42:00Z',
    current_page: 5,
    total_pages: 5,
    age: 42,
    sex: 0,
    chest_pain_type: 3,
    resting_bp: 120,
    cholesterol: 180,
    fasting_bs: 0,
    resting_ecg: 0,
    max_heart_rate: 172,
    exercise_angina: 0,
    oldpeak: 0.5,
    st_slope: 0,
    num_major_vessels: 0,
    thalassemia: 1,
    smoking_status: 'never',
    exercise_frequency: 'regular',
    family_history: false,
    diabetes: false,
  },
  {
    id: 3,
    user_id: 1,
    session_id: 'session-ghi789',
    status: 'in_progress',
    started_at: '2024-11-29T09:00:00Z',
    current_page: 2,
    total_pages: 5,
    age: 55,
    sex: 1,
    chest_pain_type: 1,
  },
];

// ==================== SAMPLE RECOMMENDATIONS ====================
export const mockRecommendations: { [riskLevel: string]: Recommendation[] } = {
  low: [
    {
      id: 1,
      category: 'Lifestyle',
      priority: 'low',
      title: 'Maintain Your Healthy Lifestyle',
      description: 'Your current health indicators are good. Continue with your healthy habits.',
      action_items: [
        'Continue regular exercise (at least 150 minutes per week)',
        'Maintain a balanced diet rich in fruits, vegetables, and whole grains',
        'Keep monitoring your blood pressure annually',
        'Stay hydrated and get adequate sleep (7-8 hours)',
      ],
    },
    {
      id: 2,
      category: 'Prevention',
      priority: 'low',
      title: 'Preventive Care',
      description: 'Regular check-ups help maintain your heart health.',
      action_items: [
        'Schedule annual physical examinations',
        'Get cholesterol levels checked every 4-6 years',
        'Maintain a healthy weight (BMI 18.5-24.9)',
        'Limit alcohol consumption and avoid smoking',
      ],
    },
  ],
  moderate: [
    {
      id: 3,
      category: 'Medical',
      priority: 'medium',
      title: 'Consult a Cardiologist',
      description: 'Your assessment indicates some risk factors that warrant professional evaluation.',
      action_items: [
        'Schedule an appointment with a cardiologist within 2 weeks',
        'Request a stress test or echocardiogram',
        'Bring this assessment report to your appointment',
        'Prepare a list of your symptoms and their frequency',
      ],
    },
    {
      id: 4,
      category: 'Lifestyle',
      priority: 'high',
      title: 'Lifestyle Modifications',
      description: 'Making changes to your lifestyle can significantly reduce your risk.',
      action_items: [
        'Adopt a heart-healthy diet (DASH or Mediterranean)',
        'Increase physical activity gradually',
        'Reduce sodium intake to less than 2,300mg per day',
        'Manage stress through meditation or yoga',
        'If you smoke, develop a quit plan',
      ],
    },
    {
      id: 5,
      category: 'Monitoring',
      priority: 'medium',
      title: 'Self-Monitoring',
      description: 'Track your health metrics regularly.',
      action_items: [
        'Check blood pressure at home weekly',
        'Keep a symptom diary (chest pain, shortness of breath, fatigue)',
        'Monitor your weight weekly',
        'Track your physical activity levels',
      ],
    },
  ],
  high: [
    {
      id: 6,
      category: 'Urgent',
      priority: 'urgent',
      title: 'Immediate Medical Attention Required',
      description: 'Your assessment indicates significant risk factors. Please seek medical care promptly.',
      action_items: [
        'Contact a cardiologist IMMEDIATELY for urgent consultation',
        'If experiencing acute symptoms (severe chest pain, shortness of breath), call 911',
        'Do not drive yourself to appointments - have someone accompany you',
        'Avoid strenuous physical activity until cleared by a doctor',
      ],
    },
    {
      id: 7,
      category: 'Medical',
      priority: 'urgent',
      title: 'Diagnostic Testing',
      description: 'Comprehensive testing is needed to assess your heart health.',
      action_items: [
        'Request immediate cardiac enzyme tests',
        'Schedule an urgent echocardiogram',
        'Discuss angiography or CT angiography with your doctor',
        'Consider admission for observation if symptoms are severe',
      ],
    },
    {
      id: 8,
      category: 'Medication',
      priority: 'high',
      title: 'Medication Review',
      description: 'Discuss medication options with your healthcare provider.',
      action_items: [
        'Review current medications with your doctor',
        'Discuss blood pressure medications if BP is elevated',
        'Consider cholesterol-lowering medications (statins)',
        'Ensure you have emergency medications (nitroglycerin if prescribed)',
      ],
    },
  ],
};

// ==================== SAMPLE PREDICTIONS ====================
export const mockPredictions: Prediction[] = [
  {
    id: 1,
    assessment_id: 1,
    predicted_class: 1,
    confidence_score: 0.72,
    probabilities: { 0: 0.18, 1: 0.72, 2: 0.10 },
    risk_level: 'moderate',
    risk_score: 58,
    risk_description: 'Your assessment indicates mild to moderate heart disease risk. Some risk factors have been identified that warrant attention and lifestyle modifications.',
    risk_color: '#FF9800',
    model_name: 'Hierarchical Classifier',
    model_version: '2.0.0',
    feature_importance: {
      'age': 0.18,
      'cholesterol': 0.15,
      'max_heart_rate': 0.14,
      'oldpeak': 0.12,
      'chest_pain_type': 0.11,
      'resting_bp': 0.10,
      'exercise_angina': 0.08,
      'thalassemia': 0.07,
      'num_major_vessels': 0.05,
    },
    created_at: '2024-11-28T10:15:30Z',
    recommendations: mockRecommendations.moderate,
  },
  {
    id: 2,
    assessment_id: 2,
    predicted_class: 0,
    confidence_score: 0.89,
    probabilities: { 0: 0.89, 1: 0.08, 2: 0.03 },
    risk_level: 'low',
    risk_score: 15,
    risk_description: 'Great news! Your assessment indicates no significant heart disease risk. Continue maintaining your healthy lifestyle.',
    risk_color: '#4CAF50',
    model_name: 'Hierarchical Classifier',
    model_version: '2.0.0',
    feature_importance: {
      'age': 0.20,
      'max_heart_rate': 0.16,
      'cholesterol': 0.14,
      'resting_bp': 0.12,
      'chest_pain_type': 0.10,
      'oldpeak': 0.09,
      'exercise_angina': 0.08,
      'thalassemia': 0.06,
      'num_major_vessels': 0.05,
    },
    created_at: '2024-11-28T11:42:15Z',
    recommendations: mockRecommendations.low,
  },
];

// High risk prediction example
export const mockHighRiskPrediction: Prediction = {
  id: 3,
  assessment_id: 3,
  predicted_class: 2,
  confidence_score: 0.81,
  probabilities: { 0: 0.08, 1: 0.11, 2: 0.81 },
  risk_level: 'high',
  risk_score: 85,
  risk_description: 'URGENT: Your assessment indicates severe heart disease risk. Immediate medical attention is strongly recommended.',
  risk_color: '#E91E63',
  model_name: 'Hierarchical Classifier',
  model_version: '2.0.0',
  feature_importance: {
    'num_major_vessels': 0.22,
    'thalassemia': 0.18,
    'oldpeak': 0.15,
    'chest_pain_type': 0.13,
    'exercise_angina': 0.11,
    'age': 0.08,
    'max_heart_rate': 0.07,
    'cholesterol': 0.04,
    'resting_bp': 0.02,
  },
  created_at: '2024-11-29T09:30:00Z',
  recommendations: mockRecommendations.high,
};

// ==================== PREDICTION RESPONSE GENERATOR ====================
export interface PredictRequest {
  age: number;
  sex: string;
  cp: string;
  trestbps?: number;
  chol?: number;
  fbs?: boolean | string;
  restecg?: string;
  thalch?: number;
  exang: boolean | string;
  oldpeak?: number;
  slope?: string;
  ca?: string | number;
  thal?: string;
}

export interface PredictResponse {
  success: boolean;
  data?: {
    prediction: number;
    confidence: number;
    probabilities: {
      '0': number;
      '1': number;
      '2': number;
    };
    risk_category: string;
    risk_color: string;
    action_items: string[];
  };
  error?: string;
}

// Action items based on risk level (matching backend logic)
export const actionItemsByRisk = {
  noDisease: [
    'Congratulations! Your assessment indicates no significant heart disease risk',
    'Continue maintaining a healthy lifestyle with regular exercise (150+ minutes/week)',
    'Follow a heart-healthy diet rich in fruits, vegetables, whole grains, and lean proteins',
    'Monitor your blood pressure and cholesterol levels annually',
    'Avoid smoking and limit alcohol consumption',
    'Maintain a healthy weight (BMI 18.5-24.9)',
    'Schedule routine check-ups with your primary care physician as recommended',
    'Stay aware of family history and inform your doctor of any changes',
  ],
  mildModerate: [
    'Your assessment indicates mild-to-moderate heart disease risk',
    'Schedule a consultation with a cardiologist within 1-2 weeks for further evaluation',
    'Discuss stress testing, echocardiogram, or other diagnostic tests with your doctor',
    'Implement lifestyle modifications: heart-healthy diet, regular exercise, stress reduction',
    'Monitor symptoms: chest discomfort, shortness of breath, fatigue, irregular heartbeat',
    'Consider cardiac rehabilitation programs if recommended by your physician',
    'Follow prescribed medications exactly as directed',
    'Avoid strenuous activity until cleared by your cardiologist',
    'Keep a symptom diary to share with your healthcare provider',
    'Reduce risk factors: quit smoking, manage diabetes, control blood pressure/cholesterol',
  ],
  severeCritical: [
    'URGENT: Your assessment indicates severe heart disease requiring immediate medical attention',
    'Contact a cardiologist IMMEDIATELY for urgent consultation (within 24-48 hours)',
    'Do not delay - severe risk factors detected that require prompt evaluation',
    'Avoid strenuous physical activity until medically evaluated',
    'Monitor for acute symptoms: severe chest pain, shortness of breath, dizziness, fainting',
    'Keep a detailed symptom diary (chest pain, breathing difficulty, fatigue, swelling)',
    'Have someone accompany you to medical appointments',
    'Bring complete medical history, current medications, and this assessment to your appointment',
    'If experiencing acute symptoms (severe chest pain, shortness of breath, profuse sweating), call 911 immediately',
    'Do not drive yourself if experiencing symptoms - call emergency services',
    'Discuss immediate treatment options: medications, procedures, lifestyle changes',
    'Consider getting a second opinion from a cardiac specialist',
  ],
};

// Model info response
export const mockModelInfo = {
  approach: 'Hierarchical',
  model_name: 'Hierarchical Classifier (RF Binary + XGBoost Multi)',
  f1_score: 0.72,
  class_names: ['No Disease', 'Mild-Moderate', 'Severe-Critical'],
  severity_grouping: 'Original 1-2 → 1, 3-4 → 2',
  features_used: 18,
};

// Health check response
export const mockHealthCheck = {
  status: 'healthy',
  model_loaded: true,
  model_type: 'Hierarchical',
};
