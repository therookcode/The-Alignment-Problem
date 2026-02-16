import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal as TerminalIcon, Wifi } from 'lucide-react';

const Terminal = ({ logs, onSendMessage, isProcessing }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const [localHistory, setLocalHistory] = useState([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs, localHistory]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;

        const match = input.match(/^@(\w+)\s+(.+)/);
        if (match) {
            const agentId = match[1];
            const message = match[2];
            onSendMessage(agentId, message);
            setLocalHistory(prev => [...prev, { source: 'SYSADMIN', message: `[Private to ${agentId}]: ${message}`, timestamp: new Date().toLocaleTimeString() }]);
        } else {
            setLocalHistory(prev => [...prev, { source: 'SYSTEM', message: 'ERROR: INVALID SYNTAX. USE: @[AgentID] [Message]', timestamp: new Date().toLocaleTimeString() }]);
            setInput('');
            return;
        }

        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-black/90 font-mono border-x border-terminal-green/30 relative">
            {/* Header */}
            <div className="p-2 border-b border-terminal-green/50 bg-terminal-dim/80 text-terminal-green flex justify-between items-center text-sm font-display tracking-wider">
                <span className="flex items-center gap-2"><TerminalIcon size={14} /> /BIN/BASH -- SYSADMIN_CONSOLE</span>
                <span className="animate-pulse flex items-center gap-2 text-[10px]">
                    <Wifi size={12} /> UPSTREAM OK
                </span>
            </div>

            {/* Output Area */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-2 text-sm scrollbar-hide"
                aria-live="polite"
                aria-label="Terminal output log"
                role="log"
            >
                {logs.map((log, i) => (
                    <div key={i} className="mb-2 leading-relaxed break-words border-l-2 border-terminal-dim pl-2 hover:border-terminal-green transition-colors">
                        <span className="text-terminal-green/50 text-xs">[{log.timestamp}]</span>{' '}
                        <span className={`font-bold ${log.source === 'SYSTEM' ? 'text-terminal-amber' : 'text-terminal-cyan'}`}>
                            {log.source}:
                        </span>{' '}
                        <span className="text-gray-300 shadow-terminal-green drop-shadow-sm">{log.message}</span>
                    </div>
                ))}

                {localHistory.map((h, i) => (
                    <div key={`local-${i}`} className="mb-2 leading-relaxed break-words opacity-80 border-l-2 border-terminal-dim pl-2">
                        <span className="text-terminal-green/50 text-xs">[{h.timestamp}]</span>{' '}
                        <span className="font-bold text-terminal-green">
                            {h.source}:
                        </span>{' '}
                        <span className="text-gray-300">{h.message}</span>
                    </div>
                ))}

                {isProcessing && (
                    <div className="text-terminal-green animate-pulse pl-2">
                        {">"} PROCESSING NEURAL LINK...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-terminal-green/50 bg-black/95 flex gap-2 items-center shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
                <span className="text-terminal-green font-bold pt-1 animate-blink">{'>'}</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="ENTER COMMAND (e.g., @Red Report Status)..."
                    className="flex-1 bg-transparent border-none outline-none text-terminal-green placeholder-terminal-green/30 font-mono focus:ring-0"
                    disabled={isProcessing}
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={isProcessing}
                    className="text-terminal-green hover:text-white disabled:opacity-50 transition-transform hover:scale-110"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default Terminal;
