# Mock API System for Frontend Development

This directory contains mock data and API services that simulate the backend behavior. Use this for frontend development without requiring the actual backend to be running.

## Quick Start

1. Enable mock mode in `.env`:
   ```env
   VITE_USE_MOCK=true
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. The frontend will now use mock data instead of the real backend!

## Files Overview

### `mockData.ts`
Contains realistic sample data including:
- **Users**: Sample user accounts for testing authentication
- **Assessments**: Complete assessment records with various statuses
- **Predictions**: Prediction results with different risk levels (low, moderate, high)
- **Recommendations**: Action items based on risk levels
- **Chat Sessions & Messages**: Sample conversations with AI responses
- **AI Response Templates**: Keyword-based responses for the chat feature

### `mockApi.ts`
A complete mock API service that:
- Simulates network latency (configurable delay)
- Implements the same prediction logic as the backend
- Maintains session state in memory
- Generates realistic AI chat responses
- Provides error handling similar to the real API

### `index.ts`
Barrel export for easy imports.

## API Endpoints Mocked

### Authentication
| Endpoint | Description |
|----------|-------------|
| `register()` | Create new user account |
| `login()` | Authenticate user |
| `refreshToken()` | Refresh auth tokens |
| `getCurrentUser()` | Get current user info |
| `logout()` | Clear session |

### Assessments
| Endpoint | Description |
|----------|-------------|
| `startAssessment()` | Begin new assessment |
| `getAssessment()` | Retrieve assessment by session ID |
| `updateAssessment()` | Update assessment data |
| `completeAssessment()` | Mark assessment complete |
| `getUserAssessments()` | Get user's assessment history |

### Predictions
| Endpoint | Description |
|----------|-------------|
| `createPrediction()` | Generate prediction for assessment |
| `getPrediction()` | Get prediction by ID |
| `getPredictionByAssessment()` | Get prediction for assessment |
| `predict()` | Direct prediction (SimpleAssessment) |

### Chat
| Endpoint | Description |
|----------|-------------|
| `createChatSession()` | Start new chat session |
| `sendChatMessage()` | Send message and get AI response |
| `getChatHistory()` | Get chat history |
| `endChatSession()` | End chat session |

### System
| Endpoint | Description |
|----------|-------------|
| `healthCheck()` | API health status |
| `getModelInfo()` | ML model information |

## Prediction Logic

The mock prediction follows the same logic as the backend:

1. **Risk Score Calculation** based on:
   - Age (higher = more risk)
   - Sex (male = slight increase)
   - Chest pain type
   - Blood pressure
   - Cholesterol
   - Exercise-induced angina
   - ST depression (oldpeak)
   - Fasting blood sugar
   - Max heart rate
   - ST slope
   - Number of major vessels
   - Thalassemia result

2. **Risk Classification**:
   - Score < 35: **No Disease** (Class 0) - Green
   - Score 35-65: **Mild-Moderate** (Class 1) - Orange
   - Score > 65: **Severe-Critical** (Class 2) - Red/Pink

3. **Action Items**: Different recommendations based on risk level

## Sample Test Data

### Low Risk Patient
```javascript
{
  age: 42,
  sex: 'female',
  cp: 'asymptomatic',
  trestbps: 120,
  chol: 180,
  fbs: false,
  restecg: 'normal',
  thalch: 172,
  exang: false,
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
  trestbps: 145,
  chol: 233,
  fbs: true,
  restecg: 'lv hypertrophy',
  thalch: 150,
  exang: false,
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
  trestbps: 180,
  chol: 290,
  fbs: true,
  restecg: 'st-t abnormality',
  thalch: 110,
  exang: true,
  oldpeak: 4.2,
  slope: 'downsloping',
  ca: '3.0',
  thal: 'reversable defect'
}
```

## Chat AI Responses

The mock chat system responds to keywords:
- **cholesterol**: Diet and medication advice
- **blood pressure**: BP categories and management
- **exercise**: Activity recommendations
- **symptoms**: Warning signs to monitor
- **diet**: Heart-healthy eating guide
- **medication**: Common heart medications info

## Configuration

In `mockApi.ts`:
```typescript
const MOCK_DELAY_MS = 500;        // Simulated network latency
const ENABLE_RANDOM_ERRORS = false; // Test error handling
const ERROR_RATE = 0.1;            // 10% error rate when enabled
```

## Usage in Components

### Using the API Service (Automatic Mock Detection)
```typescript
import api from '../services/api';

// Will automatically use mock if VITE_USE_MOCK=true
const result = await api.healthCheck();
```

### Direct Mock Usage
```typescript
import { mockApi } from '../mocks';

// Always uses mock
const prediction = await mockApi.predict({
  age: 55,
  sex: 'male',
  cp: 'typical angina',
  exang: true,
  // ... other fields
});
```

### Importing Mock Data
```typescript
import { 
  mockUsers, 
  mockAssessments, 
  mockPredictions,
  mockRecommendations 
} from '../mocks';
```

## Switching Between Mock and Real API

### Environment Variable (Recommended)
```env
# .env
VITE_USE_MOCK=true   # Use mock
VITE_USE_MOCK=false  # Use real backend
```

### Runtime Toggle
```typescript
import api from '../services/api';

// Check current mode
console.log('Mock mode:', api.isMockMode());

// Switch at runtime (useful for testing)
api.setMockMode(true);  // Enable mock
api.setMockMode(false); // Disable mock
```

## Notes for Frontend Team

1. **Mock mode is enabled by default** in the `.env` file
2. **All endpoints work without the backend** - perfect for UI development
3. **Data persists in memory** during the session but resets on page refresh
4. **Response times are simulated** to mimic real network conditions
5. **Error scenarios** can be enabled for testing error handling

## Troubleshooting

### Mock not working?
- Check that `.env` has `VITE_USE_MOCK=true`
- Restart the dev server after changing `.env`

### Need more test data?
- Add new entries to `mockData.ts`
- The mock API will automatically use them

### Testing error handling?
- Set `ENABLE_RANDOM_ERRORS = true` in `mockApi.ts`
- Adjust `ERROR_RATE` as needed
