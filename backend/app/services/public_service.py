import re
from typing import Any, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.form import Form
from app.models.question import Question
from app.models.response import Response
from app.models.answer import Answer
from app.schemas.public import (
    PublicFormResponse,
    PublicQuestionResponse,
    ResponseSubmissionRequest,
    ResponseSubmissionResult,
)

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_and_format_answer(q: Question, submitted_val: Optional[Any]) -> Optional[str]:
    # Treat empty strings and whitespace-only strings as None
    if submitted_val is None:
        str_val = ""
    else:
        str_val = str(submitted_val).strip()

    if q.required and not str_val:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Question '{q.title}' is required."
        )

    if not str_val:
        return None

    q_type = q.type

    if q_type == "short_text":
        if len(str_val) > 500:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Answer for '{q.title}' exceeds maximum length of 500 characters."
            )
        return str_val

    elif q_type == "long_text":
        if len(str_val) > 5000:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Answer for '{q.title}' exceeds maximum length of 5000 characters."
            )
        return str_val

    elif q_type == "email":
        if not EMAIL_REGEX.match(str_val):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"'{str_val}' is not a valid email address for question '{q.title}'."
            )
        return str_val

    elif q_type == "number":
        try:
            num = float(str_val)
            if num.is_integer():
                return str(int(num))
            return str(num)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Value '{str_val}' for question '{q.title}' must be a valid number."
            )

    elif q_type in ("multiple_choice", "dropdown"):
        options = []
        if q.settings and isinstance(q.settings, dict) and "options" in q.settings:
            options = q.settings.get("options", [])

        if not options or not isinstance(options, list):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Question '{q.title}' has no valid options configured."
            )

        matching_option = next((opt for opt in options if str(opt).strip() == str_val), None)
        if matching_option is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Value '{str_val}' is not a valid option for question '{q.title}'."
            )
        return str(matching_option).strip()

    elif q_type == "yes_no":
        val_lower = str_val.lower()
        if val_lower not in ("yes", "no"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Value for question '{q.title}' must be 'yes' or 'no'."
            )
        return val_lower

    elif q_type == "rating":
        try:
            rating_num = int(str_val)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Rating for question '{q.title}' must be an integer."
            )

        max_rating = 5
        if q.settings and isinstance(q.settings, dict) and "max" in q.settings:
            try:
                max_rating = int(q.settings["max"])
            except (ValueError, TypeError):
                max_rating = 5

        if rating_num < 1 or rating_num > max_rating:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Rating for question '{q.title}' must be between 1 and {max_rating}."
            )
        return str(rating_num)

    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported question type '{q_type}' for question '{q.title}'."
        )


def get_public_form_by_slug(db: Session, slug: str) -> PublicFormResponse:
    form = db.query(Form).filter(Form.slug == slug, Form.status == "published").first()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with slug '{slug}' not found or is not published"
        )

    # Sort questions by position ascending
    sorted_questions = sorted(form.questions, key=lambda q: q.position)

    return PublicFormResponse(
        id=form.id,
        title=form.title,
        slug=form.slug,
        questions=[PublicQuestionResponse.model_validate(q) for q in sorted_questions]
    )


def submit_form_response(
    db: Session,
    slug: str,
    submission: ResponseSubmissionRequest
) -> ResponseSubmissionResult:
    form = db.query(Form).filter(Form.slug == slug, Form.status == "published").first()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with slug '{slug}' not found or is not published"
        )

    # 1. Check duplicate question IDs in request
    submitted_q_ids = [ans.question_id for ans in submission.answers]
    if len(submitted_q_ids) != len(set(submitted_q_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate question IDs found in submission answers"
        )

    # 2. Map form questions
    form_questions = db.query(Question).filter(Question.form_id == form.id).order_by(Question.position.asc()).all()
    questions_map = {q.id: q for q in form_questions}
    answers_map = {ans.question_id: ans.value for ans in submission.answers}

    # 3. Check extra answers referencing questions not belonging to this form
    for q_id in submitted_q_ids:
        if q_id not in questions_map:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question ID {q_id} does not belong to this published form"
            )

    # 4. Validate all answers
    validated_answers: Dict[int, Optional[str]] = {}
    for q in form_questions:
        raw_val = answers_map.get(q.id)
        validated_val = validate_and_format_answer(q, raw_val)
        validated_answers[q.id] = validated_val

    # 5. Persist Response and Answers atomically
    try:
        response_record = Response(form_id=form.id)
        db.add(response_record)
        db.flush()

        answer_records = []
        for q_id, val in validated_answers.items():
            if val is not None:
                answer_records.append(
                    Answer(
                        response_id=response_record.id,
                        question_id=q_id,
                        value=val
                    )
                )

        if answer_records:
            db.add_all(answer_records)

        db.commit()
        db.refresh(response_record)

        return ResponseSubmissionResult(
            response_id=response_record.id,
            message="Response submitted successfully"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while saving the response submission"
        )
