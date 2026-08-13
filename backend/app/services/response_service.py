from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.form import Form
from app.models.question import Question
from app.models.response import Response
from app.models.answer import Answer
from app.schemas.response import (
    AnswerDetailedResponse,
    AnswerSimpleResponse,
    QuestionStat,
    ResponseDetailResponse,
    ResponseItem,
    ResponseListResponse,
    ResponseStatsResponse,
)


def get_form_responses(db: Session, form_id: int) -> ResponseListResponse:
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID {form_id} not found"
        )

    responses = (
        db.query(Response)
        .filter(Response.form_id == form_id)
        .order_by(Response.submitted_at.desc(), Response.id.desc())
        .all()
    )

    response_items = []
    for r in responses:
        answers_simple = [
            AnswerSimpleResponse(question_id=a.question_id, value=a.value)
            for a in r.answers
        ]
        response_items.append(
            ResponseItem(
                id=r.id,
                submitted_at=r.submitted_at,
                answers=answers_simple,
            )
        )

    return ResponseListResponse(
        form_id=form_id,
        total=len(response_items),
        responses=response_items,
    )


def get_individual_response(db: Session, form_id: int, response_id: int) -> ResponseDetailResponse:
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID {form_id} not found"
        )

    response_record = (
        db.query(Response)
        .filter(Response.id == response_id, Response.form_id == form_id)
        .first()
    )

    if not response_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Response with ID {response_id} not found for form {form_id}"
        )

    questions = (
        db.query(Question)
        .filter(Question.form_id == form_id)
        .order_by(Question.position.asc())
        .all()
    )
    questions_map = {q.id: q for q in questions}

    detailed_answers = []
    for a in response_record.answers:
        q = questions_map.get(a.question_id)
        if q:
            detailed_answers.append(
                {
                    "question_id": q.id,
                    "question_title": q.title,
                    "question_type": q.type,
                    "value": a.value,
                    "position": q.position,
                }
            )

    detailed_answers.sort(key=lambda x: x["position"])

    formatted_answers = [
        AnswerDetailedResponse(
            question_id=item["question_id"],
            question_title=item["question_title"],
            question_type=item["question_type"],
            value=item["value"],
        )
        for item in detailed_answers
    ]

    return ResponseDetailResponse(
        id=response_record.id,
        form_id=form_id,
        submitted_at=response_record.submitted_at,
        answers=formatted_answers,
    )


def get_form_response_stats(db: Session, form_id: int) -> ResponseStatsResponse:
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form with ID {form_id} not found"
        )

    total_responses = db.query(Response).filter(Response.form_id == form_id).count()
    questions = (
        db.query(Question)
        .filter(Question.form_id == form_id)
        .order_by(Question.position.asc())
        .all()
    )

    stats_list = []

    for q in questions:
        answers = (
            db.query(Answer)
            .join(Response)
            .filter(Response.form_id == form_id, Answer.question_id == q.id)
            .all()
        )

        valid_values = [
            str(a.value).strip()
            for a in answers
            if a.value is not None and str(a.value).strip() != ""
        ]
        total_answers = len(valid_values)

        counts: Optional[Dict[str, int]] = None
        average: Optional[float] = None

        if q.type in ("multiple_choice", "dropdown"):
            options = []
            if q.settings and isinstance(q.settings, dict) and "options" in q.settings:
                options = [str(opt).strip() for opt in q.settings["options"]]

            counts = {opt: 0 for opt in options}
            for v in valid_values:
                counts[v] = counts.get(v, 0) + 1

        elif q.type == "yes_no":
            counts = {"yes": 0, "no": 0}
            for v in valid_values:
                v_lower = v.lower()
                if v_lower in counts:
                    counts[v_lower] += 1
                else:
                    counts[v_lower] = counts.get(v_lower, 0) + 1

        elif q.type == "rating":
            max_rating = 5
            if q.settings and isinstance(q.settings, dict) and "max" in q.settings:
                try:
                    max_rating = int(q.settings["max"])
                except (ValueError, TypeError):
                    max_rating = 5

            counts = {str(i): 0 for i in range(1, max_rating + 1)}
            sum_rating = 0.0
            num_ratings = 0

            for v in valid_values:
                counts[v] = counts.get(v, 0) + 1
                try:
                    sum_rating += float(v)
                    num_ratings += 1
                except ValueError:
                    pass

            average = round(sum_rating / num_ratings, 2) if num_ratings > 0 else 0.0

        stats_list.append(
            QuestionStat(
                question_id=q.id,
                question_title=q.title,
                type=q.type,
                total_answers=total_answers,
                average=average,
                counts=counts,
            )
        )

    return ResponseStatsResponse(
        form_id=form_id,
        total_responses=total_responses,
        stats=stats_list,
    )
