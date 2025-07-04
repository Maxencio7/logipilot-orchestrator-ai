import logging

from sqlalchemy.orm import Session

from .database import SessionLocal, engine, Base
from .models.user import User as UserModel, UserRoleEnum # Ensure UserRoleEnum is available
from .schemas.user import UserCreate, UserRole as PydanticUserRole # Pydantic Role for UserCreate
from .crud import crud_user
from .core.config import settings
from .auth.security import get_password_hash # For direct password hashing if not using UserCreate fully

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    # Tables should be created via Alembic migrations.
    # This function is primarily for seeding data.
    # Base.metadata.create_all(bind=engine) # Usually not called here if using Alembic

    admin_email = settings.ADMIN_EMAIL
    admin_password = settings.ADMIN_PASSWORD # Plain text password from settings

    user = crud_user.get_user_by_email(db, email=admin_email)
    if not user:
        logger.info(f"Creating admin user: {admin_email}")
        # Ensure UserCreate schema expects a Pydantic UserRole
        user_in = UserCreate(
            email=admin_email,
            password=admin_password, # crud_user.create_user will hash this
            role=PydanticUserRole.ADMIN, # Use the Pydantic enum for role
            is_active=True
        )
        crud_user.create_user(db=db, user=user_in)
        logger.info(f"Admin user {admin_email} created successfully.")
    else:
        logger.info(f"Admin user {admin_email} already exists. Skipping creation.")

def main() -> None:
    logger.info("Initializing service. Creating initial data...")
    db = SessionLocal()
    try:
        init_db(db)
        logger.info("Initial data created successfully.")
    except Exception as e:
        logger.error(f"Error creating initial data: {e}")
        # You might want to raise the exception or handle it as needed
    finally:
        db.close()

if __name__ == "__main__":
    # This allows running the script directly:
    # cd logipilot-api
    # python -m app.initial_data
    main()
