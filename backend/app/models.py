from sqlalchemy import Column, Float, ForeignKey, Integer, String, Date
from sqlalchemy.orm import relationship

from .database import Base


class Project(Base):
    __tablename__ = "projects"

    project_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    ministry = Column(String, nullable=False)
    agency = Column(String, nullable=False)

    original_cost = Column(Float, nullable=False)
    revised_cost = Column(Float, nullable=True)

    physical_progress = Column(Float, default=0.0)
    financial_progress = Column(Float, default=0.0)

    status = Column(String, default="On Track")

    updates = relationship(
        "ProjectUpdate",
        back_populates="project",
        cascade="all, delete-orphan",
    )


class ProjectUpdate(Base):
    __tablename__ = "project_updates"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        String,
        ForeignKey("projects.project_id"),
        nullable=False,
        index=True,
    )

    update_date = Column(Date, nullable=False)

    revised_cost = Column(Float, nullable=False)
    expenditure_to_date = Column(Float, nullable=False)

    physical_progress_pct = Column(Float, nullable=False)

    milestones_planned = Column(Integer, default=0)
    milestones_completed = Column(Integer, default=0)

    status = Column(String, default="On Track")
    remarks = Column(String, nullable=True)

    project = relationship(
        "Project",
        back_populates="updates",
    )