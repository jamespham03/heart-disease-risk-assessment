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
  ChatSession,
  ChatMessage,
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

// ==================== SAMPLE CHAT SESSIONS ====================
export const mockChatSessions: ChatSession[] = [
  {
    id: 1,
    session_token: 'chat-token-abc123',
    assessment_id: 1,
    is_active: true,
    started_at: '2024-11-28T10:20:00Z',
    total_messages: 6,
  },
  {
    id: 2,
    session_token: 'chat-token-def456',
    assessment_id: 2,
    is_active: false,
    started_at: '2024-11-28T11:45:00Z',
    total_messages: 4,
  },
];

// ==================== SAMPLE CHAT MESSAGES ====================
export const mockChatMessages: { [sessionToken: string]: ChatMessage[] } = {
  'chat-token-abc123': [
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your Heart Health Assistant. I\'ve reviewed your assessment results showing a moderate risk level. How can I help you understand your results better?',
      created_at: '2024-11-28T10:20:00Z',
      references_prediction: true,
      references_assessment_data: false,
    },
    {
      id: 2,
      role: 'user',
      content: 'What does "mild to moderate" risk actually mean for me?',
      created_at: '2024-11-28T10:21:30Z',
      references_prediction: false,
      references_assessment_data: false,
    },
    {
      id: 3,
      role: 'assistant',
      content: 'Based on your assessment, "mild to moderate" risk means that while you don\'t currently have severe heart disease, there are some factors that increase your risk compared to the general population.\n\nSpecifically, looking at your results:\n• Your cholesterol level (233 mg/dl) is slightly elevated\n• Your blood pressure (145 mm Hg) is in the pre-hypertension range\n• Your age (55) and family history are also contributing factors\n\nThe good news is that these are largely modifiable risk factors that can be improved through lifestyle changes and, if needed, medication.\n\nWould you like specific recommendations for addressing any of these factors?',
      created_at: '2024-11-28T10:22:15Z',
      references_prediction: true,
      references_assessment_data: true,
    },
    {
      id: 4,
      role: 'user',
      content: 'Yes, what can I do about my cholesterol?',
      created_at: '2024-11-28T10:24:00Z',
      references_prediction: false,
      references_assessment_data: false,
    },
    {
      id: 5,
      role: 'assistant',
      content: 'Great question! Here are evidence-based strategies to lower your cholesterol:\n\n**Dietary Changes:**\n1. **Reduce saturated fats** - found in red meat, full-fat dairy products\n2. **Eliminate trans fats** - check labels for "partially hydrogenated" oils\n3. **Eat more omega-3 fatty acids** - salmon, mackerel, walnuts\n4. **Increase soluble fiber** - oatmeal, beans, apples, pears\n5. **Add whey protein** - found in dairy products\n\n**Lifestyle Changes:**\n• Exercise most days - aim for 30 minutes of moderate activity\n• Quit smoking if applicable - improves HDL (good) cholesterol\n• Limit alcohol - moderate drinking raises HDL\n• Lose weight - even 5-10 pounds can help\n\n**Medical Options:**\nIf lifestyle changes aren\'t enough after 3-6 months, discuss with your doctor about:\n• Statins (most common)\n• Bile-acid-binding resins\n• Cholesterol absorption inhibitors\n\nWould you like me to explain any of these in more detail?',
      created_at: '2024-11-28T10:25:30Z',
      references_prediction: false,
      references_assessment_data: true,
    },
    {
      id: 6,
      role: 'user',
      content: 'Should I see a cardiologist?',
      created_at: '2024-11-28T10:28:00Z',
      references_prediction: false,
      references_assessment_data: false,
    },
  ],
  'chat-token-def456': [
    {
      id: 7,
      role: 'assistant',
      content: 'Hello! I\'m your Heart Health Assistant. Congratulations on your low-risk assessment! Your heart health indicators look great. Is there anything you\'d like to know about maintaining your heart health?',
      created_at: '2024-11-28T11:45:00Z',
      references_prediction: true,
      references_assessment_data: false,
    },
    {
      id: 8,
      role: 'user',
      content: 'How often should I get checked?',
      created_at: '2024-11-28T11:46:30Z',
      references_prediction: false,
      references_assessment_data: false,
    },
    {
      id: 9,
      role: 'assistant',
      content: 'For someone with your low-risk profile (42 years old, normal blood pressure, healthy cholesterol), here are the recommended screening intervals:\n\n**Blood Pressure:**\n• At least every 2 years if normal (<120/80 mm Hg)\n• Annual checks are even better for preventive care\n\n**Cholesterol:**\n• Every 4-6 years for average-risk adults\n• Your level of 180 mg/dl is excellent!\n\n**Blood Glucose:**\n• Every 3 years starting at age 45\n• Earlier if you have risk factors\n\n**Physical Exam:**\n• Annual wellness visits are recommended\n• Include weight check, heart rate, and basic heart sounds\n\n**ECG/Stress Tests:**\n• Not routinely needed at your age with no symptoms\n• May be recommended if you develop symptoms\n\nKeep up the great work with your regular exercise routine - that\'s one of the best things you can do for your heart!',
      created_at: '2024-11-28T11:47:45Z',
      references_prediction: true,
      references_assessment_data: true,
    },
    {
      id: 10,
      role: 'user',
      content: 'Thanks!',
      created_at: '2024-11-28T11:49:00Z',
      references_prediction: false,
      references_assessment_data: false,
    },
  ],
};

