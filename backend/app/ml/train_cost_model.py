import pandas as pd
import numpy as np
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix
)


# ============================================================
# PATHS
# ============================================================

DATA_PATH = Path("data/training_dataset.csv")

MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

MODEL_PATH = MODEL_DIR / "cost_overrun_model.joblib"


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("PAIMANA INSIGHT - COST OVERRUN PREDICTION MODEL")
print("=" * 70)

print("\nLoading training dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Total rows: {len(df)}")
print(f"Total projects: {df['project_id'].nunique()}")


# ============================================================
# FEATURES
# ============================================================

feature_columns = [
    "sector",
    "original_cost",
    "revised_cost",
    "expenditure_to_date",
    "physical_progress_pct",

    "milestones_planned",
    "milestones_completed",

    "cost_overrun_ratio",
    "financial_completion_ratio",
    "milestone_completion_ratio",

    "burn_vs_progress_gap",

    "elapsed_days",
    "planned_duration_days",
    "time_elapsed_ratio",

    "progress_velocity",
    "progress_trend_3",
    "expenditure_trend_3",

    "expected_progress_pct",
    "progress_to_time_gap"
]


target_column = "cost_overrun_label"


X = df[feature_columns].copy()
y = df[target_column].copy()


# ============================================================
# PROJECT-LEVEL TRAIN / TEST SPLIT
# ============================================================
#
# IMPORTANT:
# We split projects, NOT individual monthly records.
#
# This prevents snapshots belonging to the same project
# from appearing in both training and testing data.
# ============================================================

project_labels = (
    df[
        ["project_id", target_column]
    ]
    .drop_duplicates("project_id")
)

train_projects, test_projects = train_test_split(
    project_labels,
    test_size=0.20,
    random_state=42,
    stratify=project_labels[target_column]
)

train_project_ids = set(train_projects["project_id"])
test_project_ids = set(test_projects["project_id"])


train_mask = df["project_id"].isin(train_project_ids)
test_mask = df["project_id"].isin(test_project_ids)


X_train = df.loc[train_mask, feature_columns]
X_test = df.loc[test_mask, feature_columns]

y_train = df.loc[train_mask, target_column]
y_test = df.loc[test_mask, target_column]


print("\nDataset split:")
print(f"Training projects: {len(train_project_ids)}")
print(f"Testing projects : {len(test_project_ids)}")
print(f"Training rows    : {len(X_train)}")
print(f"Testing rows     : {len(X_test)}")


# ============================================================
# CATEGORICAL + NUMERICAL FEATURES
# ============================================================

categorical_features = [
    "sector"
]

numeric_features = [
    column
    for column in feature_columns
    if column not in categorical_features
]


preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_features
        ),
        (
            "numeric",
            "passthrough",
            numeric_features
        )
    ]
)


# ============================================================
# RANDOM FOREST MODEL
# ============================================================

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=10,
    min_samples_split=10,
    min_samples_leaf=4,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)


pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "model",
            model
        )
    ]
)


# ============================================================
# TRAIN
# ============================================================

print("\nTraining Random Forest model...")

pipeline.fit(
    X_train,
    y_train
)

print("Training completed successfully!")


# ============================================================
# PREDICTION
# ============================================================

y_pred = pipeline.predict(X_test)

y_probability = pipeline.predict_proba(
    X_test
)[:, 1]


# ============================================================
# EVALUATION
# ============================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

precision = precision_score(
    y_test,
    y_pred,
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0
)

roc_auc = roc_auc_score(
    y_test,
    y_probability
)


print("\n" + "=" * 70)
print("MODEL PERFORMANCE")
print("=" * 70)

print(f"Accuracy  : {accuracy:.4f}")
print(f"Precision : {precision:.4f}")
print(f"Recall    : {recall:.4f}")
print(f"F1 Score  : {f1:.4f}")
print(f"ROC-AUC   : {roc_auc:.4f}")


print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        target_names=[
            "No Cost Overrun",
            "Cost Overrun"
        ],
        zero_division=0
    )
)


print("\nConfusion Matrix:")
print(
    confusion_matrix(
        y_test,
        y_pred
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(
    pipeline,
    MODEL_PATH
)

print("\n" + "=" * 70)
print("MODEL SAVED")
print("=" * 70)

print(f"Location: {MODEL_PATH}")

print("\nCost overrun model is ready! 🤖")