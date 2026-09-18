from datetime import date
from sqlalchemy.orm import Session

from app.models import Project, ProjectUpdate


def seed_demo_data(db: Session) -> None:
    if db.query(Project).count() > 0:
        return

    projects = [
        Project(
            project_id="P1001",
            project_name="National Highway Package A",
            sector="Transport",
            ministry="Ministry of Road Transport",
            implementing_agency="Agency Alpha",
            original_cost=1000,
            planned_end_date=date(2027, 3, 31),
            revised_end_date=date(2027, 9, 30),
        ),
        Project(
            project_id="P1002",
            project_name="Regional Water Grid",
            sector="Water",
            ministry="Ministry of Jal Shakti",
            implementing_agency="Agency Beta",
            original_cost=650,
            planned_end_date=date(2027, 12, 31),
            revised_end_date=None,
        ),
        Project(
            project_id="P1003",
            project_name="Urban Power Upgrade",
            sector="Power",
            ministry="Ministry of Power",
            implementing_agency="Agency Gamma",
            original_cost=420,
            planned_end_date=date(2027, 6, 30),
            revised_end_date=None,
        ),
    ]

    for project in projects:
        db.add(project)

    updates = [
        # P1001: deliberately deteriorating trajectory for the demo
        ("P1001", date(2026, 3, 31), 1050, 430, 38, 41, 20, 9, "Land issue", "Ongoing"),
        ("P1001", date(2026, 4, 30), 1080, 505, 42, 47, 20, 10, "Land issue", "Ongoing"),
        ("P1001", date(2026, 5, 31), 1110, 590, 46, 53, 20, 11, "Milestone delay", "Ongoing"),
        ("P1001", date(2026, 6, 30), 1140, 670, 50, 59, 20, 11, "Milestone delay", "Delayed"),
        ("P1001", date(2026, 7, 31), 1160, 735, 53, 65, 20, 12, "Land issue", "Delayed"),
        ("P1001", date(2026, 8, 31), 1180, 750, 55, 64, 20, 12, "Land issue", "Delayed"),

        ("P1002", date(2026, 3, 31), 650, 210, 35, 32, 15, 6, None, "Ongoing"),
        ("P1002", date(2026, 6, 30), 650, 310, 52, 48, 15, 9, None, "Ongoing"),
        ("P1002", date(2026, 8, 31), 650, 390, 67, 60, 15, 11, None, "Ongoing"),

        ("P1003", date(2026, 3, 31), 430, 140, 40, 37, 12, 5, None, "Ongoing"),
        ("P1003", date(2026, 6, 30), 430, 220, 58, 55, 12, 8, None, "Ongoing"),
        ("P1003", date(2026, 8, 31), 430, 285, 74, 66, 12, 9, None, "Ongoing"),
    ]

    for row in updates:
        project_id, update_date, revised_cost, expenditure, physical, financial, planned, completed, cause, status = row
        db.add(
            ProjectUpdate(
                project_id=project_id,
                update_date=update_date,
                revised_cost=revised_cost,
                expenditure_to_date=expenditure,
                physical_progress_pct=physical,
                financial_progress_pct=financial,
                milestones_planned=planned,
                milestones_completed=completed,
                delay_cause=cause,
                status=status,
            )
        )

    db.commit()
