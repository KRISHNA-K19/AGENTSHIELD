import React from 'react';
import { AlertTriangle, CheckCircle2, RotateCcw, ShieldCheck, Zap } from 'lucide-react';

interface DemoControlsProps {
  onRunBenign: () => void;
  onRunAttack: () => void;
  onReset: () => void;
  isRunning: boolean;
  activeScenario: string | null;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  onRunBenign,
  onRunAttack,
  onReset,
  isRunning,
  activeScenario
}) => {
  return (
    <div className="glass-card rounded-2xl p-5 border border-cyan-900/40 bg-gradient-to-r from-slate-900/90 via-[#070d1a]/90 to-slate-900/90 shadow-2xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              AGENTSHIELD RUNTIME THREAT EVALUATION CONTROLS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Simulate real-world AI agent tool request sequences to test AgentShield context-aware security policy enforcement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* SAFE WORKFLOW BUTTON */}
          <button
            onClick={onRunBenign}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg glow-emerald transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>[ RUN SAFE WORKFLOW ]</span>
          </button>

          {/* THREAT SCENARIO BUTTON */}
          <button
            onClick={onRunAttack}
            disabled={isRunning}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg glow-red transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>[ RUN THREAT SCENARIO ]</span>
          </button>

          {/* RESET BUTTON */}
          <button
            onClick={onReset}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium rounded-xl border border-slate-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET SESSION</span>
          </button>
        </div>
      </div>

      {/* Active Scenario Indicator Banner */}
      {activeScenario && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-slate-400">EVALUATING SCENARIO:</span>
            <span className="text-cyan-300 font-bold uppercase">{activeScenario}</span>
          </div>
          {isRunning && (
            <span className="text-amber-400 animate-pulse font-semibold flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 animate-spin" />
              <span>Intercepting & Analyzing Tool Requests...</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
