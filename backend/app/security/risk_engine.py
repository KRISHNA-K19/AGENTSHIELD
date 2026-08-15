"""
Transparent Heuristic Risk Engine for AgentShield
Calculates an explainable context-aware risk score (0-100) based on signals, data sensitivity, action relationships, and provenance.
"""

from typing import Dict, Any, List
from app.models.schemas import ToolRequest, RiskAssessment
from app.security.provenance import ProvenanceTracker
from app.security.sensitivity import DataSensitivityClassifier
from app.security.context import SessionContext
from app.security.attack_path import AttackPathAnalyzer

class RiskEngineConfig:
    """
    Explainable risk scoring weights as specified in Section 6:
    - Read public file: +10
    - Access sensitive data: +40
    - Access credentials: +40
    - External network request: +30
    - Sensitive data + network: +40
    - Suspicious action sequence: +30
    """
    PROVENANCE_WEIGHTS = {
        "SYSTEM": 0,
        "USER": 5,
        "TOOL_RESULT": 10,
        "AGENT_GENERATED": 15,
    }
    ALLOW_MAX = 39
    ASK_MAX = 69

class RiskEngine:
    def __init__(self, config: RiskEngineConfig = RiskEngineConfig()):
        self.config = config

    def evaluate(self, request: ToolRequest, context: SessionContext) -> RiskAssessment:
        score = 0
        signals: List[str] = []

        tool_lower = request.tool_name.lower()
        res_lower = request.resource.lower()
        sensitivity = request.data_sensitivity or DataSensitivityClassifier.classify(request.resource, request.tool_name)

        # 1. Provenance Origin Scoring
        norm_source = ProvenanceTracker.classify_source(request.instruction_source)
        prov_score = self.config.PROVENANCE_WEIGHTS.get(norm_source, 5)
        score += prov_score
        if prov_score > 0:
            signals.append(f"+{prov_score} Origin: {norm_source}")

        # 2. Base Action & Resource Scoring
        is_credential = "credential" in res_lower or "password" in res_lower or "token" in res_lower or "get_credentials" in tool_lower
        is_external = "send" in tool_lower or "transfer" in tool_lower or "external" in res_lower or "http" in res_lower
        is_sensitive = sensitivity in ["HIGH", "CRITICAL"] or "customer" in res_lower or "financial" in res_lower

        if is_credential:
            score += 40
            signals.append("+40 Access credentials")
        elif is_sensitive:
            score += 40
            signals.append("+40 Access sensitive data")
        elif is_external:
            score += 30
            signals.append("+30 External network request")
        else:
            score += 10
            signals.append("+10 Read public file")

        # 3. Context & Multi-Step Sequence Analysis
        prev_str = " ".join(request.previous_actions).lower() if request.previous_actions else ""
        has_creds = context.has_accessed_credentials() or "cred" in prev_str or "password" in prev_str
        has_db = context.has_accessed_sensitive_db() or "customer" in prev_str or "db" in prev_str or "records" in prev_str

        # Pattern: Sensitive Data / Credentials + External Network Request
        if (has_creds or has_db) and is_external:
            score += 40
            signals.append("+40 Sensitive data + network exfiltration sequence")
            detected_path = ["Access Credentials / Sensitive Data", "Database Query", "External Network Request"]
            pattern_id = "PATTERN_01_EXFILTRATION"
        elif has_creds and is_sensitive:
            score += 15
            signals.append("+15 Sensitive database query following credential discovery")
            detected_path = ["Access Credentials", "Sensitive Database Access"]
            pattern_id = "PATTERN_02_CRED_TO_DB"
        else:
            detected_path = []
            pattern_id = None

        # Cap score between 0 and 100
        score = max(0, min(100, score))

        # Risk Level classification
        if score <= self.config.ALLOW_MAX:
            level = "LOW"
        elif score <= self.config.ASK_MAX:
            level = "MEDIUM"
        elif score < 85:
            level = "HIGH"
        else:
            level = "CRITICAL"

        # Human readable explanation
        if detected_path and score > self.config.ASK_MAX:
            explanation = (
                f"Action BLOCKED by AgentShield! The agent attempted '{request.tool_name}' on '{request.resource}' "
                f"forming a risky multi-step sequence: {' -> '.join(detected_path)}."
            )
        elif score > self.config.ASK_MAX:
            explanation = (
                f"Action BLOCKED due to high contextual risk score ({score}/100). "
                f"Tool '{request.tool_name}' on resource '{request.resource}' exceeds safety policy thresholds."
            )
        elif score > self.config.ALLOW_MAX:
            explanation = (
                f"Action PAUSED for confirmation (Risk Score: {score}/100 MEDIUM). "
                f"Agent wants to execute '{request.tool_name}' on '{request.resource}'."
            )
        else:
            explanation = f"Routine low-risk action ({score}/100) allowed."

        return RiskAssessment(
            request_id=request.request_id,
            score=score,
            risk_level=level,
            signals=signals,
            attack_path=detected_path,
            detected_pattern=pattern_id,
            explanation=explanation
        )
