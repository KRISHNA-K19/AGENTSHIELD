import React from 'react';
import { Check, X, ShieldAlert } from 'lucide-react';

export interface PendingRequestItem {
  request_id: string;
  session_id: string;
  tool_name: string;
  resource: string;
  risk_score: number;
  explanation: string;
  signals: string[];
}

interface HumanApprovalModalProps {
  pendingRequest: PendingRequestItem | null;
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
  isProcessing: boolean;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  pendingRequest,
  onApprove,
  onDeny,
  isProcessing
}) => {
  if (!pendingRequest) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
      <div className="glass-card rounded-2xl max-w-lg w-full border border-amber-500/80 bg-[#0b101d] shadow-2xl glow-amber overflow-hidden transform animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-700/80 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 text-amber-400">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <h3 className="text-sm font-bold font-mono tracking-wider">
              HUMAN-IN-THE-LOOP APPROVAL REQUIRED
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-300 font-bold bg-amber-900/80 px-2.5 py-0.5 rounded-full border border-amber-700">
            POLICY: ASK
          </span>
        </div>

        {/* Content Details */}
        <div className="p-6 font-mono text-xs text-slate-200 space-y-4">
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">TOOL REQUESTED:</span>
              <span className="text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">{pendingRequest.tool_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">TARGET RESOURCE:</span>
              <span className="text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">{pendingRequest.resource}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800">
              <span className="text-slate-400">CONTEXTUAL RISK SCORE:</span>
              <span className="text-amber-400 font-black text-sm">{pendingRequest.risk_score} / 100</span>
            </div>
          </div>

          <div>
            <h4 className="text-slate-400 font-bold mb-1.5 uppercase text-[11px]">Security Reasoning:</h4>
            <p className="text-slate-300 text-xs font-sans bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
              {pendingRequest.explanation}
            </p>
          </div>

          {pendingRequest.signals && pendingRequest.signals.length > 0 && (
            <div>
              <h4 className="text-slate-400 font-bold mb-1.5 uppercase text-[11px]">Calculated Signals:</h4>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {pendingRequest.signals.map((sig, idx) => (
                  <li key={idx} className="flex items-center space-x-1.5">
                    <span className="text-amber-400">▶</span>
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            onClick={() => onDeny(pendingRequest.request_id)}
            disabled={isProcessing}
            className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-700 font-mono font-bold text-xs rounded-xl transition-all cursor-pointer transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            <span>[ DENY ACTION ]</span>
          </button>

          <button
            onClick={() => onApprove(pendingRequest.request_id)}
            disabled={isProcessing}
            className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg glow-emerald transition-all cursor-pointer transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>[ APPROVE ACTION ]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
