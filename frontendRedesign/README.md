# Heart Disease Risk Assessment - Frontend (Redesign)

A modern React-based frontend for the Heart Disease Risk Assessment application, built with TypeScript, Vite, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.8+ (for backend)
- npm or yarn

### Running the Full Stack

#### 1. Start the Flask Backend (from project root)

```bash
# Navigate to project root
cd /path/to/cmpe-257-ML-heart-disease-risk-assessment

# Create and activate virtual environment (if not already done)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask API
python src/api/app.py
```

The backend will start at `http://localhost:8000`.

#### 2. Start the Frontend (in a new terminal)

```bash
# Navigate to frontend directory
cd frontendRedesign

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`.

## 📁 Project Structure

```
frontendRedesign/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Button, Card, Input, Select
│   │   └── layout/       # Header, Footer
│   ├── mocks/            # Mock data and API for development
│   │   ├── mockData.ts   # Sample data
│   │   └── mockApi.ts    # Mock API service
│   ├── pages/            # Page components
│   │   ├── Home.tsx      # Landing page
│   │   ├── Assessment.tsx # Risk assessment form
│   │   └── Results.tsx   # Results dashboard
│   ├── services/         # API service layer
│   │   └── api.ts        # Real API calls + mock mode toggle
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── .env                  # Environment configuration
├── .env.example          # Example environment file
└── package.json
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `frontendRedesign` directory (already created):

```env
# API URL - Flask backend server
VITE_API_URL=http://localhost:8000

# Use mock API instead of real backend (set to 'true' for development without backend)
VITE_USE_MOCK=false
```

### Mock Mode

To develop without the backend running, set `VITE_USE_MOCK=true` in your `.env` file. This will use the mock API service that simulates all backend responses.

## 🔌 API Endpoints

The frontend connects to these Flask backend endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict` | POST | Submit assessment for prediction |
| `/api/health` | GET | Health check |
| `/api/model-info` | GET | Get model information |

### Predict Request Format

```json
{
  "age": 55,
  "sex": "male",
  "cp": "typical angina",
  "exang": true,
  "trestbps": 145,
  "chol": 233,
  "fbs": false,
  "restecg": "lv hypertrophy",
  "thalch": 150,
  "oldpeak": 2.3,
  "slope": "downsloping",
  "ca": "0.0",
  "thal": "fixed defect"
}
```

**Required fields:** `age`, `sex`, `cp`, `exang`  
**Optional fields:** `trestbps`, `chol`, `fbs`, `restecg`, `thalch`, `oldpeak`, `slope`, `ca`, `thal`

### Predict Response Format

```json
{
  "success": true,
  "data": {
    "prediction": 1,
    "confidence": 0.75,
    "probabilities": {
      "0": 0.15,
      "1": 0.75,
      "2": 0.10
    },
    "risk_category": "Mild-Moderate",
    "risk_color": "#FF9800",
    "action_items": [
      "Schedule a consultation with a cardiologist",
      "Implement lifestyle modifications",
      "Monitor symptoms regularly"
    ]
  }
}
```

## 🎨 Features

- **Home Page**: Landing page with information about the assessment
- **Assessment Form**: Multi-step form with required and optional clinical fields
- **Results Dashboard**: Visual display of prediction results with charts
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📝 Risk Categories

| Class | Category | Color | Description |
|-------|----------|-------|-------------|
| 0 | No Disease | Green (#4CAF50) | Low risk, maintain healthy habits |
| 1 | Mild-Moderate | Orange (#FF9800) | Some risk factors, lifestyle changes recommended |
| 2 | Severe-Critical | Pink/Red (#E91E63) | High risk, immediate medical attention needed |

## 🔧 Technology Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **React Hook Form** - Form handling
- **Recharts** - Charts and visualizations
- **Lucide React** - Icons
- **React Router DOM** - Routing

## 📄 License

MIT
