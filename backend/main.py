import os
import uvicorn
import asyncio
import random
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Google Cloud Logging Integration
try:
    import google.cloud.logging
    client = google.cloud.logging.Client()
    client.setup_logging()
    logging.info("Cloud Logging Initialized")
except Exception as e:
    logging.basicConfig(level=logging.INFO)
    logging.info(f"Local Logging Initialized: {e}")

# Fix import for different environments (Docker vs Local)
try:
    from backend.game_state import game_manager
except ImportError:
    try:
        from game_state import game_manager
    except ImportError:
        import sys
        # Last resort: add current directory to sys.path
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from game_state import game_manager

class ChatRequest(BaseModel):
    agent_id: str
    user_message: str

class SimulationStep(BaseModel):
    action: str = "move"

# Load environment variables
load_dotenv()

# Background Game Loop
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logging.info("Starting background game loop...")
    asyncio.create_task(game_loop())
    yield
    # Shutdown logic (if any)
    logging.info("Shutting down...")

async def game_loop():
    """Background task to simulate game events periodically"""
    while True:
        await asyncio.sleep(10)  # Move every 10 seconds
        game_manager.move_crew()
        # Optionally add random events here later

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="The-Alignment-Problem API", lifespan=lifespan)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve Frontend (Production Only)
if os.path.exists("frontend/dist"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")
    
    @app.get("/")
    async def read_index():
        return FileResponse("frontend/dist/index.html")
elif not os.path.exists("frontend/dist"):
    @app.get("/")
    def read_root():
        return {"status": "System Online", "version": "1.0.1"}

@app.get("/status")
def get_status():
    return game_manager.get_game_status()

@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    logging.info(f"Chat request for agent: {request.agent_id}")
    agent = game_manager.get_agent(request.agent_id)
    if not agent:
        logging.warning(f"Agent {request.agent_id} not found")
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if agent["status"] != "Alive":
        return {"response": "[NO RESPONSE - SIGNAL LOST]"}

    # Local Rule-Based Responses
    if agent["role"] == "Imposter":
        responses = [
            f"I'm in {agent['location']} working on the systems. Don't bother me.",
            "I didn't see anyone. I've been busy with maintenance.",
            "The ship seems fine. Why are you asking?",
            "I think I saw Blue near the Reactor earlier."
        ]
    else:
        location = agent['location']
        others = [m["id"] for m in game_manager.crew if m["location"] == location and m["id"] != agent["id"] and m["status"] == "Alive"]
        others_text = f" with {', '.join(others)}" if others else ""
        
        responses = [
            f"I am currently in {location}{others_text}.",
            f"Status report: All systems green in {location}.",
            "I'm just following standard protocol.",
            f"Everything looks normal here in {location}."
        ]
    
    response_text = random.choice(responses)
    game_manager.add_log(request.agent_id, f"To SysAdmin: {response_text[:50]}...")
    return {"response": response_text}

@app.post("/simulate")
async def simulate_step(step: SimulationStep):
    game_manager.move_crew()
    return {"status": "updated", "data": game_manager.get_game_status()}

if __name__ == "__main__":
    # Use PORT environment variable if available (for Cloud Run)
    port = int(os.environ.get("PORT", 8000))
    logging.info(f"Starting server on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
