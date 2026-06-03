from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import settings
from ..database import get_db

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=schemas.DashboardSummary)
def get_dashboard(db: Session = Depends(get_db)):
    threshold = settings.low_stock_threshold
    low_stock = (
        db.query(models.Product)
        .filter(models.Product.quantity <= threshold)
        .order_by(models.Product.quantity.asc())
        .all()
    )
    return schemas.DashboardSummary(
        total_products=db.query(models.Product).count(),
        total_customers=db.query(models.Customer).count(),
        total_orders=db.query(models.Order).count(),
        low_stock_count=len(low_stock),
        low_stock_threshold=threshold,
        low_stock_products=low_stock,
    )
