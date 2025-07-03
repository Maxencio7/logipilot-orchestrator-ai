from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from ..schemas.user import TokenData, UserRole as PydanticUserRole # Renamed to avoid confusion
from ..core.config import settings
from ..crud import crud_user
from ..models.user import User as DBUser, UserRoleEnum as DBUserRoleEnum
from sqlalchemy.orm import Session
from ..database import get_db

# Configuration for JWT
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# Path will be /api/v1/auth/login if we use a prefix for the auth router
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login") # Added leading / and prefix

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    if "sub" not in to_encode:
        raise ValueError("Subject ('sub') claim missing from token data")
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user_from_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> DBUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: Optional[str] = payload.get("sub")
        # Role from token can be used for quick check but DB should be source of truth
        # role_str: Optional[str] = payload.get("role")

        if email is None:
            raise credentials_exception

        # TokenData was a Pydantic model, not needed here as we fetch user directly
        # token_data = TokenData(email=email) # Role will be checked from DB user object
    except JWTError:
        raise credentials_exception

    user = crud_user.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    # Role consistency check (optional, as DB is source of truth)
    # token_role_str = payload.get("role")
    # if token_role_str != user.role.value: # user.role is DBUserRoleEnum
    #     raise credentials_exception # Token role does not match DB role

    return user

async def get_current_active_user(current_user: DBUser = Depends(get_current_user_from_token)) -> DBUser:
    if not crud_user.is_user_active(current_user): # uses crud_user helper
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

def require_role(required_role: DBUserRoleEnum): # Takes SQLAlchemy Enum member
    async def role_checker(current_user: DBUser = Depends(get_current_active_user)):
        # current_user.role is DBUserRoleEnum (e.g. UserRoleEnum.ADMIN)
        # required_role is also DBUserRoleEnum (e.g. UserRoleEnum.ADMIN)
        if current_user.role != required_role:
            # If required_role is a list/tuple of roles:
            # if current_user.role not in required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have the required {required_role.value} role. User has role {current_user.role.value}"
            )
        return current_user
    return role_checker

# Specific role requirement dependencies
require_admin = require_role(DBUserRoleEnum.ADMIN)
require_manager = require_role(DBUserRoleEnum.MANAGER)

# Dependency for requiring one of multiple roles
def require_roles(allowed_roles: list[DBUserRoleEnum]):
    async def role_checker(current_user: DBUser = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            allowed_role_values = [role.value for role in allowed_roles]
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{current_user.role.value}' is not one of the required roles: {', '.join(allowed_role_values)}"
            )
        return current_user
    return role_checker

require_admin_or_manager = require_roles([DBUserRoleEnum.ADMIN, DBUserRoleEnum.MANAGER])
