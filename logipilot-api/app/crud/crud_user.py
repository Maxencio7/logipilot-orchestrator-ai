from sqlalchemy.orm import Session
from typing import Optional, List

from ..models.user import User as UserModel, UserRoleEnum
from ..schemas.user import UserCreate, UserUpdate, UserRole
from ..auth.security import get_password_hash

def get_user(db: Session, user_id: int) -> Optional[UserModel]:
    return db.query(UserModel).filter(UserModel.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[UserModel]:
    return db.query(UserModel).filter(UserModel.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[UserModel]:
    return db.query(UserModel).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> UserModel:
    hashed_password = get_password_hash(user.password)
    # Convert Pydantic UserRole to SQLAlchemy UserRoleEnum before saving
    db_user = UserModel(
        email=user.email,
        hashed_password=hashed_password,
        role=UserRoleEnum(user.role.value), # Ensure the value is passed to the enum
        is_active=user.is_active
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: UserModel, user_in: UserUpdate) -> UserModel:
    # Use .dict() for Pydantic v1, ensure exclude_unset is True
    user_data = user_in.dict(exclude_unset=True)

    if "password" in user_data and user_data["password"] is not None:
        hashed_password = get_password_hash(user_data["password"])
        db_user.hashed_password = hashed_password

    if "role" in user_data and user_data["role"] is not None:
        # Convert Pydantic UserRole (which is an Enum) to SQLAlchemy UserRoleEnum
        # The input user_in.role would be a UserRole enum instance due to Pydantic validation.
        # So user_data["role"] would be the string value of that enum after .dict() call.
        db_user.role = UserRoleEnum(user_data["role"])

    # Update other fields
    for field, value in user_data.items():
        if field not in ["password", "role"] and value is not None:
             setattr(db_user, field, value)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> Optional[UserModel]:
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

def is_user_active(user: UserModel) -> bool:
    return user.is_active

def is_admin(user: UserModel) -> bool:
    return user.role == UserRoleEnum.ADMIN
