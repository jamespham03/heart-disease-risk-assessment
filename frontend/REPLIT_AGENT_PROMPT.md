# Frontend Redesign Prompt for Replit Agent

## Project Overview

You are tasked with redesigning the frontend for a **Heart Disease Risk Assessment** web application. This is a medical screening tool that helps users assess their heart disease risk through a questionnaire and provides AI-powered predictions with personalized recommendations.

## Tech Stack (Use the same)

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form
- **HTTP Client**: Axios (already integrated in mock)
- **Icons**: Lucide React
- **Charts**: Recharts (for probability visualization)

## Mock API System

I'm providing you with two files that simulate the backend:
1. `mockData.ts` - Contains all sample data
2. `mockApi.ts` - Mock API service with all endpoints

**Important**: Use these mock files for development. Set `VITE_USE_MOCK=true` in your `.env` file.

### API Endpoints Available

#### Authentication
```typescript
mockApi.register(userData) → AuthTokens
mockApi.login(email, password) → AuthTokens
mockApi.getCurrentUser() → User
mockApi.logout() → void
```

#### Assessments
```typescript
mockApi.startAssessment(sessionId, termsAccepted) → Assessment
mockApi.getAssessment(sessionId) → Assessment
mockApi.updateAssessment(sessionId, data) → Assessment
mockApi.completeAssessment(sessionId, data) → Assessment
mockApi.getUserAssessments(skip, limit) → Assessment[]
```

#### Predictions (Main Feature)
```typescript
// For multi-step assessment flow
mockApi.createPrediction(assessmentId) → Prediction

// For single-page assessment (recommended)
mockApi.predict(formData) → PredictResponse
```

#### Chat (AI Assistant)
```typescript
mockApi.createChatSession(assessmentId) → ChatSession
mockApi.sendChatMessage(sessionToken, content) → ChatMessage
mockApi.getChatHistory(sessionToken) → ChatHistory
```

## Core Features to Implement

### 1. Landing Page / Home
- Hero section explaining the app
- Call-to-action to start assessment
- Brief explanation of how it works
- Medical disclaimer

### 2. Assessment Form (Primary Feature)
The form collects clinical data for heart disease prediction.

**Required Fields** (user must provide):
- `age` (18-120 years)
- `sex` ("male" or "female")
- `cp` - Chest Pain Type: "typical angina", "atypical angina", "non-anginal", "asymptomatic"
- `exang` - Exercise Induced Angina (true/false)

**Optional Fields** (have smart defaults in backend):
- `trestbps` - Resting Blood Pressure (70-250 mm Hg)
- `chol` - Cholesterol (100-600 mg/dl)
- `fbs` - Fasting Blood Sugar > 120 mg/dl (true/false)
- `restecg` - Resting ECG: "normal", "st-t abnormality", "lv hypertrophy"
- `thalch` - Max Heart Rate (60-220 bpm)
- `oldpeak` - ST Depression (0-10)
- `slope` - ST Slope: "upsloping", "flat", "downsloping"
- `ca` - Number of Major Vessels (0-4)
- `thal` - Thalassemia: "normal", "fixed defect", "reversable defect"

**Design Options**:
- Single-page form with sections (simpler, recommended)
- Multi-step wizard with progress bar

### 3. Results Dashboard
Display prediction results including:

```typescript
interface PredictResponse {
  success: boolean;
  data: {
    prediction: number;        // 0=No Disease, 1=Mild-Moderate, 2=Severe
    confidence: number;        // 0.0 to 1.0
    probabilities: {
      '0': number;             // Probability of no disease
      '1': number;             // Probability of mild-moderate
      '2': number;             // Probability of severe
    };
    risk_category: string;     // "No Disease", "Mild-Moderate", "Severe-Critical"
    risk_color: string;        // "#4CAF50" (green), "#FF9800" (orange), "#E91E63" (red)
    action_items: string[];    // Array of recommendations
  };
}
```

**Display Elements**:
- Risk level badge with color coding
- Confidence percentage
- Probability distribution chart (pie or bar)
- List of personalized recommendations/action items
- Option to print/export results
- Button to start chat with AI assistant

### 4. AI Chat Interface
After receiving results, users can chat with an AI assistant about their results.
- Chat bubble interface
- Shows when response is based on prediction data
- Common questions: cholesterol, blood pressure, exercise, symptoms, diet, medication

### 5. User Authentication (Optional)
- Login/Register forms
- Save assessment history
- View past assessments

## Data Types Reference

