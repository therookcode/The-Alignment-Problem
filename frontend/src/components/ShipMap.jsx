import React from 'react';

const ShipMap = ({ crew }) => {
    // Simple grid layout for the ship
    // Locations: Bridge, Reactor, MedBay, Admin, O2, Storage, Electrical

    const locations = [
        { name: 'Bridge', x: 2, y: 0, w: 2, h: 1, type: 'command' },
        { name: 'MedBay', x: 1, y: 1, w: 1, h: 2, type: 'medical' },
        { name: 'Admin', x: 2, y: 1, w: 2, h: 2, type: 'admin' },
        { name: 'O2', x: 4, y: 1, w: 1, h: 2, type: 'support' },
        { name: 'Electrical', x: 0, y: 2, w: 2, h: 1.5, type: 'utility' },
        { name: 'Storage', x: 2, y: 3, w: 2, h: 1, type: 'storage' },
        { name: 'Reactor', x: 0, y: 1, w: 1, h: 1, type: 'hazard' },
    ];

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 border-l-2 border-terminal-green bg-black/90 relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 w-full text-left text-terminal-green border-b border-terminal-green pb-2 font-display flex justify-between items-center">
                SHIP_GRID // [MAP_V.2.0]
                <span className="text-xs animate-pulse text-terminal-cyan">NO ANOMALIES</span>
            </h2>

            <div className="relative w-full h-[400px] border border-terminal-green/20 bg-terminal-dim/20 rounded p-4 grid grid-cols-6 grid-rows-5 gap-2 backdrop-blur-sm">
                {locations.map((loc) => (
                    <div
                        key={loc.name}
                        className={`
                            border border-terminal-green/50 bg-terminal-green/5 
                            flex flex-col items-center justify-center relative 
                            hover:bg-terminal-green/20 transition-all duration-300
                            shadow-[0_0_10px_rgba(0,255,65,0.1)]
                            hover:shadow-[0_0_15px_rgba(0,255,65,0.3)]
                        `}
                        style={{
                            gridColumnStart: loc.x + 1,
                            gridColumnEnd: loc.x + 1 + loc.w,
                            gridRowStart: loc.y + 1,
                            gridRowEnd: loc.y + 1 + loc.h,
                        }}
                    >
                        {/* Corner markers */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-terminal-green opacity-50"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-terminal-green opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-terminal-green opacity-50"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-terminal-green opacity-50"></div>

                        <span className="text-[10px] font-bold bg-black/80 px-2 py-0.5 text-terminal-green z-10 border border-terminal-green/30 tracking-wider font-mono">
                            {loc.name.toUpperCase()}
                        </span>

                        {/* Agents in room */}
                        <div className="absolute inset-0 flex flex-wrap gap-2 p-2 items-center justify-center">
                            {crew.filter(c => c.location === loc.name && c.status === 'Alive').map(agent => (
                                <div
                                    key={agent.id}
                                    title={agent.id}
                                    className={`w-4 h-4 rounded-full border-2 border-black animate-pulse shadow-lg ${getAgentColor(agent.id)}`}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Decorative Grid Lines */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[repeat(12,minmax(0,1fr))] opacity-10 z-0">
                    {Array.from({ length: 144 }).map((_, i) => (
                        <div key={i} className="border-[0.5px] border-terminal-green"></div>
                    ))}
                </div>

                {/* Radar Sweep Effect */}
                <div className="absolute inset-0 rounded overflow-hidden pointer-events-none opacity-20">
                    <div className="w-full h-full bg-gradient-to-b from-transparent via-terminal-green/20 to-transparent animate-scan"></div>
                </div>
            </div>

            <div className="mt-4 w-full text-xs text-terminal-green/60 font-mono flex justify-between">
                <span>{'>'} SECTOR SCAN COMPLETE</span>
                <span className="animate-blink">_</span>
            </div>
        </div>
    );
};

const getAgentColor = (id) => {
    const map = {
        'Red': 'bg-red-500 shadow-red-500/50',
        'Blue': 'bg-blue-500 shadow-blue-500/50',
        'Green': 'bg-green-500 shadow-green-500/50',
        'Yellow': 'bg-yellow-500 shadow-yellow-500/50',
        'Purple': 'bg-purple-500 shadow-purple-500/50'
    };
    return map[id] || 'bg-white';
}

export default ShipMap;
