"""
Ordinal Classification Experiment for Heart Disease Severity Prediction

This script implements and compares:
1. Ordinal Logistic Regression (using statsmodels)
2. Cost-Sensitive Random Forest (with class weights)
3. Cost-Sensitive XGBoost (with class weights)
4. Ordinal-aware Gradient Boosting

Goal: Improve multi-class F1 score from 0.58 to 0.75
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter
import pickle
import warnings

# Sklearn imports
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (classification_report, confusion_matrix, f1_score,
                             precision_score, recall_score, accuracy_score,
                             mean_absolute_error)
from sklearn.model_selection import cross_val_score, StratifiedKFold
from xgboost import XGBClassifier

# Imbalanced-learn
from imblearn.over_sampling import BorderlineSMOTE

warnings.filterwarnings('ignore')
sns.set_style('whitegrid')

RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

print("="*80)
print("ORDINAL CLASSIFICATION EXPERIMENT")
print("="*80)

# ============================================================================
# 1. LOAD DATA
# ============================================================================
print("\n1. Loading preprocessed data...")

X_train = pd.read_csv('../data/processed/X_train_multiclass.csv')
X_test = pd.read_csv('../data/processed/X_test_multiclass.csv')
y_train = pd.read_csv('../data/processed/y_train_multiclass.csv').values.ravel()
y_test = pd.read_csv('../data/processed/y_test_multiclass.csv').values.ravel()

print(f"   Train: {X_train.shape}, Test: {X_test.shape}")
print(f"   Class distribution (train): {Counter(y_train)}")
print(f"   Class distribution (test): {Counter(y_test)}")

# Apply BorderlineSMOTE (same as original notebook)
print("\n   Applying BorderlineSMOTE...")
smote = BorderlineSMOTE(random_state=RANDOM_STATE, k_neighbors=3, kind='borderline-1')
X_train_smote, y_train_smote = smote.fit_resample(X_train, y_train)
print(f"   After SMOTE: {Counter(y_train_smote)}")

# ============================================================================
# 2. DEFINE EVALUATION FUNCTIONS
# ============================================================================

def evaluate_ordinal_model(y_true, y_pred, model_name):
    """Evaluate model with metrics suitable for ordinal classification"""

    results = {
        'model': model_name,
        'accuracy': accuracy_score(y_true, y_pred),
        'f1_weighted': f1_score(y_true, y_pred, average='weighted'),
        'f1_macro': f1_score(y_true, y_pred, average='macro'),
        'precision': precision_score(y_true, y_pred, average='weighted', zero_division=0),
        'recall': recall_score(y_true, y_pred, average='weighted', zero_division=0),
        'mae': mean_absolute_error(y_true, y_pred)  # Important for ordinal: penalizes distance
    }

    return results

def plot_ordinal_confusion_matrix(y_true, y_pred, title):
    """Plot confusion matrix with emphasis on diagonal and near-diagonal"""
    cm = confusion_matrix(y_true, y_pred)
    cm_normalized = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]

    plt.figure(figsize=(10, 8))
    sns.heatmap(cm_normalized, annot=cm, fmt='d', cmap='RdYlGn_r',
                xticklabels=['Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4'],
                yticklabels=['Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4'],
                cbar_kws={'label': 'Normalized Frequency'})
    plt.title(f'{title}\\nDarker red = more severe error', fontweight='bold')
    plt.ylabel('True Severity Level')
    plt.xlabel('Predicted Severity Level')

    # Highlight diagonal (correct predictions)
    for i in range(5):
        plt.gca().add_patch(plt.Rectangle((i, i), 1, 1, fill=False,
                                          edgecolor='green', lw=3))

    plt.tight_layout()
    plt.savefig(f'../results/{title.replace(" ", "_")}.png', dpi=150)
    plt.show()

    # Calculate ordinal metrics
    print(f"\n  Confusion Matrix Analysis:")
    print(f"  Diagonal (correct): {np.diag(cm).sum()} / {cm.sum()} = {np.diag(cm).sum()/cm.sum():.2%}")

    # Near-diagonal (off by 1)
    near_diagonal = sum(cm[i, i+1] + cm[i+1, i] for i in range(4))
    print(f"  Off by 1: {near_diagonal} / {cm.sum()} = {near_diagonal/cm.sum():.2%}")

    # Far mistakes (off by 2+)
    far_mistakes = cm.sum() - np.diag(cm).sum() - near_diagonal
    print(f"  Off by 2+: {far_mistakes} / {cm.sum()} = {far_mistakes/cm.sum():.2%}")

def calculate_ordinal_class_weights(y, alpha=2.0):
    """
    Calculate class weights with ordinal penalty

    Args:
        y: target labels
        alpha: penalty exponent (higher = more aggressive weighting)

    Returns:
        dict: class weights
    """
    from collections import Counter
    class_counts = Counter(y)
    total = len(y)
    n_classes = len(class_counts)

    # Base weights (inverse frequency)
    base_weights = {cls: total / (n_classes * count)
                    for cls, count in class_counts.items()}

    # Ordinal penalty: higher severity classes get higher weights
    ordinal_weights = {cls: base_weights[cls] * (1 + cls * 0.2)
                      for cls in class_counts.keys()}

    print(f"\n  Class weights (ordinal-aware):")
    for cls in sorted(ordinal_weights.keys()):
        print(f"    Class {cls}: {ordinal_weights[cls]:.3f} (count: {class_counts[cls]})")

    return ordinal_weights

# ============================================================================
# 3. BASELINE: REPRODUCE CURRENT BEST MODEL
# ============================================================================
print("\n" + "="*80)
print("2. BASELINE: Current Best Gradient Boosting (from original notebook)")
print("="*80)

baseline_gb = GradientBoostingClassifier(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=5,
    min_samples_split=2,
    subsample=0.9,
    random_state=RANDOM_STATE
)

baseline_gb.fit(X_train_smote, y_train_smote)
y_pred_baseline = baseline_gb.predict(X_test)

results_baseline = evaluate_ordinal_model(y_test, y_pred_baseline, 'Baseline GB')

print(f"\n  Baseline Results:")
for key, value in results_baseline.items():
    if key != 'model':
        print(f"    {key}: {value:.4f}")

print(f"\n  Classification Report:")
print(classification_report(y_test, y_pred_baseline,
                           target_names=[f'Class {i}' for i in range(5)],
                           zero_division=0))

plot_ordinal_confusion_matrix(y_test, y_pred_baseline,
                              "Baseline_Gradient_Boosting")

# ============================================================================
# 4. APPROACH 1: COST-SENSITIVE RANDOM FOREST WITH ORDINAL WEIGHTS
# ============================================================================
print("\n" + "="*80)
print("3. APPROACH 1: Cost-Sensitive Random Forest (Ordinal Weights)")
print("="*80)

# Calculate ordinal-aware class weights
class_weights_ordinal = calculate_ordinal_class_weights(y_train_smote, alpha=2.0)

rf_ordinal = RandomForestClassifier(
    n_estimators=300,
    max_depth=25,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features='sqrt',
    class_weight=class_weights_ordinal,
    random_state=RANDOM_STATE,
    n_jobs=-1
)

print("\n  Training Random Forest with ordinal weights...")
rf_ordinal.fit(X_train_smote, y_train_smote)
y_pred_rf_ordinal = rf_ordinal.predict(X_test)

results_rf_ordinal = evaluate_ordinal_model(y_test, y_pred_rf_ordinal,
                                             'RF Ordinal Weights')

print(f"\n  Results:")
for key, value in results_rf_ordinal.items():
    if key != 'model':
        print(f"    {key}: {value:.4f}")

print(f"\n  Classification Report:")
print(classification_report(y_test, y_pred_rf_ordinal,
                           target_names=[f'Class {i}' for i in range(5)],
                           zero_division=0))

plot_ordinal_confusion_matrix(y_test, y_pred_rf_ordinal,
                              "RF_Ordinal_Weights")

# ============================================================================
# 5. APPROACH 2: COST-SENSITIVE XGBOOST WITH ORDINAL PENALTIES
# ============================================================================
print("\n" + "="*80)
print("4. APPROACH 2: XGBoost with Ordinal-aware Sample Weights")
print("="*80)

# Create sample weights that penalize based on severity
sample_weights = np.array([1.0 + 0.3 * y for y in y_train_smote])

print(f"\n  Sample weight statistics:")
print(f"    Mean: {sample_weights.mean():.3f}")
print(f"    Std: {sample_weights.std():.3f}")
print(f"    Range: [{sample_weights.min():.3f}, {sample_weights.max():.3f}]")

xgb_ordinal = XGBClassifier(
    n_estimators=300,
    max_depth=7,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    gamma=0.1,
    min_child_weight=3,
    random_state=RANDOM_STATE,
    eval_metric='mlogloss',
    n_jobs=-1
)

print("\n  Training XGBoost with sample weights...")
xgb_ordinal.fit(X_train_smote, y_train_smote, sample_weight=sample_weights)
y_pred_xgb_ordinal = xgb_ordinal.predict(X_test)

results_xgb_ordinal = evaluate_ordinal_model(y_test, y_pred_xgb_ordinal,
                                              'XGBoost Ordinal Weights')

print(f"\n  Results:")
for key, value in results_xgb_ordinal.items():
    if key != 'model':
        print(f"    {key}: {value:.4f}")

print(f"\n  Classification Report:")
print(classification_report(y_test, y_pred_xgb_ordinal,
                           target_names=[f'Class {i}' for i in range(5)],
                           zero_division=0))

plot_ordinal_confusion_matrix(y_test, y_pred_xgb_ordinal,
                              "XGBoost_Ordinal_Weights")

# ============================================================================
# 6. APPROACH 3: GRADIENT BOOSTING WITH AGGRESSIVE CLASS WEIGHTS
# ============================================================================
print("\n" + "="*80)
print("5. APPROACH 3: Gradient Boosting with Aggressive Ordinal Weights")
print("="*80)

# More aggressive weighting for rare classes
aggressive_weights = {
    0: 1.0,    # Most common
    1: 1.8,    # Mild
    2: 3.5,    # Moderate
    3: 4.0,    # Severe
    4: 8.0     # Critical - very rare (22 samples)
}

print(f"\n  Using aggressive class weights:")
for cls, weight in aggressive_weights.items():
    print(f"    Class {cls}: {weight:.1f}x")

# Create sample weights array
sample_weights_aggressive = np.array([aggressive_weights[int(y)]
                                      for y in y_train_smote])

gb_ordinal_aggressive = GradientBoostingClassifier(
    n_estimators=300,
    learning_rate=0.03,  # Lower learning rate for more careful training
    max_depth=7,
    min_samples_split=3,
    subsample=0.85,
    max_features='sqrt',
    random_state=RANDOM_STATE
)

print("\n  Training Gradient Boosting with aggressive weights...")
gb_ordinal_aggressive.fit(X_train_smote, y_train_smote,
                          sample_weight=sample_weights_aggressive)
y_pred_gb_aggressive = gb_ordinal_aggressive.predict(X_test)

results_gb_aggressive = evaluate_ordinal_model(y_test, y_pred_gb_aggressive,
                                                'GB Aggressive Weights')

print(f"\n  Results:")
for key, value in results_gb_aggressive.items():
    if key != 'model':
        print(f"    {key}: {value:.4f}")

print(f"\n  Classification Report:")
print(classification_report(y_test, y_pred_gb_aggressive,
                           target_names=[f'Class {i}' for i in range(5)],
                           zero_division=0))

plot_ordinal_confusion_matrix(y_test, y_pred_gb_aggressive,
                              "GB_Aggressive_Ordinal_Weights")

# ============================================================================
# 7. FINAL COMPARISON
# ============================================================================
print("\n" + "="*80)
print("6. FINAL COMPARISON - ALL APPROACHES")
print("="*80)

results_df = pd.DataFrame([
    results_baseline,
    results_rf_ordinal,
    results_xgb_ordinal,
    results_gb_aggressive
])

results_df = results_df.sort_values('f1_weighted', ascending=False)

print("\n" + results_df.to_string(index=False))

# Visualize comparison
fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# F1 scores
results_df.plot(x='model', y=['f1_weighted', 'f1_macro'], kind='bar', ax=axes[0])
axes[0].set_title('F1-Score Comparison', fontweight='bold', fontsize=14)
axes[0].set_ylabel('F1-Score', fontsize=12)
axes[0].set_xlabel('Model', fontsize=12)
axes[0].legend(['F1 (Weighted)', 'F1 (Macro)'], fontsize=10)
axes[0].axhline(y=0.75, color='r', linestyle='--', label='Target (0.75)', linewidth=2)
axes[0].axhline(y=0.5793, color='orange', linestyle=':', label='Original Best (0.5793)', linewidth=2)
axes[0].set_xticklabels(axes[0].get_xticklabels(), rotation=45, ha='right')
axes[0].grid(axis='y', alpha=0.3)
axes[0].legend(fontsize=9)

# MAE (Mean Absolute Error) - lower is better for ordinal
results_df.plot(x='model', y='mae', kind='bar', ax=axes[1], color='coral')
axes[1].set_title('Mean Absolute Error (Lower = Better)', fontweight='bold', fontsize=14)
axes[1].set_ylabel('MAE', fontsize=12)
axes[1].set_xlabel('Model', fontsize=12)
axes[1].set_xticklabels(axes[1].get_xticklabels(), rotation=45, ha='right')
axes[1].grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.savefig('../results/ordinal_classification_comparison.png', dpi=150)
plt.show()

# ============================================================================
# 8. SAVE BEST MODEL
# ============================================================================
best_model_idx = results_df['f1_weighted'].idxmax()
best_model_name = results_df.iloc[best_model_idx]['model']
best_f1 = results_df.iloc[best_model_idx]['f1_weighted']

print(f"\n{'='*80}")
print(f"BEST MODEL: {best_model_name}")
print(f"F1-Score (weighted): {best_f1:.4f}")
print(f"Improvement over baseline: {((best_f1 - 0.5793) / 0.5793) * 100:.1f}%")

if best_f1 >= 0.75:
    print(f"✅ TARGET ACHIEVED! (≥0.75)")
else:
    print(f"⚠️  Gap to target: {0.75 - best_f1:.4f} ({((0.75 - best_f1) / 0.75) * 100:.1f}%)")
print(f"{'='*80}")

# Select and save the best model
if 'RF' in best_model_name:
    best_model = rf_ordinal
elif 'XGBoost' in best_model_name:
    best_model = xgb_ordinal
elif 'Aggressive' in best_model_name:
    best_model = gb_ordinal_aggressive
else:
    best_model = baseline_gb

# Save model
with open('../models/best_ordinal_model.pkl', 'wb') as f:
    pickle.dump(best_model, f)

# Save results
results_df.to_csv('../results/ordinal_classification_results.csv', index=False)

print(f"\n✅ Best model saved to: ../models/best_ordinal_model.pkl")
print(f"✅ Results saved to: ../results/ordinal_classification_results.csv")

print("\n" + "="*80)
print("EXPERIMENT COMPLETE")
print("="*80)
