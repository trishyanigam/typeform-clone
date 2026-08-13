from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.form import Form
from app.models.question import Question
from app.schemas.question import (
    QuestionCreate,
    QuestionUpdate,
    QuestionReorder,
    validate_and_normalize_settings,
)


def get_questions_by_form(db: Session, form_id: int) -> List[Question]:
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID {form_id} not found"
        )
    return db.query(Question).filter(Question.form_id == form_id).order_by(Question.position.asc()).all()


def create_question(db: Session, form_id: int, question_in: QuestionCreate) -> Question:
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID {form_id} not found"
        )

    try:
        norm_settings = validate_and_normalize_settings(question_in.type, question_in.settings)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

    # Automatically assign the next position
    max_pos = db.query(func.max(Question.position)).filter(Question.form_id == form_id).scalar()
    next_position = (max_pos or 0) + 1

    question = Question(
        form_id=form_id,
        type=question_in.type,
        title=question_in.title,
        description=question_in.description,
        required=question_in.required,
        position=next_position,
        settings=norm_settings
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def get_question_by_id(db: Session, question_id: int) -> Question:
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID {question_id} not found"
        )
    return question


def update_question(db: Session, question_id: int, question_in: QuestionUpdate) -> Question:
    question = get_question_by_id(db, question_id)

    new_type = question_in.type if question_in.type is not None else question.type
    new_settings = question_in.settings if question_in.settings is not None else question.settings

    try:
        norm_settings = validate_and_normalize_settings(new_type, new_settings)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

    question.type = new_type
    question.settings = norm_settings

    if question_in.title is not None:
        question.title = question_in.title
    if question_in.description is not None:
        question.description = question_in.description
    if question_in.required is not None:
        question.required = question_in.required

    db.commit()
    db.refresh(question)
    return question


def delete_question(db: Session, question_id: int) -> None:
    question = get_question_by_id(db, question_id)
    form_id = question.form_id
    db.delete(question)
    db.commit()

    # Re-normalize positions of remaining questions for this form
    remaining = db.query(Question).filter(Question.form_id == form_id).order_by(Question.position.asc()).all()
    for idx, q in enumerate(remaining, start=1):
        q.position = idx
    db.commit()


def reorder_questions(db: Session, form_id: int, reorder_in: QuestionReorder) -> List[Question]:
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID {form_id} not found"
        )

    existing_questions = db.query(Question).filter(Question.form_id == form_id).all()
    existing_ids = {q.id for q in existing_questions}
    existing_map = {q.id: q for q in existing_questions}

    supplied_ids = reorder_in.question_ids

    # 1. Verify duplicate IDs in request
    if len(supplied_ids) != len(set(supplied_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate question IDs found in reorder request"
        )

    # 2. Verify set match (all supplied IDs match exact existing question IDs for this form)
    supplied_set = set(supplied_ids)
    if supplied_set != existing_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reorder request must contain exactly all question IDs belonging to this form"
        )

    # 3. Reassign positions starting from 1 in transaction
    for index, q_id in enumerate(supplied_ids, start=1):
        q = existing_map[q_id]
        q.position = index

    db.commit()

    return db.query(Question).filter(Question.form_id == form_id).order_by(Question.position.asc()).all()
