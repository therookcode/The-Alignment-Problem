import random
from typing import List, Dict, Optional
from datetime import datetime

class GameState:
    def __init__(self):
        self.locations = ["Bridge", "Reactor", "MedBay", "Admin", "O2", "Storage", "Electrical"]
        self.crew = self._initialize_crew()
        self.game_log: List[Dict] = []
        self.add_log("SYSTEM", "Ship system reboot complete. Crew status: ONLINE.")

    def _initialize_crew(self) -> List[Dict]:
        """Initialize the crew with one Imposter and random locations."""
        roles = ["Crewmate"] * 4 + ["Imposter"]
        random.shuffle(roles)
        colors = ["Red", "Blue", "Green", "Yellow", "Purple"]
        
        crew = []
        for i, color in enumerate(colors):
            crew.append({
                "id": color,
                "role": roles[i],
                "status": "Alive",
                "location": random.choice(self.locations),
                "is_player": False # The player is acting as SysAdmin, not one of these agents
            })
        return crew

    def get_agent(self, agent_id: str) -> Optional[Dict]:
        for member in self.crew:
            if member["id"] == agent_id:
                return member
        return None

    def get_game_status(self) -> Dict:
        return {
            "crew": self.crew,
            "logs": self.game_log[-50:], # Return last 50 logs
            "active_alert": "None"
        }

    def add_log(self, source: str, message: str):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.game_log.append({
            "timestamp": timestamp,
            "source": source,
            "message": message
        })

    def move_crew(self):
        """Simulate random movement for alive crew members."""
        for member in self.crew:
            if member["status"] == "Alive" and random.random() > 0.7:
                old_loc = member["location"]
                new_loc = random.choice(self.locations)
                member["location"] = new_loc
                # We don't always log movement to keep suspense, but maybe for debugging/admin view
                # self.add_log("SENSOR", f"{member['id']} moved from {old_loc} to {new_loc}")

    def update_agent_status(self, agent_id: str, status: str):
        agent = self.get_agent(agent_id)
        if agent:
            agent["status"] = status
            self.add_log("SYSTEM", f"ALERT: Agent {agent_id} status changed to {status}")

    def get_context_for_agent(self, agent_id: str) -> str:
        agent = self.get_agent(agent_id)
        if not agent:
            return ""
        
        # Construct knowledge based on location and others in the same room
        location = agent["location"]
        others_in_room = [m["id"] for m in self.crew if m["location"] == location and m["id"] != agent_id and m["status"] == "Alive"]
        
        context = f"""
        Current Game State:
        - Your Location: {location}
        - Others in room: {', '.join(others_in_room) if others_in_room else 'None'}
        - Ship Status: Stable
        """
        return context

game_manager = GameState()
