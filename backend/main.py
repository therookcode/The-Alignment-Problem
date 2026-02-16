import os
import uvicorn
import asyncio
import random
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# --- GOOGLE CLOUD ARCHITECTURE: OBSERVABILITY ---
try:
    from google.cloud import logging as cloud_logging
    log_client = cloud_logging.Client()
    log_client.setup_logging()
    # Direct logger for system events
    gcp_logger = log_client.logger("sys-admin-logs")
    gcp_logger.log_text("The-Alignment-Problem: Neural Link Initialized")
except Exception as e:
    logging.basicConfig(level=logging.INFO)
    logging.info(f"Local logging active: {e}")

# Load environment variables
load_dotenv()

# --- AI CONFIGURATION ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    logging.warning("GEMINI_API_KEY missing. Running in Rule-Based Fallback mode.")

# --- GAME ENGINE IMPORT ---
try:
    from backend.game_state import game_manager
except ImportError:
    try:
        from game_state import game_manager
    except ImportError:
        import sys
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from game_state import game_manager

# --- MODELS ---
class ChatRequest(BaseModel):
    agent_id: str
    user_message: str

# --- LIFECYCLE ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("SYSTEM_BOOT: Synchronizing crew positions...")
    asyncio.create_task(game_loop())
    yield
    logging.info("SYSTEM_HALT: Disconnecting neural link...")

async def game_loop():
    """Background simulation loop"""
    while True:
        await asyncio.sleep(10)
        game_manager.move_crew()

# --- API SETUP ---
app = FastAPI(title="The-Alignment-Problem AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINTS ---

@app.get("/status")
def get_status():
    return game_manager.get_game_status()

@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    agent = game_manager.get_agent(request.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if agent["status"] != "Alive":
        return {"response": "[CONNECTION LOST] Vital signs flatline."}

    # AI Logic with Fallback
    if GEMINI_API_KEY:
        try:
            context = game_manager.get_context_for_agent(request.agent_id)
            prompt = f"""
            You are Agent {agent['id']} on a spaceship. 
            Role: {agent['role']}. 
            Game State: {context}.
            User is SysAdmin. 
            Message: {request.user_message}
            Keep it short and immersive.
            """
            response = model.generate_content(prompt)
            response_text = response.text.strip()
        except Exception as e:
            logging.error(f"AI Error: {e}")
            response_text = "[NEURAL LINK LAG] ... " + random.choice(["Everything is fine.", "I'm busy.", "Who is this?"])
    else:
        # Rule-Based Fallback
        response_text = f"Agent {agent['id']} reporting from {agent['location']}. Systems functional."

    game_manager.add_log(request.agent_id, f"To SysAdmin: {response_text[:30]}...")
    return {"response": response_text}

# Production Static Files
if os.path.exists("frontend/dist"):
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")
    @app.get("/")
    async def serve_index():
        return FileResponse("frontend/dist/index.html")
else:
    @app.get("/")
    def health_check():
        return {"status": "ONLINE", "mode": "API_ONLY", "version": "2.0.0"}

# --- SENIOR ARCHITECT: PORT BINDING FIX ---
if __name__ == "__main__":
    # Cloud Run injects the PORT environment variable. 
    # Defaulting to 8080 as per Google Best Practices.
    target_port = int(os.environ.get("PORT", 8080))
    logging.info(f"NODE_START: Binding to 0.0.0.0:{target_port}")
    uvicorn.run("main:app", host="0.0.0.0", port=target_port)
