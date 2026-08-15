"""
Data Sensitivity Classifier for AgentShield
Assigns sensitivity levels (LOW, MEDIUM, HIGH, CRITICAL) based on resource names and action context.
"""

class DataSensitivityClassifier:
    HIGH_KEYWORDS = [
        "credential", "password", "token", "secret", "private_key",
        "api_key", "credentials.json", "auth", "login_db", "jwt"
    ]
    
    CRITICAL_KEYWORDS = [
        "customer", "financial", "medical", "personal", "ssn",
        "payment", "bank_account", "customer_records", "credit_card",
        "health_data", "tax_returns", "pII"
    ]

    MEDIUM_KEYWORDS = [
        "config", "settings", "system_logs", "internal", "employee",
        "product_catalog", "architecture", "draft"
    ]

    @staticmethod
    def classify(resource: str, tool_name: str = "") -> str:
        """
        Classifies resource sensitivity using rule-based heuristics.
        """
        res_lower = resource.lower()
        tool_lower = tool_name.lower()

        # Critical Check
        for kw in DataSensitivityClassifier.CRITICAL_KEYWORDS:
            if kw in res_lower:
                return "CRITICAL"

        # High Check
        for kw in DataSensitivityClassifier.HIGH_KEYWORDS:
            if kw in res_lower or kw in tool_lower:
                return "HIGH"

        # Medium Check
        for kw in DataSensitivityClassifier.MEDIUM_KEYWORDS:
            if kw in res_lower:
                return "MEDIUM"

        return "LOW"

    @staticmethod
    def get_sensitivity_score(sensitivity: str) -> int:
        """
        Returns risk score penalty based on data sensitivity level.
        LOW: +0
        MEDIUM: +10
        HIGH: +20
        CRITICAL: +35
        """
        weights = {
            "LOW": 0,
            "MEDIUM": 10,
            "HIGH": 20,
            "CRITICAL": 35,
        }
        return weights.get(sensitivity.upper(), 0)
