from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import uuid

from app.models.schemas import (
    ToolRequest, InterceptResponse, AgentSession, ApproveDenyRequest, AuditEvent
)
from app.security.interceptor import interceptor_instance, audit_log_store, pending_approvals
from app.security.context import get_or_create_context, session_store
from app.services.simulator import AgentSimulator
from app.database.connection import engine, Base

# Initialize Database tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print("Database init exception:", e)

app = FastAPI(
    title="AgentShield API",
    description="Context-Aware Runtime Security Gateway for AI Agents",
    version="1.0.0"
)

# Enable CORS for Next.js / React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgentShield Runtime Security Middleware",
        "version": "1.0.0",
        "active_sessions": len(session_store),
        "pending_approvals": len(pending_approvals)
    }

@app.post("/api/session/start")
@app.post("/session/start")
def start_session(agent_id: str = "Production-Agent-01", task: str = "Customer Data Processing"):
    session_id = f"sess_{str(uuid.uuid4())[:8]}"
    ctx = get_or_create_context(session_id, agent_id)
    return AgentSession(
        session_id=session_id,
        agent_id=agent_id,
        status="ACTIVE",
        current_task=task,
        action_count=0,
        current_risk_score=0
    )

@app.post("/api/tool/intercept")
@app.post("/tool/intercept")
def intercept_tool_request(request: ToolRequest):
    return interceptor_instance.intercept(request)

@app.post("/api/decision/approve")
@app.post("/decision/approve")
def approve_decision(payload: ApproveDenyRequest):
    try:
        return interceptor_instance.approve_pending_request(payload.request_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/decision/deny")
@app.post("/decision/deny")
def deny_decision(payload: ApproveDenyRequest):
    try:
        return interceptor_instance.deny_pending_request(payload.request_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/session/{session_id}")
@app.get("/session/{session_id}")
def get_session(session_id: str):
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")
    ctx = session_store[session_id]
    
    actions = ctx.history
    allowed = sum(1 for a in actions if a['decision'] in ["ALLOW", "APPROVED_BY_HUMAN"])
    asked = sum(1 for a in actions if a['decision'] == "ASK")
    blocked = sum(1 for a in actions if a['decision'] in ["BLOCK", "DENIED_BY_HUMAN"])
    current_risk = actions[-1]['risk_score'] if actions else 0

    return {
        "session_id": session_id,
        "agent_id": ctx.agent_id,
        "status": "ACTIVE",
        "action_count": len(actions),
        "allowed_count": allowed,
        "asked_count": asked,
        "blocked_count": blocked,
        "current_risk_score": current_risk
    }

@app.get("/api/session/{session_id}/actions")
@app.get("/session/{session_id}/actions")
def get_session_actions(session_id: str):
    if session_id not in session_store:
        return {"session_id": session_id, "actions": [], "graph": {"nodes": [], "edges": []}}
    ctx = session_store[session_id]
    return {
        "session_id": session_id,
        "actions": ctx.history,
        "graph": ctx.get_graph()
    }

@app.get("/api/session/{session_id}/attack-path")
@app.get("/session/{session_id}/attack-path")
def get_session_attack_path(session_id: str):
    if session_id not in session_store:
        return {"session_id": session_id, "attack_path": [], "detected": False}
    ctx = session_store[session_id]
    graph = ctx.get_graph()
    
    detected_paths = [a for a in ctx.history if a['risk_score'] >= 70]
    return {
        "session_id": session_id,
        "graph": graph,
        "detected": len(detected_paths) > 0,
        "attack_path": ["Access Credentials / Sensitive Data", "Database Query", "External Network Request"] if detected_paths else []
    }

@app.get("/api/session/{session_id}/risk")
@app.get("/session/{session_id}/risk")
def get_session_risk(session_id: str):
    if session_id not in session_store:
        return {"session_id": session_id, "risk_score": 0, "level": "LOW"}
    ctx = session_store[session_id]
    current_score = ctx.history[-1]['risk_score'] if ctx.history else 0
    
    if current_score <= 39:
        level = "LOW"
    elif current_score <= 69:
        level = "MEDIUM"
    elif current_score < 85:
        level = "HIGH"
    else:
        level = "CRITICAL"

    return {
        "session_id": session_id,
        "risk_score": current_score,
        "level": level
    }

@app.get("/api/audit")
@app.get("/audit")
def get_audit_logs():
    return {
        "total_records": len(audit_log_store),
        "audit_events": list(reversed(audit_log_store))
    }

@app.get("/api/pending-approvals")
@app.get("/pending-approvals")
def get_pending_approvals():
    items = []
    for req_id, data in pending_approvals.items():
        items.append({
            "request_id": req_id,
            "session_id": data["request"].session_id,
            "tool_name": data["request"].tool_name,
            "resource": data["request"].resource,
            "risk_score": data["risk"].score,
            "explanation": data["risk"].explanation,
            "signals": data["risk"].signals,
            "timestamp": data["request"].timestamp
        })
    return {"pending_count": len(items), "requests": items}

# Scenario Endpoints
@app.post("/api/demo/scenario-1")
@app.post("/demo/scenario-1")
def run_scenario_1():
    return AgentSimulator.run_safe_scenario()

@app.post("/api/demo/scenario-2")
@app.post("/demo/scenario-2")
def run_scenario_2():
    return AgentSimulator.run_suspicious_scenario()

@app.post("/api/demo/scenario-3")
@app.post("/demo/scenario-3")
def run_scenario_3():
    return AgentSimulator.run_multistep_attack_scenario()
