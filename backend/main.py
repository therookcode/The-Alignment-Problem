import os
import uvicorn
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

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
    asyncio.create_task(game_loop())
    yield
    # Shutdown logic (if any)

async def game_loop():
    """Background task to simulate game events periodically"""
    while True:
        await asyncio.sleep(10)  # Move every 10 seconds
        game_manager.move_crew()
        # Optionally add random events here later

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# ... imports ...

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
# We expect the 'dist' folder to be inside or adjacent to backend in the container
if os.path.exists("frontend/dist"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")
    
    @app.get("/")
    async def read_index():
        return FileResponse("frontend/dist/index.html")

# Keep the original root API if frontend not present (Dev mode)
elif not os.path.exists("frontend/dist"):
    @app.get("/")
    def read_root():
        return {"status": "System Online", "version": "1.0.0"}

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

    # Local Rule-Based Responses
    if agent["role"] == "Imposter":
        # Randomly lie or be vague
        responses = [
            f"I'm in {agent['location']} working on the systems. Don't bother me.",
            "I didn't see anyone. I've been busy with maintenance.",
            "The ship seems fine. Why are you asking?",
            "I think I saw Blue near the Reactor earlier."
        ]
    else:
        # Be helpful and tell the truth
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
    
    # Log the interaction
    game_manager.add_log(request.agent_id, f"To SysAdmin: {response_text[:50]}...")
    
    return {"response": response_text}

@app.post("/simulate")
async def simulate_step(step: SimulationStep):
    """Advance the game state (move agents, etc)"""
    game_manager.move_crew()
    return {"status": "updated", "data": game_manager.get_game_status()}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
