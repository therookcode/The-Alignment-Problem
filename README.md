# 🚀 The Alignment Problem
> *A Sci-Fi Social Deduction Thriller.*

![Status](https://img.shields.io/badge/Status-Prototype-green)
![Stack](https://img.shields.io/badge/Stack-React_|_FastAPI-orange)

## 📖 Overview
**The Alignment Problem** is an immersive, terminal-based social deduction game where you play as the ship's **SysAdmin**. A member of the crew has become sabotaged (the Imposter) and is blending in with the rest. 

Your goal: **Identify the Imposter through conversation and observation before the ship is destroyed.**

The game features:
- **Rule-Based Agents**: Each crew member has their own personality, role, and hidden objectives.
- **Dynamic Conversations**: Interaction via terminal messaging.
- **Real-time Simulation**: The crew moves between sectors, performing tasks (or sabotaging them).

## ✨ Features
### Current Implementation
- **Retro Terminal Interface**: A fully immersive CLI-style chat with typing effects,CRT scanlines, and glitch aesthetics.
- **Live Ship Map**: Real-time tracking of crew positions on a deck blueprint.
- **Crew Manifest**: Monitor vital signs and status of all agents.
- **AI Interrogation**: Chat with specific agents (e.g., `@Red Where were you?`) to deduce their alignment.
- **Boot Sequence**: Atmospheric startup animation.

### 🗺️ Roadmap & Future Features (Hackathon Ideas)
- [ ] **Voice Command Interface**: Use Web Speech API to allow players to *talk* to the terminal.
- [ ] **Visual Evidence**: Generate AI images of specific rooms ("Check Security Cam 4") to catch the imposter in the act.
- [ ] **System Sabotage Events**: Random critical failures (O2 depletion, Reactor breach) creating time pressure.
- [ ] **Multi-Agent Debates**: Allow agents to converse with *each other* in the main channel, accusing one another.
- [ ] **Procedural Narrative**: The AI Game Master dynamically generates plot twists based on player choices.
- [ ] **Soundscape**: Ambient engine hums, alarms, and mechanical keyboard sounds for immersion.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, TailwindCSS (with `Share Tech Mono` & `Orbitron` fonts).
- **Backend**: Python FastAPI.
- **State Management**: In-memory Python `GameState` simulation loop.

## ⚡ Setup & Installation

- Python 3.9+
- Node.js & npm

#### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Server runs at `http://localhost:8000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*UI runs at `http://localhost:5173`*

## 🎮 How to Play
1. **Boot Up**: Watch the system initialize.
2. **Monitor**: Watch the **Ship Map** for suspicious movement (e.g., two people in Electrical, one leaves).
3. **Interrogate**: Use the terminal to ask questions.
   - Syntax: `@<AgentColor> <Question>`
   - Example: `@Blue Did you see Red in the MedBay?`
4. **Deduce**: Cross-reference agent claims with their actual location history.
5. **Survive**: Don't let the Imposter fool you.

## 🤝 Contribution
Command Override: `AUTH_LEVEL_ADMIN` required. 
Submit PRs to the `main` branch.

---
*System Status: ONLINE // Neural Link: STABLE*