```typescript
interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

interface Assessment {
  id: number;
  session_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  completed_at?: string;
  current_page: number;
  total_pages: number;
  // Clinical data fields...
}

interface Prediction {
  id: number;
  assessment_id: number;
  predicted_class: number;
  confidence_score: number;
  probabilities: {[key: number]: number};
  risk_level: string;
  risk_score: number;
  risk_description: string;
  risk_color: string;
  feature_importance: {[key: string]: number};
  recommendations?: Recommendation[];
}

interface Recommendation {
  id: number;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  action_items: string[];
}

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  references_prediction: boolean;
  references_assessment_data: boolean;
}
```

## Risk Level Color Scheme

| Risk Level | Class | Color | Hex |
|------------|-------|-------|-----|
| No Disease | 0 | Green | #4CAF50 |
| Mild-Moderate | 1 | Orange | #FF9800 |
| Severe-Critical | 2 | Red/Pink | #E91E63 |

## Sample Test Data for Development

### Low Risk Patient
```javascript
{
  age: 42,
  sex: 'female',
  cp: 'asymptomatic',
  exang: false,
  trestbps: 120,
  chol: 180,
  thalch: 172,
  oldpeak: 0.5,
  slope: 'upsloping',
  ca: '0.0',
  thal: 'normal'
}
```

### Moderate Risk Patient
```javascript
{
  age: 55,
  sex: 'male',
  cp: 'typical angina',
  exang: false,
  trestbps: 145,
  chol: 233,
  thalch: 150,
  oldpeak: 2.3,
  slope: 'downsloping',
  ca: '0.0',
  thal: 'fixed defect'
}
```

### High Risk Patient
```javascript
{
  age: 68,
  sex: 'male',
  cp: 'typical angina',
  exang: true,
  trestbps: 180,
  chol: 290,
  thalch: 110,
  oldpeak: 4.2,
  slope: 'downsloping',
  ca: '3.0',
  thal: 'reversable defect'
}
```

## Design Guidelines

### Visual Style
- Clean, modern, medical/health-focused aesthetic
- Trust-inspiring color palette (blues, teals, whites)
- Clear typography with good hierarchy
- Accessible (WCAG 2.1 compliant)
- Mobile-responsive

### UX Priorities
1. **Clarity**: Medical terms should have tooltips/explanations
2. **Trust**: Professional appearance, clear disclaimers
3. **Ease of Use**: Simple form flow, clear progress indication
4. **Reassurance**: Non-alarming presentation of results
5. **Action-Oriented**: Clear next steps based on risk level

### Important UI Elements
- Medical disclaimer on assessment page
- Loading states during prediction (simulate ML inference)
- Error handling for failed API calls
- Success/confirmation messages
- Print-friendly results page

## Project Structure Suggestion

```
src/
├── components/
│   ├── common/          # Button, Card, Input, etc.
│   ├── layout/          # Header, Footer, Layout
│   ├── assessment/      # Form components
│   ├── results/         # Results display components
│   └── chat/            # Chat interface components
├── pages/
│   ├── Home.tsx
│   ├── Assessment.tsx   # or SimpleAssessment.tsx
│   ├── Results.tsx
│   └── Chat.tsx
├── services/
│   └── api.ts           # Uses mockApi
├── mocks/
│   ├── mockApi.ts       # (provided)
│   └── mockData.ts      # (provided)
├── types/
│   └── index.ts
├── hooks/
│   └── useAssessment.ts
└── utils/
    └── validation.ts
```

## Getting Started

1. Create a new Vite + React + TypeScript project
2. Install dependencies: `npm install react-router-dom react-hook-form axios lucide-react recharts`
3. Install Tailwind CSS
4. Add the provided `mockApi.ts` and `mockData.ts` to `src/mocks/`
5. Create `.env` with `VITE_USE_MOCK=true`
6. Build out the pages and components

## Deliverables

1. **Responsive landing page** with clear value proposition
2. **Assessment form** that collects all clinical data
3. **Results dashboard** with risk visualization and recommendations
4. **Chat interface** for follow-up questions
5. **Clean, reusable component library**

## Notes

- The mock API has built-in delays to simulate real network conditions
- Predictions are calculated based on clinical factors (see mockApi.ts)
- Chat responses are keyword-based (cholesterol, blood pressure, exercise, diet, etc.)
- All data persists in memory during the session but resets on page refresh

Good luck with the redesign! Focus on creating a trustworthy, user-friendly experience for health-conscious users.
