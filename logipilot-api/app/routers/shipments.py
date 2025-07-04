from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud, schemas, models
from ..database import get_db
from ..auth.jwt import get_current_active_user, require_admin, require_admin_or_manager
from ..models.user import User as DBUser
from ..schemas.shipment import ShipmentCreate, ShipmentPublic, ShipmentUpdate, ShipmentStatus
from ..schemas.client import ClientPublic
from ..schemas.response import StandardResponse # Import standard response

router = APIRouter(
    prefix="/shipments",
    tags=["Shipments"],
)

@router.post("/", response_model=StandardResponse[schemas.shipment.ShipmentPublic], status_code=status.HTTP_201_CREATED)
async def create_new_shipment(
    shipment_in: schemas.shipment.ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(require_admin_or_manager)
):
    new_shipment = crud.crud_shipment.create_shipment(db=db, shipment=shipment_in)
    if not new_shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {shipment_in.client_id} not found. Cannot create shipment.",
        )
    return StandardResponse(data=new_shipment)

@router.get("/", response_model=StandardResponse[List[schemas.shipment.ShipmentPublic]])
async def read_shipments_list(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    client_id: Optional[int] = Query(None, description="Filter shipments by client ID"),
    status: Optional[ShipmentStatus] = Query(None, description="Filter shipments by status"),
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_user)
):
    shipments = crud.crud_shipment.get_shipments(db, skip=skip, limit=limit, client_id=client_id, status=status)
    return StandardResponse(data=shipments)

@router.get("/{shipment_id}", response_model=StandardResponse[schemas.shipment.ShipmentPublic])
async def read_shipment_by_id(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_user)
):
    db_shipment = crud.crud_shipment.get_shipment(db, shipment_id=shipment_id)
    if not db_shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    return StandardResponse(data=db_shipment)

@router.put("/{shipment_id}", response_model=StandardResponse[schemas.shipment.ShipmentPublic])
async def update_existing_shipment(
    shipment_id: int,
    shipment_in: schemas.shipment.ShipmentUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(require_admin_or_manager)
):
    db_shipment = crud.crud_shipment.get_shipment(db, shipment_id=shipment_id)
    if not db_shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")

    updated_shipment = crud.crud_shipment.update_shipment(db=db, db_shipment=db_shipment, shipment_in=shipment_in)
    if not updated_shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, # Or 400 Bad Request if client_id was the issue
            detail=f"Failed to update shipment, possibly due to invalid client_id: {shipment_in.client_id}",
        )
    return StandardResponse(data=updated_shipment)

@router.delete("/{shipment_id}", response_model=StandardResponse[schemas.shipment.ShipmentPublic])
async def delete_existing_shipment(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(require_admin)
):
    deleted_shipment = crud.crud_shipment.delete_shipment(db, shipment_id=shipment_id)
    if not deleted_shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    return StandardResponse(data=deleted_shipment)
