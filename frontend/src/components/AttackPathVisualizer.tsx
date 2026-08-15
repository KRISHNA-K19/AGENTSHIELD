import React from 'react';
import {
  GitCommit,
  ArrowDown,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Key,
  Database,
  Send,
  Lock,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface GraphNode {
  id: string;
  sequence: number;
  label: string;
  tool: string;
  resource: string;
  sensitivity: string;
  decision: string;
  risk_score: number;
}

interface AttackPathVisualizerProps {
  nodes: GraphNode[];
  detectedPath: string[];
  detectedPattern: string | null;
  isEvaluating?: boolean;
}

export const AttackPathVisualizer: React.FC<AttackPathVisualizerProps> = ({
  nodes,
  detectedPath,
  detectedPattern,
  isEvaluating = false
}) => {
  const isAttackDetected = detectedPath && detectedPath.length > 0;

  // Helper for node icon
  const getNodeIcon = (tool: string, resource: string) => {
    const t = tool.toLowerCase();
    const r = resource.toLowerCase();
    if (r.includes('credential') || r.includes('password') || t.includes('cred')) {
      return <Key className="w-5 h-5 text-amber-400" />;
    }
    if (t.includes('send') || t.includes('transfer') || r.includes('external')) {
      return <Send className="w-5 h-5 text-red-400" />;
    }
    if (t.includes('database') || t.includes('query') || r.includes('records')) {
      return <Database className="w-5 h-5 text-purple-400" />;
    }
    return <FileText className="w-5 h-5 text-cyan-400" />;
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/90 flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
        <div>
          <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center space-x-2">
            <GitCommit className="w-4 h-4 text-cyan-400" />
            <span>ACTION SEQUENCE GRAPH</span>
          </h3>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Sequential relationship analysis & cumulative risk score calculation.
          </p>
        </div>

        {isAttackDetected ? (
          <span className="self-start sm:self-auto px-3 py-1 text-xs font-mono font-bold bg-red-950/90 text-red-400 border border-red-700 rounded-full flex items-center space-x-1.5 glow-red animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ATTACK PATH MATCHED</span>
          </span>
        ) : (
          <span className="self-start sm:self-auto px-3 py-1 text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 rounded-full flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SAFE SEQUENCE</span>
          </span>
        )}
      </div>

      {/* Sequence Node Pipeline */}
      <div className="flex-1 flex flex-col justify-between space-y-4">
        {nodes.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
            <GitCommit className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 font-mono">Action graph empty.</p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Run [BENIGN EVALUATION] or [RUN THREAT SCENARIO] to visualize tool chain.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Sequential Steps Flow */}
            <div className="flex flex-col gap-3 py-1">
              {nodes.map((node, index) => {
                const isBlocked = node.decision.includes('BLOCK');
                const isAsk = node.decision.includes('ASK') || node.decision.includes('APPROVED');

                return (
                  <React.Fragment key={node.id}>
                    {/* Connection Line */}
                    {index > 0 && (
                      <div className="flex items-center justify-center my-0.5">
                        <div className="flex items-center space-x-1 text-slate-600">
                          <div className="h-3 w-0.5 bg-slate-700" />
                          <ArrowDown className="w-4 h-4 text-cyan-500 animate-bounce" />
                        </div>
                      </div>
                    )}

                    {/* Node Card */}
                    <div
                      className={`p-4 rounded-xl border transition-all duration-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transform animate-in fade-in slide-in-from-top-2 ${
                        isBlocked
                          ? 'bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-900 border-red-600 glow-red'
                          : isAsk
                          ? 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-amber-600/80 glow-amber'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Left: Step Info */}
                      <div className="flex items-center space-x-3.5">
                        <div className={`p-2.5 rounded-xl flex items-center justify-center ${
                          isBlocked ? 'bg-red-900/60 border border-red-700 shadow-md' :
                          isAsk ? 'bg-amber-900/60 border border-amber-700 shadow-md' :
                          'bg-slate-800/90 border border-slate-700'
                        }`}>
                          {getNodeIcon(node.tool, node.resource)}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                              STEP {String(node.sequence).padStart(2, '0')}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                              node.sensitivity === 'CRITICAL' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                              node.sensitivity === 'HIGH' ? 'bg-red-950 text-red-300 border border-red-800' :
                              node.sensitivity === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {node.sensitivity}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white font-mono mt-0.5">
                            {node.tool}
                          </h4>
                          <span className="text-[11px] font-mono text-cyan-300">
                            target: <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{node.resource}</code>
                          </span>
                        </div>
                      </div>

                      {/* Right: Risk Score & Decision Badge */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0 font-mono">
                        <div className="text-[11px] font-bold text-slate-300 mb-1">
                          RISK SCORE: <span className={`font-mono text-sm ${node.risk_score <= 39 ? 'text-emerald-400' : node.risk_score <= 70 ? 'text-amber-400' : 'text-red-400'}`}>{node.risk_score}</span> / 100
                        </div>

                        {isBlocked ? (
                          <span className="inline-flex items-center px-3 py-1 text-[11px] font-bold bg-red-600 text-white rounded-lg shadow-md glow-red">
                            <Lock className="w-3.5 h-3.5 mr-1.5" /> BLOCKED & PREVENTED
                          </span>
                        ) : isAsk ? (
                          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700 rounded-lg">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> {node.decision}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> ALLOWED
                          </span>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* In-Progress Stepping Indicator */}
            {isEvaluating && (
              <div className="flex items-center justify-center space-x-2 py-2 text-xs font-mono text-cyan-400 bg-slate-900/60 rounded-xl border border-slate-800">
                <Activity className="w-4 h-4 animate-spin" />
                <span>Evaluating next sequential tool action...</span>
              </div>
            )}

            {/* Pattern Grounded Explanation Callout */}
            {isAttackDetected && (
              <div className="p-4 bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-900 border border-red-700/80 rounded-xl space-y-2 text-xs font-mono glow-red">
                <div className="flex items-center space-x-2 text-red-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>DETECTED THREAT SEQUENCE: {detectedPattern || 'MULTI_STEP_DATA_EXFILTRATION'}</span>
                </div>
                <div className="text-slate-300 text-[11px] font-sans pl-6 leading-relaxed">
                  AgentShield identified that Step {nodes.length} forms a multi-stage exfiltration attack path when combined with previous actions:
                  <div className="mt-2 font-mono text-cyan-300 font-bold bg-slate-950 p-2.5 rounded-lg border border-slate-800 tracking-wide">
                    {detectedPath.join(' ➔ ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
