from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

def current_iso_utc() -> str:
    return datetime.now(timezone.utc).isoformat()

class ToolRequest(BaseModel):
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    agent_id: str = "Demo-Agent-01"
    tool_name: str
    action: str
    resource: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    instruction_source: str = "USER"  # SYSTEM, USER, TOOL_RESULT, AGENT_GENERATED
    requested_by: str = "agent"
    data_sensitivity: Optional[str] = None
    previous_actions: List[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=current_iso_utc)

class RiskAssessment(BaseModel):
    request_id: str
    score: int  # 0 to 100
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    signals: List[str]
    attack_path: List[str] = Field(default_factory=list)
    detected_pattern: Optional[str] = None
    explanation: str

class PolicyDecision(BaseModel):
    request_id: str
    session_id: str
    decision: str  # ALLOW, ASK, BLOCK
    policy: str
    timestamp: str = Field(default_factory=current_iso_utc)
    status: str  # EXECUTED, WAITING_FOR_APPROVAL, DENIED, BLOCKED_BY_AGENTSHIELD
    risk_assessment: RiskAssessment

class AuditEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = Field(default_factory=current_iso_utc)
    session_id: str
    agent_id: str
    tool_name: str
    action: str
    resource: str
    instruction_source: str
    data_sensitivity: str
    risk_score: int
    decision: str
    reason: str
    attack_path: List[str] = Field(default_factory=list)
    executed: bool

class ActionEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    sequence_num: int
    timestamp: str = Field(default_factory=current_iso_utc)
    tool_name: str
    action: str
    resource: str
    instruction_source: str
    data_sensitivity: str
    risk_score: int
    decision: str
    status: str

class AgentSession(BaseModel):
    session_id: str
    agent_id: str = "Demo-Agent-01"
    status: str = "ACTIVE"  # ACTIVE, PAUSED_WAITING_APPROVAL, COMPLETED, BLOCKED
    current_task: str = "Security Monitoring Session"
    created_at: str = Field(default_factory=current_iso_utc)
    action_count: int = 0
    allowed_count: int = 0
    asked_count: int = 0
    blocked_count: int = 0
    current_risk_score: int = 0

class ApproveDenyRequest(BaseModel):
    session_id: str
    request_id: str

class InterceptResponse(BaseModel):
    status: str  # EXECUTED, WAITING_FOR_APPROVAL, BLOCKED_BY_AGENTSHIELD, DENIED
    tool_request: ToolRequest
    risk_assessment: RiskAssessment
    decision: PolicyDecision
    tool_result: Optional[Dict[str, Any]] = None
    message: str
