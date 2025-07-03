from sqlalchemy import Column, Integer, String, Enum as SAEnum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # For default datetime
import enum

from ..database import Base

class ClientStatusEnum(str, enum.Enum):
    ACTIVE = "Active"
    PROSPECT = "Prospect"
    INACTIVE = "Inactive"
    ON_HOLD = "On Hold"
    # Add other statuses as needed

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    status = Column(SAEnum(ClientStatusEnum), nullable=False, default=ClientStatusEnum.PROSPECT)

    # auto_now_add equivalent for SQLAlchemy
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # auto_now equivalent for SQLAlchemy (if you need an updated_at field)
    # updatedAt = Column(DateTime(timezone=True), onupdate=func.now())


    # Relationships
    shipments = relationship("Shipment", back_populates="client", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Client(id={self.id}, name='{self.name}', email='{self.email}')>"
