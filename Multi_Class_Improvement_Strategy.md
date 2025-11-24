# 🎯 Multi-Class Classification Improvement Strategy
## Heart Disease Severity Prediction (0-4 Classes)

**Current Performance:**
- Binary (disease vs no disease): **F1 = 0.85** ✓
- Multi-class (0-4 severity): **F1 = 0.58** ⚠️

**Goal:** Improve multi-class F1 from 0.58 to **0.70+**

---

## 📊 Root Cause Analysis

### Problem 1: EXTREME Class Imbalance ⚠️⚠️⚠️

```
Class 0 (no disease):       411 samples (44.67%)  ← Majority
Class 1 (mild):             265 samples (28.80%)
Class 2 (moderate):         109 samples (11.85%)
Class 3 (severe):           107 samples (11.63%)
Class 4 (very severe):       28 samples (3.04%)   ← Only 28 samples!

Imbalance Ratio: 14.68:1 (SEVERE!)
```

**Impact:** Model can't learn patterns for class 4 with only 28 examples

### Problem 2: MASSIVE Missing Data

```
ca (# of vessels):     66% missing  ← Most predictive feature! (r=0.52)
thal (thalassemia):    53% missing  ← 2nd most predictive (r=0.22)
slope:                 34% missing  ← Moderately predictive (r=-0.30)
```

**Impact:** Losing information from the most important features

### Problem 3: Poor Class Separability

**Classes 3 & 4 are nearly identical:**
```
Feature         Class 3    Class 4    Difference
Age             59.2       59.2       0.0 years
Trestbps        136.2      138.7      2.5 mm Hg
Thalch          120.5      127.8      7.3 bpm
```

**Impact:** Model can't distinguish between adjacent severity levels

---

## 🎯 Solution Strategy: Multi-Pronged Approach

### Strategy 1: **Advanced Imputation** (Immediate Win)

**Problem:** 66% missing in `ca` (most predictive feature)

**Solutions:**

#### A. Iterative Imputer (Recommended)
```python
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from sklearn.ensemble import RandomForestRegressor

# Use other features to predict missing ca/thal values
imputer = IterativeImputer(
    estimator=RandomForestRegressor(n_estimators=100, random_state=42),
    max_iter=10,
    random_state=42
)

# Impute on training data only!
X_train_imputed = imputer.fit_transform(X_train)
X_test_imputed = imputer.transform(X_test)
```

**Expected Improvement:** +5-10% F1 score

#### B. Multiple Imputation
```python
from sklearn.impute import IterativeImputer

# Create multiple imputed datasets
n_imputations = 5
models = []

for i in range(n_imputations):
    imputer = IterativeImputer(random_state=i)
    X_train_imp = imputer.fit_transform(X_train)
    
    model = XGBClassifier(...)
    model.fit(X_train_imp, y_train)
    models.append(model)

# Ensemble predictions
predictions = np.array([model.predict(X_test_imp) for model in models])
final_pred = stats.mode(predictions, axis=0)[0]
```

**Expected Improvement:** +3-7% F1 score

---

### Strategy 2: **Class Grouping** (High Impact)

**Current:** Trying to predict 5 classes with poor separation

**Solution:** Hierarchical classification

#### Option A: Binary + Severity (Recommended)
```python
# Stage 1: Binary (disease vs no disease)
binary_model = XGBClassifier(...)
has_disease = binary_model.predict(X)

# Stage 2: Only for diseased patients, predict severity (1-4)
severity_model = XGBClassifier(...)
severity = severity_model.predict(X[has_disease])

# Combine predictions
final_pred[has_disease] = severity + 1  # Shift to 1-4
final_pred[~has_disease] = 0
```

**Expected Improvement:** +10-15% F1 score
**Why it works:** 
- Binary is easier (you already get 0.85!)
- Severity model focuses on harder problem with more balanced classes

