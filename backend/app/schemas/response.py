from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class AnswerSimpleResponse(BaseModel):
    question_id: int
    value: str

    model_config = ConfigDict(from_attributes=True)


class AnswerDetailedResponse(BaseModel):
    question_id: int
    question_title: str
    question_type: str
    value: str


class ResponseItem(BaseModel):
    id: int
    submitted_at: datetime
    answers: List[AnswerSimpleResponse]

    model_config = ConfigDict(from_attributes=True)


class ResponseListResponse(BaseModel):
    form_id: int
    total: int
    responses: List[ResponseItem]


class ResponseDetailResponse(BaseModel):
    id: int
    form_id: int
    submitted_at: datetime
    answers: List[AnswerDetailedResponse]


class QuestionStat(BaseModel):
    question_id: int
    question_title: str
    type: str
    total_answers: int
    average: Optional[float] = None
    counts: Optional[Dict[str, int]] = None


class ResponseStatsResponse(BaseModel):
    form_id: int
    total_responses: int
    stats: List[QuestionStat]
