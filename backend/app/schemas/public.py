from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class PublicQuestionResponse(BaseModel):
    id: int
    type: str
    title: str
    description: Optional[str] = None
    required: bool
    position: int
    settings: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class PublicFormResponse(BaseModel):
    id: int
    title: str
    slug: str
    questions: List[PublicQuestionResponse]

    model_config = ConfigDict(from_attributes=True)


class AnswerSubmission(BaseModel):
    question_id: int
    value: Optional[Any] = None


class ResponseSubmissionRequest(BaseModel):
    answers: List[AnswerSubmission] = Field(default_factory=list)


class ResponseSubmissionResult(BaseModel):
    response_id: int
    message: str = "Response submitted successfully"