// ==================== AI CHAT RESPONSE TEMPLATES ====================
export const mockAIResponses: { [keyword: string]: string } = {
  'cholesterol': `Here's what you should know about cholesterol management:

**Understanding Your Numbers:**
• Total Cholesterol: Below 200 mg/dL is desirable
• LDL ("bad" cholesterol): Below 100 mg/dL is optimal
• HDL ("good" cholesterol): 60 mg/dL or higher is protective
• Triglycerides: Below 150 mg/dL is normal

**To Lower Cholesterol:**
1. Eat heart-healthy foods (Mediterranean diet)
2. Exercise regularly (30 mins, 5 days/week)
3. Quit smoking
4. Lose excess weight
5. Limit alcohol

Would you like more specific dietary recommendations?`,

  'blood pressure': `Let me explain blood pressure management:

**Blood Pressure Categories:**
• Normal: Less than 120/80 mm Hg
• Elevated: 120-129/<80 mm Hg
• High BP Stage 1: 130-139/80-89 mm Hg
• High BP Stage 2: 140+/90+ mm Hg

**To Lower Blood Pressure:**
1. **DASH Diet** - rich in fruits, vegetables, whole grains
2. **Reduce sodium** - aim for less than 2,300 mg/day
3. **Regular exercise** - 150 minutes of moderate activity weekly
4. **Maintain healthy weight** - losing 1 kg can reduce BP by 1 mm Hg
5. **Limit alcohol** - no more than 1 drink/day for women, 2 for men
6. **Manage stress** - try meditation or deep breathing

Would you like tips on any of these specifically?`,

  'exercise': `Here are exercise recommendations for heart health:

**Recommended Exercise:**
• **Aerobic**: 150 mins moderate OR 75 mins vigorous per week
• **Strength training**: 2+ days per week
• **Flexibility**: Stretching after workouts

**Heart-Healthy Activities:**
1. Brisk walking (easiest to start)
2. Swimming (low impact)
3. Cycling
4. Dancing
5. Tennis or racquet sports

**Getting Started Safely:**
• Start slow and gradually increase intensity
• Warm up for 5-10 minutes
• Cool down after exercise
• Stay hydrated
• Stop if you feel chest pain or severe shortness of breath

Would you like a personalized exercise plan based on your current fitness level?`,

  'symptoms': `Important heart disease symptoms to monitor:

**Warning Signs (Seek immediate help if severe):**
🚨 **Chest discomfort** - pressure, squeezing, fullness
🚨 **Shortness of breath** - especially at rest or lying down
🚨 **Pain in arms, back, neck, jaw, or stomach**
🚨 **Cold sweats, nausea, or lightheadedness**

**Other Symptoms to Track:**
• Fatigue (unusual tiredness)
• Swelling in legs, ankles, or feet
• Irregular heartbeat (palpitations)
• Reduced ability to exercise
• Persistent cough

**What to Do:**
• Keep a symptom diary with dates, times, and triggers
• Note what you were doing when symptoms occurred
• Bring this record to your doctor visits

If you're experiencing any concerning symptoms right now, please contact your healthcare provider or call 911 if severe.`,

  'diet': `Here's a heart-healthy eating guide:

**The Mediterranean/DASH Diet Approach:**

✅ **Eat More:**
• Fruits and vegetables (aim for 5+ servings/day)
• Whole grains (oats, brown rice, quinoa)
• Lean proteins (fish, poultry, legumes)
• Healthy fats (olive oil, avocados, nuts)
• Low-fat dairy

❌ **Limit or Avoid:**
• Saturated fats (fatty meats, full-fat dairy)
• Trans fats (fried foods, baked goods)
• Sodium (processed foods, canned soups)
• Added sugars (sodas, candy, desserts)
• Red meat (limit to 1-2 times per week)

**Quick Tips:**
1. Cook at home more often
2. Read nutrition labels
3. Use herbs and spices instead of salt
4. Choose grilled or baked over fried
5. Drink water instead of sugary drinks

Would you like specific meal ideas or recipes?`,

  'medication': `Regarding heart medications:

**Common Heart Medications:**
• **Statins** - lower cholesterol (Lipitor, Crestor)
• **ACE Inhibitors** - lower blood pressure (Lisinopril)
• **Beta Blockers** - slow heart rate, lower BP
• **Aspirin** - prevent blood clots (consult doctor first)
• **Diuretics** - reduce fluid buildup

**Important Reminders:**
1. Take medications exactly as prescribed
2. Don't stop suddenly without consulting your doctor
3. Report any side effects promptly
4. Keep a list of all medications for appointments
5. Set reminders to take medications on time

**Before Starting Any Medication:**
• Discuss all current medications with your doctor
• Ask about potential side effects
• Understand when and how to take them
• Know what to do if you miss a dose

Please consult your healthcare provider for personalized medication advice.`,

  'default': `Thank you for your question! I'm here to help you understand your heart health better.

Based on your assessment, I can provide information about:
• Understanding your risk factors
• Lifestyle modifications
• Diet and exercise recommendations
• Symptom monitoring
• When to seek medical care

What specific aspect of your heart health would you like to discuss?

Remember: While I can provide general health information, please consult with healthcare professionals for personalized medical advice.`,
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
