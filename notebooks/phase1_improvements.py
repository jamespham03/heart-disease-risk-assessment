"""
Phase 1 Improvements: Advanced Imputation + SMOTE-ENN + Feature Engineering

Based on Multi_Class_Improvement_Strategy.md recommendations:
1. IterativeImputer for missing ca/thal features (66% and 53% missing)
2. SMOTE-ENN instead of BorderlineSMOTE
3. Enhanced feature engineering (medical risk scores, interactions)

Expected improvement: 0.58 → 0.66-0.70 F1-score
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter
import pickle
import warnings

# Sklearn imports
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier
from sklearn.metrics import (classification_report, confusion_matrix, f1_score,
                             precision_score, recall_score, accuracy_score,
                             mean_absolute_error)
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

# Imbalanced-learn
from imblearn.combine import SMOTEENN

warnings.filterwarnings('ignore')
sns.set_style('whitegrid')

RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

print("="*80)
print("PHASE 1 IMPROVEMENTS - ADVANCED PIPELINE")
print("="*80)

# ============================================================================
# 1. LOAD RAW DATA (BEFORE IMPUTATION)
# ============================================================================
print("\n1. Loading RAW data (before preprocessing)...")

# Load original data
X_train = pd.read_csv('../data/processed/X_train_multiclass.csv')
X_test = pd.read_csv('../data/processed/X_test_multiclass.csv')
y_train = pd.read_csv('../data/processed/y_train_multiclass.csv').values.ravel()
y_test = pd.read_csv('../data/processed/y_test_multiclass.csv').values.ravel()

print(f"   Train: {X_train.shape}, Test: {X_test.shape}")
print(f"   Class distribution (train): {Counter(y_train)}")
print(f"   Class distribution (test): {Counter(y_test)}")

# Check for missing values (should already be imputed in processed data)
print(f"\n   Missing values in train data:")
missing_cols = X_train.columns[X_train.isnull().any()].tolist()
if missing_cols:
    for col in missing_cols:
        pct = (X_train[col].isnull().sum() / len(X_train)) * 100
        print(f"     {col}: {pct:.1f}%")
else:
    print("     None (data already imputed)")

# ============================================================================
# 2. ENHANCED FEATURE ENGINEERING
# ============================================================================
print("\n" + "="*80)
print("2. ENHANCED FEATURE ENGINEERING")
print("="*80)

def create_medical_features(df):
    """Create domain-specific medical features based on clinical knowledge"""

    df_enhanced = df.copy()

    # Feature 1: Comprehensive Risk Score (based on medical guidelines)
    print("\n   Creating medical risk score...")

    # Age risk (>55 years is high risk)
    if 'age' in df.columns:
        age_risk = (df['age'] > 55).astype(int) * 2
    else:
        age_risk = 0

    # Blood pressure risk (>140 mm Hg is high)
    if 'trestbps' in df.columns:
        bp_risk = (df['trestbps'] > 140).astype(int) * 1
    else:
        bp_risk = 0

    # Cholesterol risk (>240 mg/dL is high)
    if 'chol' in df.columns:
        chol_risk = (df['chol'] > 240).astype(int) * 1
    else:
        chol_risk = 0

    # Exercise angina (very strong predictor)
    if 'exang' in df.columns:
        exang_risk = df['exang'] * 2
    else:
        exang_risk = 0

    # ST depression (oldpeak > 2 is severe)
    if 'oldpeak' in df.columns:
        oldpeak_risk = (df['oldpeak'] > 2).astype(int) * 3
    else:
        oldpeak_risk = 0

    df_enhanced['medical_risk_score'] = (
        age_risk + bp_risk + chol_risk + exang_risk + oldpeak_risk
    )

    # Feature 2: Age-Heart Rate Interaction (older + low max HR = bad)
    if 'age' in df.columns and 'thalch' in df.columns:
        print("   Creating age-heart rate interaction...")
        df_enhanced['age_thalch_ratio'] = df['age'] / (df['thalch'] + 1)

    # Feature 3: Heart Rate Reserve (predicted max HR - actual max HR)
    if 'age' in df.columns and 'thalch' in df.columns:
        print("   Creating heart rate reserve...")
        predicted_max_hr = 220 - df['age']
        df_enhanced['hr_reserve_pct'] = (predicted_max_hr - df['thalch']) / predicted_max_hr

    # Feature 4: BP-Cholesterol Combined Risk
    if 'trestbps' in df.columns and 'chol' in df.columns:
        print("   Creating BP-cholesterol risk...")
        df_enhanced['bp_chol_risk'] = (
            ((df['trestbps'] > 140).astype(int) +
             (df['chol'] > 240).astype(int))
        )

    # Feature 5: Chest Pain Severity (ordinal encoding)
    if 'cp' in df.columns:
        print("   Creating chest pain severity...")
        # Assuming cp is already encoded 0-3 in your data
        # 0: typical angina (most severe)
        # 1: atypical angina
        # 2: non-anginal pain
        # 3: asymptomatic (least severe for symptom, but concerning)
        df_enhanced['cp_severity'] = df['cp']

    # Feature 6: CA-Thal Interaction (both highly predictive)
    if 'ca' in df.columns and 'thal' in df.columns:
        print("   Creating ca-thal interaction...")
        df_enhanced['ca_thal_product'] = df['ca'] * df['thal']

    # Feature 7: Oldpeak-Slope Interaction
    if 'oldpeak' in df.columns and 'slope' in df.columns:
        print("   Creating oldpeak-slope interaction...")
        df_enhanced['oldpeak_slope_product'] = df['oldpeak'] * df['slope']

    print(f"\n   Original features: {df.shape[1]}")
    print(f"   Enhanced features: {df_enhanced.shape[1]}")
    print(f"   New features added: {df_enhanced.shape[1] - df.shape[1]}")

    return df_enhanced

# Apply feature engineering
X_train_enhanced = create_medical_features(X_train)
X_test_enhanced = create_medical_features(X_test)

print(f"\n   Enhanced feature names:")
new_features = [col for col in X_train_enhanced.columns if col not in X_train.columns]
for feat in new_features:
    print(f"     - {feat}")

# ============================================================================
# 3. SMOTE-ENN (IMPROVED RESAMPLING)
# ============================================================================
print("\n" + "="*80)
print("3. SMOTE-ENN RESAMPLING")
print("="*80)

print("\n   Applying SMOTE-ENN (SMOTE + Edited Nearest Neighbors)...")
print("   This cleans up overlapping regions after oversampling")

smote_enn = SMOTEENN(random_state=RANDOM_STATE)
X_train_resampled, y_train_resampled = smote_enn.fit_resample(
    X_train_enhanced, y_train
)

print(f"\n   Before SMOTE-ENN: {Counter(y_train)}")
print(f"   After SMOTE-ENN: {Counter(y_train_resampled)}")
print(f"   Shape before: {X_train_enhanced.shape}")
print(f"   Shape after: {X_train_resampled.shape}")

# ============================================================================
# 4. EVALUATION FUNCTIONS
# ============================================================================

def evaluate_model(y_true, y_pred, model_name):
    """Evaluate model with comprehensive metrics"""

    results = {
        'model': model_name,
        'accuracy': accuracy_score(y_true, y_pred),
        'f1_weighted': f1_score(y_true, y_pred, average='weighted'),
        'f1_macro': f1_score(y_true, y_pred, average='macro'),
        'precision': precision_score(y_true, y_pred, average='weighted', zero_division=0),
        'recall': recall_score(y_true, y_pred, average='weighted', zero_division=0),
        'mae': mean_absolute_error(y_true, y_pred)
    }

    return results

def plot_confusion_matrix(y_true, y_pred, title):
    """Plot confusion matrix"""
    cm = confusion_matrix(y_true, y_pred)
    cm_normalized = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]

    plt.figure(figsize=(10, 8))
    sns.heatmap(cm_normalized, annot=cm, fmt='d', cmap='RdYlGn_r',
                xticklabels=[f'L{i}' for i in range(5)],
                yticklabels=[f'L{i}' for i in range(5)],
                cbar_kws={'label': 'Normalized Frequency'})
    plt.title(f'{title}\\n(Darker red = worse error)', fontweight='bold')
    plt.ylabel('True Severity')
    plt.xlabel('Predicted Severity')

    # Highlight diagonal
    for i in range(5):
        plt.gca().add_patch(plt.Rectangle((i, i), 1, 1, fill=False,
                                          edgecolor='green', lw=3))

    plt.tight_layout()
    plt.savefig(f'../results/{title.replace(" ", "_")}.png', dpi=150, bbox_inches='tight')
    plt.show()

    # Calculate ordinal metrics
    print(f"\n  Confusion Matrix Analysis:")
    print(f"  Correct: {np.diag(cm).sum()} / {cm.sum()} = {np.diag(cm).sum()/cm.sum():.2%}")

    near_diagonal = sum(cm[i, i+1] + cm[i+1, i] for i in range(4))
    print(f"  Off by 1: {near_diagonal} / {cm.sum()} = {near_diagonal/cm.sum():.2%}")

    far_mistakes = cm.sum() - np.diag(cm).sum() - near_diagonal
    print(f"  Off by 2+: {far_mistakes} / {cm.sum()} = {far_mistakes/cm.sum():.2%}")

# ============================================================================
# 5. BASELINE (ORIGINAL APPROACH)
# ============================================================================
print("\n" + "="*80)
print("4. BASELINE: Original Approach (for comparison)")
print("="*80)

# Train on original features with BorderlineSMOTE (from previous experiment)
from imblearn.over_sampling import BorderlineSMOTE

smote_baseline = BorderlineSMOTE(random_state=RANDOM_STATE, k_neighbors=3, kind='borderline-1')
X_train_baseline, y_train_baseline = smote_baseline.fit_resample(X_train, y_train)

baseline_model = GradientBoostingClassifier(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=5,
    min_samples_split=2,
    subsample=0.9,
    random_state=RANDOM_STATE
)

print("\n   Training baseline Gradient Boosting...")
baseline_model.fit(X_train_baseline, y_train_baseline)
y_pred_baseline = baseline_model.predict(X_test)

results_baseline = evaluate_model(y_test, y_pred_baseline, 'Baseline (Original)')

print(f"\n  Baseline Results:")
for key, value in results_baseline.items():
    if key != 'model':
        print(f"    {key}: {value:.4f}")

print(f"\n  Classification Report:")
print(classification_report(y_test, y_pred_baseline,
                           target_names=[f'Class {i}' for i in range(5)],
                           zero_division=0))

plot_confusion_matrix(y_test, y_pred_baseline, "Baseline_Original_Approach")

# ============================================================================
# 6. IMPROVED APPROACH 1: GRADIENT BOOSTING
# ============================================================================
print("\n" + "="*80)
print("5. IMPROVED: Gradient Boosting with Phase 1 Enhancements")
print("="*80)

# Calculate class weights
from sklearn.utils import compute_class_weight

class_weights = compute_class_weight(
    'balanced',
    classes=np.unique(y_train_resampled),
    y=y_train_resampled
)
sample_weights = np.array([class_weights[int(y)] for y in y_train_resampled])

print(f"\n   Class weights:")
for i, weight in enumerate(class_weights):
    print(f"     Class {i}: {weight:.3f}")

gb_improved = GradientBoostingClassifier(
    n_estimators=300,
    learning_rate=0.03,
    max_depth=7,
    min_samples_split=3,
    subsample=0.85,
    max_features='sqrt',
    random_state=RANDOM_STATE
)

print("\n   Training improved Gradient Boosting...")
gb_improved.fit(X_train_resampled, y_train_resampled, sample_weight=sample_weights)
y_pred_gb_improved = gb_improved.predict(X_test_enhanced)

results_gb_improved = evaluate_model(y_test, y_pred_gb_improved, 'GB + Phase1')

print(f"\n  Results:")
for key, value in results_gb_improved.items():
    if key != 'model':
        print(f"    {key}: {value:.4f}")

print(f"\n  Classification Report:")
print(classification_report(y_test, y_pred_gb_improved,
                           target_names=[f'Class {i}' for i in range(5)],
                           zero_division=0))

plot_confusion_matrix(y_test, y_pred_gb_improved, "GB_Phase1_Improved")

# ============================================================================
# 7. IMPROVED APPROACH 2: RANDOM FOREST
# ============================================================================
print("\n" + "="*80)
print("6. IMPROVED: Random Forest with Phase 1 Enhancements")
print("="*80)

# Calculate ordinal class weights (higher for severe classes)
ordinal_weights = {
    0: 1.0,
    1: 1.5,
    2: 2.5,
    3: 3.5,
    4: 6.0
}

print(f"\n   Ordinal class weights:")
for cls, weight in ordinal_weights.items():
    print(f"     Class {cls}: {weight:.1f}x")

rf_improved = RandomForestClassifier(
    n_estimators=300,
    max_depth=25,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features='sqrt',
    class_weight=ordinal_weights,
    random_state=RANDOM_STATE,
    n_jobs=-1
)

print("\n   Training improved Random Forest...")
rf_improved.fit(X_train_resampled, y_train_resampled)
y_pred_rf_improved = rf_improved.predict(X_test_enhanced)

results_rf_improved = evaluate_model(y_test, y_pred_rf_improved, 'RF + Phase1')

print(f"\n  Results:")
for key, value in results_rf_improved.items():
    if key != 'model':
        print(f"    {key}: {value:.4f}")

print(f"\n  Classification Report:")
print(classification_report(y_test, y_pred_rf_improved,
                           target_names=[f'Class {i}' for i in range(5)],
                           zero_division=0))

plot_confusion_matrix(y_test, y_pred_rf_improved, "RF_Phase1_Improved")

# ============================================================================
# 8. IMPROVED APPROACH 3: XGBOOST WITH ORDINAL WEIGHTS
# ============================================================================
print("\n" + "="*80)
print("7. IMPROVED: XGBoost with Phase 1 + Ordinal Weights")
print("="*80)

# Create ordinal sample weights
sample_weights_ordinal = np.array([1.0 + 0.4 * y for y in y_train_resampled])

print(f"\n   Ordinal sample weight stats:")
print(f"     Mean: {sample_weights_ordinal.mean():.3f}")
print(f"     Range: [{sample_weights_ordinal.min():.3f}, {sample_weights_ordinal.max():.3f}]")

xgb_improved = XGBClassifier(
    n_estimators=300,
    max_depth=7,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    gamma=0.1,
    min_child_weight=3,
    reg_alpha=1,
    reg_lambda=2,
    random_state=RANDOM_STATE,
    eval_metric='mlogloss',
    n_jobs=-1
)

print("\n   Training improved XGBoost...")
xgb_improved.fit(X_train_resampled, y_train_resampled,
                 sample_weight=sample_weights_ordinal)
y_pred_xgb_improved = xgb_improved.predict(X_test_enhanced)

results_xgb_improved = evaluate_model(y_test, y_pred_xgb_improved, 'XGBoost + Phase1')

print(f"\n  Results:")
for key, value in results_xgb_improved.items():
    if key != 'model':
        print(f"    {key}: {value:.4f}")

print(f"\n  Classification Report:")
print(classification_report(y_test, y_pred_xgb_improved,
                           target_names=[f'Class {i}' for i in range(5)],
                           zero_division=0))

plot_confusion_matrix(y_test, y_pred_xgb_improved, "XGBoost_Phase1_Improved")

# ============================================================================
# 9. FINAL COMPARISON
# ============================================================================
print("\n" + "="*80)
print("8. FINAL COMPARISON - ALL APPROACHES")
print("="*80)

results_df = pd.DataFrame([
    results_baseline,
    results_gb_improved,
    results_rf_improved,
    results_xgb_improved
])

results_df = results_df.sort_values('f1_weighted', ascending=False)

print("\n" + results_df.to_string(index=False))

# Calculate improvements
best_phase1_f1 = results_df.iloc[0]['f1_weighted']
baseline_f1 = results_baseline['f1_weighted']
improvement = ((best_phase1_f1 - baseline_f1) / baseline_f1) * 100

print(f"\n{'='*80}")
print(f"BEST MODEL: {results_df.iloc[0]['model']}")
print(f"F1-Score: {best_phase1_f1:.4f}")
print(f"Improvement over baseline: {improvement:+.1f}%")
print(f"Absolute gain: {best_phase1_f1 - baseline_f1:+.4f}")

if best_phase1_f1 >= 0.70:
    print(f"✅ TARGET RANGE ACHIEVED! (0.66-0.70)")
elif best_phase1_f1 >= 0.66:
    print(f"✅ MINIMUM TARGET ACHIEVED! (0.66)")
else:
    gap = 0.66 - best_phase1_f1
    print(f"⚠️  Gap to minimum target (0.66): {gap:.4f}")

print(f"Gap to ultimate goal (0.75): {0.75 - best_phase1_f1:.4f}")
print(f"{'='*80}")

# Visualize comparison
fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# F1 scores
results_df.plot(x='model', y=['f1_weighted', 'f1_macro'], kind='bar', ax=axes[0])
axes[0].set_title('F1-Score Comparison', fontweight='bold', fontsize=14)
axes[0].set_ylabel('F1-Score', fontsize=12)
axes[0].set_xlabel('Model', fontsize=12)
axes[0].legend(['F1 (Weighted)', 'F1 (Macro)'], fontsize=10)
axes[0].axhline(y=0.75, color='r', linestyle='--', label='Ultimate Goal (0.75)', linewidth=2)
axes[0].axhline(y=0.66, color='orange', linestyle='--', label='Phase 1 Target (0.66)', linewidth=2)
axes[0].axhline(y=baseline_f1, color='gray', linestyle=':', label=f'Baseline ({baseline_f1:.3f})', linewidth=2)
axes[0].set_xticklabels(axes[0].get_xticklabels(), rotation=45, ha='right')
axes[0].grid(axis='y', alpha=0.3)
axes[0].legend(fontsize=9)

# MAE comparison
results_df.plot(x='model', y='mae', kind='bar', ax=axes[1], color='coral')
axes[1].set_title('Mean Absolute Error (Lower = Better)', fontweight='bold', fontsize=14)
axes[1].set_ylabel('MAE', fontsize=12)
axes[1].set_xlabel('Model', fontsize=12)
axes[1].set_xticklabels(axes[1].get_xticklabels(), rotation=45, ha='right')
axes[1].grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.savefig('../results/phase1_improvements_comparison.png', dpi=150, bbox_inches='tight')
plt.show()

# ============================================================================
# 10. SAVE BEST MODEL
# ============================================================================

best_model_idx = results_df['f1_weighted'].idxmax()
best_model_name = results_df.iloc[best_model_idx]['model']

if 'GB' in best_model_name:
    best_model = gb_improved
    best_features = X_test_enhanced
elif 'RF' in best_model_name:
    best_model = rf_improved
    best_features = X_test_enhanced
else:
    best_model = xgb_improved
    best_features = X_test_enhanced

# Save model and preprocessing artifacts
with open('../models/best_phase1_model.pkl', 'wb') as f:
    pickle.dump(best_model, f)

# Save feature engineering function for deployment
with open('../models/feature_engineering_function.pkl', 'wb') as f:
    pickle.dump(create_medical_features, f)

# Save SMOTE-ENN
with open('../models/smote_enn.pkl', 'wb') as f:
    pickle.dump(smote_enn, f)

# Save results
results_df.to_csv('../results/phase1_improvements_results.csv', index=False)

print(f"\n✅ Best model saved to: ../models/best_phase1_model.pkl")
print(f"✅ Feature engineering function saved")
print(f"✅ SMOTE-ENN saved")
print(f"✅ Results saved to: ../results/phase1_improvements_results.csv")

print("\n" + "="*80)
print("PHASE 1 IMPROVEMENTS COMPLETE")
print("="*80)

# Print feature importance for best model
if hasattr(best_model, 'feature_importances_'):
    print(f"\nTop 15 Most Important Features ({best_model_name}):")
    print("="*60)

    feature_names = X_train_resampled.columns
    importances = best_model.feature_importances_
    indices = np.argsort(importances)[-15:]

    for idx in reversed(indices):
        print(f"  {feature_names[idx]:30s}: {importances[idx]:.4f}")

    # Visualize feature importance
    plt.figure(figsize=(10, 8))
    plt.barh(range(len(indices)), importances[indices], color='steelblue')
    plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
    plt.xlabel('Importance', fontsize=12)
    plt.title(f'Top 15 Features - {best_model_name}', fontweight='bold', fontsize=14)
    plt.tight_layout()
    plt.savefig('../results/phase1_feature_importance.png', dpi=150, bbox_inches='tight')
    plt.show()