#### Option B: Three-Level Grouping
```python
# Group classes:
# 0 → 0 (No disease)
# 1,2 → 1 (Mild-Moderate)  
# 3,4 → 2 (Severe-Very Severe)

y_grouped = y.copy()
y_grouped[(y == 1) | (y == 2)] = 1
y_grouped[(y == 3) | (y == 4)] = 2

# Train on grouped targets
model = XGBClassifier(...)
model.fit(X_train, y_grouped_train)
```

**Expected Improvement:** +8-12% F1 score
**Rationale:** Classes 3&4 are too similar, grouping makes sense

---

### Strategy 3: **Feature Engineering** (Medium Impact)

#### A. Domain-Based Features
```python
# Risk score based on medical knowledge
df['risk_score'] = (
    (df['age'] > 55).astype(int) * 2 +
    (df['trestbps'] > 140).astype(int) * 1 +
    (df['chol'] > 240).astype(int) * 1 +
    (df['exang'] == 1).astype(int) * 2 +
    (df['oldpeak'] > 2).astype(int) * 3
)

# Age-heart rate interaction (older + low max HR = bad)
df['age_thalch_interaction'] = df['age'] / (df['thalch'] + 1)

# Chest pain severity (categorical to ordinal)
cp_severity = {'typical angina': 3, 'atypical angina': 2, 
               'non-anginal': 1, 'asymptomatic': 0}
df['cp_severity'] = df['cp'].map(cp_severity)
```

**Expected Improvement:** +3-5% F1 score

#### B. Polynomial Features (Selected)
```python
from sklearn.preprocessing import PolynomialFeatures

# Only for top features to avoid overfitting
top_features = ['oldpeak', 'ca', 'thalch', 'age']
poly = PolynomialFeatures(degree=2, include_bias=False)
poly_features = poly.fit_transform(df[top_features])
```

**Expected Improvement:** +2-4% F1 score

---

### Strategy 4: **Advanced SMOTE** (Immediate Win)

**Current:** Probably using basic SMOTE

**Better:** Use SMOTE variants designed for multi-class

#### A. SMOTE-ENN (SMOTE + Edited Nearest Neighbors)
```python
from imblearn.combine import SMOTEENN

smote_enn = SMOTEENN(random_state=42)
X_resampled, y_resampled = smote_enn.fit_resample(X_train, y_train)
```

**Why better:** Cleans up overlapping regions after oversampling

#### B. Adaptive Synthetic Sampling (ADASYN)
```python
from imblearn.over_sampling import ADASYN

adasyn = ADASYN(random_state=42)
X_resampled, y_resampled = adasyn.fit_resample(X_train, y_train)
```

**Why better:** Focuses on harder-to-learn examples

#### C. Borderline-SMOTE
```python
from imblearn.over_sampling import BorderlineSMOTE

borderline_smote = BorderlineSMOTE(random_state=42)
X_resampled, y_resampled = borderline_smote.fit_resample(X_train, y_train)
```

**Why better:** Only synthesizes samples near decision boundary

**Expected Improvement:** +5-8% F1 score over basic SMOTE

---

### Strategy 5: **Model Optimization** (Medium Impact)

#### A. XGBoost with Class Weights & Focal Loss

**Current XGBoost (probably):**
```python
model = XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1
)
```

**Optimized XGBoost:**
```python
from sklearn.utils import compute_class_weight

# Compute class weights
class_weights = compute_class_weight(
    'balanced',
    classes=np.unique(y_train),
    y=y_train
)
sample_weights = np.array([class_weights[y] for y in y_train])

model = XGBClassifier(
    n_estimators=300,              # More trees
    max_depth=4,                   # Shallower (prevent overfit)
    learning_rate=0.05,            # Lower (more careful)
    min_child_weight=5,            # Require more samples per leaf
    gamma=0.1,                     # Regularization
    subsample=0.8,                 # Row sampling
    colsample_bytree=0.8,          # Feature sampling
    reg_alpha=1,                   # L1 regularization
    reg_lambda=2,                  # L2 regularization
    scale_pos_weight=None,         # Let sample_weights handle it
    objective='multi:softmax',
    eval_metric='mlogloss',
    random_state=42
)

# Train with sample weights
model.fit(X_train, y_train, sample_weight=sample_weights)
```

