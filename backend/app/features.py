from sqlalchemy.orm import Session

from .models import Project, ProjectUpdate


def calculate_project_features(
    project: Project,
    updates: list[ProjectUpdate],
):
    if not updates:
        return {
            "project_id": project.project_id,
            "message": "No project updates available",
        }

    updates = sorted(updates, key=lambda x: x.update_date)

    latest = updates[-1]

    # -----------------------------
    # Cost Overrun
    # -----------------------------
    cost_overrun_ratio = 0.0

    if project.original_cost:
        cost_overrun_ratio = (
            latest.revised_cost - project.original_cost
        ) / project.original_cost

    # -----------------------------
    # Financial Completion
    # -----------------------------
    financial_completion_ratio = 0.0

    if latest.revised_cost:
        financial_completion_ratio = (
            latest.expenditure_to_date / latest.revised_cost
        )

    # -----------------------------
    # Milestone Completion
    # -----------------------------
    milestone_completion_ratio = 0.0

    if latest.milestones_planned:
        milestone_completion_ratio = (
            latest.milestones_completed
            / latest.milestones_planned
        )

    # -----------------------------
    # Burn vs Progress Gap
    # -----------------------------
    burn_vs_progress_gap = (
        financial_completion_ratio * 100
        - latest.physical_progress_pct
    )

    # -----------------------------
    # Progress Velocity
    # -----------------------------
    progress_velocity = 0.0

    if len(updates) >= 2:
        previous = updates[-2]

        days = (
            latest.update_date - previous.update_date
        ).days

        if days > 0:
            progress_velocity = (
                latest.physical_progress_pct
                - previous.physical_progress_pct
            ) / days

    # -----------------------------
    # 3-update Progress Trend
    # -----------------------------
    progress_trend_3 = 0.0

    if len(updates) >= 4:
        previous_3 = updates[-4]

        progress_trend_3 = (
            latest.physical_progress_pct
            - previous_3.physical_progress_pct
        )

    # -----------------------------
    # 3-update Expenditure Trend
    # -----------------------------
    expenditure_trend_3 = 0.0

    if len(updates) >= 4:
        previous_3 = updates[-4]

        expenditure_trend_3 = (
            latest.expenditure_to_date
            - previous_3.expenditure_to_date
        )

    return {
        "project_id": project.project_id,
        "project_name": project.name,

        "latest_update": str(latest.update_date),

        "cost_overrun_ratio": round(
            cost_overrun_ratio,
            4,
        ),

        "financial_completion_ratio": round(
            financial_completion_ratio,
            4,
        ),

        "physical_progress_pct": round(
            latest.physical_progress_pct,
            2,
        ),

        "milestone_completion_ratio": round(
            milestone_completion_ratio,
            4,
        ),

        "burn_vs_progress_gap": round(
            burn_vs_progress_gap,
            2,
        ),

        "progress_velocity": round(
            progress_velocity,
            4,
        ),

        "progress_trend_3": round(
            progress_trend_3,
            2,
        ),

        "expenditure_trend_3": round(
            expenditure_trend_3,
            2,
        ),

        "status": latest.status,
    }