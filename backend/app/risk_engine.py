def calculate_risk(features: dict):
    """
    Transparent rule-based risk engine for PAIMANA INSIGHT.

    Produces:
    - Cost risk
    - Delay risk
    - Implementation risk
    - Overall priority index
    - Risk drivers / explanations
    """

    cost_risk = 0
    delay_risk = 0
    implementation_risk = 0

    cost_drivers = []
    delay_drivers = []
    implementation_drivers = []

    # --------------------------------------------------
    # 1. COST RISK
    # --------------------------------------------------

    cost_overrun = features.get("cost_overrun_ratio", 0)

    if cost_overrun >= 0.15:
        cost_risk += 60
        cost_drivers.append(
            "Revised project cost is significantly above the original cost"
        )
    elif cost_overrun >= 0.10:
        cost_risk += 40
        cost_drivers.append(
            "Project cost has increased above the original estimate"
        )
    elif cost_overrun >= 0.05:
        cost_risk += 20
        cost_drivers.append(
            "Moderate increase in revised project cost"
        )

    burn_gap = features.get("burn_vs_progress_gap", 0)

    if burn_gap >= 10:
        cost_risk += 30
        cost_drivers.append(
            "Financial expenditure is substantially ahead of physical progress"
        )
    elif burn_gap >= 5:
        cost_risk += 20
        cost_drivers.append(
            "Financial expenditure is ahead of physical progress"
        )

    expenditure_trend = features.get("expenditure_trend_3", 0)

    if expenditure_trend >= 150:
        cost_risk += 10
        cost_drivers.append(
            "Expenditure has increased significantly over recent updates"
        )

    cost_risk = min(cost_risk, 100)

    # --------------------------------------------------
    # 2. DELAY RISK
    # --------------------------------------------------

    if features.get("status") == "Delayed":
        delay_risk += 40
        delay_drivers.append(
            "Latest project status is marked as Delayed"
        )
    elif features.get("status") == "Watch":
        delay_risk += 20
        delay_drivers.append(
            "Latest project status requires monitoring"
        )

    physical_progress = features.get("physical_progress_pct", 0)
    financial_progress = features.get("financial_completion_ratio", 0) * 100

    if financial_progress - physical_progress >= 8:
        delay_risk += 25
        delay_drivers.append(
            "Financial progress is ahead of physical progress"
        )

    progress_velocity = features.get("progress_velocity", 0)

    if progress_velocity < 0.05:
        delay_risk += 20
        delay_drivers.append(
            "Recent physical progress velocity is low"
        )

    progress_trend = features.get("progress_trend_3", 0)

    if progress_trend <= 5:
        delay_risk += 15
        delay_drivers.append(
            "Physical progress has increased slowly over recent updates"
        )

    delay_risk = min(delay_risk, 100)

    # --------------------------------------------------
    # 3. IMPLEMENTATION RISK
    # --------------------------------------------------

    milestone_ratio = features.get(
        "milestone_completion_ratio", 0
    )

    if milestone_ratio < 0.50:
        implementation_risk += 50
        implementation_drivers.append(
            "Less than half of planned milestones have been completed"
        )
    elif milestone_ratio < 0.65:
        implementation_risk += 30
        implementation_drivers.append(
            "Milestone completion is below the desired level"
        )

    if features.get("status") == "Delayed":
        implementation_risk += 25
        implementation_drivers.append(
            "Delayed project status indicates implementation pressure"
        )

    if burn_gap >= 8:
        implementation_risk += 25
        implementation_drivers.append(
            "High gap between financial expenditure and physical progress"
        )

    implementation_risk = min(implementation_risk, 100)

    # --------------------------------------------------
    # 4. OVERALL PRIORITY INDEX
    # --------------------------------------------------

    overall_priority = (
        cost_risk * 0.35
        + delay_risk * 0.35
        + implementation_risk * 0.30
    )

    overall_priority = round(overall_priority, 2)

    # --------------------------------------------------
    # 5. OVERALL RISK LEVEL
    # --------------------------------------------------

    if overall_priority >= 70:
        risk_level = "High"
    elif overall_priority >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # --------------------------------------------------
    # 6. RETURN RESULT
    # --------------------------------------------------

    return {
        "project_id": features.get("project_id"),
        "project_name": features.get("project_name"),

        "cost_risk": cost_risk,
        "delay_risk": delay_risk,
        "implementation_risk": implementation_risk,

        "overall_priority_index": overall_priority,
        "risk_level": risk_level,

        "drivers": {
            "cost": cost_drivers,
            "delay": delay_drivers,
            "implementation": implementation_drivers,
        },
    }