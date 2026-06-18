"""API integration tests — run against a live server."""

import os
import uuid

import httpx
import pytest

BASE_URL = os.getenv("TEST_API_URL", "http://localhost:8000/api")


@pytest.fixture
def client():
    return httpx.Client(base_url=BASE_URL, timeout=30.0)


@pytest.fixture
def unique_suffix():
    return uuid.uuid4().hex[:8]


def test_health(client):
    response = httpx.get(BASE_URL.replace("/api", "") + "/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_product_unique_sku(client, unique_suffix):
    sku = f"SKU-{unique_suffix}"
    payload = {"name": "Test Product", "sku": sku, "price": 19.99, "stock_quantity": 100}
    r1 = client.post("/products", json=payload)
    assert r1.status_code == 201

    r2 = client.post("/products", json=payload)
    assert r2.status_code == 409


def test_customer_unique_email(client, unique_suffix):
    email = f"test-{unique_suffix}@example.com"
    payload = {"name": "Test Customer", "email": email}
    r1 = client.post("/customers", json=payload)
    assert r1.status_code == 201

    r2 = client.post("/customers", json=payload)
    assert r2.status_code == 409


def test_order_stock_validation_and_reduction(client, unique_suffix):
    sku = f"ORD-{unique_suffix}"
    product = client.post(
        "/products",
        json={"name": "Order Test", "sku": sku, "price": 10.0, "stock_quantity": 5},
    ).json()
    customer = client.post(
        "/customers",
        json={"name": "Buyer", "email": f"buyer-{unique_suffix}@example.com"},
    ).json()

    # Insufficient stock should fail
    bad_order = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 10}]},
    )
    assert bad_order.status_code == 400

    # Valid order should succeed and reduce stock
    good_order = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 3}]},
    )
    assert good_order.status_code == 201
    assert float(good_order.json()["total_amount"]) == 30.0

    updated = client.get(f"/products/{product['id']}").json()
    assert updated["stock_quantity"] == 2