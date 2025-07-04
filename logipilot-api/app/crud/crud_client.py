from sqlalchemy.orm import Session
from typing import Optional, List

from ..models.client import Client as ClientModel, ClientStatusEnum
from ..schemas.client import ClientCreate, ClientUpdate, ClientStatus as PydanticClientStatus

def get_client(db: Session, client_id: int) -> Optional[ClientModel]:
    return db.query(ClientModel).filter(ClientModel.id == client_id).first()

def get_client_by_email(db: Session, email: str) -> Optional[ClientModel]:
    return db.query(ClientModel).filter(ClientModel.email == email).first()

def get_clients(db: Session, skip: int = 0, limit: int = 100, status: Optional[PydanticClientStatus] = None) -> List[ClientModel]:
    query = db.query(ClientModel)
    if status:
        query = query.filter(ClientModel.status == ClientStatusEnum(status.value)) # Convert Pydantic enum to SQLAlchemy enum
    return query.order_by(ClientModel.name).offset(skip).limit(limit).all()

def create_client(db: Session, client: ClientCreate) -> ClientModel:
    db_client = ClientModel(
        name=client.name,
        email=client.email,
        phone=client.phone,
        status=ClientStatusEnum(client.status.value) # Convert Pydantic enum to SQLAlchemy enum
        # createdAt will be handled by server_default
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, db_client: ClientModel, client_in: ClientUpdate) -> ClientModel:
    client_data = client_in.dict(exclude_unset=True) # Pydantic V1
    # client_data = client_in.model_dump(exclude_unset=True) # Pydantic V2

    for field, value in client_data.items():
        if value is not None:
            if field == "status":
                setattr(db_client, field, ClientStatusEnum(value)) # Convert Pydantic string/enum to SQLAlchemy enum
            else:
                setattr(db_client, field, value)

    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: int) -> Optional[ClientModel]:
    db_client = db.query(ClientModel).filter(ClientModel.id == client_id).first()
    if db_client:
        # Consider related data (e.g., shipments). Soft delete might be better.
        # For now, hard delete.
        db.delete(db_client)
        db.commit()
    return db_client
