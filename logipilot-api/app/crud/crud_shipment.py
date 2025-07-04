from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from ..models.shipment import Shipment as ShipmentModel, ShipmentStatusEnum
from ..models.client import Client as ClientModel # To validate client_id
from ..schemas.shipment import ShipmentCreate, ShipmentUpdate, ShipmentStatus as PydanticShipmentStatus

def get_shipment(db: Session, shipment_id: int) -> Optional[ShipmentModel]:
    # Use joinedload to eager load the client information
    return db.query(ShipmentModel).options(joinedload(ShipmentModel.client)).filter(ShipmentModel.id == shipment_id).first()

def get_shipments(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[int] = None,
    status: Optional[PydanticShipmentStatus] = None
) -> List[ShipmentModel]:
    query = db.query(ShipmentModel).options(joinedload(ShipmentModel.client)) # Eager load client

    if client_id is not None:
        query = query.filter(ShipmentModel.client_id == client_id)
    if status:
        query = query.filter(ShipmentModel.status == ShipmentStatusEnum(status.value))

    return query.order_by(ShipmentModel.createdAt.desc()).offset(skip).limit(limit).all()

def create_shipment(db: Session, shipment: ShipmentCreate) -> Optional[ShipmentModel]:
    # Validate if client_id exists
    client = db.query(ClientModel).filter(ClientModel.id == shipment.client_id).first()
    if not client:
        return None # Or raise an exception: raise ValueError(f"Client with id {shipment.client_id} not found")

    db_shipment = ShipmentModel(
        client_id=shipment.client_id,
        status=ShipmentStatusEnum(shipment.status.value),
        origin=shipment.origin,
        destination=shipment.destination
        # createdAt will be handled by server_default
    )
    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)
    # Eager load client for the returned object
    db.query(ShipmentModel).options(joinedload(ShipmentModel.client)).filter(ShipmentModel.id == db_shipment.id).first()
    return db_shipment

def update_shipment(db: Session, db_shipment: ShipmentModel, shipment_in: ShipmentUpdate) -> Optional[ShipmentModel]:
    shipment_data = shipment_in.dict(exclude_unset=True)

    if "client_id" in shipment_data and shipment_data["client_id"] is not None:
        # Validate if new client_id exists
        client = db.query(ClientModel).filter(ClientModel.id == shipment_data["client_id"]).first()
        if not client:
            return None # Or raise ValueError

    for field, value in shipment_data.items():
        if value is not None:
            if field == "status":
                setattr(db_shipment, field, ShipmentStatusEnum(value))
            else:
                setattr(db_shipment, field, value)

    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)
    # Eager load client for the returned object
    db.query(ShipmentModel).options(joinedload(ShipmentModel.client)).filter(ShipmentModel.id == db_shipment.id).first()
    return db_shipment

def delete_shipment(db: Session, shipment_id: int) -> Optional[ShipmentModel]:
    db_shipment = db.query(ShipmentModel).filter(ShipmentModel.id == shipment_id).first()
    if db_shipment:
        db.delete(db_shipment)
        db.commit()
    return db_shipment
