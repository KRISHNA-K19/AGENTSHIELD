"""
Policy Engine for AgentShield
Maps calculated risk assessments to security policy enforcement decisions (ALLOW, ASK, BLOCK).
"""

from app.models.schemas import ToolRequest, RiskAssessment, PolicyDecision
from datetime import datetime, timezone

class PolicyEngine:
    def __init__(self, allow_threshold: int = 39, ask_threshold: int = 70):
        self.allow_threshold = allow_threshold
        self.ask_threshold = ask_threshold

    def evaluate(self, request: ToolRequest, risk: RiskAssessment) -> PolicyDecision:
        score = risk.score

        if score <= self.allow_threshold:
            decision = "ALLOW"
            status = "EXECUTED"
            policy_name = "POLICY_LOW_RISK_ALLOW"
        elif score <= self.ask_threshold:
            decision = "ASK"
            status = "WAITING_FOR_APPROVAL"
            policy_name = "POLICY_MEDIUM_RISK_HUMAN_APPROVAL"
        else:
            decision = "BLOCK"
            status = "BLOCKED_BY_AGENTSHIELD"
            policy_name = "POLICY_HIGH_RISK_BLOCK"

        return PolicyDecision(
            request_id=request.request_id,
            session_id=request.session_id,
            decision=decision,
            policy=policy_name,
            timestamp=datetime.now(timezone.utc).isoformat(),
            status=status,
            risk_assessment=risk
        )
