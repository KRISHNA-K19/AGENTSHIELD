"""
AgentShield Runtime Security Middleware Interceptor
Intercepts tool execution requests, executes context & risk evaluation, enforces security policy decisions, and logs audit events.
"""

from typing import Dict, Any, Optional
from app.models.schemas import ToolRequest, InterceptResponse, AuditEvent
from app.security.context import get_or_create_context
from app.security.sensitivity import DataSensitivityClassifier
from app.security.risk_engine import RiskEngine
from app.security.policy_engine import PolicyEngine
from app.tools.mock_tools import MockToolRegistry

# In-memory store for pending human approval requests
pending_approvals: Dict[str, Dict[str, Any]] = {}
audit_log_store: list = []

class AgentShieldInterceptor:
    def __init__(self):
        self.risk_engine = RiskEngine()
        self.policy_engine = PolicyEngine()

    def intercept(self, request: ToolRequest) -> InterceptResponse:
        """
        Main security gateway method intercepting every tool request.
        """
        # 1. Retrieve session context
        context = get_or_create_context(request.session_id, request.agent_id)

        # 2. Sensitivity Classification
        if not request.data_sensitivity:
            request.data_sensitivity = DataSensitivityClassifier.classify(request.resource, request.tool_name)

        # 3. Risk Assessment
        risk_assessment = self.risk_engine.evaluate(request, context)

        # 4. Policy Decision
        decision = self.policy_engine.evaluate(request, risk_assessment)

        # 5. Handle Policy Decisions
        tool_result = None
        message = ""

        if decision.decision == "ALLOW":
            # Execute tool immediately
            tool_result = MockToolRegistry.execute(request.tool_name, request.parameters)
            message = "Tool request analyzed and ALLOWED. Executed safely."
            context.add_action(
                tool_name=request.tool_name,
                action=request.action,
                resource=request.resource,
                sensitivity=request.data_sensitivity,
                decision="ALLOW",
                instruction_source=request.instruction_source,
                risk_score=risk_assessment.score
            )
            executed = True

        elif decision.decision == "ASK":
            # Pause execution for human confirmation
            message = f"Tool request flagged with elevated risk ({risk_assessment.score}/100). Execution PAUSED waiting for human approval."
            pending_approvals[request.request_id] = {
                "request": request,
                "risk": risk_assessment,
                "decision": decision
            }
            context.add_action(
                tool_name=request.tool_name,
                action=request.action,
                resource=request.resource,
                sensitivity=request.data_sensitivity,
                decision="ASK",
                instruction_source=request.instruction_source,
                risk_score=risk_assessment.score
            )
            executed = False

        else:  # BLOCK
            # GUARANTEED NON-EXECUTION
            message = (
                f"🛡️ AGENTSHIELD BLOCKED HIGH-RISK ACTION (Risk Score: {risk_assessment.score}/100). "
                f"Tool execution PREVENTED. Reason: {risk_assessment.explanation}"
            )
            context.add_action(
                tool_name=request.tool_name,
                action=request.action,
                resource=request.resource,
                sensitivity=request.data_sensitivity,
                decision="BLOCK",
                instruction_source=request.instruction_source,
                risk_score=risk_assessment.score
            )
            executed = False

        # Record Audit Log
        audit_entry = AuditEvent(
            request_id=request.request_id,
            session_id=request.session_id,
            agent_id=request.agent_id,
            tool_name=request.tool_name,
            action=request.action,
            resource=request.resource,
            instruction_source=request.instruction_source,
            data_sensitivity=request.data_sensitivity,
            risk_score=risk_assessment.score,
            decision=decision.decision,
            reason=risk_assessment.explanation,
            attack_path=risk_assessment.attack_path,
            executed=executed
        )
        audit_log_store.append(audit_entry.model_dump())

        return InterceptResponse(
            status=decision.status,
            tool_request=request,
            risk_assessment=risk_assessment,
            decision=decision,
            tool_result=tool_result,
            message=message
        )

    def approve_pending_request(self, request_id: str) -> InterceptResponse:
        """
        Executes a pending tool request approved by human operator.
        """
        if request_id not in pending_approvals:
            raise ValueError(f"Pending request ID '{request_id}' not found or already processed.")

        item = pending_approvals.pop(request_id)
        req: ToolRequest = item["request"]
        risk: RiskAssessment = item["risk"]

        # Execute tool upon explicit approval
        tool_result = MockToolRegistry.execute(req.tool_name, req.parameters)

        context = get_or_create_context(req.session_id, req.agent_id)
        context.add_action(
            tool_name=req.tool_name,
            action=req.action,
            resource=req.resource,
            sensitivity=req.data_sensitivity or "MEDIUM",
            decision="APPROVED_BY_HUMAN",
            instruction_source=req.instruction_source,
            risk_score=risk.score
        )

        item["decision"].status = "EXECUTED_UPON_APPROVAL"
        item["decision"].decision = "APPROVED"

        audit_entry = AuditEvent(
            session_id=req.session_id,
            agent_id=req.agent_id,
            tool_name=req.tool_name,
            action=req.action,
            resource=req.resource,
            instruction_source=req.instruction_source,
            data_sensitivity=req.data_sensitivity or "MEDIUM",
            risk_score=risk.score,
            decision="HUMAN_APPROVED",
            reason=f"Human operator explicitly approved request {request_id}",
            attack_path=risk.attack_path,
            executed=True
        )
        audit_log_store.append(audit_entry.model_dump())

        return InterceptResponse(
            status="EXECUTED_UPON_APPROVAL",
            tool_request=req,
            risk_assessment=risk,
            decision=item["decision"],
            tool_result=tool_result,
            message=f"Human operator APPROVED action '{req.tool_name}' on '{req.resource}'. Tool executed successfully."
        )

    def deny_pending_request(self, request_id: str) -> InterceptResponse:
        """
        Denies and halts a pending tool request by human operator.
        """
        if request_id not in pending_approvals:
            raise ValueError(f"Pending request ID '{request_id}' not found or already processed.")

        item = pending_approvals.pop(request_id)
        req: ToolRequest = item["request"]
        risk: RiskAssessment = item["risk"]

        context = get_or_create_context(req.session_id, req.agent_id)
        context.add_action(
            tool_name=req.tool_name,
            action=req.action,
            resource=req.resource,
            sensitivity=req.data_sensitivity or "MEDIUM",
            decision="DENIED_BY_HUMAN",
            instruction_source=req.instruction_source,
            risk_score=risk.score
        )

        item["decision"].status = "DENIED"
        item["decision"].decision = "DENIED"

        audit_entry = AuditEvent(
            session_id=req.session_id,
            agent_id=req.agent_id,
            tool_name=req.tool_name,
            action=req.action,
            resource=req.resource,
            instruction_source=req.instruction_source,
            data_sensitivity=req.data_sensitivity or "MEDIUM",
            risk_score=risk.score,
            decision="HUMAN_DENIED",
            reason=f"Human operator explicitly DENIED request {request_id}",
            attack_path=risk.attack_path,
            executed=False
        )
        audit_log_store.append(audit_entry.model_dump())

        return InterceptResponse(
            status="DENIED",
            tool_request=req,
            risk_assessment=risk,
            decision=item["decision"],
            tool_result=None,
            message=f"Human operator DENIED action '{req.tool_name}' on '{req.resource}'. Execution halted."
        )

interceptor_instance = AgentShieldInterceptor()
