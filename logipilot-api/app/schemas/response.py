from pydantic import BaseModel, Field
from typing import TypeVar, Generic, Optional, Any, List # Moved List here

T = TypeVar('T')

class ErrorDetail(BaseModel):
    code: Optional[str] = None # e.g., "VALIDATION_ERROR", "AUTHENTICATION_FAILED"
    message: str
    field: Optional[str] = None # For validation errors, indicates which field

class ErrorResponse(BaseModel):
    message: str # General error message
    details: Optional[List[ErrorDetail]] = None

class StandardResponse(Generic[T], BaseModel):
    data: Optional[T] = None
    error: Optional[ErrorResponse] = None # Using the more detailed ErrorResponse

# Example usage in router:
# @router.post("/", response_model=StandardResponse[schemas.user.UserPublic])
# async def create_user(...):
#     # ... logic ...
#     return StandardResponse(data=new_user)

# For errors:
# return JSONResponse(
#     status_code=400,
#     content={"error": {"message": "Validation Error", "details": [{"code": "INVALID_EMAIL", "message": "Email format is incorrect", "field": "email"}]}}
# )
# This structure for JSONResponse content will be handled by exception handlers.
# The routers themselves will aim to return StandardResponse(data=...) on success.
# For direct error returns from endpoints (if not raising exceptions), they'd construct the error part.
# However, it's cleaner to raise HTTPExceptions and let handlers format them.
from typing import List # Added this import that was missed. Will correct in next step if necessary.
