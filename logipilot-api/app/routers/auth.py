from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .. import crud, schemas # schemas.user, schemas.auth (if any)
from ..core.config import settings
from ..database import get_db
from ..auth import jwt as jwt_auth
from ..auth import security
from ..models.user import User as DBUser
from ..schemas.user import UserPublic, TokenResponse # Use the new name TokenResponse
from ..schemas.response import StandardResponse

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

@router.post("/login", response_model=StandardResponse[TokenResponse]) # Use TokenResponse
async def login_for_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = crud.crud_user.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    access_token_str = jwt_auth.create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )

    user_public_data = UserPublic.from_orm(user)

    token_data_for_response = TokenResponse( # Use TokenResponse here
        access_token=access_token_str,
        token_type="bearer",
        user=user_public_data
    )

    return StandardResponse(data=token_data_for_response)

# Example: Token refresh endpoint (optional)
# @router.post("/token/refresh")
# async def refresh_token(...):
#     ...

# Example: Password recovery / reset endpoints (optional)
# @router.post("/password-recovery/{email}")
# ...
# @router.post("/reset-password/")
# ...

# Make sure the main app includes this router: app.include_router(auth_router.router)
