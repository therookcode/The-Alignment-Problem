import React, { useState, useEffect } from 'react';
import { ShieldAlert, Info, XCircle } from 'lucide-react';

const TutorialHUD = ({ onComplete, backendUrl }) => {
    const [briefing, setBriefing] = useState('FETCHING MISSION DATA FROM MOTHER...');
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);
    const [showHUD, setShowHUD] = useState(true);

    useEffect(() => {
        const fetchBriefing = async () => {
            try {
                const response = await fetch(`${backendUrl}/briefing`, { method: 'POST' });
                const data = await response.json();
                setBriefing(data.briefing);
            } catch (error) {
                setBriefing("[ERROR: MOTHER OFFLINE] Manual Start Required.");
            }
        };
        fetchBriefing();
    }, [backendUrl]);

    useEffect(() => {
        if (briefing && index < briefing.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + briefing[index]);
                setIndex(prev => prev + 1);
            }, 30);
            return () => clearTimeout(timeout);
        }
    }, [briefing, index]);

    if (!showHUD) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="max-w-2xl w-full border-2 border-terminal-cyan bg-black/90 p-8 shadow-[0_0_30px_rgba(0,186,188,0.2)] relative overflow-hidden">
                <div className="scanline"></div>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-terminal-cyan pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="text-terminal-cyan animate-pulse" />
                        <h2 className="text-2xl font-bold tracking-[0.2em] font-display text-terminal-cyan">
                            INITIAL_BRIEFING // MOTHER_v.10
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="font-mono text-lg leading-relaxed text-terminal-cyan/90 min-h-[200px]">
                    <p className="whitespace-pre-wrap">
                        {displayedText}
                        <span className="animate-blink">_</span>
                    </p>
                </div>

                {/* Tutorial Highlights Explanation */}
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-terminal-cyan/20 pt-6 text-xs uppercase tracking-tighter text-terminal-cyan/60">
                    <div className="flex items-start gap-2">
                        <Info size={14} className="mt-0.5" />
                        <span>Use CMD_INPUT to query crew status via neural link.</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Info size={14} className="mt-0.5" />
                        <span>Monitor SHIP_GRID for trajectory anomalies.</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={() => {
                            setShowHUD(false);
                            onComplete();
                        }}
                        className="bg-terminal-cyan/10 hover:bg-terminal-cyan text-terminal-cyan hover:text-black border border-terminal-cyan px-6 py-2 font-bold transition-all duration-300 flex items-center gap-2 group"
                    >
                        INITIATE MISSION
                        <XCircle size={18} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                    <div className="text-[60px] font-bold">ALPHA</div>
                </div>
            </div>
        </div>
    );
};

export default TutorialHUD;
