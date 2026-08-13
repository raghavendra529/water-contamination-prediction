"""
SQLite database setup and user management.
Users are stored persistently in models/aquaai_users.db
"""
import os
import hashlib
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'aquaai_users.db')
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    email         = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_verified   = Column(Boolean, default=False)
    created_at    = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)


def _hash(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


# ── User CRUD ──────────────────────────────────────────────────────────────

def get_user(email: str) -> User | None:
    db = SessionLocal()
    try:
        return db.query(User).filter(User.email == email).first()
    finally:
        db.close()


def register_user(name: str, email: str, password: str) -> dict:
    """
    Creates an UNVERIFIED user record.
    Returns {"success": True} or {"success": False, "error": "..."}
    """
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing and existing.is_verified:
            return {"success": False, "error": "An account with this email already exists."}
        if existing and not existing.is_verified:
            # Overwrite the stale unverified record so they can retry
            existing.name = name
            existing.password_hash = _hash(password)
            db.commit()
            return {"success": True}

        user = User(name=name, email=email, password_hash=_hash(password), is_verified=False)
        db.add(user)
        db.commit()
        return {"success": True}
    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}
    finally:
        db.close()


def mark_verified(email: str) -> bool:
    """Marks a user's email as verified. Returns True on success."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return False
        user.is_verified = True
        db.commit()
        return True
    finally:
        db.close()


def authenticate_user(email: str, password: str) -> tuple:
    """
    Returns (user_dict, None) on success or (None, error_message) on failure.
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None, "No account found with this email. Please sign up."
        if user.password_hash != _hash(password):
            return None, "Incorrect password. Please try again."
        if not user.is_verified:
            return None, "Email not verified. Please check your inbox for the OTP."
        return {"name": user.name, "email": user.email}, None
    finally:
        db.close()
