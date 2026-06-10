from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models import JobLog

router = APIRouter()


class JobLogRead(BaseModel):
    id: int
    job_type: str
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


@router.get('/', response_model=List[JobLogRead])
def list_job_logs(
    status: Optional[str] = Query(None),
    task_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(JobLog)
    if status:
        query = query.filter(JobLog.status == status)
    if task_type:
        query = query.filter(JobLog.task_type == task_type)

    logs = query.order_by(JobLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    result = []
    for log in logs:
        result.append({
            'id': log.id,
            'job_type': log.task_type,
            'status': log.status,
            'error_message': log.error_message,
            'created_at': log.created_at,
            'updated_at': log.updated_at,
        })

    return result
