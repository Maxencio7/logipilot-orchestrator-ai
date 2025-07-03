from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud, schemas, models
from ..database import get_db
from ..auth.jwt import get_current_active_user, require_admin, require_admin_or_manager
from ..models.user import User as DBUser
from ..schemas.client import ClientCreate, ClientPublic, ClientUpdate, ClientStatus
from ..schemas.response import StandardResponse # Import standard response

router = APIRouter(
    prefix="/clients",
    tags=["Clients"],
)

@router.post("/", response_model=StandardResponse[schemas.client.ClientPublic], status_code=status.HTTP_201_CREATED)
async def create_new_client(
    client_in: schemas.client.ClientCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(require_admin_or_manager)
):
    existing_client = crud.crud_client.get_client_by_email(db, email=client_in.email)
    if existing_client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Client with email '{client_in.email}' already exists.",
        )
    new_client = crud.crud_client.create_client(db=db, client=client_in)
    return StandardResponse(data=new_client)

@router.get("/", response_model=StandardResponse[List[schemas.client.ClientPublic]])
async def read_clients_list(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[ClientStatus] = Query(None, description="Filter clients by status"),
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_user)
):
    clients = crud.crud_client.get_clients(db, skip=skip, limit=limit, status=status)
    return StandardResponse(data=clients)

@router.get("/{client_id}", response_model=StandardResponse[schemas.client.ClientPublic])
async def read_client_by_id(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_user)
):
    db_client = crud.crud_client.get_client(db, client_id=client_id)
    if not db_client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return StandardResponse(data=db_client)

@router.put("/{client_id}", response_model=StandardResponse[schemas.client.ClientPublic])
async def update_existing_client(
    client_id: int,
    client_in: schemas.client.ClientUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(require_admin_or_manager)
):
    db_client = crud.crud_client.get_client(db, client_id=client_id)
    if not db_client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    if client_in.email and client_in.email != db_client.email:
        existing_client_email = crud.crud_client.get_client_by_email(db, email=client_in.email)
        if existing_client_email and existing_client_email.id != client_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered by another client.")

    updated_client = crud.crud_client.update_client(db=db, db_client=db_client, client_in=client_in)
    return StandardResponse(data=updated_client)

@router.delete("/{client_id}", response_model=StandardResponse[schemas.client.ClientPublic])
async def delete_existing_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(require_admin)
):
    deleted_client = crud.crud_client.delete_client(db, client_id=client_id)
    if not deleted_client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return StandardResponse(data=deleted_client)
