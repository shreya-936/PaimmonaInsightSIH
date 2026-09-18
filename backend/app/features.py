import pandas as pd
import numpy as np


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Build derived PAIMANA INSIGHT features from project updates.

    The input dataframe should contain:
    original_cost
    revised_cost
    expenditure_to_date
    physical_progress_pct
    milestones_planned
    milestones_completed
    update_date
    """

    out = df.copy()

    # Make sure dates are properly interpreted
    out["update_date"] = pd.to_datetime(out["update_date"])

    # Sort chronologically
    out = out.sort_values("update_date").reset_index(drop=True)

    # ---------------------------------------------------------
    # 1. Cost Overrun Ratio
    # ---------------------------------------------------------
    out["cost_overrun_ratio"] = np.where(
        out["original_cost"] != 0,
        (out["revised_cost"] - out["original_cost"])
        / out["original_cost"],
        0.0
    )

    # ---------------------------------------------------------
    # 2. Financial Completion Ratio
    # ---------------------------------------------------------
    out["financial_completion_ratio"] = np.where(
        out["revised_cost"] != 0,
        out["expenditure_to_date"] / out["revised_cost"],
        0.0
    )

    # ---------------------------------------------------------
    # 3. Milestone Completion Ratio
    # ---------------------------------------------------------
    out["milestone_completion_ratio"] = np.where(
        out["milestones_planned"] != 0,
        out["milestones_completed"] / out["milestones_planned"],
        0.0
    )

    # ---------------------------------------------------------
    # 4. Burn vs Progress Gap
    # ---------------------------------------------------------
    out["burn_vs_progress_gap"] = (
        out["financial_completion_ratio"] * 100
        - out["physical_progress_pct"]
    )

    # ---------------------------------------------------------
    # 5. Elapsed Days
    # ---------------------------------------------------------
    out["elapsed_days"] = (
        out["update_date"] - out["update_date"].min()
    ).dt.days

    # ---------------------------------------------------------
    # 6. Progress Velocity
    # ---------------------------------------------------------
    progress_change = out["physical_progress_pct"].diff()
    time_change = out["elapsed_days"].diff()

    out["progress_velocity"] = (
        progress_change / time_change.replace(0, np.nan)
    )

    # ---------------------------------------------------------
    # 7. Three-update Progress Trend
    # ---------------------------------------------------------
    out["progress_trend_3"] = (
        out["physical_progress_pct"].diff(3)
    )

    # ---------------------------------------------------------
    # 8. Three-update Expenditure Trend
    # ---------------------------------------------------------
    out["expenditure_trend_3"] = (
        out["expenditure_to_date"].diff(3)
    )

    # ---------------------------------------------------------
    # Replace NaN / infinity values
    # ---------------------------------------------------------
    out = out.replace([np.inf, -np.inf], np.nan)

    out = out.fillna(0)

    # Convert timestamps into JSON-friendly strings
    out["update_date"] = out["update_date"].dt.strftime("%Y-%m-%d")

    # Convert NumPy values to normal Python values
    return out