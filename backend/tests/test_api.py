from fastapi.testclient import TestClient
import sys
import os

# Add the project root to path for testing
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app

client = TestClient(app)

def test_health_check():
    """Verify system is online"""
    response = client.get("/")
    assert response.status_code == 200

def test_game_state():
    """Verify game status data structure"""
    response = client.get("/status")
    assert response.status_code == 200
    data = response.json()
    assert "crew" in data
    assert "logs" in data
    assert len(data["crew"]) == 5

def test_chat_endpoint_validation():
    """Verify chat requires correct payload"""
    response = client.post("/chat", json={"message": "hello"}) # Missing agent_id
    assert response.status_code == 422 # Validation Error
