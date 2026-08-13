from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.form import FormCreate, FormUpdate, FormResponse
from app.services import form_service

router = APIRouter(prefix="/forms", tags=["forms"])


@router.post(
    "",
    response_model=FormResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new form"
)
def create_form(
    form_in: FormCreate,
    db: Session = Depends(get_db)
):
    return form_service.create_form(db=db, form_in=form_in)


@router.get(
    "",
    response_model=List[FormResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all forms"
)
def get_forms(
    db: Session = Depends(get_db)
):
    return form_service.get_forms(db=db)


@router.get(
    "/{id}",
    response_model=FormResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a single form by ID"
)
def get_form(
    id: int,
    db: Session = Depends(get_db)
):
    form = form_service.get_form_by_id(db=db, form_id=id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID {id} not found"
        )
    return form


@router.put(
    "/{id}",
    response_model=FormResponse,
    status_code=status.HTTP_200_OK,
    summary="Update form title"
)
def update_form(
    id: int,
    form_in: FormUpdate,
    db: Session = Depends(get_db)
):
    form = form_service.get_form_by_id(db=db, form_id=id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID {id} not found"
        )
    return form_service.update_form(db=db, form=form, form_in=form_in)


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a form"
)
def delete_form(
    id: int,
    db: Session = Depends(get_db)
):
    form = form_service.get_form_by_id(db=db, form_id=id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID {id} not found"
        )
    form_service.delete_form(db=db, form=form)
    return {"message": f"Form with ID {id} deleted successfully"}


@router.post(
    "/{id}/duplicate",
    response_model=FormResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Duplicate a form"
)
def duplicate_form(
    id: int,
    db: Session = Depends(get_db)
):
    form = form_service.get_form_by_id(db=db, form_id=id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID {id} not found"
        )
    return form_service.duplicate_form(db=db, form=form)


@router.post(
    "/{id}/publish",
    response_model=FormResponse,
    status_code=status.HTTP_200_OK,
    summary="Publish a form"
)
def publish_form(
    id: int,
    db: Session = Depends(get_db)
):
    form = form_service.get_form_by_id(db=db, form_id=id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID {id} not found"
        )
    return form_service.publish_form(db=db, form=form)


@router.post(
    "/{id}/unpublish",
    response_model=FormResponse,
    status_code=status.HTTP_200_OK,
    summary="Unpublish a form"
)
def unpublish_form(
    id: int,
    db: Session = Depends(get_db)
):
    form = form_service.get_form_by_id(db=db, form_id=id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID {id} not found"
        )
    return form_service.unpublish_form(db=db, form=form)
