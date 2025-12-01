export interface User {
  id: number;
  email: string;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  is_active: boolean;
  created_at: string;
  terms_accepted?: boolean;
}

export interface Assessment {
  id: number;
  user_id?: number;
  session_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  completed_at?: string;
  current_page: number;
  total_pages: number;
  age?: number;
  sex?: number;
  chest_pain_type?: number;
  resting_bp?: number;
  cholesterol?: number;
  fasting_bs?: number;
  resting_ecg?: number;
  max_heart_rate?: number;
  exercise_angina?: number;
  oldpeak?: number;
  st_slope?: number;
  num_major_vessels?: number;
  thalassemia?: number;
  smoking_status?: string;
  exercise_frequency?: string;
  family_history?: boolean;
  diabetes?: boolean;
}

export interface Recommendation {
  id: number;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  action_items: string[];
}

export interface Prediction {
  id: number;
  assessment_id: number;
  predicted_class: number;
  confidence_score: number;
  probabilities: { [key: number]: number };
  risk_level: string;
  risk_score: number;
  risk_description: string;
  risk_color: string;
  model_name?: string;
  model_version?: string;
  feature_importance: { [key: string]: number };
  created_at: string;
  recommendations?: Recommendation[];
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

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
