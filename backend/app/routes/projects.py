from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Project, ProjectUpdate
from ..schemas import ProjectCreate, ProjectResponse
from ..features import calculate_project_features
from ..risk_engine import calculate_risk
from ..alert_engine import generate_alerts

router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"],
)


@router.get("/", response_model=list[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.project_id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return project


@router.post("/", response_model=ProjectResponse)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Project)
        .filter(Project.project_id == project_data.project_id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Project ID already exists",
        )

    project = Project(**project_data.model_dump())

    db.add(project)
    db.commit()
    db.refresh(project)

    return project
@router.get("/{project_id}/features")
def get_project_features(
    project_id: str,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.project_id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    updates = (
        db.query(ProjectUpdate)
        .filter(ProjectUpdate.project_id == project_id)
        .order_by(ProjectUpdate.update_date.asc())
        .all()
    )

    return calculate_project_features(
        project,
        updates,
    )
@router.get("/{project_id}/risk")
def get_project_risk(project_id: str, db: Session = Depends(get_db)):
    project = (
        db.query(Project)
        .filter(Project.project_id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    updates = (
        db.query(ProjectUpdate)
        .filter(ProjectUpdate.project_id == project_id)
        .order_by(ProjectUpdate.update_date.asc())
        .all()
    )

    features = calculate_project_features(project, updates)

    if "message" in features:
        return features

    return calculate_risk(features)
@router.get("/{project_id}/alerts")
def get_project_alerts(project_id: str, db: Session = Depends(get_db)):
    project = (
        db.query(Project)
        .filter(Project.project_id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    updates = (
        db.query(ProjectUpdate)
        .filter(ProjectUpdate.project_id == project_id)
        .order_by(ProjectUpdate.update_date.asc())
        .all()
    )

    features = calculate_project_features(project, updates)

    if "message" in features:
        return features

    risk = calculate_risk(features)

    return generate_alerts(features, risk)