from datetime import datetime

from sqlalchemy import DateTime, ForeignKey
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
        default=datetime.utcnow
    )

    form = relationship(
        "Form",
        back_populates="responses"
    )

    answers = relationship(
        "Answer",
        back_populates="response",
        cascade="all, delete-orphan"
    )