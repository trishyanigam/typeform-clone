import re
from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.form import Form
from app.models.question import Question
from app.models.response import Response
from app.schemas.form import FormCreate, FormUpdate, FormResponse


def generate_unique_slug(db: Session, base_text: str, current_form_id: Optional[int] = None) -> str:
    # Normalize slug text to lower-case alphanumeric with hyphens
    slug_base = re.sub(r"[^a-z0-9]+", "-", base_text.lower()).strip("-")
    if not slug_base:
        slug_base = "form"

    slug = slug_base
    counter = 1

    while True:
        query = db.query(Form).filter(Form.slug == slug)
        if current_form_id is not None:
            query = query.filter(Form.id != current_form_id)

        existing = query.first()
        if not existing:
            return slug

        slug = f"{slug_base}-{counter}"
        counter += 1


def attach_response_count(db: Session, form: Form) -> Form:
    count = db.query(func.count(Response.id)).filter(Response.form_id == form.id).scalar() or 0
    form.response_count = count
    return form


def create_form(db: Session, form_in: FormCreate) -> Form:
    slug = generate_unique_slug(db, form_in.title)
    form = Form(
        title=form_in.title,
        slug=slug,
        status="draft"
    )
    db.add(form)
    db.commit()
    db.refresh(form)
    return attach_response_count(db, form)


def get_forms(db: Session) -> List[Form]:
    forms = db.query(Form).order_by(Form.created_at.desc()).all()
    for form in forms:
        attach_response_count(db, form)
    return forms


def get_form_by_id(db: Session, form_id: int) -> Optional[Form]:
    form = db.query(Form).filter(Form.id == form_id).first()
    if form:
        attach_response_count(db, form)
    return form


def update_form(db: Session, form: Form, form_in: FormUpdate) -> Form:
    form.title = form_in.title
    db.commit()
    db.refresh(form)
    return attach_response_count(db, form)


def delete_form(db: Session, form: Form) -> None:
    db.delete(form)
    db.commit()


def duplicate_form(db: Session, form: Form) -> Form:
    new_title = f"{form.title} Copy"
    new_slug = generate_unique_slug(db, new_title)

    new_form = Form(
        title=new_title,
        slug=new_slug,
        status="draft"
    )
    db.add(new_form)
    db.flush()

    # Preserve and duplicate existing questions if present
    for q in form.questions:
        duplicated_question = Question(
            form_id=new_form.id,
            type=q.type,
            title=q.title,
            description=q.description,
            required=q.required,
            position=q.position,
            settings=q.settings
        )
        db.add(duplicated_question)

    db.commit()
    db.refresh(new_form)
    return attach_response_count(db, new_form)


def publish_form(db: Session, form: Form) -> Form:
    # Ensure form slug is unique upon publishing
    form.slug = generate_unique_slug(db, form.title, current_form_id=form.id)
    form.status = "published"
    db.commit()
    db.refresh(form)
    return attach_response_count(db, form)


def unpublish_form(db: Session, form: Form) -> Form:
    form.status = "draft"
    db.commit()
    db.refresh(form)
    return attach_response_count(db, form)