**Expected Improvement:** +5-10% F1 score

#### B. Ensemble Multiple Models
```python
from sklearn.ensemble import VotingClassifier

# Train different model types
rf = RandomForestClassifier(
    n_estimators=300,
    max_depth=10,
    class_weight='balanced',
    random_state=42
)

xgb = XGBClassifier(...)  # optimized as above

lgb = LGBMClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    class_weight='balanced',
    random_state=42
)

# Voting ensemble
ensemble = VotingClassifier(
    estimators=[('rf', rf), ('xgb', xgb), ('lgb', lgb)],
    voting='soft',  # Use predicted probabilities
    weights=[1, 2, 1]  # Give more weight to best performer
)

ensemble.fit(X_train, y_train)
```

**Expected Improvement:** +3-8% F1 score

---

### Strategy 6: **Ordinal Classification** (Novel Approach)

**Key Insight:** Your classes have natural order (0 < 1 < 2 < 3 < 4)

**Standard multi-class treats them as independent!**

#### Ordinal Regression Approach
```python
from mord import LogisticAT  # All-threshold variant

# Ordinal logistic regression
model = LogisticAT(alpha=1.0)
model.fit(X_train, y_train)
```

**Or create custom ordinal XGBoost:**
```python
# Predict cumulative probabilities
# P(Y ≤ k) for k = 0, 1, 2, 3, 4

def ordinal_encoding(y, n_classes=5):
    """Convert to cumulative format"""
    encoded = np.zeros((len(y), n_classes-1))
    for i, val in enumerate(y):
        encoded[i, :val] = 1
    return encoded

# Train separate binary classifiers for each threshold
models = []
for threshold in range(4):  # 0 vs >0, ≤1 vs >1, etc.
    y_binary = (y_train > threshold).astype(int)
    
    model = XGBClassifier(...)
    model.fit(X_train, y_binary)
    models.append(model)

# Predict by finding transition point
def predict_ordinal(X):
    probs = np.array([model.predict_proba(X)[:, 1] for model in models])
    # Sum probabilities to get predicted class
    return np.sum(probs > 0.5, axis=0)
```

**Expected Improvement:** +5-10% F1 score
**Why it works:** Respects the ordering constraint

---

### Strategy 7: **Calibration** (Final Polish)

**Problem:** Model might be overconfident or underconfident

```python
from sklearn.calibration import CalibratedClassifierCV

# Calibrate probabilities
calibrated_model = CalibratedClassifierCV(
    base_estimator=model,
    method='isotonic',  # or 'sigmoid'
    cv=5
)

calibrated_model.fit(X_train, y_train)
```

**Expected Improvement:** +1-3% F1 score

---

## 🎯 Recommended Implementation Plan

### Phase 1: Quick Wins (1-2 days)
**Expected gain: +15-20% F1 (0.58 → 0.70-0.73)**

1. ✅ **Advanced imputation** (IterativeImputer)
2. ✅ **Hierarchical classification** (Binary → Severity)
3. ✅ **Optimized XGBoost** with class weights
4. ✅ **SMOTE-ENN** or ADASYN

