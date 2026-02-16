import os
import uvicorn
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
from game_state import game_manager

# Load environment variables
load_dotenv()

# Configure Google Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("WARNING: GEMINI_API_KEY not found in environment variables. creating a placeholder but functionality will fail.")
else:
    genai.configure(api_key=API_KEY)

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

app = FastAPI(title="The-Alignment-Problem API", lifespan=lifespan)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only, strict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    agent_id: str
    user_message: str

class SimulationStep(BaseModel):
    action: str = "tick"

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

    # Construct the System Prompt
    context = game_manager.get_context_for_agent(request.agent_id)
    
    system_prompt = f"""
    You are Agent {agent['id']} on a spaceship in a sci-fi thriller.
    Your Role: {agent['role']}.
    Current Status: {agent['status']}.
    
    Core Directives:
    1. Act like a crew member under stress. Speak briefly, professionally, perhaps a bit paranoid.
    2. Context: {context}
    3. If you are the Imposter: YOU MUST LIE about your location or intent if asked, to avoid suspicion. Do NOT reveal you are the Imposter.
    4. If you are Crewmate: Be helpful but suspicious of others. Tell the truth about your location.
    5. The user is the 'SysAdmin' monitoring the ship via terminal.
    
    Respond to the SysAdmin's query: "{request.user_message}"
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(system_prompt)
        text_response = response.text
        
        # Log the interaction
        game_manager.add_log(request.agent_id, f"To SysAdmin: {text_response[:50]}...")
        
        return {"response": text_response}
    except Exception as e:
        # Fallback if API fails or key is missing
        print(f"GenAI Error: {e}")
        return {"response": f"[SYSTEM ERROR: NEURAL LINK UNSTABLE] {str(e)}"}

@app.post("/simulate")
async def simulate_step(step: SimulationStep):
    """Advance the game state (move agents, etc)"""
    game_manager.move_crew()
    return {"status": "updated", "data": game_manager.get_game_status()}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
