from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.public import (
    PublicFormResponse,
    ResponseSubmissionRequest,
    ResponseSubmissionResult,
)
from app.services import public_service

router = APIRouter(prefix="/forms", tags=["public"])


@router.get(
    "/{slug}",
    response_model=PublicFormResponse,
    status_code=status.HTTP_200_OK,
    summary="Get published form schema by slug for respondents"
)
def get_public_form(
    slug: str,
    db: Session = Depends(get_db)
):
    return public_service.get_public_form_by_slug(db=db, slug=slug)


@router.post(
    "/{slug}/responses",
    response_model=ResponseSubmissionResult,
    status_code=status.HTTP_201_CREATED,
    summary="Submit form responses for a published form"
)
def submit_public_response(
    slug: str,
    submission: ResponseSubmissionRequest,
    db: Session = Depends(get_db)
):
    return public_service.submit_form_response(db=db, slug=slug, submission=submission)
