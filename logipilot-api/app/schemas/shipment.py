from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from ..models.shipment import ShipmentStatusEnum as ModelShipmentStatusEnum
from .client import ClientPublic # To nest client details in shipment response

class ShipmentStatus(str, ModelShipmentStatusEnum): # Inherit from str and the model's enum
    pass

class ShipmentBase(BaseModel):
    client_id: int = Field(..., gt=0, description="ID of the client for this shipment")
    status: ShipmentStatus = ShipmentStatus.PENDING
    origin: str = Field(..., min_length=2, max_length=200)
    destination: str = Field(..., min_length=2, max_length=200)

class ShipmentCreate(ShipmentBase):
    pass

class ShipmentUpdate(BaseModel):
    client_id: Optional[int] = Field(None, gt=0, description="ID of the client for this shipment")
    status: Optional[ShipmentStatus] = None
    origin: Optional[str] = Field(None, min_length=2, max_length=200)
    destination: Optional[str] = Field(None, min_length=2, max_length=200)

class ShipmentInDBBase(ShipmentBase):
    id: int
    createdAt: datetime

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic V2

class ShipmentPublic(ShipmentInDBBase):
    client: Optional[ClientPublic] = None # Include full client details
    # If client is None (e.g. if client was deleted but shipment remains, or selective loading)
    # it's good practice to ensure the client_id is still directly available if needed.
    # However, client_id is already in ShipmentBase, so it's inherited.

# You might also want a schema that only has client_id for responses if nesting is too verbose sometimes
class ShipmentPublicWithClientId(ShipmentInDBBase):
    pass # This would just return client_id
