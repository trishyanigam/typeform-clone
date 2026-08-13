from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    form_id: Mapped[int] = mapped_column(
        ForeignKey("forms.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    required: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    position: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    settings: Mapped[dict[str, Any] | None] = mapped_column(
        JSON,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    form = relationship(
        "Form",
        back_populates="questions"
    )

    answers = relationship(
        "Answer",
        back_populates="question"
    )