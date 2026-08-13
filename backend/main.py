from fastapi import FastAPI

from app.database import Base, engine
from app.models import Form, Question, Response, Answer
from app.routes import forms_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Typeform Clone API",
    version="1.0.0"
)

app.include_router(forms_router, prefix="/api", tags=["forms"])


@app.get("/")
def root():
    return {
        "message": "Typeform Clone API is running"
    }