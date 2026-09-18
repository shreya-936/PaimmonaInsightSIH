from datetime import date
from sqlalchemy import Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Project(Base):
    __tablename__ = "projects"

    project_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sector: Mapped[str] = mapped_column(String(100), nullable=False)
    ministry: Mapped[str] = mapped_column(String(150), nullable=False)
    implementing_agency: Mapped[str] = mapped_column(String(150), nullable=False)
    original_cost: Mapped[float] = mapped_column(Float, nullable=False)
    planned_end_date: Mapped[date] = mapped_column(Date, nullable=False)
    revised_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    updates: Mapped[list["ProjectUpdate"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
    )


class ProjectUpdate(Base):
    __tablename__ = "project_updates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.project_id"), nullable=False)
    update_date: Mapped[date] = mapped_column(Date, nullable=False)
    revised_cost: Mapped[float] = mapped_column(Float, nullable=False)
    expenditure_to_date: Mapped[float] = mapped_column(Float, nullable=False)
    physical_progress_pct: Mapped[float] = mapped_column(Float, nullable=False)
    financial_progress_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    milestones_planned: Mapped[int] = mapped_column(Integer, nullable=False)
    milestones_completed: Mapped[int] = mapped_column(Integer, nullable=False)
    delay_cause: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False)

    project: Mapped["Project"] = relationship(back_populates="updates")
