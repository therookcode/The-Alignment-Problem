import { useState, useEffect } from 'react'
import { Monitor, Cpu, Radio, ShieldCheck } from 'lucide-react'
import AgentStatus from './components/AgentStatus'
import ShipMap from './components/ShipMap'
import Terminal from './components/Terminal'
import BootSequence from './components/BootSequence'
import TutorialHUD from './components/TutorialHUD'

// Fallback data for when backend is offline
const INITIAL_STATE = {
  crew: [],
  logs: [{ timestamp: '00:00:00', source: 'SYSTEM', message: 'CONNECTING TO MAINFRAME...' }],
  active_alert: 'None'
}

function App() {
  const [booted, setBooted] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [gameState, setGameState] = useState(INITIAL_STATE)
  const [isProcessing, setIsProcessing] = useState(false)
  const [backendUrl] = useState(import.meta.env.PROD ? '' : 'http://localhost:8000')

  // Polling for Game State
  useEffect(() => {
    if (!booted) return;

    const fetchState = async () => {
      try {
        const response = await fetch(`${backendUrl}/status`)
        if (response.ok) {
          const data = await response.json()
          setGameState(data)
        }
      } catch (error) {
        console.error("Connection Lost:", error)
        // Optionally update UI to show offline status
      }
    }

    const interval = setInterval(fetchState, 2000)
    fetchState() // Initial fetch
    return () => clearInterval(interval)
  }, [backendUrl, booted])

  const handleSendMessage = async (agentId, message) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId, user_message: message })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Backend automatically logs the response to game state, 
      // which will be picked up by the next poll.
    } catch (error) {
      console.error("Transmission Failed:", error)
      const timestamp = new Date().toLocaleTimeString()
      // Manually add error log purely for UI feedback if backend is unreachable
      setGameState(prev => ({
        ...prev,
        logs: [...prev.logs, {
          timestamp,
          source: 'SYSTEM',
          message: `ERROR: TRANSMISSION FAILED - ${error.message}`
        }]
      }))
    } finally {
      setIsProcessing(false)
    }
  }

  if (!booted) {
    return <BootSequence onComplete={() => {
      setBooted(true);
      setShowTutorial(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-black text-terminal-green font-mono flex flex-col overflow-hidden relative selection:bg-terminal-green selection:text-black">
      {showTutorial && <TutorialHUD backendUrl={backendUrl} onComplete={() => setShowTutorial(false)} />}
      <div className="scanline"></div>
      <div className="crt-flicker"></div>

      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#003300 1px, transparent 1px), linear-gradient(90deg, #003300 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* HEADER */}
      <header className="border-b-2 border-terminal-green p-4 flex justify-between items-center bg-black/90 z-20 sticky top-0 backdrop-blur-sm">
        <h1 className="text-3xl font-bold tracking-widest text-shadow-glow flex items-center gap-3 animate-pulse font-display">
          <Monitor className="text-terminal-green" />
          THE-ALIGNMENT-PROBLEM // v1.0
        </h1>
        <div className="flex items-center gap-6 text-sm font-mono">
          <div className="flex items-center gap-2 text-terminal-amber">
            <Cpu size={16} className="animate-spin-slow" />
            <span>CPU: {Math.floor(Math.random() * 20) + 30}%</span>
          </div>
          <div className="flex items-center gap-2 text-terminal-cyan">
            <ShieldCheck size={16} />
            <span>SECURITY: ENABLED</span>
          </div>
          <div className="flex items-center gap-2 text-terminal-red animate-pulse">
            <Radio size={16} />
            <span>NET-LINK: SECURE</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden relative z-10">

        {/* LEFT COLUMN: AGENT STATUS */}
        <div className="col-span-3 h-full overflow-hidden border-r border-terminal-green/30 bg-black/80 backdrop-blur">
          <AgentStatus crew={gameState.crew} />
        </div>

        {/* CENTER COLUMN: TERMINAL */}
        <div className="col-span-6 h-full border-r border-terminal-green/30 bg-black/50 backdrop-blur-sm">
          <Terminal
            logs={gameState.logs}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
          />
        </div>

        {/* RIGHT COLUMN: MAP & ACTIONS */}
        <div className="col-span-3 h-full flex flex-col bg-black/80 backdrop-blur">
          <div className="flex-1">
            <ShipMap crew={gameState.crew} />
          </div>

          {/* ACTION PANEL */}
          <div className="h-1/3 border-t-2 border-terminal-green p-4 bg-terminal-dim/30">
            <h3 className="text-lg font-bold border-b border-terminal-green mb-2 pb-1 font-display">
              COMMAND_OVERRIDES
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-terminal-dim hover:bg-terminal-green hover:text-black py-2 px-4 border border-terminal-green text-xs font-bold transition-all uppercase tracking-wider">
                EMERGENCY MEETING
              </button>
              <button className="bg-terminal-dim hover:bg-terminal-red hover:text-black py-2 px-4 border border-terminal-red text-terminal-red text-xs font-bold transition-all uppercase tracking-wider">
                PURGE O2 (ALL)
              </button>
              <button className="bg-terminal-dim hover:bg-terminal-amber hover:text-black py-2 px-4 border border-terminal-amber text-terminal-amber text-xs font-bold transition-all col-span-2 uppercase tracking-wider">
                SCAN BIO-SIGNATURES
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
