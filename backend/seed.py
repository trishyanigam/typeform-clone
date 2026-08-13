import sys
import os
from datetime import datetime, timedelta, timezone

# Ensure app package is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import Form, Question, Response, Answer


def seed_database():
    print("Starting database seeding...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check existing seeded forms for idempotence
        f1_slug = "customer-feedback"
        f2_slug = "developer-experience-survey"

        existing_f1 = db.query(Form).filter(Form.slug == f1_slug).first()
        existing_f2 = db.query(Form).filter(Form.slug == f2_slug).first()

        if existing_f1:
            print(f"Clearing existing seeded form '{f1_slug}'...")
            db.delete(existing_f1)
            db.commit()

        if existing_f2:
            print(f"Clearing existing seeded form '{f2_slug}'...")
            db.delete(existing_f2)
            db.commit()

        # ==========================================
        # FORM 1: Customer Feedback
        # ==========================================
        form1 = Form(
            title="Customer Feedback",
            slug=f1_slug,
            status="published"
        )
        db.add(form1)
        db.commit()
        db.refresh(form1)

        q1_1 = Question(
            form_id=form1.id,
            type="short_text",
            title="What is your full name?",
            description="Please enter your first and last name.",
            required=True,
            position=1,
            settings=None
        )
        q1_2 = Question(
            form_id=form1.id,
            type="email",
            title="What is your email address?",
            description="We will only use this to send follow-up confirmation.",
            required=True,
            position=2,
            settings=None
        )
        q1_3 = Question(
            form_id=form1.id,
            type="multiple_choice",
            title="How did you hear about us?",
            description="Select the primary channel.",
            required=True,
            position=3,
            settings={"options": ["Social Media", "Search Engine", "Friend / Word of Mouth", "Advertisement"]}
        )
        q1_4 = Question(
            form_id=form1.id,
            type="dropdown",
            title="Which industry do you work in?",
            description="Choose your primary industry sector.",
            required=False,
            position=4,
            settings={"options": ["Technology", "Healthcare", "Education", "Finance", "Retail", "Other"]}
        )
        q1_5 = Question(
            form_id=form1.id,
            type="yes_no",
            title="Would you recommend our product to a colleague?",
            description=None,
            required=True,
            position=5,
            settings=None
        )
        q1_6 = Question(
            form_id=form1.id,
            type="rating",
            title="How would you rate your overall satisfaction?",
            description="1 = Very Unsatisfied, 5 = Extremely Satisfied",
            required=True,
            position=6,
            settings={"max": 5}
        )

        db.add_all([q1_1, q1_2, q1_3, q1_4, q1_5, q1_6])
        db.commit()

        # Seed 5 Responses for Form 1
        now = datetime.now(timezone.utc)
        f1_responses_data = [
            {
                "time_offset": timedelta(days=5, hours=2),
                "answers": {
                    q1_1.id: "Alice Smith",
                    q1_2.id: "alice.smith@example.com",
                    q1_3.id: "Social Media",
                    q1_4.id: "Technology",
                    q1_5.id: "yes",
                    q1_6.id: "5"
                }
            },
            {
                "time_offset": timedelta(days=4, hours=6),
                "answers": {
                    q1_1.id: "Bob Johnson",
                    q1_2.id: "bob.j@example.com",
                    q1_3.id: "Search Engine",
                    q1_4.id: "Finance",
                    q1_5.id: "yes",
                    q1_6.id: "4"
                }
            },
            {
                "time_offset": timedelta(days=3, hours=1),
                "answers": {
                    q1_1.id: "Carol Williams",
                    q1_2.id: "carol.w@example.com",
                    q1_3.id: "Friend / Word of Mouth",
                    q1_4.id: "Education",
                    q1_5.id: "yes",
                    q1_6.id: "5"
                }
            },
            {
                "time_offset": timedelta(days=2, hours=4),
                "answers": {
                    q1_1.id: "David Brown",
                    q1_2.id: "david.b@example.com",
                    q1_3.id: "Advertisement",
                    q1_4.id: "Retail",
                    q1_5.id: "no",
                    q1_6.id: "2"
                }
            },
            {
                "time_offset": timedelta(days=1, hours=3),
                "answers": {
                    q1_1.id: "Eva Davis",
                    q1_2.id: "eva.davis@example.com",
                    q1_3.id: "Search Engine",
                    q1_4.id: "Healthcare",
                    q1_5.id: "yes",
                    q1_6.id: "4"
                }
            }
        ]

        for item in f1_responses_data:
            resp_time = now - item["time_offset"]
            resp = Response(form_id=form1.id, submitted_at=resp_time)
            db.add(resp)
            db.flush()

            for q_id, val in item["answers"].items():
                ans = Answer(response_id=resp.id, question_id=q_id, value=val)
                db.add(ans)

        db.commit()

        # ==========================================
        # FORM 2: Developer Experience Survey
        # ==========================================
        form2 = Form(
            title="Developer Experience Survey",
            slug=f2_slug,
            status="published"
        )
        db.add(form2)
        db.commit()
        db.refresh(form2)

        q2_1 = Question(
            form_id=form2.id,
            type="short_text",
            title="What is your primary programming language?",
            description=None,
            required=True,
            position=1,
            settings=None
        )
        q2_2 = Question(
            form_id=form2.id,
            type="long_text",
            title="What is the biggest challenge in your current developer workflow?",
            description="Describe any pain points, build times, or tooling bottlenecks.",
            required=False,
            position=2,
            settings=None
        )
        q2_3 = Question(
            form_id=form2.id,
            type="multiple_choice",
            title="What primary OS do you use for software development?",
            description=None,
            required=True,
            position=3,
            settings={"options": ["macOS", "Linux", "Windows"]}
        )
        q2_4 = Question(
            form_id=form2.id,
            type="number",
            title="How many years of software engineering experience do you have?",
            description=None,
            required=True,
            position=4,
            settings=None
        )
        q2_5 = Question(
            form_id=form2.id,
            type="yes_no",
            title="Do you regularly use AI coding assistants in your daily workflow?",
            description=None,
            required=True,
            position=5,
            settings=None
        )
        q2_6 = Question(
            form_id=form2.id,
            type="rating",
            title="Rate your overall developer tooling satisfaction",
            description=None,
            required=True,
            position=6,
            settings={"max": 5}
        )

        db.add_all([q2_1, q2_2, q2_3, q2_4, q2_5, q2_6])
        db.commit()

        # Seed 5 Responses for Form 2
        f2_responses_data = [
            {
                "time_offset": timedelta(days=6, hours=5),
                "answers": {
                    q2_1.id: "TypeScript / Python",
                    q2_2.id: "Slow CI/CD test execution pipeline times.",
                    q2_3.id: "macOS",
                    q2_4.id: "6",
                    q2_5.id: "yes",
                    q2_6.id: "5"
                }
            },
            {
                "time_offset": timedelta(days=4, hours=2),
                "answers": {
                    q2_1.id: "Python / Go",
                    q2_2.id: "Complex local microservices setup and environment variables.",
                    q2_3.id: "Linux",
                    q2_4.id: "4",
                    q2_5.id: "yes",
                    q2_6.id: "4"
                }
            },
            {
                "time_offset": timedelta(days=3, hours=8),
                "answers": {
                    q2_1.id: "C# / .NET Core",
                    q2_2.id: "Legacy monolithic code architecture and refactoring safety.",
                    q2_3.id: "Windows",
                    q2_4.id: "8",
                    q2_5.id: "no",
                    q2_6.id: "3"
                }
            },
            {
                "time_offset": timedelta(days=2, hours=1),
                "answers": {
                    q2_1.id: "Rust / C++",
                    q2_2.id: "Long compilation times and strict borrow checker debugging.",
                    q2_3.id: "Linux",
                    q2_4.id: "5",
                    q2_5.id: "yes",
                    q2_6.id: "5"
                }
            },
            {
                "time_offset": timedelta(days=1, hours=4),
                "answers": {
                    q2_1.id: "Java / Kotlin",
                    q2_2.id: "Dependency version conflicts and slow IDE indexing.",
                    q2_3.id: "macOS",
                    q2_4.id: "3",
                    q2_5.id: "yes",
                    q2_6.id: "4"
                }
            }
        ]

        for item in f2_responses_data:
            resp_time = now - item["time_offset"]
            resp = Response(form_id=form2.id, submitted_at=resp_time)
            db.add(resp)
            db.flush()

            for q_id, val in item["answers"].items():
                ans = Answer(response_id=resp.id, question_id=q_id, value=val)
                db.add(ans)

        db.commit()

        print("Database seeding completed successfully!")
        print(f"Form 1 created: 'Customer Feedback' (slug: {f1_slug}) with 6 questions & 5 responses.")
        print(f"Form 2 created: 'Developer Experience Survey' (slug: {f2_slug}) with 6 questions & 5 responses.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
