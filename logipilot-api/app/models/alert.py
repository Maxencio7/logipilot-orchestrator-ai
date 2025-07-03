from sqlalchemy import Column, Integer, String, Enum as SAEnum, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # For default datetime
import enum

from ..database import Base
# from .shipment import Shipment # For clarity if needed

class AlertSeverityEnum(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False)

    message = Column(Text, nullable=False) # Using Text for potentially longer messages
    severity = Column(SAEnum(AlertSeverityEnum), nullable=False, default=AlertSeverityEnum.MEDIUM)

    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # resolvedAt = Column(DateTime(timezone=True), nullable=True) # Optional: if alerts can be resolved

    # Relationship to Shipment model
    shipment = relationship("Shipment", back_populates="alerts")

    def __repr__(self):
        return f"<Alert(id={self.id}, shipment_id={self.shipment_id}, severity='{self.severity.value}')>"
