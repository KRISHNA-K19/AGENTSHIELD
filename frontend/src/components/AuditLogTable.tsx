import React, { useState } from 'react';
import { Database, Search, CheckCircle, XCircle } from 'lucide-react';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  session_id: string;
  agent_id: string;
  tool_name: string;
  action: string;
  resource: string;
  instruction_source: string;
  data_sensitivity: string;
  risk_score: number;
  decision: string;
  reason: string;
  executed: boolean;
}

interface AuditLogTableProps {
  logs: AuditLogItem[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDecision, setFilterDecision] = useState<string>('ALL');

  const filteredLogs = logs.filter(item => {
    const matchesSearch =
      item.tool_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDecision =
      filterDecision === 'ALL' || item.decision.toUpperCase() === filterDecision.toUpperCase();

    return matchesSearch && matchesDecision;
  });

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center space-x-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>SECURITY DECISION AUDIT LOGS</span>
        </h3>

        {/* Filter Controls */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search audit records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>

          <select
            value={filterDecision}
            onChange={(e) => setFilterDecision(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">ALL DECISIONS</option>
            <option value="ALLOW">ALLOW</option>
            <option value="ASK">ASK</option>
            <option value="BLOCK">BLOCK</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="mt-4 overflow-x-auto">
        {filteredLogs.length === 0 ? (
          <div className="h-36 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-lg font-mono text-xs text-slate-500">
            No audit log entries found matching criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">SESSION</th>
                <th className="py-2.5 px-3">TOOL / RESOURCE</th>
                <th className="py-2.5 px-3">SENSITIVITY</th>
                <th className="py-2.5 px-3">RISK SCORE</th>
                <th className="py-2.5 px-3">DECISION</th>
                <th className="py-2.5 px-3">EXECUTED</th>
                <th className="py-2.5 px-3">SECURITY REASONING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log, idx) => (
                <tr key={log.id || idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 text-purple-300 font-semibold">
                    {log.session_id.slice(0, 12)}...
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-200">{log.tool_name}</span>
                    <span className="text-slate-400 text-[11px] block">{log.resource}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 rounded border border-slate-700 uppercase text-slate-300">
                      {log.data_sensitivity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    <span className={log.risk_score <= 39 ? 'text-emerald-400' : log.risk_score <= 70 ? 'text-amber-400' : 'text-red-400'}>
                      {log.risk_score}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${
                      log.decision.includes('ALLOW') ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      log.decision.includes('ASK') || log.decision.includes('HUMAN') ? 'bg-amber-950 text-amber-400 border-amber-800' :
                      'bg-red-950 text-red-400 border-red-800'
                    }`}>
                      {log.decision}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    {log.executed ? (
                      <span className="text-emerald-400 flex items-center space-x-1 text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" /> <span>YES</span>
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center space-x-1 text-[11px]">
                        <XCircle className="w-3.5 h-3.5" /> <span>NO</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-xs truncate">
                    {log.reason}
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
