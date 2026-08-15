from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime
from datetime import datetime
from app.database.connection import Base

class DBItemSession(Base):
    __tablename__ = "sessions"

    session_id = Column(String, primary_key=True, index=True)
    agent_id = Column(String, default="Demo-Agent-01")
    status = Column(String, default="ACTIVE")
    current_task = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    action_count = Column(Integer, default=0)
    allowed_count = Column(Integer, default=0)
    asked_count = Column(Integer, default=0)
    blocked_count = Column(Integer, default=0)
    current_risk_score = Column(Integer, default=0)

class DBItemAction(Base):
    __tablename__ = "action_history"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, index=True)
    sequence_num = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    tool_name = Column(String)
    action = Column(String)
    resource = Column(String)
    instruction_source = Column(String)
    data_sensitivity = Column(String)
    risk_score = Column(Integer)
    decision = Column(String)
    status = Column(String)
    parameters_json = Column(Text, default="{}")

class DBItemAudit(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    session_id = Column(String, index=True)
    agent_id = Column(String)
    tool_name = Column(String)
    action = Column(String)
    resource = Column(String)
    instruction_source = Column(String)
    data_sensitivity = Column(String)
    risk_score = Column(Integer)
    decision = Column(String)
    reason = Column(Text)
    attack_path_json = Column(Text, default="[]")
    executed = Column(Boolean, default=False)
