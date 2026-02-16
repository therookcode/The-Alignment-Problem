# 🚀 The Alignment Problem
> *A Sci-Fi Social Deduction Thriller.*

![Status](https://img.shields.io/badge/Status-Optimized-green)
![Stack](https://img.shields.io/badge/Stack-React_|_FastAPI-orange)
![GCP](https://img.shields.io/badge/Cloud-Google_Cloud_Run-blue)

## 📖 Overview
**The Alignment Problem** is an immersive, terminal-based social deduction game where you play as the ship's **SysAdmin**. A member of the crew has been compromised (the Imposter) and is blending in with the rest. 

Your goal: **Identify the Imposter through interrogation and observation before the ship is lost.**

The game features:
- **Rule-Based Agents**: Each crew member has their own personality, role, and hidden objectives.
- **Dynamic Interrogation**: Query agents via the terminal; Crewmates tell the truth, but the Imposter lies to stay hidden.
- **Real-time Simulation**: The crew moves between sectors on a live **Ship Map**.
- **A11y/Accessibility**: Built with ARIA landmarks and inclusive design for screen readers.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Lucide-React.
- **Backend**: Python FastAPI, Pydantic.
- **DevOps**: Google Cloud Logging, Containerized with Docker.
- **Testing**: Pytest with HTTPX for API verification.

---

## ⚡ Setup & Installation

### 🏠 Local Development
Follow these steps to run the app on your local machine.

#### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Backend initializes at `http://localhost:8000`*

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*UI runs at `http://localhost:5173`*

---

### ☁️ Cloud Deployment (Google Cloud Run)
The application is optimized for **Google Cloud Run** with built-in port binding and Cloud Logging.

#### 1. Push to GitHub
Ensure your local changes are pushed to your repository:
```bash
git add .
git commit -m "Deployment Update"
git push origin main
```

#### 2. Deploy via Google Cloud Shell
Run this command in your Cloud Shell to pull and deploy:
```bash
git fetch origin && git reset --hard origin/main
gcloud run deploy the-alignment-problem --source . --region europe-west1 --allow-unauthenticated
```
*Note: The app dynamically binds to the `$PORT` variable provided by Cloud Run.*

---

## 🎮 How to Play
1. **Boot Up**: Watch the system initialize the neural link.
2. **Monitor**: Watch the **Ship Map** for suspicious movement patterns.
3. **Interrogate**: Use the terminal to query specific agents.
   - **Syntax**: `@<AgentColor> <Question>`
   - **Example**: `@Blue What is your status?` or `@Red Where were you?`
4. **Deduce**: Cross-reference agent responses with their real-time location. If an agent claims to be in "MedBay" but the map shows "Reactor", they are the anomaly.
5. **Neutralize**: Use the **Agent Manifest** to eject the suspect.

---

## 🏆 Hackathon Extra Mile
- **Cloud Logging**: All system events and chat requests are transmitted to Google Cloud Logging for professional observability.
- **Accessibility**: ARIA labels and `aria-live` regions ensure the terminal is usable by everyone.
- **Automated Tests**: Run `pytest backend/test_main.py` to verify the game engine logic.

---
*System Status: ONLINE // Cloud Link: SECURE*
