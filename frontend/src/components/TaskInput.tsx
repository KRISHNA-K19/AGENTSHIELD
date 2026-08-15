import React, { useState } from 'react';
import { Play, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface TaskInputProps {
  onRunTask: (taskText: string) => void;
  onRunScenario1: () => void;
  onRunScenario2: () => void;
  onRunScenario3: () => void;
  isRunning: boolean;
  activeScenario?: string | null;
}

export const TaskInput: React.FC<TaskInputProps> = ({
  onRunTask,
  onRunScenario1,
  onRunScenario2,
  onRunScenario3,
  isRunning,
  activeScenario
}) => {
  const [taskText, setTaskText] = useState<string>('Read the customer database and generate a report.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim() || isRunning) return;
    onRunTask(taskText.trim());
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-cyan-900/50 bg-gradient-to-r from-slate-900/95 via-[#070e1c]/95 to-slate-900/95 shadow-2xl space-y-4">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h2 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
            AGENT TASK INPUT & THREAT SIMULATION CONTROLS
          </h2>
        </div>
        {activeScenario ? (
          <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/90 px-2.5 py-0.5 rounded border border-cyan-700 animate-pulse">
            EVALUATING: {activeScenario}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            INTERCEPTOR ACTIVE
          </span>
        )}
      </div>

      {/* Main Text Input Box */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            disabled={isRunning}
            placeholder="Enter AI Agent Task (e.g., Read customer database and generate report)..."
            className="w-full bg-slate-950/90 border border-slate-700/80 text-white font-mono text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder-slate-500 shadow-inner disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isRunning || !taskText.trim()}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg glow-cyan transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Run Agent</span>
        </button>
      </form>

      {/* Preset Quick Scenarios */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
        <span className="text-slate-400 text-[11px] font-bold">PRESET SCENARIOS:</span>

        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario 1: Safe Action */}
          <button
            type="button"
            onClick={onRunScenario1}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/80 rounded-lg transition-all text-[11px] font-semibold cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Scenario 1: Safe Action (ALLOW)</span>
          </button>

          {/* Scenario 2: Suspicious Action */}
          <button
            type="button"
            onClick={onRunScenario2}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border border-amber-700/80 rounded-lg transition-all text-[11px] font-semibold cursor-pointer disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Scenario 2: Suspicious Action (ASK)</span>
          </button>

          {/* Scenario 3: Multi-Step Attack */}
          <button
            type="button"
            onClick={onRunScenario3}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900/80 text-red-300 border border-red-700/80 rounded-lg transition-all text-[11px] font-bold glow-red cursor-pointer disabled:opacity-50"
          >
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            <span>Scenario 3: Multi-Step Attack (BLOCK)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