```python
# Quick implementation template
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from imblearn.combine import SMOTEENN
from xgboost import XGBClassifier

# Step 1: Imputation
imputer = IterativeImputer(max_iter=10, random_state=42)
X_train_imp = imputer.fit_transform(X_train)
X_test_imp = imputer.transform(X_test)

# Step 2: SMOTE-ENN
smote_enn = SMOTEENN(random_state=42)
X_train_balanced, y_train_balanced = smote_enn.fit_resample(X_train_imp, y_train)

# Step 3: Hierarchical classification
# Binary stage
y_binary = (y_train_balanced > 0).astype(int)
binary_model = XGBClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    scale_pos_weight=len(y_binary[y_binary==0]) / len(y_binary[y_binary==1])
)
binary_model.fit(X_train_balanced, y_binary)

# Severity stage (only on diseased samples)
diseased_mask = y_train_balanced > 0
X_diseased = X_train_balanced[diseased_mask]
y_severity = y_train_balanced[diseased_mask] - 1  # Shift to 0-3

severity_model = XGBClassifier(
    n_estimators=300,
    max_depth=4,
    learning_rate=0.05,
    class_weight='balanced'
)
severity_model.fit(X_diseased, y_severity)

# Prediction
def predict_hierarchical(X):
    has_disease = binary_model.predict(X)
    predictions = np.zeros(len(X), dtype=int)
    
    if has_disease.sum() > 0:
        diseased_samples = X[has_disease == 1]
        severity = severity_model.predict(diseased_samples)
        predictions[has_disease == 1] = severity + 1
    
    return predictions

predictions = predict_hierarchical(X_test_imp)
```

### Phase 2: Feature Engineering (2-3 days)
**Expected additional gain: +5-8% F1 (0.73 → 0.78-0.81)**

1. ✅ Create domain features
2. ✅ Polynomial features for top predictors
3. ✅ Interaction features

### Phase 3: Advanced Techniques (3-5 days)
**Expected additional gain: +3-5% F1 (0.78 → 0.81-0.86)**

1. ✅ Ordinal classification
2. ✅ Ensemble methods
3. ✅ Calibration
4. ✅ Hyperparameter tuning (Optuna/GridSearch)

---

## 📊 Evaluation Strategy

**Use stratified K-fold for reliable estimates:**
```python
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import classification_report, confusion_matrix

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
f1_scores = []

for train_idx, val_idx in skf.split(X, y):
    X_train, X_val = X[train_idx], X[val_idx]
    y_train, y_val = y[train_idx], y[val_idx]
    
    # Your pipeline here
    model.fit(X_train, y_train)
    y_pred = model.predict(X_val)
    
    f1 = f1_score(y_val, y_pred, average='weighted')
    f1_scores.append(f1)

print(f"Mean F1: {np.mean(f1_scores):.4f} ± {np.std(f1_scores):.4f}")
```

**Per-class metrics:**
```python
print(classification_report(y_test, y_pred, target_names=['0', '1', '2', '3', '4']))

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix')
```

---

## 🚨 Common Mistakes to Avoid

1. ❌ **Applying SMOTE to test data** → ONLY train data!
2. ❌ **Imputing train and test together** → Fit on train, transform test
3. ❌ **Using accuracy metric** → Use weighted F1-score
4. ❌ **Not checking class distribution after resampling**
5. ❌ **Forgetting to save/load imputer for deployment**

---

## 🎯 Expected Final Performance

With all strategies combined:

| Approach | Expected F1 | Difficulty |
|----------|-------------|------------|
| Current (XGBoost + basic SMOTE) | 0.58 | Baseline |
| + Advanced imputation | 0.63-0.68 | Easy |
| + Hierarchical classification | 0.70-0.75 | Medium |
| + Feature engineering | 0.73-0.78 | Medium |
| + Ordinal classification | 0.76-0.81 | Hard |
| + Full ensemble | 0.78-0.83 | Hard |

**Realistic target: F1 = 0.75-0.80** (vs current 0.58)

---

## 💡 Key Insights

1. **Class 4 problem:** Only 28 samples! Consider merging with class 3
2. **Missing data is killing you:** 66% missing in best feature (ca)
3. **Binary is much easier:** Leverage this with hierarchical approach
4. **Classes 3 & 4 overlap heavily:** Natural grouping opportunity
5. **Ordinal structure matters:** Use ordinal classification

**Bottom line:** Multi-class is MUCH harder than binary. Your 0.58 isn't bad considering the challenges. With these strategies, 0.75+ is achievable!
