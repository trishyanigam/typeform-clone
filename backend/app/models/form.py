from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Form(Base):
    __tablename__ = "forms"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="draft",
        nullable=False
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

    questions = relationship(
        "Question",
        back_populates="form",
        cascade="all, delete-orphan"
    )

    responses = relationship(
        "Response",
        back_populates="form",
        cascade="all, delete-orphan"
    )