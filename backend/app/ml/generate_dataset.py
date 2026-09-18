import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)

OUTPUT_DIR = Path("data")
OUTPUT_DIR.mkdir(exist_ok=True)

sectors = [
    "Transport",
    "Water",
    "Power",
    "Railways",
    "Urban Development"
]

ministries = {
    "Transport": "Ministry of Road Transport",
    "Water": "Ministry of Jal Shakti",
    "Power": "Ministry of Power",
    "Railways": "Ministry of Railways",
    "Urban Development": "Ministry of Housing and Urban Affairs"
}

agencies = [
    "Agency Alpha",
    "Agency Beta",
    "Agency Gamma",
    "Agency Delta",
    "Agency Epsilon"
]

rows = []
outcomes = []

N_PROJECTS = 600
MONTHS = 18

for i in range(1, N_PROJECTS + 1):

    project_id = f"P{i:04d}"
    sector = np.random.choice(sectors)
    ministry = ministries[sector]
    agency = np.random.choice(agencies)

    start_date = pd.Timestamp("2024-01-01") + pd.DateOffset(
        months=np.random.randint(0, 18)
    )

    planned_duration = np.random.randint(18, 37)

    planned_end_date = (
        start_date + pd.DateOffset(months=planned_duration)
    )

    original_cost = np.random.uniform(300, 5000)

    # Hidden project behaviour used only for generating realistic outcomes
    project_type = np.random.choice(
        ["healthy", "moderate", "risky"],
        p=[0.40, 0.35, 0.25]
    )

    if project_type == "healthy":
        final_overrun = np.random.uniform(-0.02, 0.10)
        delay_days = max(0, int(np.random.normal(15, 25)))

    elif project_type == "moderate":
        final_overrun = np.random.uniform(0.05, 0.25)
        delay_days = max(0, int(np.random.normal(70, 45)))

    else:
        final_overrun = np.random.uniform(0.15, 0.55)
        delay_days = max(20, int(np.random.normal(150, 70)))

    final_cost = original_cost * (1 + final_overrun)

    actual_completion_date = (
        planned_end_date + pd.Timedelta(days=delay_days)
    )

    milestones_planned = np.random.randint(10, 31)

    for month in range(MONTHS):

        update_date = (
            start_date + pd.DateOffset(months=month)
        )

        if update_date >= actual_completion_date:
            break

        planned_progress = min(
            100,
            (month + 1) / planned_duration * 100
        )

        if project_type == "healthy":
            progress = planned_progress + np.random.normal(3, 3)

        elif project_type == "moderate":
            progress = planned_progress - np.random.uniform(0, 12)

        else:
            progress = planned_progress - np.random.uniform(5, 25)

        progress = np.clip(progress, 3, 98)

        # Expenditure roughly follows progress,
        # but risky projects spend money faster than they progress.
        if project_type == "healthy":
            spend_ratio = progress / 100 + np.random.normal(0, 0.03)

        elif project_type == "moderate":
            spend_ratio = progress / 100 + np.random.uniform(0.05, 0.15)

        else:
            spend_ratio = progress / 100 + np.random.uniform(0.10, 0.30)

        spend_ratio = np.clip(spend_ratio, 0.03, 0.98)

        current_revised_cost = (
            original_cost *
            (1 + final_overrun * (month + 1) / MONTHS)
        )

        expenditure = current_revised_cost * spend_ratio

        milestone_completed = int(
            np.clip(
                milestones_planned * progress / 100 +
                np.random.normal(0, 1),
                0,
                milestones_planned
            )
        )

        if project_type == "healthy":
            status = "On Track"

        elif project_type == "moderate":
            status = np.random.choice(
                ["On Track", "Watch", "Delayed"],
                p=[0.35, 0.45, 0.20]
            )

        else:
            status = np.random.choice(
                ["Watch", "Delayed"],
                p=[0.25, 0.75]
            )

        delay_causes = [
            "None",
            "Land acquisition",
            "Material shortage",
            "Funding issue",
            "Weather",
            "Administrative approval"
        ]

        delay_cause = (
            "None"
            if status == "On Track"
            else np.random.choice(delay_causes[1:])
        )

        rows.append({
            "project_id": project_id,
            "project_name": f"{sector} Infrastructure Project {i}",
            "sector": sector,
            "ministry": ministry,
            "implementing_agency": agency,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "planned_end_date": planned_end_date.strftime("%Y-%m-%d"),
            "update_date": update_date.strftime("%Y-%m-%d"),
            "original_cost": round(original_cost, 2),
            "revised_cost": round(current_revised_cost, 2),
            "expenditure_to_date": round(expenditure, 2),
            "physical_progress_pct": round(progress, 2),
            "milestones_planned": milestones_planned,
            "milestones_completed": milestone_completed,
            "delay_cause": delay_cause,
            "status": status
        })

    outcomes.append({
        "project_id": project_id,
        "final_cost": round(final_cost, 2),
        "actual_completion_date": actual_completion_date.strftime("%Y-%m-%d"),
        "final_overrun_ratio": round(final_overrun, 4),
        "final_delay_days": delay_days,

        # Prototype labels
        "cost_overrun_label": int(final_overrun >= 0.10),
        "delay_label": int(delay_days > 30)
    })


updates_df = pd.DataFrame(rows)
outcomes_df = pd.DataFrame(outcomes)

updates_df.to_csv(
    OUTPUT_DIR / "historical_project_updates.csv",
    index=False
)

outcomes_df.to_csv(
    OUTPUT_DIR / "project_outcomes.csv",
    index=False
)

print("=" * 60)
print("PAIMANA INSIGHT - HISTORICAL DATA GENERATION")
print("=" * 60)

print(f"Projects generated : {len(outcomes_df)}")
print(f"Monthly snapshots   : {len(updates_df)}")

print("\nCost overrun distribution:")
print(
    outcomes_df["cost_overrun_label"]
    .value_counts()
    .rename({0: "No Overrun", 1: "Overrun"})
)

print("\nDelay distribution:")
print(
    outcomes_df["delay_label"]
    .value_counts()
    .rename({0: "No Delay", 1: "Delay"})
)

print("\nFiles created:")
print("data/historical_project_updates.csv")
print("data/project_outcomes.csv")

print("\nDataset generation completed successfully!")
