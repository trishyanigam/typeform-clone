from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


class FormCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Title of the form"
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v_stripped = v.strip()
        if not v_stripped:
            raise ValueError("Title cannot be empty or consist only of whitespace")
        return v_stripped


class FormUpdate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Updated title of the form"
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v_stripped = v.strip()
        if not v_stripped:
            raise ValueError("Title cannot be empty or consist only of whitespace")
        return v_stripped


class FormResponse(BaseModel):
    id: int
    title: str
    slug: str
    status: str
    created_at: datetime
    updated_at: datetime
    response_count: int = 0

    model_config = ConfigDict(from_attributes=True)
