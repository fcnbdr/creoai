from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models import Category
from pydantic import BaseModel

router = APIRouter()


class CategoryRead(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


@router.get('/', response_model=List[CategoryRead])
def list_categories(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    categories = db.query(Category).order_by(Category.name).all()
    return categories
