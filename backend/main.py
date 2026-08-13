from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import Form, Question, Response, Answer
from app.routes import forms_router, questions_router, public_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Typeform Clone API",
    version="1.0.0"
)

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forms_router, prefix="/api")
app.include_router(questions_router, prefix="/api")
app.include_router(public_router, prefix="/api/public")



@app.get("/")
def root():
    return {
        "message": "Typeform Clone API is running"
    }


