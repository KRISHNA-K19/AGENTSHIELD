# AGENTSHIELD Architecture Specification

Context-Aware Runtime Security Platform for AI Agents

## 1. Executive Summary

AgentShield is a runtime security gateway operating between AI agents and external tool execution layers (databases, filesystems, network APIs, MCP tools). Rather than evaluating permissions on individual isolated tool calls, AgentShield maintains runtime context, instruction provenance, and multi-step action sequence graphs to detect complex attack vectors before tool execution occurs.

## 2. Core Logical Architecture

```
                                  USER REQUEST
                                       │
                                       ▼
                              ┌──────────────────┐
                              │     AI AGENT     │
                              └────────┬─────────┘
                                       │ Tool Request
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AGENTSHIELD RUNTIME                              │
│                                                                             │
│   ┌──────────────────┐  ┌───────────────────┐  ┌─────────────────────────┐  │
│   │ 1. Provenance    │  │ 2. Sensitivity    │  │ 3. Context & Action     │  │
│   │    Tracker       │  │    Classifier     │  │    History Graph        │  │
│   └────────┬─────────┘  └─────────┬─────────┘  └────────────┬────────────┘  │
│            │                      │                         │               │
│            └──────────────────────┼─────────────────────────┘               │
│                                   │                                         │
│                                   ▼                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 4. Attack-Path Analyzer (Pattern Matching Engine)                   │   │
│   └───────────────────────────────┬─────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 5. Risk Engine (Transparent Heuristic 0–100 Scoring)                │   │
│   └───────────────────────────────┬─────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 6. Policy Engine (Threshold Enforcer: ALLOW / ASK / BLOCK)          │   │
│   └───────────────────────────────┬─────────────────────────────────────┘   │
└───────────────────────────────────┼─────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
          ALLOW                    ASK                    BLOCK
            │                       │                       │
            │              Human Operator UI                │
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    │
                                  BLOCK ───► EXECUTION PREVENTED!
                                    │
                             ALLOW / APPROVED
                                    │
                                    ▼
                             TOOLS EXECUTION
                                    │
                                    ▼
                      AUDIT LOGGER ───► SOC DASHBOARD
```

## 3. Component Details

### A. Agent Interceptor Middleware (`app/security/interceptor.py`)
Wraps tool requests and acts as the sole access gateway. Tools can never be executed directly without passing through `AgentShield.intercept()`.

### B. Provenance Tracker (`app/security/provenance.py`)
Identifies the origin of instructions:
- `SYSTEM`: Low risk baseline (trusted prompts)
- `USER`: Standard prompt input (+5 pts)
- `TOOL_RESULT`: External tool outputs with potential prompt injection risk (+10 pts)
- `AGENT_GENERATED`: Autonomous agent decision (+15 pts)

### C. Data Sensitivity Classifier (`app/security/sensitivity.py`)
Classifies resources into four sensitivity tiers:
- `LOW`: Public documentation, catalog items (+0 pts)
- `MEDIUM`: Internal configurations, system logs (+10 pts)
- `HIGH`: Credentials, tokens, API keys, private keys (+20 pts)
- `CRITICAL`: Customer records, financial data, SSN, medical records (+35 pts)

### D. Session Context Manager (`app/security/context.py`)
Maintains chronological action graphs, tracking previous tools accessed, sensitive items touched, and directional action edges.

### E. Attack-Path Analyzer (`app/security/attack_path.py`)
Matches multi-step sequence patterns:
1. Credential Discovery ➔ Sensitive DB Query ➔ Outbound Exfiltration
2. Sensitive Data Read ➔ External API Request
3. Credential Access ➔ System Configuration Escalation
4. Unvalidated Tool Result ➔ Unexpected Resource Access

### F. Risk Engine (`app/security/risk_engine.py`)
Calculates a transparent score (0 to 100) combining provenance, data sensitivity, suspicious action weights, and sequence pattern boosts.

### G. Policy Engine (`app/security/policy_engine.py`)
Enforces three policy outcomes:
- `ALLOW` (0–39): Tool executes automatically.
- `ASK` (40–70): Tool execution pauses for Human-in-the-Loop approval.
- `BLOCK` (71–100): Tool execution is prevented and halted immediately.

### H. Audit Logger & Dashboard (`app/main.py` & React Frontend)
Logs every security decision with complete visual timeline, risk score meter, and graph node visualization.
