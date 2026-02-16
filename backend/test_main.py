import pytest
from httpx import AsyncClient
from backend.main import app
import os

@pytest.mark.asyncio
async def test_read_status():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/status")
    assert response.status_code == 200
    assert "crew" in response.json()
    assert "logs" in response.json()

@pytest.mark.asyncio
async def test_chat_invalid_agent():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/chat", json={"agent_id": "NonExistent", "user_message": "Hello"})
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_chat_valid_agent():
    # Get a valid agent ID from status
    async with AsyncClient(app=app, base_url="http://test") as ac:
        status_res = await ac.get("/status")
        agent_id = status_res.json()["crew"][0]["id"]
        
        response = await ac.post("/chat", json={"agent_id": agent_id, "user_message": "Report status"})
    assert response.status_code == 200
    assert "response" in response.json()

@pytest.mark.asyncio
async def test_simulate_step():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/simulate", json={"action": "move"})
    assert response.status_code == 200
    assert response.json()["status"] == "updated"
