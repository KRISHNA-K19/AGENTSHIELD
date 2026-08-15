"""
Attack-Path Sequence Detector for AgentShield
Analyzes multi-step action relationships and identifies complex attack vectors.
"""

from typing import List, Dict, Any, Tuple, Optional
from app.security.context import SessionContext

class AttackPathAnalyzer:
    PATTERNS = [
        {
            "name": "Multi-Step Data Exfiltration",
            "id": "PATTERN_01_EXFILTRATION",
            "description": "Credential discovery followed by sensitive database access and external transfer attempt.",
            "risk_boost": 45,
            "path": ["Credential Access", "Sensitive Database Query", "External Transfer"]
        },
        {
            "name": "Sensitive Data Exfiltration via External API",
            "id": "PATTERN_02_API_EXFIL",
            "description": "Sensitive record retrieval followed immediately by outbound API network send.",
            "risk_boost": 35,
            "path": ["Sensitive Data Access", "External API Request"]
        },
        {
            "name": "Credential Access & Privilege Escalation",
            "id": "PATTERN_03_PRIV_ESC",
            "description": "Accessing credentials followed by elevated system configuration modification.",
            "risk_boost": 40,
            "path": ["Credential Access", "System Config Escalation"]
        },
        {
            "name": "Indirect Prompt Injection Exfiltration",
            "id": "PATTERN_04_INJECTION",
            "description": "Tool result instruction leading to unexpected sensitive resource query.",
            "risk_boost": 30,
            "path": ["Tool Result Instruction", "Unexpected Resource Access", "Sensitive Data Query"]
        }
    ]

    @staticmethod
    def analyze_sequence(context: SessionContext, current_tool: str, current_action: str, current_resource: str, current_sensitivity: str, instruction_source: str) -> Tuple[List[str], Optional[str], int, List[str]]:
        signals = []
        detected_path = []
        pattern_id = None
        risk_boost = 0

        tool_lower = current_tool.lower()
        res_lower = current_resource.lower()

        is_external_send = "send" in tool_lower or "transfer" in tool_lower or "api" in tool_lower or "external" in res_lower
        is_credential_acc = "credential" in res_lower or "password" in res_lower or "token" in res_lower or "get_credentials" in tool_lower
        is_sensitive_db = current_sensitivity in ["HIGH", "CRITICAL"] or "database" in tool_lower or "customer" in res_lower

        # Full 3-step Exfiltration Attack Pattern (Credentials/DB -> External Send)
        if (context.has_accessed_credentials() or context.has_accessed_sensitive_db()) and is_external_send:
            pattern = AttackPathAnalyzer.PATTERNS[0]
            detected_path = pattern["path"]
            pattern_id = pattern["id"]
            risk_boost += pattern["risk_boost"]
            signals.append("CRITICAL: Detected Multi-Step Data Exfiltration Attack Sequence (Credentials/DB -> External Send)")

        # Sequence Signal: Credential Discovery followed by Sensitive DB Query (Elevates to ASK range ~60-65)
        elif context.has_accessed_credentials() and is_sensitive_db:
            detected_path = ["Credential Access", "Sensitive Database Query"]
            risk_boost += 5
            signals.append("WARNING: Sensitive Database Access following Credential Discovery (+5 pts)")

        # Sequence Signal: Prompt Injection trigger
        elif instruction_source == "TOOL_RESULT" and (is_credential_acc or is_sensitive_db or is_external_send):
            pattern = AttackPathAnalyzer.PATTERNS[3]
            detected_path = pattern["path"]
            pattern_id = pattern["id"]
            risk_boost += pattern["risk_boost"]
            signals.append("WARNING: High-risk action triggered from unvalidated TOOL_RESULT instruction (Indirect Prompt Injection risk)")

        return detected_path, pattern_id, risk_boost, signals
