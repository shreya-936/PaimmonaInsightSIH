def generate_alerts(features: dict, risk: dict):
    """
    Generate transparent monitoring alerts
    from project features and risk scores.
    """

    alerts = []

    project_id = features.get("project_id")
    project_name = features.get("project_name")

    # --------------------------------------------------
    # 1. HIGH COST RISK
    # --------------------------------------------------

    if risk.get("cost_risk", 0) >= 70:
        alerts.append({
            "type": "Cost Risk",
            "severity": "High",
            "message": "Project cost risk is high.",
            "reason": (
                f"Cost overrun ratio is "
                f"{features.get('cost_overrun_ratio', 0) * 100:.1f}%."
            )
        })

    # --------------------------------------------------
    # 2. HIGH DELAY RISK
    # --------------------------------------------------

    if risk.get("delay_risk", 0) >= 70:
        alerts.append({
            "type": "Delay Risk",
            "severity": "High",
            "message": "Project shows significant delay risk.",
            "reason": (
                f"Current physical progress is "
                f"{features.get('physical_progress_pct', 0):.1f}% "
                f"while financial completion is "
                f"{features.get('financial_completion_ratio', 0) * 100:.1f}%."
            )
        })

    # --------------------------------------------------
    # 3. IMPLEMENTATION RISK
    # --------------------------------------------------

    if risk.get("implementation_risk", 0) >= 70:
        alerts.append({
            "type": "Implementation Risk",
            "severity": "High",
            "message": "Implementation risk is high.",
            "reason": (
                f"Milestone completion is "
                f"{features.get('milestone_completion_ratio', 0) * 100:.1f}%."
            )
        })

    # --------------------------------------------------
    # 4. BURN VS PROGRESS GAP
    # --------------------------------------------------

    burn_gap = features.get("burn_vs_progress_gap", 0)

    if burn_gap >= 8:
        alerts.append({
            "type": "Progress Gap",
            "severity": "Medium",
            "message": "Financial expenditure is significantly ahead of physical progress.",
            "reason": (
                f"Burn-vs-progress gap is {burn_gap:.2f} percentage points."
            )
        })

    # --------------------------------------------------
    # 5. DELAYED STATUS
    # --------------------------------------------------

    if features.get("status") == "Delayed":
        alerts.append({
            "type": "Project Status",
            "severity": "High",
            "message": "Project is currently marked as Delayed.",
            "reason": "Latest project monitoring update reports delayed status."
        })

    # --------------------------------------------------
    # FINAL RESPONSE
    # --------------------------------------------------

    return {
        "project_id": project_id,
        "project_name": project_name,
        "alert_count": len(alerts),
        "alerts": alerts,
    }