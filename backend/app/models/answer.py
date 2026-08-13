from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Answer(Base):
    __tablename__ = "answers"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    response_id: Mapped[int] = mapped_column(
        ForeignKey("responses.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    value: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    response = relationship(
        "Response",
        back_populates="answers"
    )

    question = relationship(
        "Question",
        back_populates="answers"
    )