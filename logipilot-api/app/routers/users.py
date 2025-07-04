from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas, models
from ..database import get_db
from ..auth.jwt import get_current_active_user, require_admin
from ..models.user import User as DBUser, UserRoleEnum
from ..schemas.user import UserCreate, UserPublic, UserUpdate
from ..schemas.response import StandardResponse # Import standard response

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

@router.post("/", response_model=StandardResponse[schemas.user.UserPublic], status_code=status.HTTP_201_CREATED)
async def create_new_user(
    user_in: schemas.user.UserCreate,
    db: Session = Depends(get_db),
    current_admin_user: models.user.User = Depends(require_admin) # Renamed for clarity
):
    """
    Create a new user. Only accessible by administrators.
    """
    db_user_exists = crud.crud_user.get_user_by_email(db, email=user_in.email)
    if db_user_exists: # Renamed variable
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_user_db = crud.crud_user.create_user(db=db, user=user_in) # Renamed variable
    # Pydantic conversion to UserPublic happens during StandardResponse creation if orm_mode is efficient
    return StandardResponse(data=new_user_db)

@router.get("/me", response_model=StandardResponse[schemas.user.UserPublic])
async def read_users_me(current_active_user: models.user.User = Depends(get_current_active_user)): # Renamed for clarity
    """
    Get current logged-in user's public information.
    """
    return StandardResponse(data=current_active_user)

@router.get("/", response_model=StandardResponse[List[schemas.user.UserPublic]]) # Updated response_model
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin_user: models.user.User = Depends(require_admin) # Renamed for clarity
):
    """
    Retrieve a list of users. Admin only. Includes pagination.
    """
    users_list = crud.crud_user.get_users(db, skip=skip, limit=limit) # Renamed variable
    return StandardResponse(data=users_list)

@router.get("/{user_id}", response_model=StandardResponse[schemas.user.UserPublic]) # Updated response_model
async def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin_user: models.user.User = Depends(require_admin) # Renamed for clarity
):
    """
    Get a specific user by ID. Admin only.
    """
    db_user_found = crud.crud_user.get_user(db, user_id=user_id) # Renamed variable
    if db_user_found is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return StandardResponse(data=db_user_found)

@router.put("/{user_id}", response_model=StandardResponse[schemas.user.UserPublic]) # Updated response_model
async def update_existing_user(
    user_id: int,
    user_in: schemas.user.UserUpdate,
    db: Session = Depends(get_db),
    current_admin_user: models.user.User = Depends(require_admin) # Renamed for clarity
):
    """
    Update a user's details. Admin only.
    """
    db_user_to_update = crud.crud_user.get_user(db, user_id=user_id) # Renamed variable
    if not db_user_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user_in.email and user_in.email != db_user_to_update.email:
        existing_email_user = crud.crud_user.get_user_by_email(db, email=user_in.email) # Renamed
        if existing_email_user and existing_email_user.id != user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered by another user.")

    updated_user_db = crud.crud_user.update_user(db=db, db_user=db_user_to_update, user_in=user_in) # Renamed
    return StandardResponse(data=updated_user_db)

@router.delete("/{user_id}", response_model=StandardResponse[schemas.user.UserPublic]) # Updated response_model
async def delete_existing_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin_user: models.user.User = Depends(require_admin) # Renamed for clarity
):
    """
    Delete a user. Admin only.
    Prevents admin from deleting themselves.
    """
    if current_admin_user.id == user_id: # current_user is now current_admin_user
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins cannot delete themselves.")

    deleted_user_db = crud.crud_user.delete_user(db, user_id=user_id) # Renamed
    if not deleted_user_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return StandardResponse(data=deleted_user_db)
