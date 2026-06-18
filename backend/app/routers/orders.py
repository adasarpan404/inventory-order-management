from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Customer, Order, OrderItem, OrderStatus, Product
from app.schemas import InventoryLogResponse, OrderCreate, OrderItemResponse, OrderResponse

router = APIRouter(prefix="/orders", tags=["orders"])

LOW_STOCK_THRESHOLD = 10


def _build_order_response(order: Order) -> OrderResponse:
    items = []
    for item in order.items:
        items.append(
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
                product_name=item.product.name if item.product else None,
                product_sku=item.product.sku if item.product else None,
            )
        )
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        status=order.status,
        total_amount=order.total_amount,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        customer_name=order.customer.name if order.customer else None,
        items=items,
    )


@router.get("", response_model=list[OrderResponse])
def list_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_build_order_response(order) for order in orders]


@router.get("/inventory/summary", response_model=list[InventoryLogResponse])
def inventory_summary(db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.name).all()
    summary = []
    for product in products:
        total_ordered = (
            db.query(func.coalesce(func.sum(OrderItem.quantity), 0))
            .filter(OrderItem.product_id == product.id)
            .scalar()
        )
        summary.append(
            InventoryLogResponse(
                product_id=product.id,
                product_name=product.name,
                product_sku=product.sku,
                current_stock=product.stock_quantity,
                total_ordered=int(total_ordered),
                low_stock=product.stock_quantity <= LOW_STOCK_THRESHOLD,
            )
        )
    return summary


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return _build_order_response(order)


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    product_ids = [item.product_id for item in order_in.items]
    if len(product_ids) != len(set(product_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate products in order items are not allowed",
        )

    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    product_map = {p.id: p for p in products}

    if len(product_map) != len(product_ids):
        missing = set(product_ids) - set(product_map.keys())
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Products not found: {sorted(missing)}",
        )

    for item in order_in.items:
        product = product_map[item.product_id]
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                    f"Available: {product.stock_quantity}, Requested: {item.quantity}"
                ),
            )

    order = Order(
        customer_id=order_in.customer_id,
        status=OrderStatus.CONFIRMED,
        notes=order_in.notes,
        total_amount=Decimal("0"),
    )
    db.add(order)
    db.flush()

    total_amount = Decimal("0")
    for item in order_in.items:
        product = product_map[item.product_id]
        unit_price = Decimal(str(product.price))
        subtotal = unit_price * item.quantity
        total_amount += subtotal

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=unit_price,
            subtotal=subtotal,
        )
        db.add(order_item)
        product.stock_quantity -= item.quantity

    order.total_amount = total_amount
    db.commit()
    db.refresh(order)

    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .filter(Order.id == order.id)
        .first()
    )
    return _build_order_response(order)