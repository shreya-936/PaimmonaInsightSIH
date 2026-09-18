from datetime import date
from pydantic import BaseModel, ConfigDict


class ProjectUpdateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    update_date: date
    revised_cost: float
    expenditure_to_date: float
    physical_progress_pct: float
    financial_progress_pct: float | None
    milestones_planned: int
    milestones_completed: int
    delay_cause: str | None
    status: str


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: str
    project_name: str
    sector: str
    ministry: str
    implementing_agency: str
    original_cost: float
    planned_end_date: date
    revised_end_date: date | None
    updates: list[ProjectUpdateOut] = []
