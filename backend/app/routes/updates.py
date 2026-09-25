from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Project, ProjectUpdate
from ..schemas import ProjectUpdateCreate, ProjectUpdateResponse

router = APIRouter(
    prefix="/api/projects",
    tags=["Project Updates"],
)


@router.get(
    "/{project_id}/updates",
    response_model=list[ProjectUpdateResponse],
)
def get_project_updates(
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

    return (
        db.query(ProjectUpdate)
        .filter(ProjectUpdate.project_id == project_id)
        .order_by(ProjectUpdate.update_date.asc())
        .all()
    )


@router.post(
    "/{project_id}/updates",
    response_model=ProjectUpdateResponse,
)
def create_project_update(
    project_id: str,
    update_data: ProjectUpdateCreate,
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

    update = ProjectUpdate(
        project_id=project_id,
        **update_data.model_dump(),
    )

    db.add(update)
    db.commit()
    db.refresh(update)

    return update