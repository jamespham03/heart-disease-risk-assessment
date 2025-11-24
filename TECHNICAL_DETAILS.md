# Technical Details - Heart Disease Risk Assessment

**Project**: CMPE 257 Machine Learning - Heart Disease Severity Prediction
**Team**: Lam Nguyen, James Pham, Le Duy Vu, Vi Thi Tuong Nguyen
**Last Updated**: November 24, 2025

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Pipeline](#data-pipeline)
3. [Machine Learning Models](#machine-learning-models)
4. [API Specification](#api-specification)
5. [Frontend Implementation](#frontend-implementation)
6. [Deployment](#deployment)
7. [Future Improvements](#future-improvements)

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────┐      HTTP/JSON       ┌──────────────────┐
│                 │  ───────────────────> │                  │
│  React Frontend │                       │   Flask Backend  │
│  (Port 3000)    │  <─────────────────── │   (Port 8000)    │
│                 │                       │                  │
└─────────────────┘                       └──────────────────┘
        │                                          │
        │                                          │
        v                                          v
   User Browser                           ML Pipeline
                                         ┌──────────────┐
                                         │ Preprocessing│
                                         │   Pipeline   │
                                         └──────────────┘
                                                 │
                                                 v
                                        ┌──────────────────┐
                                        │  XGBoost Ordinal │
                                        │   Classifier     │
                                        │  (F1 = 0.5863)   │
                                        └──────────────────┘
```

### Technology Stack

**Frontend**:
- React 19.2.0 + TypeScript 5.6.2
- Vite 7.2.2 (build tool)
- TailwindCSS 3.4.18 (styling)
- React Hook Form 7.66.0 (form validation)
- Axios 1.13.2 (HTTP client)
- Recharts 3.4.1 (visualizations)

**Backend**:
- Python 3.12.7
- Flask 3.1.0 (web framework)
- Flask-CORS 5.0.0 (cross-origin)
- scikit-learn 1.5.2 (ML library)
- XGBoost 2.1.3 (gradient boosting)
- imbalanced-learn 0.12.4 (SMOTE)
- pandas 2.2.3, numpy 2.1.3

**ML Pipeline**:
- Preprocessing: StandardScaler, LabelEncoder, KNNImputer
- Resampling: BorderlineSMOTE (k=3, borderline-1)
- Model: XGBoost with ordinal sample weighting
- Saved artifacts: 17 MB pickle files

---

## 📊 Data Pipeline

### 1. Raw Data Ingestion

**Dataset**: UCI Heart Disease
- **Source**: 4 medical centers (Cleveland, Hungarian, Switzerland, Long Beach VA)
- **Size**: 920 patients
- **Features**: 14 clinical attributes
- **Target**: 5 severity levels (0-4)

**Class Distribution**:
```
Class 0 (no disease):     411 samples (44.7%)  ← Majority
Class 1 (mild):           265 samples (28.8%)
Class 2 (moderate):       109 samples (11.8%)
Class 3 (severe):         107 samples (11.7%)
Class 4 (very severe):     28 samples (3.0%)   ← Critical imbalance!
```

**Imbalance Ratio**: 15:1 (class 0 vs class 4)

### 2. Exploratory Data Analysis

**Missing Data Analysis**:
```
Feature    Missing %  Strategy
────────────────────────────────────────
ca         66%        → Missing indicator + KNN imputation
thal       53%        → Missing indicator + KNN imputation
slope      34%        → KNN imputation (k=5)
exang      1%         → Mode imputation
restecg    <1%        → Mode imputation
Others     0%         → No imputation needed
```

**Key Insights**:
- `ca` (# of major vessels) and `thal` (thalassemia) have severe missing data
- These are also the **most predictive features** (correlation with target: r=0.52 and r=0.22)
- Classes 3 & 4 are nearly identical in feature space (poor separability)

### 3. Preprocessing Pipeline

```python
# Step 1: Handle Missing Values
KNNImputer(n_neighbors=5)  # For ca, thal, slope
mode/median imputation      # For fbs, exang, restecg

# Step 2: Create Missing Indicators
ca_missing, thal_missing, slope_missing (binary flags)

# Step 3: Label Encoding
LabelEncoder for 8 categorical features:
- sex, cp, fbs, restecg, exang, slope, ca, thal

# Step 4: Feature Engineering
age_group       = pd.cut(age, bins=[0,45,60,75,100], labels=[0,1,2,3])
bp_category     = pd.cut(trestbps, bins=[0,120,130,140,200], labels=[0,1,2,3])
chol_category   = pd.cut(chol, bins=[0,200,240,500], labels=[0,1,2])
hr_reserve      = (220 - age) - thalch
cv_risk_score   = composite of age, BP, cholesterol, symptoms

# Step 5: Standard Scaling
StandardScaler(fit on train only, transform on train & test)

# Final Features: 18 (13 original + 5 engineered)
```

### 4. Class Imbalance Handling

**Binary Classification** (Disease vs No Disease):
```python
SMOTE(random_state=42, k_neighbors=5)
Before: {0: 329, 1: 407}
After:  {0: 407, 1: 407}  ← Perfectly balanced
```

**Multi-class Classification** (Severity 0-4):
```python
BorderlineSMOTE(random_state=42, k_neighbors=3, kind='borderline-1')
Before: {0: 329, 1: 212, 2: 87, 3: 86, 4: 22}
After:  {0: 329, 1: 329, 2: 329, 3: 329, 4: 329}  ← All balanced
```

**Why BorderlineSMOTE**:
- Focuses on **borderline cases** near decision boundaries
- More conservative than standard SMOTE
- Better for **overlapping classes** (severity 1 vs 2 vs 3)

---

## 🤖 Machine Learning Models

### Binary Classification (Disease Detection)

**Algorithms Tested**:
1. Logistic Regression (baseline)
2. Random Forest (100 trees)
3. XGBoost (gradient boosting)
4. SVM (RBF kernel)
5. Gradient Boosting
6. Voting Ensemble (RF + XGB + GB)
7. Stacking Ensemble (RF + XGB + GB → LR)

**Hyperparameter Tuning**:
- Method: RandomizedSearchCV (50 iterations)
- CV: Stratified 5-fold
- Scoring: Weighted F1-score

**Best Model**: XGBoost (Tuned)
```
Hyperparameters:
- n_estimators: 100
- max_depth: 5
- learning_rate: 0.05
- subsample: 0.6
- colsample_bytree: 0.6
- gamma: 0.2
- scale_pos_weight: 1

Results:
- Test F1: 0.8692 (86.9%) ✅
- Test Accuracy: 0.8696
- ROC-AUC: 0.9214
- Precision: 0.8696
- Recall: 0.8696
```

### Multi-class Classification (Severity Assessment)

**Approaches Tested**:

#### 1. Direct Multi-class (Baseline)
```python
GradientBoostingClassifier(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=5,
    subsample=0.9
)

Results:
- Test F1: 0.5793
- Test Accuracy: 0.5761
```

#### 2. Hierarchical Classification
```python
# Stage 1: Binary (Disease vs No Disease)
# Stage 2: Multi-class (Severity for Disease cases)

Results:
- Test F1: 0.5595
- Test Accuracy: 0.5598
- Issue: Error propagation from Stage 1
```

#### 3. Ordinal Classification ✅ **BEST**
```python
# XGBoost with ordinal-aware sample weights
sample_weights = [1.0 + 0.4 * y for y in y_train]
# Class 0: weight = 1.0
# Class 1: weight = 1.4
# Class 2: weight = 1.8
# Class 3: weight = 2.2
# Class 4: weight = 2.6

XGBClassifier(
    n_estimators=300,
    max_depth=7,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    gamma=0.1,
    min_child_weight=3
)

Results:
- Test F1: 0.5863 (58.6%) ✅ BEST
- Test Accuracy: 0.5815
- MAE: 0.5924 (lower = better for ordinal)
- Off-by-1 errors: 27.7% (clinically acceptable)
- Severe errors (off by 2+): 14.1% (low risk)
```

**Why Ordinal Classification Wins**:
1. Respects natural ordering (0 < 1 < 2 < 3 < 4)
2. Penalizes distant mistakes more heavily
3. Lower Mean Absolute Error (clinical safety)
4. Fewer catastrophic predictions (4→0)

### Model Performance Comparison

| Approach | Binary F1 | Multi-class F1 | Target Met? |
|----------|-----------|----------------|-------------|
| **Binary (XGBoost)** | **0.8692** | N/A | ✅ **Yes** (Target: 0.75) |
| Direct Multi-class | N/A | 0.5793 | ❌ No (Target: 0.75) |
| Hierarchical | N/A | 0.5595 | ❌ No |
| **Ordinal (XGBoost)** | N/A | **0.5863** | ❌ No, but **BEST** |

---

## 🔌 API Specification

### Backend Endpoints

#### 1. **POST /api/predict** - Main Prediction Endpoint

**Request**:
```json
{
  "age": 65,
  "sex": "male",
  "cp": "typical angina",
  "trestbps": 160,
  "chol": 280,
  "fbs": true,
  "restecg": "ST-T abnormality",
  "thalch": 120,
  "exang": true,
  "oldpeak": 2.5,
  "slope": "downsloping",
  "ca": "2",
  "thal": "reversible defect"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "prediction": 3,
    "confidence": 0.78,
    "probabilities": {
      "0": 0.05,
      "1": 0.08,
      "2": 0.09,
      "3": 0.78,
      "4": 0.00
    },
    "risk_category": "Severe",
    "risk_color": "red",
    "risk_description": "Significant heart disease detected",
    "action_items": [
      "Consult cardiologist urgently",
      "Comprehensive cardiac evaluation recommended",
      "Lifestyle modifications essential"
    ],
    "ui_config": {
      "severity_level": 3,
      "color": "red",
      "icon": "alert-circle"
    }
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Missing required field: age"
}
```

#### 2. **GET /api/health** - Health Check

**Response**:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": "2025-11-24T12:00:00Z"
}
```

#### 3. **GET /api/info** - Model Information

**Response**:
```json
{
  "model": "XGBoost Ordinal Classifier",
  "version": "1.0.0",
  "f1_score": 0.5863,
  "accuracy": 0.5815,
  "training_date": "2025-11-24",
  "features": 18
}
```

### Data Flow

```
User Input (Frontend Form)
    ↓
Axios POST /api/predict
    ↓
Flask Route Handler
    ↓
preprocess_input(raw_data)
    ├─> Remove identifiers
    ├─> Convert types
    ├─> Label encoding
    ├─> Create missing indicators
    ├─> Feature engineering
    └─> Standard scaling
    ↓
X_processed (1, 18) array
    ↓
model.predict(X_processed)
model.predict_proba(X_processed)
    ↓
severity_level (0-4)
probabilities [p0, p1, p2, p3, p4]
    ↓
Enrich response with:
  - Risk category & color
  - Action items
  - UI configuration
    ↓
JSON Response to Frontend
    ↓
Display Results (Recharts visualization)
```

---

## 🎨 Frontend Implementation

### Component Architecture

```
App.tsx (Router)
  ├─> Layout.tsx (Header + Footer)
  │     ├─> Navbar
  │     └─> Footer
  │
  ├─> Home.tsx (Landing Page)
  │     ├─> Hero Section
  │     ├─> Features Grid
  │     └─> CTA Button → /assessment
  │
  └─> SimpleAssessment.tsx (Main Form) ✅
        ├─> Terms & Conditions Modal
        ├─> Assessment Form (4 sections)
        │     ├─> Demographics (age, sex)
        │     ├─> Symptoms (chest pain, angina)
        │     ├─> Vitals (BP, cholesterol, HR)
        │     └─> Diagnostics (ECG, oldpeak, etc.)
        │
        └─> Results Display
              ├─> Risk Level Card (color-coded)
              ├─> Probability Chart (Recharts)
              ├─> Action Items List
              └─> Export/Print Buttons
```

### Key Components

#### SimpleAssessment.tsx

**Features**:
- Single-page form (all sections on one page)
- React Hook Form validation
- Real-time field validation
- Axios HTTP requests
- Loading states
- Error handling
- Responsive design (mobile-friendly)

**State Management**:
```typescript
const [showTerms, setShowTerms] = useState(true);
const [termsAccepted, setTermsAccepted] = useState(false);
const [loading, setLoading] = useState(false);
const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
const [error, setError] = useState<string | null>(null);
```

**Form Validation**:
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

// Validation rules
age: required, min=1, max=120
trestbps: required, min=50, max=250
chol: required, min=100, max=600
thalch: required, min=50, max=250
oldpeak: required, min=0, max=10
```

**API Integration**:
```typescript
const onSubmit = async (data: FormData) => {
  setLoading(true);
  setError(null);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/predict`,
      transformData(data)
    );
    setPrediction(response.data);
  } catch (err) {
    setError('Failed to get prediction. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### Styling

**TailwindCSS Utility Classes**:
```css
/* Color-coded severity levels */
.severity-0 { @apply bg-green-100 text-green-800 border-green-300; }
.severity-1 { @apply bg-yellow-100 text-yellow-800 border-yellow-300; }
.severity-2 { @apply bg-orange-100 text-orange-800 border-orange-300; }
.severity-3 { @apply bg-red-100 text-red-800 border-red-300; }
.severity-4 { @apply bg-purple-100 text-purple-800 border-purple-300; }

/* Responsive design */
Mobile: col-span-full (full width)
Tablet: md:col-span-6 (2 columns)
Desktop: lg:col-span-4 (3 columns)
```

---

## 🚀 Deployment

### Development Setup

**Backend**:
```bash
cd cmpe-257-ML-heart-disease-risk-assessment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/api/app.py
```
→ Runs on http://localhost:8000

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```
→ Runs on http://localhost:3000

### Production Deployment (Future)

**Frontend** (Vercel):
```bash
cd frontend
npm run build
# Upload dist/ to Vercel
```

**Backend** (Railway/Render):
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "src.api.app:app"]
```

**Environment Variables**:
```bash
# Frontend (.env)
VITE_API_URL=https://your-backend.railway.app

# Backend (.env)
FLASK_ENV=production
MODEL_PATH=/app/models/
```

---

## 🔮 Future Improvements

### Short-term (1-2 weeks)

1. **Confusion Matrix Analysis**
   - Identify which classes are frequently confused
   - Optimize for clinically relevant errors (FN > FP)

2. **SHAP Explanations**
   ```python
   import shap
   explainer = shap.TreeExplainer(model)
   shap_values = explainer.shap_values(X_test)
   shap.summary_plot(shap_values, X_test)
   ```
   - Show feature contributions per prediction
   - Build trust with medical professionals

3. **Cross-validation Analysis**
   - Report mean ± std F1 scores
   - Ensure results are stable

### Medium-term (1-2 months)

1. **Full Backend with Database**
   - PostgreSQL for data persistence
   - User authentication (JWT)
   - Assessment history tracking
   - Doctor dashboard

2. **Model Improvements**
   - Try 3-class grouping (0, 1-2, 3-4)
   - Ensemble of ordinal models
   - Cost-sensitive learning with medical costs

3. **Enhanced Features**
   - More domain-specific risk scores
   - Polynomial features for top predictors
   - Interaction terms (age × BP, etc.)

### Long-term (3-6 months)

1. **Cloud Deployment**
   - Frontend: Vercel
   - Backend: Railway/Render
   - CI/CD: GitHub Actions

2. **External Validation**
   - Test on different hospital datasets
   - A/B testing with medical professionals
   - Collect feedback and iterate

3. **Mobile App**
   - React Native version
   - Offline prediction capability
   - Push notifications for follow-ups

4. **Research Extensions**
   - Federated learning (privacy-preserving)
   - Multi-task learning (binary + multi-class jointly)
   - Deep learning (TabNet, SAINT)
   - Publish paper on ordinal medical classification

---

## 📚 References

### Datasets
- [UCI Heart Disease Dataset](https://archive.ics.uci.edu/dataset/45/heart+disease)
- [Kaggle Mirror](https://www.kaggle.com/datasets/redwankarimsony/heart-disease-data)

### Technical Documentation
- [XGBoost Documentation](https://xgboost.readthedocs.io/)
- [imbalanced-learn (SMOTE)](https://imbalanced-learn.org/)
- [scikit-learn Pipeline](https://scikit-learn.org/stable/modules/generated/sklearn.pipeline.Pipeline.html)

### Research Papers
- Aha, D. & Dennis Kibler (1988). "Instance-based prediction of heart-disease presence with the Cleveland database"
- Chawla et al. (2002). "SMOTE: Synthetic Minority Over-sampling Technique"
- Han et al. (2005). "Borderline-SMOTE: A New Over-Sampling Method"

---

## 📞 Support & Contact

**Team Members**:
- **Lam Nguyen** - Data preprocessing & feature engineering
- **James Pham** - Model development & training
- **Le Duy Vu** - Full-stack implementation
- **Vi Thi Tuong Nguyen** - Evaluation & documentation

**GitHub**: [Lambert-Nguyen/cmpe-257-ML-heart-disease-risk-assessment](https://github.com/Lambert-Nguyen/cmpe-257-ML-heart-disease-risk-assessment)

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
**Status**: ✅ Production-ready for demo
