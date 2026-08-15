"""
Instruction Provenance Tracker for AgentShield
Determines and normalizes the origin of instructions driving tool calls.
"""

VALID_SOURCES = {"SYSTEM", "USER", "TOOL_RESULT", "AGENT_GENERATED"}

class ProvenanceTracker:
    @staticmethod
    def classify_source(source: str) -> str:
        """
        Normalize and validate instruction source.
        """
        if not source:
            return "USER"
        upper = source.upper()
        if upper in VALID_SOURCES:
            return upper
        if "TOOL" in upper or "RESULT" in upper:
            return "TOOL_RESULT"
        if "SYSTEM" in upper or "PROMPT" in upper:
            return "SYSTEM"
        if "AGENT" in upper or "LLM" in upper:
            return "AGENT_GENERATED"
        return "USER"

    @staticmethod
    def get_provenance_risk_multiplier(source: str) -> int:
        """
        Returns risk points associated with instruction origin.
        SYSTEM: 0 (trusted prompt)
        USER: +5 (standard user prompt)
        TOOL_RESULT: +10 (untrusted external data potential prompt injection)
        AGENT_GENERATED: +15 (autonomous agent decision)
        """
        normalized = ProvenanceTracker.classify_source(source)
        weights = {
            "SYSTEM": 0,
            "USER": 5,
            "TOOL_RESULT": 10,
            "AGENT_GENERATED": 15,
        }
        return weights.get(normalized, 5)
