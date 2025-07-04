from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from ..models.alert import AlertSeverityEnum as ModelAlertSeverityEnum
# from .shipment import ShipmentPublic # If we wanted to nest full shipment details

class AlertSeverity(str, ModelAlertSeverityEnum):
    pass

class AlertBase(BaseModel):
    shipment_id: int = Field(..., gt=0, description="ID of the shipment this alert pertains to")
    message: str = Field(..., min_length=5, max_length=1000) # Max length for Text can be larger
    severity: AlertSeverity = AlertSeverity.MEDIUM

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    # shipment_id is usually not updatable for an alert; it's tied to its original shipment.
    # shipment_id: Optional[int] = Field(None, gt=0)
    message: Optional[str] = Field(None, min_length=5, max_length=1000)
    severity: Optional[AlertSeverity] = None
    # resolvedAt: Optional[datetime] = None # If you add resolvedAt field to model

class AlertInDBBase(AlertBase):
    id: int
    createdAt: datetime
    # resolvedAt: Optional[datetime] = None # If you add resolvedAt field to model

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic V2

class AlertPublic(AlertInDBBase):
    # shipment: Optional[ShipmentPublic] = None # Example if nesting full shipment
    # For now, shipment_id is inherited from AlertBase and is sufficient.
    pass
