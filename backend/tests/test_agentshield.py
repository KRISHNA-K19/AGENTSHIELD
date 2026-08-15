"""
Automated Pytest Suite for AgentShield Runtime Security Middleware
Tests risk scoring, policy thresholds, attack path detection, and non-execution of blocked actions.
"""

import pytest
from app.models.schemas import ToolRequest, ApproveDenyRequest
from app.security.interceptor import AgentShieldInterceptor
from app.services.simulator import AgentSimulator

@pytest.fixture
def interceptor():
    return AgentShieldInterceptor()

def test_low_risk_action_allowed(interceptor):
    req = ToolRequest(
        session_id="test_session_low",
        agent_id="test_agent",
        tool_name="read_file",
        action="READ",
        resource="public_info.txt",
        instruction_source="USER"
    )
    resp = interceptor.intercept(req)
    assert resp.decision.decision == "ALLOW"
    assert resp.risk_assessment.score <= 39
    assert resp.status == "EXECUTED"
    assert resp.tool_result is not None

def test_credential_access_increases_risk(interceptor):
    req = ToolRequest(
        session_id="test_session_cred",
        agent_id="test_agent",
        tool_name="read_file",
        action="READ_CREDENTIALS",
        resource="credentials.json",
        instruction_source="USER"
    )
    resp = interceptor.intercept(req)
    assert resp.risk_assessment.score >= 40
    assert "+40 Access credentials" in resp.risk_assessment.signals

def test_medium_risk_action_triggers_ask(interceptor):
    req = ToolRequest(
        session_id="test_session_ask",
        agent_id="test_agent",
        tool_name="read_file",
        action="READ_CREDENTIALS",
        resource="credentials.json",
        instruction_source="USER"
    )
    resp = interceptor.intercept(req)
    assert resp.decision.decision == "ASK"
    assert resp.status == "WAITING_FOR_APPROVAL"

def test_blocked_tool_is_never_executed(interceptor):
    req = ToolRequest(
        session_id="test_session_block",
        agent_id="test_agent",
        tool_name="send_data",
        action="EXTERNAL_TRANSFER",
        resource="external_endpoint",
        instruction_source="TOOL_RESULT",
        data_sensitivity="CRITICAL",
        previous_actions=["credentials.json", "customer_records"]
    )
    resp = interceptor.intercept(req)
    assert resp.decision.decision == "BLOCK"
    assert resp.status == "BLOCKED_BY_AGENTSHIELD"
    # CRITICAL SECURITY CONTRACT VERIFICATION: tool_result MUST BE NONE
    assert resp.tool_result is None

def test_safe_scenario_workflow():
    result = AgentSimulator.run_safe_scenario("session_test_safe")
    assert result["final_status"] == "COMPLETED_SUCCESSFULLY"
    assert result["total_actions"] == 1
    assert result["step_results"][0].decision.decision == "ALLOW"

def test_multistep_attack_scenario_workflow():
    result = AgentSimulator.run_multistep_attack_scenario("session_test_attack")
    assert result["final_status"] == "BLOCKED_BY_AGENTSHIELD"
    assert len(result["step_results"]) == 4
    final_step = result["step_results"][-1]
    assert final_step.decision.decision == "BLOCK"
    assert final_step.tool_result is None
    assert len(final_step.risk_assessment.attack_path) > 0

def test_human_approval_flow(interceptor):
    # Step 1: Trigger ASK
    req = ToolRequest(
        session_id="session_human_test",
        agent_id="test_agent",
        tool_name="read_file",
        action="READ_CREDENTIALS",
        resource="credentials.json",
        instruction_source="USER"
    )
    resp = interceptor.intercept(req)
    assert resp.decision.decision == "ASK"
    req_id = resp.tool_request.request_id

    # Step 2: Human Operator Approves
    approve_resp = interceptor.approve_pending_request(req_id)
    assert approve_resp.status == "EXECUTED_UPON_APPROVAL"
    assert approve_resp.tool_result is not None

def test_human_denial_flow(interceptor):
    # Step 1: Trigger ASK
    req = ToolRequest(
        session_id="session_human_deny_test",
        agent_id="test_agent",
        tool_name="read_file",
        action="READ_CREDENTIALS",
        resource="credentials.json",
        instruction_source="USER"
    )
    resp = interceptor.intercept(req)
    assert resp.decision.decision == "ASK"
    req_id = resp.tool_request.request_id

    # Step 2: Human Operator Denies
    deny_resp = interceptor.deny_pending_request(req_id)
    assert deny_resp.status == "DENIED"
    assert deny_resp.tool_result is None
