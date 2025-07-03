from sqlalchemy import Column, Integer, String, Enum as SAEnum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # For default datetime
import enum

from ..database import Base
# Import Client model for ForeignKey relationship if not already implicitly handled by SQLAlchemy's awareness
# from .client import Client # Not strictly needed for ForeignKey string reference but good for clarity

class ShipmentStatusEnum(str, enum.Enum):
    PENDING = "Pending"
    IN_TRANSIT = "In Transit"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"
    DELAYED = "Delayed"
    # Add other statuses as needed

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)

    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False) # ForeignKey to clients table, id column

    status = Column(SAEnum(ShipmentStatusEnum), nullable=False, default=ShipmentStatusEnum.PENDING)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)

    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # updatedAt = Column(DateTime(timezone=True), onupdate=func.now()) # Optional

    # Relationship to Client model
    client = relationship("Client", back_populates="shipments")

    # Relationship to Alert model
    # This allows accessing alerts related to this shipment instance (e.g., my_shipment.alerts)
    alerts = relationship("Alert", back_populates="shipment", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Shipment(id={self.id}, client_id={self.client_id}, status='{self.status.value}')>"
