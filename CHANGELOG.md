# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Created CHANGELOG.md
- **Project Setup**: Initialized FastAPI project structure (`logipilot-api`), including `app/main.py` with CORS, `requirements.txt`, and `.env.example`. Created directories for models, schemas, routers, and auth.
- **User Authentication (JWT + Roles)**:
    - Defined `User` model (`app/models/user.py`) with roles (Admin, Manager, Client, Driver) and `UserRoleEnum`.
    - Created Pydantic schemas for User (`app/schemas/user.py`) including `UserCreate`, `UserPublic`, `Token`, `TokenData`.
    - Implemented password hashing (`app/auth/security.py`) using passlib.
    - Setup JWT creation and validation (`app/auth/jwt.py`) with `get_current_active_user` and role-based dependency `require_role` (e.g., `require_admin`).
    - Established database connection and session management (`app/database.py`).
    - Added `crud_user` module (`app/crud/crud_user.py`) for user database operations.
    - Created `/api/v1/auth/login` endpoint (`app/routers/auth.py`) for JWT token generation.
    - Created `/api/v1/users/me` and admin-only `/api/v1/users/create` (and other CRUD) endpoints (`app/routers/users.py`).
    - Integrated auth and user routers into `main.py` with `/api/v1` prefix.
    - Added global app settings management (`app/core/config.py`).
- **Database Setup (SQLite & Alembic)**:
    - Configured SQLAlchemy for SQLite (`app/database.py`).
    - Manually set up Alembic configuration (`alembic.ini`, `alembic/env.py`, `alembic/script.py.mako`) due to tool limitations.
    - `alembic/env.py` configured to use application's models and database settings.
    - Manually created the first Alembic migration script (`alembic/versions/0001_create_users_table.py`) to create the `users` table.
    - Created a script (`app/initial_data.py`) to seed an initial admin user (`admin@logipilot.com`). Instructions to run would be `alembic upgrade head` then `python -m app.initial_data`.
- **Core Models & CRUD (Client, Shipment, Alert)**:
    - **Client**:
        - Defined `Client` model (`app/models/client.py`) with status enum and relationships.
        - Created Pydantic schemas (`app/schemas/client.py`) for Client.
        - Implemented CRUD operations (`app/crud/crud_client.py`).
        - Added API router (`app/routers/clients.py`) with role-based access controls.
        - Integrated router into `main.py`.
        - Updated `alembic/env.py` and manually created migration `0002_create_clients_table.py`.
    - **Shipment**:
        - Defined `Shipment` model (`app/models/shipment.py`) with status enum and relationships to Client and Alert.
        - Created Pydantic schemas (`app/schemas/shipment.py`), including nested Client details in `ShipmentPublic`.
        - Implemented CRUD operations (`app/crud/crud_shipment.py`).
        - Added API router (`app/routers/shipments.py`) with role-based access.
        - Integrated router into `main.py`.
        - Updated `alembic/env.py` and manually created migration `0003_create_shipments_table.py`.
    - **Alert**:
        - Defined `Alert` model (`app/models/alert.py`) with severity enum and relationship to Shipment.
        - Created Pydantic schemas (`app/schemas/alert.py`).
        - Implemented CRUD operations (`app/crud/crud_alert.py`).
        - Added API router (`app/routers/alerts.py`) with role-based access.
        - Integrated router into `main.py`.
        - Updated `alembic/env.py` and manually created migration `0004_create_alerts_table.py`.
- **API Enhancements & Documentation**:
    - Implemented a standardized JSON response wrapper (`StandardResponse` in `app/schemas/response.py`) for all API endpoints, providing `{ data: ..., error: ... }` structure.
    - Added global exception handlers in `app/main.py` for `RequestValidationError`, `HTTPException`, and generic `Exception` to ensure errors are returned in the standard format.
    - Updated all API routers (`auth`, `users`, `clients`, `shipments`, `alerts`) to use the `StandardResponse` model for their outputs.
    - Created a comprehensive `README.md` in `logipilot-api/` with setup, configuration, migration, seeding, and execution instructions.
    - Noted that Swagger UI at `/docs` should now reflect these standardized responses and provide a good interface for manual testing (pending a functional execution environment).
- **Final Review**:
    - Conducted a code review for consistency, adherence to requirements, error handling, and security best practices (within tool limitations).
    - Confirmed all models, CRUD operations, authentication, and API endpoints are implemented as per the MVP specification.
    - Verified `CHANGELOG.md` and `README.md` are complete.
