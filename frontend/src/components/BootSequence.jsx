import React, { useState, useEffect } from 'react';

const BootSequence = ({ onComplete }) => {
    const [lines, setLines] = useState([]);

    const bootLines = [
        "INITIALIZING KERNEL...",
        "LOADING NEURAL NETWORKS...",
        "CHECKING BIO-SIGNATURES...",
        "CONNECTING TO SATELLITE UPLINK...",
        "ENCRYPTING CONNECTION...",
        "ESTABLISHING SECURE HANDSHAKE...",
        "ACCESS GRANTED.",
        "WELCOME, SYSADMIN."
    ];

    useEffect(() => {
        let delay = 0;
        bootLines.forEach((line, index) => {
            delay += Math.random() * 500 + 200;
            setTimeout(() => {
                setLines(prev => [...prev, line]);
                if (index === bootLines.length - 1) {
                    setTimeout(onComplete, 1000);
                }
            }, delay);
        });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-terminal-green font-mono z-50 fixed inset-0">
            <div className="w-full max-w-md p-4 space-y-2">
                {lines.map((line, i) => (
                    <div key={i} className="typewriter">
                        <span className="mr-2 text-terminal-dim">{'>'}</span>
                        {line}
                    </div>
                ))}
                <div className="animate-pulse text-terminal-green mt-4">_</div>
            </div>
        </div>
    );
};

export default BootSequence;
