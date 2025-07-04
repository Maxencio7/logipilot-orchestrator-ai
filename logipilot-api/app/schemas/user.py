from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from typing import Optional

# Importing UserRoleEnum from models to avoid circular dependency if schemas are imported by models
# and to keep a single source of truth for Role enum.
# However, for Pydantic, it's often cleaner to redefine or use strings and validate.
# For this case, let's use the model's UserRoleEnum directly.
from ..models.user import UserRoleEnum as ModelUserRoleEnum

class UserRole(str, Enum):
    ADMIN = ModelUserRoleEnum.ADMIN.value
    MANAGER = ModelUserRoleEnum.MANAGER.value
    CLIENT = ModelUserRoleEnum.CLIENT.value
    DRIVER = ModelUserRoleEnum.DRIVER.value

class UserBase(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.CLIENT
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str = Field(min_length=8)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)

class UserInDBBase(UserBase):
    id: int

    class Config:
        orm_mode = True # Pydantic V1
        # from_attributes = True # Pydantic V2

class UserPublic(UserInDBBase):
    pass # No hashed_password

class UserInDB(UserInDBBase):
    hashed_password: str

# Schema for token data
class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None

# Schema for the token response
class TokenResponse(BaseModel): # Renamed from Token to TokenResponse
    access_token: str
    token_type: str
    user: UserPublic
