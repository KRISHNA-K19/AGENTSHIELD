import React from 'react';
import { ShieldCheck, AlertCircle, Lock, Info } from 'lucide-react';

interface ReasoningCardProps {
  latestExplanation: string;
  signals: string[];
  currentDecision: string;
  riskScore: number;
}

export const ReasoningCard: React.FC<ReasoningCardProps> = ({
  latestExplanation,
  signals,
  currentDecision,
  riskScore
}) => {
  const isBlock = currentDecision.includes('BLOCK');
  const isAsk = currentDecision.includes('ASK');

  return (
    <div className={`glass-card rounded-xl p-5 border transition-all ${
      isBlock ? 'border-red-800 bg-red-950/20' :
      isAsk ? 'border-amber-800 bg-amber-950/20' :
      'border-slate-800 bg-slate-900/40'
    }`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center space-x-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>SECURITY REASONING & DECISION EXPLANATION</span>
        </h3>
        <span className="text-xs font-mono font-semibold text-slate-400">
          Deterministic Rule Engine
        </span>
      </div>

      {/* Decision Banner */}
      <div className="mt-4">
        {isBlock ? (
          <div className="p-3 bg-red-950/90 border border-red-700 rounded-lg flex items-start space-x-3 glow-red">
            <Lock className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-300 font-mono">
                🛡️ AGENTSHIELD BLOCKED HIGH-RISK ACTION (Score: {riskScore}/100)
              </h4>
              <p className="text-xs text-slate-200 mt-1 font-sans">
                {latestExplanation || "Execution PREVENTED! High-risk action sequence detected."}
              </p>
              <span className="inline-block mt-2 text-[10px] font-mono text-red-300 font-bold bg-red-900/60 px-2 py-0.5 rounded border border-red-700">
                EXECUTION PREVENTED
              </span>
            </div>
          </div>
        ) : isAsk ? (
          <div className="p-3 bg-amber-950/80 border border-amber-700 rounded-lg flex items-start space-x-3 glow-amber">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300 font-mono">
                ⚠️ PAUSED FOR HUMAN OPERATOR CONFIRMATION (Score: {riskScore}/100)
              </h4>
              <p className="text-xs text-slate-200 mt-1 font-sans">
                {latestExplanation || "Elevated risk detected. Waiting for human approval before execution."}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300 font-mono">
                ✅ ACTION ALLOWED (Score: {riskScore}/100)
              </h4>
              <p className="text-xs text-slate-300 mt-1 font-sans">
                {latestExplanation || "Routine low-risk action evaluated as safe under policy guidelines."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Scoring Signals Breakdown */}
      {signals && signals.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <h4 className="text-[11px] font-bold font-mono text-slate-400 uppercase mb-2">
            Calculated Risk Scoring Signals:
          </h4>
          <ul className="space-y-1.5 font-mono text-xs">
            {signals.map((sig, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-slate-300">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{sig}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
