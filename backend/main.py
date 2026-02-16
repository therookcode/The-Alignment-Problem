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

# Senior Architect Design: Google Cloud Native Observability
try:
    from google.cloud import logging as cloud_logging
    log_client = cloud_logging.Client()
    # Use standard logging for app logs
    log_client.setup_logging()
    # Get a direct logger for specialized Cloud Run logs
    gcp_logger = log_client.logger("main-logger")
    gcp_logger.log_text("The-Alignment-Problem System Online")
except Exception as e:
    logging.basicConfig(level=logging.INFO)
    logging.info(f"Local Environment Initialized: {e}")

# Fix import for different environments (Docker vs Local)
try:
    from backend.game_state import game_manager
except ImportError:
    try:
        from game_state import game_manager
    except ImportError:
        import sys
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from game_state import game_manager

class ChatRequest(BaseModel):
    agent_id: str
    user_message: str

class SimulationStep(BaseModel):
    action: str = "move"

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("CONTAINER_START: Initializing game logic...")
    asyncio.create_task(game_loop())
    yield
    logging.info("CONTAINER_SHUTDOWN: Cleaning up...")

async def game_loop():
    while True:
        await asyncio.sleep(10)
        game_manager.move_crew()

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="The-Alignment-Problem API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve Frontend
if os.path.exists("frontend/dist"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")
    @app.get("/")
    async def read_index():
        return FileResponse("frontend/dist/index.html")
else:
    @app.get("/")
    def read_root():
        return {"status": "System Online", "version": "1.0.2"}

@app.get("/status")
def get_status():
    return game_manager.get_game_status()

@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    agent = game_manager.get_agent(request.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if agent["status"] != "Alive":
        return {"response": "[NO RESPONSE - SIGNAL LOST]"}

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

# Senior Architect Fix: PORT and HOST binding for Cloud Run
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    # host MUST be 0.0.0.0 for Docker/Cloud Run
    uvicorn.run("main:app", host="0.0.0.0", port=port)
