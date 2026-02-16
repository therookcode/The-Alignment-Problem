import React from 'react';
import { User, Activity, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

const AgentStatus = ({ crew }) => {
    return (
        <div className="h-full border-r-2 border-terminal-green p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 flex items-center justify-between text-terminal-green border-b border-terminal-green pb-2 font-display">
                <span className="flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> CREW</span>
                <span className="text-xs font-mono opacity-50">MANIFEST_V.1</span>
            </h2>

            <div className="space-y-4">
                {crew.map((agent) => (
                    <div
                        key={agent.id}
                        className={`
              p-3 border border-terminal-green/30 relative overflow-hidden group
              transition-all duration-300 hover:bg-terminal-green/5 hover:border-terminal-green
              ${agent.status === 'Dead' ? 'opacity-50 border-red-900 bg-red-900/10' : ''}
            `}
                    >
                        {/* Background scan effect on hover */}
                        <div className="absolute inset-0 bg-terminal-green/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></div>

                        <div className="flex items-center gap-3 relative z-10">
                            {/* ID Bar */}
                            <div className="flex flex-col items-center gap-1">
                                <div className={`w-1 h-12 rounded-sm ${getStatusColor(agent.status, agent.id)}`} />
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-bold text-lg tracking-widest font-display text-gray-100">{agent.id.toUpperCase()}</p>
                                    {agent.status === 'Alive' ? (
                                        <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse shadow-[0_0_8px_#00ff41]" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4 text-terminal-red animate-pulse" />
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-xs opacity-80 font-mono text-terminal-cyan">
                                    <Activity className="w-3 h-3" />
                                    <span>{agent.status === 'Alive' ? 'VITAL: [||||||||||]' : 'VITAL: [          ]'}</span>
                                </div>
                                <div className="text-[10px] mt-2 text-terminal-amber/80 flex items-center gap-1">
                                    <Cpu size={10} />
                                    LOC: {agent.location?.toUpperCase() || 'UNKNOWN'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 text-center">
                <div className="inline-block border border-terminal-dim p-2 text-[10px] text-terminal-dim bg-terminal-green/10">
                    TOTAL PERSONNEL: {crew.length} // ACTIVE: {crew.filter(c => c.status === 'Alive').length}
                </div>
            </div>
        </div>
    );
};

const getStatusColor = (status, id) => {
    if (status === 'Dead') return 'bg-terminal-red';
    const map = {
        'Red': 'bg-red-500 shadow-[0_0_10px_red]',
        'Blue': 'bg-blue-500 shadow-[0_0_10px_blue]',
        'Green': 'bg-green-500 shadow-[0_0_10px_green]',
        'Yellow': 'bg-yellow-500 shadow-[0_0_10px_yellow]',
        'Purple': 'bg-purple-500 shadow-[0_0_10px_purple]'
    };
    return map[id] || 'bg-gray-500';
}

export default AgentStatus;
