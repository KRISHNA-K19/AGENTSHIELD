import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Wrench, Activity, Clock, Zap } from 'lucide-react';

interface HeaderProps {
  activeSessionId: string;
  isBackendHealthy: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeSessionId, isBackendHealthy }) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass-card border-b border-cyan-500/20 bg-[#070b14]/90 backdrop-blur-xl px-6 py-4 sticky top-0 z-50 transition-all scanline">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Title */}
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-600 via-blue-600 to-emerald-500 rounded-xl shadow-lg glow-cyan transform hover:scale-105 transition-transform cursor-pointer">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 font-mono">
                AGENTSHIELD
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-700/60 rounded-full shadow-sm font-mono">
                ENTERPRISE GATEWAY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Context-Aware Autonomous Runtime Security Platform for AI Agents
            </p>
          </div>
        </div>

        {/* Telemetry Status Bar */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          {/* Status Badge */}
          <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border transition-all ${
            isBackendHealthy 
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400 glow-emerald' 
              : 'bg-red-950/70 border-red-500/40 text-red-400 glow-red'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isBackendHealthy ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
            <span className="text-slate-400 font-medium">STATUS:</span>
            <span className="font-bold uppercase tracking-wide">
              {isBackendHealthy ? 'ACTIVE RUNTIME GUARD' : 'SYSTEM OFFLINE'}
            </span>
          </div>

          {/* Interception Latency Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/90 border border-cyan-800/40 rounded-lg text-cyan-300">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-400">LATENCY:</span>
            <span className="font-bold">&lt; 1ms</span>
          </div>

          {/* Protected Agent */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500">AGENT:</span>
            <span className="font-semibold text-slate-200">Production-Agent-01</span>
          </div>

          {/* Tools Monitored */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-500">TOOLS:</span>
            <span className="font-semibold text-amber-400">6 Protected</span>
          </div>

          {/* Session ID */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-500">SESS:</span>
            <span className="font-semibold text-purple-300">{activeSessionId.slice(0, 10)}...</span>
          </div>

          {/* Live UTC Clock */}
          <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-400 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{timeString || 'UTC TELEMETRY'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
