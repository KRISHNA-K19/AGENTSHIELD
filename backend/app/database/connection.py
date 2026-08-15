import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

IS_SERVERLESS = os.getenv("VERCEL") == "1" or os.getenv("AWS_LAMBDA_FUNCTION_NAME") is not None or os.getenv("VERCEL_ENV") is not None

if IS_SERVERLESS:
    DB_PATH = os.getenv("DATABASE_URL", "sqlite:///:memory:")
else:
    DB_PATH = os.getenv("DATABASE_URL", "sqlite:///./agentshield.db")

engine = create_engine(
    DB_PATH, connect_args={"check_same_thread": False} if DB_PATH.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
