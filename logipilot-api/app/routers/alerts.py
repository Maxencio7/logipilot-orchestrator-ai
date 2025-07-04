from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud, schemas, models
from ..database import get_db
from ..auth.jwt import get_current_active_user, require_admin, require_admin_or_manager
from ..models.user import User as DBUser
from ..schemas.alert import AlertCreate, AlertPublic, AlertUpdate, AlertSeverity
from ..schemas.response import StandardResponse # Import standard response

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
)

@router.post("/", response_model=StandardResponse[schemas.alert.AlertPublic], status_code=status.HTTP_201_CREATED)
async def create_new_alert(
    alert_in: schemas.alert.AlertCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(require_admin_or_manager)
):
    new_alert = crud.crud_alert.create_alert(db=db, alert=alert_in)
    if not new_alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shipment with id {alert_in.shipment_id} not found. Cannot create alert.",
        )
    return StandardResponse(data=new_alert)

@router.get("/", response_model=StandardResponse[List[schemas.alert.AlertPublic]])
async def read_alerts_list(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    shipment_id: Optional[int] = Query(None, description="Filter alerts by shipment ID"),
    severity: Optional[AlertSeverity] = Query(None, description="Filter alerts by severity"),
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_user)
):
    alerts = crud.crud_alert.get_alerts(db, skip=skip, limit=limit, shipment_id=shipment_id, severity=severity)
    return StandardResponse(data=alerts)

@router.get("/{alert_id}", response_model=StandardResponse[schemas.alert.AlertPublic])
async def read_alert_by_id(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_user)
):
    db_alert = crud.crud_alert.get_alert(db, alert_id=alert_id)
    if not db_alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return StandardResponse(data=db_alert)

@router.put("/{alert_id}", response_model=StandardResponse[schemas.alert.AlertPublic])
async def update_existing_alert(
    alert_id: int,
    alert_in: schemas.alert.AlertUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(require_admin_or_manager)
):
    db_alert = crud.crud_alert.get_alert(db, alert_id=alert_id)
    if not db_alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    updated_alert = crud.crud_alert.update_alert(db=db, db_alert=db_alert, alert_in=alert_in)
    return StandardResponse(data=updated_alert)

@router.delete("/{alert_id}", response_model=StandardResponse[schemas.alert.AlertPublic])
async def delete_existing_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(require_admin)
):
    deleted_alert = crud.crud_alert.delete_alert(db, alert_id=alert_id)
    if not deleted_alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return StandardResponse(data=deleted_alert)
