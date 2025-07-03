# LogiPilot API

This is the backend API for the LogiPilot application, built with FastAPI.

## Features

- User authentication (JWT-based) with roles (admin, manager, client, driver).
- CRUD operations for:
    - Users (Admin only for creation/management)
    - Clients
    - Shipments
    - Alerts
- SQLite database with Alembic for migrations.
- Standardized JSON response format: `{ "data": ..., "error": ... }`.
- Automatic Swagger UI documentation at `/docs`.

## Project Structure

```
logipilot-api/
├── alembic/                  # Alembic migration scripts
├── app/                      # Main application module
│   ├── auth/                 # Authentication logic (JWT, security)
│   ├── core/                 # Core settings and configurations
│   ├── crud/                 # CRUD operations for database models
│   ├── database.py           # Database setup and session management
│   ├── initial_data.py       # Script to seed initial data (e.g., admin user)
│   ├── main.py               # FastAPI application entry point, middleware, routers
│   ├── models/               # SQLAlchemy database models
│   ├── routers/              # API endpoint routers
│   └── schemas/              # Pydantic schemas for request/response validation and serialization
├── alembic.ini               # Alembic configuration
├── .env.example              # Example environment variables
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## Setup and Running Locally

### Prerequisites

- Python 3.8+
- Pip (Python package installer)

### 1. Clone the Repository (if applicable)

```bash
# If this API is part of a larger project structure, navigate to the root.
# cd /path/to/your/project
```

### 2. Create a Virtual Environment

It's highly recommended to use a virtual environment.

```bash
# Navigate into the API directory if you haven't already
cd logipilot-api

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS and Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy the example `.env.example` file to a new file named `.env` in the `logipilot-api` directory:

```bash
cp .env.example .env
```

Review and update the variables in `.env` as needed. At a minimum, you might want to change `SECRET_KEY`. The `DATABASE_URL` defaults to a local SQLite file `logipilot.db`.

### 5. Apply Database Migrations

Alembic is used for database migrations. To create/update your database schema:

```bash
# Ensure you are in the logipilot-api directory
# (where alembic.ini is located)
alembic upgrade head
```
This will create the `logipilot.db` SQLite file if it doesn't exist and apply all migrations.

### 6. Seed Initial Data (Optional but Recommended)

To create an initial admin user (`admin@logipilot.com` / `admin123` by default, configurable in `.env`):

```bash
# Ensure you are in the logipilot-api directory
python -m app.initial_data
```

### 7. Run the FastAPI Application

```bash
# From the logipilot-api directory:
uvicorn app.main:app --reload
```
Or, if your project root is one level above `logipilot-api`:
```bash
# From the project root (e.g., /path/to/your/project):
# uvicorn logipilot-api.app.main:app --reload --app-dir logipilot-api
```

The application will typically be available at `http://127.0.0.1:8000`.

### 8. Access API Documentation

Once the server is running, you can access the interactive API documentation (Swagger UI) at:
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

You can also view ReDoc documentation at:
[http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Testing with Swagger UI

1.  Go to `/docs`.
2.  Use the `/api/v1/auth/login` endpoint to log in. The default admin credentials (if seeded) are:
    - Username: `admin@logipilot.com`
    - Password: `admin123`
3.  Copy the `access_token` from the response.
4.  Click the "Authorize" button at the top of the Swagger UI page and paste the token in the format `Bearer YOUR_TOKEN_HERE`.
5.  You should now be able to test the protected endpoints.

## Code Structure Notes

- **`app/main.py`**: Initializes the FastAPI app, includes routers, CORS, and exception handlers.
- **`app/database.py`**: Handles SQLAlchemy engine and session creation.
- **`app/core/config.py`**: Manages application settings using Pydantic's `BaseSettings` (loads from `.env`).
- **`app/models/`**: Contains SQLAlchemy ORM models.
- **`app/schemas/`**: Contains Pydantic models for data validation and serialization. Includes the `StandardResponse` wrapper.
- **`app/crud/`**: Contains functions for common database operations (Create, Read, Update, Delete) for each model.
- **`app/routers/`**: Defines API endpoints for different resources (auth, users, clients, etc.).
- **`app/auth/`**: JWT generation, password hashing, and dependency functions for authentication/authorization.
- **`alembic/`**: Stores database migration scripts.
- **`alembic.ini`**: Configuration for Alembic.
- **`app/initial_data.py`**: Script for seeding initial database records.

This README provides a good overview for developers to get started with the API.
