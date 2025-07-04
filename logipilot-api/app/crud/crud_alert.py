from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from ..models.alert import Alert as AlertModel, AlertSeverityEnum
from ..models.shipment import Shipment as ShipmentModel # To validate shipment_id
from ..schemas.alert import AlertCreate, AlertUpdate, AlertSeverity as PydanticAlertSeverity

def get_alert(db: Session, alert_id: int) -> Optional[AlertModel]:
    # Optionally join shipment details if needed, but AlertPublic doesn't nest them by default.
    # return db.query(AlertModel).options(joinedload(AlertModel.shipment)).filter(AlertModel.id == alert_id).first()
    return db.query(AlertModel).filter(AlertModel.id == alert_id).first()

def get_alerts(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    shipment_id: Optional[int] = None,
    severity: Optional[PydanticAlertSeverity] = None
) -> List[AlertModel]:
    query = db.query(AlertModel)

    if shipment_id is not None:
        query = query.filter(AlertModel.shipment_id == shipment_id)
    if severity:
        query = query.filter(AlertModel.severity == AlertSeverityEnum(severity.value))

    return query.order_by(AlertModel.createdAt.desc()).offset(skip).limit(limit).all()

def create_alert(db: Session, alert: AlertCreate) -> Optional[AlertModel]:
    # Validate if shipment_id exists
    shipment = db.query(ShipmentModel).filter(ShipmentModel.id == alert.shipment_id).first()
    if not shipment:
        return None # Or raise ValueError(f"Shipment with id {alert.shipment_id} not found")

    db_alert = AlertModel(
        shipment_id=alert.shipment_id,
        message=alert.message,
        severity=AlertSeverityEnum(alert.severity.value)
        # createdAt will be handled by server_default
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def update_alert(db: Session, db_alert: AlertModel, alert_in: AlertUpdate) -> AlertModel:
    alert_data = alert_in.dict(exclude_unset=True)

    # shipment_id is generally not changed for an existing alert.
    # If it were, validation for the new shipment_id would be needed here.

    for field, value in alert_data.items():
        if value is not None:
            if field == "severity":
                setattr(db_alert, field, AlertSeverityEnum(value))
            else:
                setattr(db_alert, field, value)

    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def delete_alert(db: Session, alert_id: int) -> Optional[AlertModel]:
    db_alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
    if db_alert:
        db.delete(db_alert)
        db.commit()
    return db_alert
