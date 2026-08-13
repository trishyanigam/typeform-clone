from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict

ALLOWED_QUESTION_TYPES = {
    "short_text",
    "long_text",
    "multiple_choice",
    "dropdown",
    "email",
    "number",
    "yes_no",
    "rating"
}


def validate_and_normalize_settings(q_type: str, settings: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if q_type not in ALLOWED_QUESTION_TYPES:
        raise ValueError(f"Invalid question type '{q_type}'. Allowed types are: {', '.join(sorted(ALLOWED_QUESTION_TYPES))}")

    if q_type == "multiple_choice":
        if not settings or not isinstance(settings, dict):
            raise ValueError("Settings must be provided for multiple_choice question with an 'options' list")
        options = settings.get("options")
        if not isinstance(options, list):
            raise ValueError("Settings for multiple_choice must contain an 'options' list")
        non_empty_options = [str(opt).strip() for opt in options if str(opt).strip()]
        if len(non_empty_options) < 2:
            raise ValueError("multiple_choice questions must have at least 2 non-empty options")
        settings["options"] = non_empty_options
        return settings

    elif q_type == "dropdown":
        if not settings or not isinstance(settings, dict):
            raise ValueError("Settings must be provided for dropdown question with an 'options' list")
        options = settings.get("options")
        if not isinstance(options, list):
            raise ValueError("Settings for dropdown must contain an 'options' list")
        non_empty_options = [str(opt).strip() for opt in options if str(opt).strip()]
        if len(non_empty_options) < 1:
            raise ValueError("dropdown questions must have at least 1 non-empty option")
        settings["options"] = non_empty_options
        return settings

    elif q_type == "rating":
        if settings is None or not isinstance(settings, dict):
            settings = {"max": 5}
        else:
            max_val = settings.get("max")
            if max_val is None:
                settings["max"] = 5
            else:
                if not isinstance(max_val, int) or max_val < 1:
                    raise ValueError("Rating 'max' setting must be a positive integer (>= 1)")
        return settings

    return settings


class QuestionCreate(BaseModel):
    type: str = Field(..., description="Type of the question")
    title: str = Field(..., min_length=1, max_length=500, description="Title of the question")
    description: Optional[str] = Field(None, description="Optional detailed description")
    required: bool = Field(False, description="Whether answering is required")
    settings: Optional[Dict[str, Any]] = Field(None, description="Type-specific settings")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v_stripped = v.strip()
        if not v_stripped:
            raise ValueError("Question title cannot be empty or consist only of whitespace")
        return v_stripped

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v_lower = v.lower().strip()
        if v_lower not in ALLOWED_QUESTION_TYPES:
            raise ValueError(f"Invalid question type '{v}'. Allowed types are: {', '.join(sorted(ALLOWED_QUESTION_TYPES))}")
        return v_lower


class QuestionUpdate(BaseModel):
    type: Optional[str] = Field(None, description="Updated type of the question")
    title: Optional[str] = Field(None, min_length=1, max_length=500, description="Updated title")
    description: Optional[str] = Field(None, description="Updated description")
    required: Optional[bool] = Field(None, description="Updated required flag")
    settings: Optional[Dict[str, Any]] = Field(None, description="Updated settings")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_stripped = v.strip()
            if not v_stripped:
                raise ValueError("Question title cannot be empty or consist only of whitespace")
            return v_stripped
        return v

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_lower = v.lower().strip()
            if v_lower not in ALLOWED_QUESTION_TYPES:
                raise ValueError(f"Invalid question type '{v}'. Allowed types are: {', '.join(sorted(ALLOWED_QUESTION_TYPES))}")
            return v_lower
        return v


class QuestionReorder(BaseModel):
    question_ids: List[int] = Field(..., description="Ordered list of all question IDs for the form")


class QuestionResponse(BaseModel):
    id: int
    form_id: int
    type: str
    title: str
    description: Optional[str] = None
    required: bool
    position: int
    settings: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
