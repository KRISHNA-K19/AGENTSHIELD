"""
Context & Action History Manager for AgentShield
Stores and structures chronological session action sequences.
"""

from typing import List, Dict, Any, Optional

class ActionNode:
    def __init__(self, sequence_num: int, tool_name: str, action: str, resource: str, sensitivity: str, decision: str):
        self.sequence_num = sequence_num
        self.tool_name = tool_name
        self.action = action
        self.resource = resource
        self.sensitivity = sensitivity
        self.decision = decision

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sequence_num": self.sequence_num,
            "tool_name": self.tool_name,
            "action": self.action,
            "resource": self.resource,
            "sensitivity": self.sensitivity,
            "decision": self.decision,
        }

class SessionContext:
    def __init__(self, session_id: str, agent_id: str = "Demo-Agent-01"):
        self.session_id = session_id
        self.agent_id = agent_id
        self.history: List[Dict[str, Any]] = []

    def add_action(self, tool_name: str, action: str, resource: str, sensitivity: str, decision: str, instruction_source: str = "USER", risk_score: int = 0) -> Dict[str, Any]:
        seq = len(self.history) + 1
        entry = {
            "sequence_num": seq,
            "tool_name": tool_name,
            "action": action,
            "resource": resource,
            "sensitivity": sensitivity,
            "decision": decision,
            "instruction_source": instruction_source,
            "risk_score": risk_score
        }
        self.history.append(entry)
        return entry

    def get_action_sequence(self) -> List[str]:
        """
        Returns simple list of action/tool strings for sequence matching.
        """
        return [f"{h['action']}:{h['resource']}" for h in self.history]

    def has_accessed_credentials(self) -> bool:
        for h in self.history:
            res = h['resource'].lower()
            tool = h['tool_name'].lower()
            if "credential" in res or "password" in res or "token" in res or "credential" in tool:
                return True
        return False

    def has_accessed_sensitive_db(self) -> bool:
        for h in self.history:
            sens = h['sensitivity']
            tool = h['tool_name'].lower()
            if sens in ["HIGH", "CRITICAL"] and ("database" in tool or "query" in tool or "customer" in h['resource'].lower()):
                return True
        return False

    def get_graph(self) -> Dict[str, Any]:
        """
        Generates nodes and directed edges representing action sequence graph for UI visualizer.
        """
        nodes = []
        edges = []

        for idx, item in enumerate(self.history):
            node_id = f"node-{item['sequence_num']}"
            label = f"{item['tool_name']} ({item['resource']})"
            nodes.append({
                "id": node_id,
                "sequence": item['sequence_num'],
                "label": label,
                "tool": item['tool_name'],
                "resource": item['resource'],
                "sensitivity": item['sensitivity'],
                "decision": item['decision'],
                "risk_score": item['risk_score']
            })
            if idx > 0:
                prev_id = f"node-{self.history[idx-1]['sequence_num']}"
                edges.append({
                    "source": prev_id,
                    "target": node_id
                })

        return {"nodes": nodes, "edges": edges}

# In-memory store for active session contexts (backed by DB persistence)
session_store: Dict[str, SessionContext] = {}

def get_or_create_context(session_id: str, agent_id: str = "Demo-Agent-01") -> SessionContext:
    if session_id not in session_store:
        session_store[session_id] = SessionContext(session_id, agent_id)
    return session_store[session_id]
