from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.question import (
    QuestionCreate,
    QuestionUpdate,
    QuestionReorder,
    QuestionResponse,
)
from app.services import question_service

router = APIRouter(tags=["questions"])


@router.get(
    "/forms/{form_id}/questions",
    response_model=List[QuestionResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all questions for a form"
)
def get_questions_for_form(
    form_id: int,
    db: Session = Depends(get_db)
):
    return question_service.get_questions_by_form(db=db, form_id=form_id)


@router.post(
    "/forms/{form_id}/questions",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a question for a form"
)
def create_question(
    form_id: int,
    question_in: QuestionCreate,
    db: Session = Depends(get_db)
):
    return question_service.create_question(db=db, form_id=form_id, question_in=question_in)


@router.put(
    "/forms/{form_id}/questions/reorder",
    response_model=List[QuestionResponse],
    status_code=status.HTTP_200_OK,
    summary="Reorder questions for a form"
)
def reorder_questions(
    form_id: int,
    reorder_in: QuestionReorder,
    db: Session = Depends(get_db)
):
    return question_service.reorder_questions(db=db, form_id=form_id, reorder_in=reorder_in)


@router.get(
    "/questions/{question_id}",
    response_model=QuestionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a single question by ID"
)
def get_question(
    question_id: int,
    db: Session = Depends(get_db)
):
    return question_service.get_question_by_id(db=db, question_id=question_id)


@router.put(
    "/questions/{question_id}",
    response_model=QuestionResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a question"
)
def update_question(
    question_id: int,
    question_in: QuestionUpdate,
    db: Session = Depends(get_db)
):
    return question_service.update_question(db=db, question_id=question_id, question_in=question_in)


@router.delete(
    "/questions/{question_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a question"
)
def delete_question(
    question_id: int,
    db: Session = Depends(get_db)
):
    question_service.delete_question(db=db, question_id=question_id)
    return {"message": f"Question with ID {question_id} deleted successfully"}
