from datetime import date
from typing import Optional

from pydantic import BaseModel


class ProjectBase(BaseModel):
    name: str
    sector: str
    ministry: str
    agency: str
    original_cost: float
    revised_cost: Optional[float] = None
    physical_progress: float = 0.0
    financial_progress: float = 0.0
    status: str = "On Track"


class ProjectCreate(ProjectBase):
    project_id: str


class ProjectResponse(ProjectBase):
    project_id: str

    class Config:
        from_attributes = True


class ProjectUpdateCreate(BaseModel):
    update_date: date
    revised_cost: float
    expenditure_to_date: float
    physical_progress_pct: float
    milestones_planned: int = 0
    milestones_completed: int = 0
    status: str = "On Track"
    remarks: Optional[str] = None


class ProjectUpdateResponse(ProjectUpdateCreate):
    id: int
    project_id: str

    class Config:
        from_attributes = True