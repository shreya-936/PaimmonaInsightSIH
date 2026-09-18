import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Project
from app.schemas import ProjectOut
from app.seed import seed_demo_data
from app.features import build_features

router = APIRouter(tags=["projects"])


@router.get("/projects", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    seed_demo_data(db)
    return db.query(Project).all()


@router.get("/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)):
    seed_demo_data(db)
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/projects/{project_id}/features")
def get_project_features(project_id: str, db: Session = Depends(get_db)):
    seed_demo_data(db)
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rows = [
        {
            "update_date": u.update_date,
            "original_cost": project.original_cost,
            "revised_cost": u.revised_cost,
            "expenditure_to_date": u.expenditure_to_date,
            "physical_progress_pct": u.physical_progress_pct,
            "milestones_planned": u.milestones_planned,
            "milestones_completed": u.milestones_completed,
        }
        for u in project.updates
    ]

    features = build_features(pd.DataFrame(rows))
    features = features.where(pd.notna(features), None)
    return features.to_dict(orient="records")
