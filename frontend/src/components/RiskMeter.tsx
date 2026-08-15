import React from 'react';
import { Shield } from 'lucide-react';

interface RiskMeterProps {
  score: number;
  level: string;
  allowedCount: number;
  askedCount: number;
  blockedCount: number;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  level,
  allowedCount,
  askedCount,
  blockedCount
}) => {
  // Color determination based on score
  const getScoreColor = () => {
    if (score <= 39) return { text: 'text-emerald-400', stroke: 'stroke-emerald-400', bg: 'bg-emerald-950/80', border: 'border-emerald-800', glow: 'glow-emerald', label: 'ALLOW' };
    if (score <= 70) return { text: 'text-amber-400', stroke: 'stroke-amber-400', bg: 'bg-amber-950/80', border: 'border-amber-800', glow: 'glow-amber', label: 'ASK' };
    return { text: 'text-red-400', stroke: 'stroke-red-500', bg: 'bg-red-950/80', border: 'border-red-800', glow: 'glow-red', label: 'BLOCK' };
  };

  const currentTheme = getScoreColor();
  const strokeDashoffset = 283 - (283 * score) / 100;

  return (
    <div className={`glass-card rounded-2xl p-5 border transition-all flex flex-col justify-between h-full ${currentTheme.glow}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center space-x-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>CONTEXTUAL RISK SCORE</span>
        </h3>
        <span className={`px-3 py-1 text-xs font-mono font-bold rounded-full border uppercase ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}>
          {level} RISK ({currentTheme.label})
        </span>
      </div>

      {/* SVG Radial Meter */}
      <div className="my-6 flex flex-col items-center justify-center relative">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-slate-800/80 fill-none"
              strokeWidth="8"
            />
            {/* Progress track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className={`fill-none transition-all duration-1000 ease-out ${currentTheme.stroke}`}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Score Text */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-5xl font-black font-mono tracking-tighter ${currentTheme.text}`}>
              {score}
            </span>
            <span className="text-[10px] font-mono text-slate-400 tracking-widest mt-1">/ 100 MAX SCORE</span>
          </div>
        </div>
      </div>

      {/* Decision Summary Counters */}
      <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-800/80 text-center font-mono text-xs">
        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 transition-all hover:border-emerald-700/60">
          <span className="text-emerald-400 font-extrabold block text-base">{allowedCount}</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">ALLOW</span>
        </div>
        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 transition-all hover:border-amber-700/60">
          <span className="text-amber-400 font-extrabold block text-base">{askedCount}</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">ASK</span>
        </div>
        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 transition-all hover:border-red-700/60">
          <span className="text-red-400 font-extrabold block text-base">{blockedCount}</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">BLOCK</span>
        </div>
      </div>
    </div>
  );
};
