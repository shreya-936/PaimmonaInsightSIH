import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = Path("data")

updates_path = DATA_DIR / "historical_project_updates.csv"
outcomes_path = DATA_DIR / "project_outcomes.csv"
output_path = DATA_DIR / "training_dataset.csv"

updates = pd.read_csv(updates_path)
outcomes = pd.read_csv(outcomes_path)

updates["update_date"] = pd.to_datetime(updates["update_date"])
updates["start_date"] = pd.to_datetime(updates["start_date"])
updates["planned_end_date"] = pd.to_datetime(updates["planned_end_date"])

outcomes["actual_completion_date"] = pd.to_datetime(
    outcomes["actual_completion_date"]
)

df = updates.merge(
    outcomes,
    on="project_id",
    how="left"
)

df = df.sort_values(
    ["project_id", "update_date"]
).reset_index(drop=True)

# ---------------------------------------------------------
# FEATURE ENGINEERING
# ---------------------------------------------------------

# Current cost overrun
df["cost_overrun_ratio"] = np.where(
    df["original_cost"] != 0,
    (
        df["revised_cost"] - df["original_cost"]
    ) / df["original_cost"],
    0
)

# Financial completion
df["financial_completion_ratio"] = np.where(
    df["revised_cost"] != 0,
    df["expenditure_to_date"] / df["revised_cost"],
    0
)

# Milestone completion
df["milestone_completion_ratio"] = np.where(
    df["milestones_planned"] != 0,
    df["milestones_completed"] /
    df["milestones_planned"],
    0
)

# Burn vs physical progress
df["burn_vs_progress_gap"] = (
    df["financial_completion_ratio"] * 100
    - df["physical_progress_pct"]
)

# Time elapsed
df["elapsed_days"] = (
    df["update_date"] - df["start_date"]
).dt.days

# Planned duration
df["planned_duration_days"] = (
    df["planned_end_date"] - df["start_date"]
).dt.days

# Time elapsed ratio
df["time_elapsed_ratio"] = np.where(
    df["planned_duration_days"] != 0,
    df["elapsed_days"] /
    df["planned_duration_days"],
    0
)

# Progress velocity
df["progress_velocity"] = (
    df.groupby("project_id")["physical_progress_pct"]
    .diff()
    /
    df.groupby("project_id")["elapsed_days"]
    .diff().replace(0, np.nan)
)

# Progress trend over previous 3 observations
df["progress_trend_3"] = (
    df.groupby("project_id")["physical_progress_pct"]
    .diff(3)
)

# Expenditure trend
df["expenditure_trend_3"] = (
    df.groupby("project_id")["expenditure_to_date"]
    .diff(3)
)

# Expected progress based on elapsed time
df["expected_progress_pct"] = (
    df["time_elapsed_ratio"] * 100
)

# Difference between expected and actual progress
df["progress_to_time_gap"] = (
    df["physical_progress_pct"]
    - df["expected_progress_pct"]
)

# ---------------------------------------------------------
# DATA CLEANING
# ---------------------------------------------------------

df = df.replace(
    [np.inf, -np.inf],
    np.nan
)

numeric_columns = [
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

for column in numeric_columns:
    df[column] = df[column].fillna(0)

# ---------------------------------------------------------
# REMOVE FUTURE-OUTCOME LEAKAGE
# ---------------------------------------------------------

# We only train on snapshots BEFORE the project is completed.
df = df[
    df["update_date"] <
    df["actual_completion_date"]
].copy()

# ---------------------------------------------------------
# SELECT TRAINING COLUMNS
# ---------------------------------------------------------

training_columns = [
    "project_id",
    "project_name",
    "sector",
    "ministry",
    "implementing_agency",

    "update_date",

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
    "progress_to_time_gap",

    # TARGETS
    "cost_overrun_label",
    "delay_label"
]

training_df = df[training_columns].copy()

training_df.to_csv(
    output_path,
    index=False
)

print("=" * 60)
print("PAIMANA INSIGHT - TRAINING DATA PREPARATION")
print("=" * 60)

print(f"Training rows : {len(training_df)}")
print(f"Features      : {len(training_columns) - 2}")

print("\nCost overrun labels:")
print(
    training_df["cost_overrun_label"]
    .value_counts()
)

print("\nDelay labels:")
print(
    training_df["delay_label"]
    .value_counts()
)

print("\nTraining features:")

feature_columns = [
    c for c in training_columns
    if c not in [
        "project_id",
        "project_name",
        "sector",
        "ministry",
        "implementing_agency",
        "update_date",
        "cost_overrun_label",
        "delay_label"
    ]
]

for feature in feature_columns:
    print(" -", feature)

print("\nCreated:")
print("data/training_dataset.csv")

print("\nTraining dataset preparation completed successfully!")
