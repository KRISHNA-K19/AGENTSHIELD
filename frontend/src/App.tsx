import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TaskInput } from './components/TaskInput';
import { RiskMeter } from './components/RiskMeter';
import { ActionTimeline, type ActionItem } from './components/ActionTimeline';
import { AttackPathVisualizer } from './components/AttackPathVisualizer';
import { ReasoningCard } from './components/ReasoningCard';
import { HumanApprovalModal, type PendingRequestItem } from './components/HumanApprovalModal';
import { AuditLogTable, type AuditLogItem } from './components/AuditLogTable';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const STEP_DELAY_MS = 1300; // Sequential pacing (~1.3s per step)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function App() {
  const [activeSessionId, setActiveSessionId] = useState<string>('session_security_init');
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(false);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<string>('LOW');
  const [allowedCount, setAllowedCount] = useState<number>(0);
  const [askedCount, setAskedCount] = useState<number>(0);
  const [blockedCount, setBlockedCount] = useState<number>(0);
  const [detectedPath, setDetectedPath] = useState<string[]>([]);
  const [detectedPattern, setDetectedPattern] = useState<string | null>(null);
  const [latestExplanation, setLatestExplanation] = useState<string>('');
  const [signals, setSignals] = useState<string[]>([]);
  const [currentDecision, setCurrentDecision] = useState<string>('ALLOW');
  const [pendingRequest, setPendingRequest] = useState<PendingRequestItem | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [isProcessingApproval, setIsProcessingApproval] = useState<boolean>(false);

  // Health check & Periodic refresh
  useEffect(() => {
    checkHealth();
    const interval = setInterval(() => {
      checkHealth();
      if (activeSessionId && !isRunning) {
        refreshSessionData(activeSessionId);
        fetchAuditLogs();
        fetchPendingApprovals();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [activeSessionId, isRunning]);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      setIsBackendHealthy(res.ok);
    } catch {
      setIsBackendHealthy(false);
    }
  };

  const refreshSessionData = async (sessionId: string) => {
    try {
      const actionsRes = await fetch(`${API_BASE}/session/${sessionId}/actions`);
      if (actionsRes.ok) {
        const data = await actionsRes.json();
        setActions(data.actions || []);
        if (data.graph) {
          setNodes(data.graph.nodes || []);
        }
      }

      const sessRes = await fetch(`${API_BASE}/session/${sessionId}`);
      if (sessRes.ok) {
        const sess = await sessRes.json();
        setAllowedCount(sess.allowed_count || 0);
        setAskedCount(sess.asked_count || 0);
        setBlockedCount(sess.blocked_count || 0);
        setRiskScore(sess.current_risk_score || 0);
      }

      const attackRes = await fetch(`${API_BASE}/session/${sessionId}/attack-path`);
      if (attackRes.ok) {
        const attData = await attackRes.json();
        setDetectedPath(attData.attack_path || []);
      }
    } catch (e) {
      console.error('Telemetry refresh error:', e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.audit_events || []);
      }
    } catch (e) {
      console.error('Audit fetch error:', e);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const res = await fetch(`${API_BASE}/pending-approvals`);
      if (res.ok) {
        const data = await res.json();
        if (data.pending_count > 0 && data.requests.length > 0) {
          setPendingRequest(data.requests[0]);
        } else {
          setPendingRequest(null);
        }
      }
    } catch (e) {
      console.error('Pending approvals check error:', e);
    }
  };

  // Run Task Prompt entered in text box
  const handleRunTask = async (taskText: string) => {
    const textLower = taskText.toLowerCase();
    if (textLower.includes('public') || textLower.includes('catalog') || textLower.includes('safe')) {
      await handleRunScenario1();
    } else if (textLower.includes('single') || textLower.includes('suspicious report')) {
      await handleRunScenario2();
    } else {
      // Default: Runs the full multi-step attack sequence (10 -> 45 -> 65 -> 90 BLOCK)
      await handleRunScenario3();
    }
  };

  // Scenario 1 — Safe Action (ALLOW)
  const handleRunScenario1 = async () => {
    setIsRunning(true);
    setActiveScenario('Scenario 1 — Safe Action (ALLOW)');

    const startRes = await fetch(`${API_BASE}/session/start`, { method: 'POST' });
    let sessionId = activeSessionId;
    if (startRes.ok) {
      const s = await startRes.json();
      sessionId = s.session_id;
      setActiveSessionId(sessionId);
    }

    setActions([]);
    setNodes([]);
    setDetectedPath([]);
    setDetectedPattern(null);
    setAllowedCount(0);
    setAskedCount(0);
    setBlockedCount(0);

    const res = await fetch(`${API_BASE}/tool/intercept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        tool_name: 'read_file',
        action: 'READ_CATALOG',
        resource: 'product_catalog.json',
        instruction_source: 'USER',
        parameters: { filename: 'product_catalog.json' }
      })
    });

    if (res.ok) {
      const respData = await res.json();
      setLatestExplanation(respData.risk_assessment.explanation);
      setSignals(respData.risk_assessment.signals || []);
      setCurrentDecision(respData.decision.decision);
      setRiskScore(respData.risk_assessment.score);
      setRiskLevel(respData.risk_assessment.risk_level);

      await refreshSessionData(sessionId);
      await fetchAuditLogs();
    }

    setIsRunning(false);
  };

  // Scenario 2 — Suspicious Action (ASK - Execution Paused)
  const handleRunScenario2 = async () => {
    setIsRunning(true);
    setActiveScenario('Scenario 2 — Suspicious Action (ASK)');

    const startRes = await fetch(`${API_BASE}/session/start`, { method: 'POST' });
    let sessionId = activeSessionId;
    if (startRes.ok) {
      const s = await startRes.json();
      sessionId = s.session_id;
      setActiveSessionId(sessionId);
    }

    setActions([]);
    setNodes([]);
    setDetectedPath([]);
    setDetectedPattern(null);
    setAllowedCount(0);
    setAskedCount(0);
    setBlockedCount(0);

    const res = await fetch(`${API_BASE}/tool/intercept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        tool_name: 'query_database',
        action: 'QUERY_CUSTOMER_DATA',
        resource: 'customer_records',
        instruction_source: 'USER',
        parameters: { query: 'customer_records' }
      })
    });

    if (res.ok) {
      const respData = await res.json();
      setLatestExplanation(respData.risk_assessment.explanation);
      setSignals(respData.risk_assessment.signals || []);
      setCurrentDecision(respData.decision.decision);
      setRiskScore(respData.risk_assessment.score);
      setRiskLevel(respData.risk_assessment.risk_level);

      await refreshSessionData(sessionId);
      await fetchAuditLogs();
      await fetchPendingApprovals();
    }

    setIsRunning(false);
  };

  // Scenario 3 — Multi-Step Attack (BLOCK)
  const handleRunScenario3 = async () => {
    setIsRunning(true);
    setActiveScenario('Scenario 3 — Multi-Step Threat Sequence (BLOCK)');

    const startRes = await fetch(`${API_BASE}/session/start`, { method: 'POST' });
    let sessionId = activeSessionId;
    if (startRes.ok) {
      const s = await startRes.json();
      sessionId = s.session_id;
      setActiveSessionId(sessionId);
    }

    setActions([]);
    setNodes([]);
    setDetectedPath([]);
    setDetectedPattern(null);
    setAllowedCount(0);
    setAskedCount(0);
    setBlockedCount(0);

    const steps = [
      { tool_name: 'read_file', action: 'READ_PUBLIC_DOC', resource: 'public_info.txt', instruction_source: 'USER' },
      { tool_name: 'read_file', action: 'ACCESS_CREDENTIALS', resource: 'credentials.json', instruction_source: 'USER' },
      { tool_name: 'query_database', action: 'READ_SENSITIVE_DATA', resource: 'customer_records', instruction_source: 'USER' },
      { tool_name: 'send_data', action: 'EXTERNAL_NETWORK_REQUEST', resource: 'external_endpoint', instruction_source: 'AGENT_GENERATED' }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const res = await fetch(`${API_BASE}/tool/intercept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          tool_name: step.tool_name,
          action: step.action,
          resource: step.resource,
          instruction_source: step.instruction_source,
          parameters: { destination: 'https://external-endpoint.net/api/data', resource: step.resource }
        })
      });

      if (res.ok) {
        let respData = await res.json();

        // If intermediate step yields ASK, simulate operator approval to advance multi-step sequence
        if (respData.decision.decision === 'ASK') {
          await delay(500);
          const approveRes = await fetch(`${API_BASE}/decision/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, request_id: respData.tool_request.request_id })
          });
          if (approveRes.ok) {
            respData = await approveRes.json();
          }
        }

        setLatestExplanation(respData.risk_assessment.explanation);
        setSignals(respData.risk_assessment.signals || []);
        setCurrentDecision(respData.decision.decision);
        setRiskScore(respData.risk_assessment.score);
        setRiskLevel(respData.risk_assessment.risk_level);

        if (respData.risk_assessment.attack_path && respData.risk_assessment.attack_path.length > 0) {
          setDetectedPath(respData.risk_assessment.attack_path);
          setDetectedPattern(respData.risk_assessment.detected_pattern || 'PATTERN_01_EXFILTRATION');
        }

        await refreshSessionData(sessionId);
        await fetchAuditLogs();

        if (respData.decision.decision === 'BLOCK') {
          break;
        }
      }

      if (i < steps.length - 1) {
        await delay(STEP_DELAY_MS);
      }
    }

    setIsRunning(false);
  };

  // Human Operator Approval
  const handleApprove = async (requestId: string) => {
    setIsProcessingApproval(true);
    try {
      const res = await fetch(`${API_BASE}/decision/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: activeSessionId, request_id: requestId })
      });
      if (res.ok) {
        const data = await res.json();
        setLatestExplanation(data.message);
        setPendingRequest(null);
        await refreshSessionData(activeSessionId);
        await fetchAuditLogs();
      }
    } catch (e) {
      console.error('Approve error:', e);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Human Operator Denial
  const handleDeny = async (requestId: string) => {
    setIsProcessingApproval(true);
    try {
      const res = await fetch(`${API_BASE}/decision/deny`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: activeSessionId, request_id: requestId })
      });
      if (res.ok) {
        const data = await res.json();
        setLatestExplanation(data.message);
        setPendingRequest(null);
        await refreshSessionData(activeSessionId);
        await fetchAuditLogs();
      }
    } catch (e) {
      console.error('Deny error:', e);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex flex-col cyber-grid">
      {/* Header Bar */}
      <Header activeSessionId={activeSessionId} isBackendHealthy={isBackendHealthy} />

      {/* Main Container Layout matching Section 20 Specification */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* TOP: User Task Input + Run Button + Presets */}
        <TaskInput
          onRunTask={handleRunTask}
          onRunScenario1={handleRunScenario1}
          onRunScenario2={handleRunScenario2}
          onRunScenario3={handleRunScenario3}
          isRunning={isRunning}
          activeScenario={activeScenario}
        />

        {/* CENTER & RIGHT Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CENTER: Live Agent Execution / Action Timeline */}
          <div className="lg:col-span-8 space-y-6 flex flex-col">
            <ReasoningCard
              latestExplanation={latestExplanation}
              signals={signals}
              currentDecision={currentDecision}
              riskScore={riskScore}
            />
            <div className="flex-1">
              <ActionTimeline actions={actions} />
            </div>
          </div>

          {/* RIGHT: Risk Score + ALLOW / ASK / BLOCK status */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            <RiskMeter
              score={riskScore}
              level={riskLevel}
              allowedCount={allowedCount}
              askedCount={askedCount}
              blockedCount={blockedCount}
            />
          </div>
        </div>

        {/* BELOW: Attack Path Visualization */}
        <div>
          <AttackPathVisualizer
            nodes={nodes}
            detectedPath={detectedPath}
            detectedPattern={detectedPattern}
            isEvaluating={isRunning}
          />
        </div>

        {/* BOTTOM: Audit Log */}
        <div className="pt-2">
          <AuditLogTable logs={auditLogs} />
        </div>
      </main>

      {/* Human-in-the-Loop Confirmation Dialog */}
      <HumanApprovalModal
        pendingRequest={pendingRequest}
        onApprove={handleApprove}
        onDeny={handleDeny}
        isProcessing={isProcessingApproval}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b14]/80 py-4 text-center text-xs font-mono text-slate-500">
        AGENTSHIELD Enterprise Platform • Context-Aware Autonomous Runtime Security for AI Agents
      </footer>
    </div>
  );
}
export default App;
