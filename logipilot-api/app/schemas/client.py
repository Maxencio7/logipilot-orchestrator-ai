from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Re-define or import Enum for Pydantic model
from ..models.client import ClientStatusEnum as ModelClientStatusEnum

class ClientStatus(str, ModelClientStatusEnum): # Inherit from str and the model's enum
    pass # Pydantic will use the values from ModelClientStatusEnum

class ClientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    status: ClientStatus = ClientStatus.PROSPECT

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    status: Optional[ClientStatus] = None

class ClientInDBBase(ClientBase):
    id: int
    createdAt: datetime # This will be populated from the DB

    class Config:
        orm_mode = True # Pydantic V1
        # from_attributes = True # Pydantic V2

class ClientPublic(ClientInDBBase):
    pass # All fields are public for now
