from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException as FastAPIHTTPException # Alias to avoid confusion
from fastapi.middleware.cors import CORSMiddleware
from .schemas.response import StandardResponse, ErrorResponse, ErrorDetail # Import custom response/error schemas
from typing import Any

app = FastAPI(
    title="LogiPilot API",
    version="0.1.0",
    # Disable default validation error responses to use custom ones
    # This is not directly available; handled by overriding exception handler.
)

# app instance should be defined before handlers are attached to it.
# Exception handlers will be defined below and attached to this 'app' instance.

# CORS configuration - This should also come after app instantiation.
origins = [
    "http://localhost",
    "http://localhost:3000",  # Assuming frontend runs on port 3000
    # Add other origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handler for Pydantic RequestValidationError
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_details = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"]) if error["loc"] else None
        error_details.append(ErrorDetail(
            code="VALIDATION_ERROR", # Could be more specific if error types are available
            message=error["msg"],
            field=field
        ))
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=StandardResponse(error=ErrorResponse(message="Validation failed", details=error_details)).model_dump(exclude_none=True) # V2
        # content=StandardResponse(error=ErrorResponse(message="Validation failed", details=error_details)).dict(exclude_none=True) # V1
    )

# Exception handler for FastAPI's HTTPException (and custom ones inheriting from it)
@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    error_detail = ErrorDetail(message=exc.detail)
    # You could add custom codes based on status_code or specific exception types if needed
    # if exc.status_code == 401: error_detail.code = "UNAUTHENTICATED"
    # elif exc.status_code == 403: error_detail.code = "FORBIDDEN"
    # elif exc.status_code == 404: error_detail.code = "NOT_FOUND"

    return JSONResponse(
        status_code=exc.status_code,
        content=StandardResponse(error=ErrorResponse(message=str(exc.detail), details=[error_detail])).model_dump(exclude_none=True), # V2
        # content=StandardResponse(error=ErrorResponse(message=str(exc.detail), details=[error_detail])).dict(exclude_none=True), # V1
        headers=exc.headers,
    )

# Generic Python Exception handler (optional, for unhandled errors)
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log the exception here for debugging
    # logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=StandardResponse(error=ErrorResponse(message="An unexpected internal server error occurred.")).model_dump(exclude_none=True) #V2
        # content=StandardResponse(error=ErrorResponse(message="An unexpected internal server error occurred.")).dict(exclude_none=True) #V1
    )

# The app instance was already created above where CORS was added.
# CORS configuration was moved up.
# Now, include routers and define root/health paths.

@app.get("/")
async def root():
    return {"message": "Welcome to LogiPilot API"}

# Import and include routers
from .routers import auth as auth_router, users as users_router, clients as clients_router, shipments as shipments_router, alerts as alerts_router

# API version prefix (optional but good practice)
API_V1_PREFIX = "/api/v1"

app.include_router(auth_router.router, prefix=API_V1_PREFIX)
app.include_router(users_router.router, prefix=API_V1_PREFIX)
app.include_router(clients_router.router, prefix=API_V1_PREFIX)
app.include_router(shipments_router.router, prefix=API_V1_PREFIX)
app.include_router(alerts_router.router, prefix=API_V1_PREFIX)


# Root path for health check or basic info, distinct from API versioned paths
@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    # For development, run directly: python -m app.main (if main.py is inside app folder)
    # Or: uvicorn app.main:app --reload (from logipilot-api directory)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) # Added reload=True
