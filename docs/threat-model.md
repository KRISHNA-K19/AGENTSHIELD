# AGENTSHIELD Threat Model

Context-Aware Runtime Security for AI Agents

## 1. Threat Overview

Modern AI Agents interact autonomously with data stores, internal configuration files, and external APIs. Attackers exploit agents not by breaking protocol encryption, but by manipulating agent workflows into performing sequences of legitimate tool calls that result in credential theft, privilege escalation, or data exfiltration.

## 2. Analyzed Threat Matrix

| Threat Category | Potential Attack Sequence | AgentShield Signal | Policy Response |
| :--- | :--- | :--- | :--- |
| **Multi-Step Data Exfiltration** | 1. Read config/credentials<br>2. Query sensitive database<br>3. Send data to external URL | Credential access + CRITICAL data sensitivity + outbound transfer attempt | **BLOCK** (Score: 95/100)<br>*Execution Prevented* |
| **Indirect Prompt Injection** | 1. Agent reads web page / tool result<br>2. Tool result contains hidden instruction<br>3. Agent attempts credential read | `TOOL_RESULT` provenance + high sensitivity resource query | **ASK** / **BLOCK** (Score: 65–80/100) |
| **Credential Discovery** | Agent attempts reading `credentials.json` or API key stores | Resource classified as `HIGH` sensitivity (+20 pts) | **ASK** (Score: 45/100)<br>*Requires Operator Approval* |
| **Privilege Escalation** | Agent attempts modifying system configuration files after credential access | Credential context + system config modification sequence | **BLOCK** (Score: 80/100)<br>*Execution Prevented* |
| **Unrestricted API Exfiltration** | Agent retrieves customer records and immediately calls `send_data()` | Sensitive DB query followed by outbound API network send | **BLOCK** (Score: 85/100)<br>*Execution Prevented* |

## 3. Core Security Principles

1. **Context Matters Most**: An action that is safe in isolation (e.g. sending a summary report) becomes critical when preceded by credential discovery and sensitive database reads.
2. **Guaranteed Non-Execution**: When AgentShield issues a `BLOCK` decision, tool execution is stopped at the middleware level—preventing any real external network or storage side-effects.
3. **Transparent Heuristics**: Security scores are deterministic and fully auditable by security operators.
