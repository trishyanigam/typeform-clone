from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.response import (
    ResponseDetailResponse,
    ResponseListResponse,
    ResponseStatsResponse,
)
from app.services import response_service

router = APIRouter(prefix="/forms", tags=["responses"])


@router.get(
    "/{form_id}/responses",
    response_model=ResponseListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all responses submitted for a form"
)
def get_form_responses(
    form_id: int,
    db: Session = Depends(get_db)
):
    return response_service.get_form_responses(db=db, form_id=form_id)


@router.get(
    "/{form_id}/responses/{response_id}",
    response_model=ResponseDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get individual response details with question context"
)
def get_individual_response(
    form_id: int,
    response_id: int,
    db: Session = Depends(get_db)
):
    return response_service.get_individual_response(db=db, form_id=form_id, response_id=response_id)


@router.get(
    "/{form_id}/response-stats",
    response_model=ResponseStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get question-by-question response statistics"
)
def get_form_response_stats(
    form_id: int,
    db: Session = Depends(get_db)
):
    return response_service.get_form_response_stats(db=db, form_id=form_id)
