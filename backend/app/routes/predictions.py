from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import pandas as pd
import joblib

from pathlib import Path

from app.db import get_db
from app.models import Project, ProjectUpdate
from app.features import build_features


router = APIRouter(
    prefix="/api/predictions",
    tags=["Predictions"]
)


# ============================================================
# MODEL
# ============================================================

MODEL_PATH = Path("models/cost_overrun_model.joblib")

try:
    cost_model = joblib.load(MODEL_PATH)
except Exception:
    cost_model = None


# ============================================================
# COST RISK PREDICTION
# ============================================================

@router.get("/{project_id}/cost-risk")
def predict_cost_risk(
    project_id: str,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Check model
    # --------------------------------------------------------

    if cost_model is None:
        raise HTTPException(
            status_code=500,
            detail="Cost overrun model not found. Train the model first."
        )

    # --------------------------------------------------------
    # Find project
    # --------------------------------------------------------

    project = (
        db.query(Project)
        .filter(Project.project_id == project_id)
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # --------------------------------------------------------
    # Get historical updates
    # --------------------------------------------------------

    updates = (
        db.query(ProjectUpdate)
        .filter(
            ProjectUpdate.project_id == project_id
        )
        .order_by(
            ProjectUpdate.update_date
        )
        .all()
    )

    if not updates:
        raise HTTPException(
            status_code=404,
            detail="No project updates available"
        )

    # --------------------------------------------------------
    # Convert updates to DataFrame
    # --------------------------------------------------------

    records = []

    for update in updates:

        records.append({
            "project_id": project.project_id,
            "project_name": project.name,
            "sector": project.sector,
            "ministry": project.ministry,
            "implementing_agency": project.implementing_agency,

            "update_date": update.update_date,

            "original_cost": project.original_cost,
            "revised_cost": update.revised_cost,
            "expenditure_to_date": update.expenditure_to_date,
            "physical_progress_pct": update.physical_progress_pct,

            "milestones_planned": update.milestones_planned,
            "milestones_completed": update.milestones_completed
        })

    df = pd.DataFrame(records)

    # --------------------------------------------------------
    # Build features
    # --------------------------------------------------------

    feature_df = build_features(df)

    # --------------------------------------------------------
    # Add missing model features
    # --------------------------------------------------------

    feature_df["start_date"] = pd.to_datetime(
        feature_df["update_date"]
    )

    feature_df["planned_duration_days"] = 365

    feature_df["time_elapsed_ratio"] = (
        feature_df["elapsed_days"] /
        feature_df["planned_duration_days"]
    )

    feature_df["expected_progress_pct"] = (
        feature_df["time_elapsed_ratio"] * 100
    )

    feature_df["progress_to_time_gap"] = (
        feature_df["physical_progress_pct"] -
        feature_df["expected_progress_pct"]
    )

    # --------------------------------------------------------
    # Take latest project snapshot
    # --------------------------------------------------------

    latest = feature_df.iloc[-1:].copy()

    # --------------------------------------------------------
    # Model features
    # --------------------------------------------------------

    model_features = [
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

    X = latest[model_features]

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    probability = cost_model.predict_proba(X)[0][1]

    prediction = int(
        probability >= 0.50
    )

    risk_percentage = round(
        probability * 100,
        2
    )

    # --------------------------------------------------------
    # Risk category
    # --------------------------------------------------------

    if risk_percentage >= 75:
        risk_level = "High"

    elif risk_percentage >= 50:
        risk_level = "Medium"

    else:
        risk_level = "Low"

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "project_id": project_id,
        "project_name": project.name,

        "prediction": prediction,

        "cost_overrun_probability": risk_percentage,

        "risk_level": risk_level,

        "as_of_date": str(
            latest["update_date"].iloc[0]
        )
    }