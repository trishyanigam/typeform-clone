from datetime import datetime
from typing import List

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Response(Base):
    __tablename__ = "responses"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    form_id: Mapped[int] = mapped_column(
        ForeignKey("forms.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=func.now(),
        nullable=False
    )

    form: Mapped["Form"] = relationship(
        "Form",
        back_populates="responses"
    )

    answers: Mapped[List["Answer"]] = relationship(
        "Answer",
        back_populates="response",
        cascade="all, delete-orphan"
    )