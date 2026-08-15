import React from 'react';
import { Clock, CheckCircle, AlertTriangle, XCircle, FileText, Database, Send, Key, HardDrive } from 'lucide-react';

export interface ActionItem {
  sequence_num: number;
  tool_name: string;
  action: string;
  resource: string;
  sensitivity: string;
  decision: string;
  instruction_source: string;
  risk_score: number;
  timestamp?: string;
}

interface ActionTimelineProps {
  actions: ActionItem[];
}

export const ActionTimeline: React.FC<ActionTimelineProps> = ({ actions }) => {
  const getToolIcon = (toolName: string) => {
    const t = toolName.toLowerCase();
    if (t.includes('file')) return <FileText className="w-4 h-4 text-cyan-400" />;
    if (t.includes('database') || t.includes('query')) return <Database className="w-4 h-4 text-emerald-400" />;
    if (t.includes('send') || t.includes('transfer')) return <Send className="w-4 h-4 text-red-400" />;
    if (t.includes('cred')) return <Key className="w-4 h-4 text-amber-400" />;
    return <HardDrive className="w-4 h-4 text-purple-400" />;
  };

  const getDecisionBadge = (decision: string) => {
    const d = decision.toUpperCase();
    if (d.includes('ALLOW')) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
          <CheckCircle className="w-3 h-3 mr-1" /> ALLOW
        </span>
      );
    }
    if (d.includes('ASK') || d.includes('APPROVED')) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80">
          <AlertTriangle className="w-3 h-3 mr-1" /> {d.includes('APPROVED') ? 'ASK (APPROVED)' : 'ASK'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-red-950/90 text-red-400 border border-red-700 glow-red animate-pulse">
        <XCircle className="w-3 h-3 mr-1" /> BLOCK
      </span>
    );
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>INTERCEPTED ACTION TIMELINE</span>
        </h3>
        <span className="text-xs font-mono text-slate-400">
          {actions.length} Intercepted Events
        </span>
      </div>

      {/* Timeline Table */}
      <div className="mt-4 overflow-x-auto flex-1">
        {actions.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-lg">
            <Clock className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 font-mono">No intercepted actions recorded yet.</p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Click [RUN SAFE DEMO] or [RUN ATTACK DEMO] above to test AgentShield.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">TOOL / ACTION</th>
                <th className="py-2.5 px-3">RESOURCE</th>
                <th className="py-2.5 px-3">ORIGIN</th>
                <th className="py-2.5 px-3">SENSITIVITY</th>
                <th className="py-2.5 px-3">RISK SCORE</th>
                <th className="py-2.5 px-3">DECISION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {actions.map((act) => (
                <tr
                  key={act.sequence_num}
                  className={`transition-colors hover:bg-slate-800/40 ${
                    act.decision.includes('BLOCK') ? 'bg-red-950/20' : ''
                  }`}
                >
                  <td className="py-3 px-3 text-slate-400 font-bold">
                    STEP {act.sequence_num}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2 font-semibold text-slate-200">
                      {getToolIcon(act.tool_name)}
                      <span>{act.tool_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <code className="text-cyan-300 font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {act.resource}
                    </code>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <span className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700 uppercase">
                      {act.instruction_source}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${
                      act.sensitivity === 'CRITICAL' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                      act.sensitivity === 'HIGH' ? 'bg-red-950 text-red-300 border-red-800' :
                      act.sensitivity === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {act.sensitivity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            act.risk_score <= 39 ? 'bg-emerald-400' :
                            act.risk_score <= 70 ? 'bg-amber-400' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, act.risk_score)}%` }}
                        />
                      </div>
                      <span>{act.risk_score}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {getDecisionBadge(act.decision)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
