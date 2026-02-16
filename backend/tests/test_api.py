import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    """Verify that the root endpoint is accessible"""
    response = client.get("/")
    assert response.status_code == 200

def test_game_status():
    """Verify that the status endpoint returns valid crew and logs JSON"""
    response = client.get("/status")
    assert response.status_code == 200
    data = response.json()
    assert "crew" in data
    assert "logs" in data
    assert isinstance(data["crew"], list)
    assert len(data["crew"]) == 5
