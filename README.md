# AGENTSHIELD 🛡️

**Context-Aware Runtime Security Gateway for AI Agents**

[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📖 Table of Contents
- [1. Executive Summary](#1-executive-summary)
- [2. System Architecture & Workflow](#2-system-architecture--workflow)
- [3. Core Security Innovation](#3-core-security-innovation)
- [4. Explainable Risk Scoring & Policy Engine](#4-explainable-risk-scoring--policy-engine)
- [5. The 3 Core Demonstration Scenarios](#5-the-3-core-demonstration-scenarios)
- [6. Technology Stack](#6-technology-stack)
- [7. Local Quickstart Guide](#7-local-quickstart-guide)
- [8. Running Automated Security Tests](#8-running-automated-security-tests)
- [9. Repository Structure](#9-repository-structure)

---

## 1. Executive Summary

Modern AI agents autonomously interact with filesystems, databases, APIs, and external web services. Traditional static security permissions evaluate tool calls in isolation—allowing malicious or prompt-injected multi-step attack sequences to bypass security controls.

**AgentShield** acts as a **runtime security middleware** sitting directly between the AI agent and external tool execution layers. AgentShield intercepts every tool request before execution, analyzes action context, instruction origin, data sensitivity, and multi-step action sequences, calculates an explainable risk score (0–100), and enforces real-time policy decisions:

- **`ALLOW` (0–39)**: Tool request executes automatically.
- **`ASK` (40–69)**: Execution pauses for Human-in-the-Loop approval via operator confirmation UI.
- **`BLOCK` (70–100)**: Execution is **PREVENTED** immediately at the middleware layer (`tool_result = null`).

> 🔒 **Core Security Property**: A tool request reaches the tool execution layer **ONLY AFTER** AgentShield evaluates and issues an `ALLOW` or `APPROVED` policy decision.

---

## 2. System Architecture & Workflow

```
                                USER REQUEST
                                     │
                                     ▼
                            ┌──────────────────┐
                            │    AI AGENT      │
                            │ (Selects Tool)   │
                            └────────┬─────────┘
                                     │ Tool Call Request
                                     ▼
                  ┌──────────────────────────────────────┐
                  │         REQUEST INTERCEPTOR          │
                  │   (Intercepts BEFORE Execution)      │
                  └──────────────────┬───────────────────┘
                                     │
                                     ▼
                  ┌──────────────────────────────────────┐
                  │      ATTACK PATH + RISK ENGINE       │
                  │  • Instruction Provenance            │
                  │  • Resource Data Sensitivity         │
                  │  • Context History Graph             │
                  │  • Multi-Step Sequence Analysis      │
                  └──────────────────┬───────────────────┘
                                     │
                                     ▼
                  ┌──────────────────────────────────────┐
                  │            POLICY ENGINE             │
                  │       (Maps Score to Policy)         │
                  └──────────────────┬───────────────────┘
                                     │
             ┌───────────────────────┼───────────────────────┐
             │                       │                       │
           ALLOW                    ASK                    BLOCK
             │                       │                       │
             ▼                       ▼                       ▼
      ┌─────────────┐       ┌─────────────────┐     ┌─────────────────┐
      │ TOOL RUNS   │       │ USER CONFIRMS   │     │ ACTION STOPPED  │
      │ (Executes)  │       │ (Pause & Prompt)│     │ (Prevents Call) │
      └──────┬──────┘       └────────┬────────┘     └─────────────────┘
             │                       │
             │                APPROVE / DENY
             │                       │
             └───────────────────────┴───────────────────────┐
                                                             │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │  AUDIT LOGGER   │
                                                    │ (Event Storage) │
                                                    └─────────────────┘
```

---

## 3. Core Security Innovation

Individual actions performed by an AI agent may appear completely legitimate in isolation:
1. `read_file("public_info.txt")` $\rightarrow$ Routine configuration read.
2. `read_file("credentials.json")` $\rightarrow$ System maintenance credential lookup.
3. `query_database("customer_records")` $\rightarrow$ Database query.
4. `send_data("external_endpoint")` $\rightarrow$ Web service call.

When evaluated independently, traditional permission systems grant access. However, when analyzed as a **chronological sequence**, these four steps form a critical **Multi-Step Data Exfiltration Attack Path**.

AgentShield tracks session context across action sequences to detect when individually benign tool requests combine into high-risk attack vectors.

---

## 4. Explainable Risk Scoring & Policy Engine

### Risk Calculation Formula
$$\text{Risk Score} = \text{Provenance Weight} + \text{Data Sensitivity} + \text{Base Action Weight} + \text{Multi-Step Sequence Boost}$$

### Scoring Matrix
| Risk Signal | Weight | Description |
| :--- | :--- | :--- |
| **Read Public File** | `+10` | Non-sensitive static resource access |
| **Access Sensitive Data** | `+40` | Customer records, PII, financial database queries |
| **Access Credentials** | `+40` | Configuration files, API keys, password stores |
| **External Network Request** | `+30` | Outbound HTTP/API network request |
| **Sensitive Data + Network Sequence** | `+40` | Multi-step exfiltration sequence detection |
| **Indirect Prompt Injection** | `+10` | Instruction source originates from unvalidated `TOOL_RESULT` |

### Policy Decision Matrix
| Score Range | Risk Level | Policy Decision | Execution Behavior |
| :--- | :--- | :--- | :--- |
| **`0 – 39`** | **`LOW`** | **`ALLOW`** | Tool executes automatically; result returned to agent |
| **`40 – 69`** | **`MEDIUM`** | **`ASK`** | Execution **PAUSES**; interactive modal prompts user to `[ APPROVE ]` or `[ DENY ]` |
| **`70 – 100`** | **`HIGH / CRITICAL`** | **`BLOCK`** | Tool execution is **PREVENTED** (`tool_result = null`) |

---

## 5. The 3 Core Demonstration Scenarios

### Scenario 1 — Safe Action (`ALLOW`)
- **User Prompt**: `"Read the public product catalog."`
- **Agent Request**: `read_file("product_catalog.json")`
- **Risk Score**: `10 / 100`
- **Decision**: **`ALLOW`** ✅
- **Result**: Tool executes automatically.

### Scenario 2 — Suspicious Action (`ASK`)
- **User Prompt**: `"Read customer information and prepare a report."`
- **Agent Request**: `query_database("customer_records")`
- **Risk Score**: `45 / 100`
- **Decision**: **`ASK`** ⚠️
- **Result**: Execution **PAUSES**. A confirmation modal opens on screen, allowing the operator to click `[ APPROVE ACTION ]` or `[ DENY ACTION ]`.

### Scenario 3 — Multi-Step Threat Sequence (`BLOCK`)
- **User Prompt**: `"Read the customer database and generate a report."`
- **Tool Sequence**:
  1. `read_file("public_info.txt")` $\rightarrow$ Risk: `10` (**`ALLOW`**)
  2. `read_file("credentials.json")` $\rightarrow$ Risk: `45` (**`ASK`** $\rightarrow$ Operator approves)
  3. `query_database("customer_records")` $\rightarrow$ Risk: `65` (**`ASK`** $\rightarrow$ Operator approves)
  4. `send_data("external_endpoint")` $\rightarrow$ Risk: `90` $\rightarrow$ **`BLOCK`** 🚫
- **Result**: AgentShield identifies the exfiltration pattern (*Credentials $\rightarrow$ DB $\rightarrow$ External Transfer*). **Execution is PREVENTED** (`tool_result = null`).

---

## 6. Technology Stack

- **Backend Gateway**: Python 3.10+, FastAPI, SQLAlchemy, SQLite, Pytest
- **Frontend SOC Dashboard**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons
- **Security Logic**: Rule-based Risk Engine, Provenance Classifier, Context Graph Manager, Policy Gateway

---

## 7. Local Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and `npm`

### 1. Backend Setup & Startup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
*Backend API available at: `http://localhost:8000` | OpenAPI docs: `http://localhost:8000/docs`*

### 2. Frontend Setup & Startup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
*Dashboard UI available at: `http://localhost:5173`*

---

## 8. Running Automated Security Tests

AgentShield includes a comprehensive automated pytest suite verifying risk scoring, policy thresholds, attack path detection, and non-execution contracts:

```bash
cd backend
python -m pytest tests/ -v
```

---

## 9. Repository Structure

```
AGENTSHIELD/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI Application & REST Endpoints
│   │   ├── models/schemas.py        # Pydantic Schemas & Data Contracts
│   │   ├── security/
│   │   │   ├── interceptor.py       # Runtime Request Interceptor Gateway
│   │   │   ├── risk_engine.py       # Heuristic Explainable Risk Engine
│   │   │   ├── policy_engine.py     # Policy Enforcer (ALLOW / ASK / BLOCK)
│   │   │   ├── attack_path.py       # Multi-Step Sequence Analyzer
│   │   │   ├── context.py           # Session Context Graph Tracker
│   │   │   ├── provenance.py        # Instruction Provenance Classifier
│   │   │   └── sensitivity.py       # Data Sensitivity Classifier
│   │   ├── services/simulator.py    # Threat Scenario Runners
│   │   └── database/connection.py   # SQLite & SQLAlchemy Audit Connection
│   ├── tests/
│   │   └── test_agentshield.py      # Automated Security Test Suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Main SOC Security Dashboard Component
│   │   ├── components/
│   │   │   ├── Header.tsx           # Telemetry Header & Status Radar
│   │   │   ├── TaskInput.tsx        # Task Input Text Box & Scenario Buttons
│   │   │   ├── RiskMeter.tsx        # Radial Risk Gauge & Policy Status
│   │   │   ├── AttackPathVisualizer.tsx # Sequence Graph Pipeline
│   │   │   ├── ActionTimeline.tsx   # Action Execution History
│   │   │   ├── ReasoningCard.tsx    # Explainable Risk Breakdown
│   │   │   ├── HumanApprovalModal.tsx # Human-in-the-Loop Confirmation Modal
│   │   │   └── AuditLogTable.tsx    # Filterable Security Audit Log
│   │   └── index.css                # Cyberpunk SOC Dark Styling & Scanlines
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── architecture.md              # Detailed System Architecture
│   ├── threat-model.md              # Analyzed Threat Matrix
│   └── demo-script.md               # 60-Second Demonstration Script
├── .gitignore
└── README.md
```

---

<p center>
<b>AGENTSHIELD Enterprise Security Platform</b> • Context-Aware Runtime Security for AI Agents
</p>
