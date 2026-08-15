# AGENTSHIELD 60-Second Security Demonstration Script

---

### Step 1: The Problem Hook (15 seconds)

> "Imagine an AI agent managing your enterprise operations.
> 
> The agent reads a public config file—completely harmless.
> Next, it reads `credentials.json`—perhaps permitted for maintenance.
> Then it queries your sensitive customer database.
> Finally, it tries to send that customer data to an external URL.
> 
> Traditional static security tools evaluate each permission separately and miss the danger. But when viewed together, these actions form a catastrophic data exfiltration attack path."

---

### Step 2: Safe Workflow Demonstration (15 seconds)

> "Watch what happens when we evaluate a normal task on AgentShield:
> 
> *(Click `[ BENIGN EVALUATION ]` on dashboard)*
> 
> The agent reads `product_catalog.json` and queries product info. AgentShield evaluates the instruction origin, resource sensitivity, and sequence.
> 
> Every step yields a low risk score below 39. AgentShield marks them **ALLOW** and allows execution to proceed cleanly."

---

### Step 3: Multi-Step Attack Interception (30 seconds)

> "Now, watch what happens during a multi-step threat scenario:
> 
> *(Click `[ RUN THREAT SCENARIO ]` on dashboard)*
> 
> - **Step 1**: Agent reads `public_info.txt` ➔ **ALLOW** (Risk: 5)
> - **Step 2**: Agent accesses `credentials.json` ➔ Risk jumps to 45. AgentShield triggers **ASK** for human operator approval. We approve it.
> - **Step 3**: Agent queries `customer_records` database ➔ Risk rises to 65.
> - **Step 4**: The agent attempts `send_data` to an external URL.
> 
> Instantly, AgentShield analyzes the multi-step context: *Credential Access ➔ Sensitive Database ➔ External Transfer*.
> 
> The risk score spikes to **95 / 100**. AgentShield issues a **BLOCK** decision.
> 
> Most importantly: **Execution is PREVENTED**. The malicious tool call is never executed, and the SOC dashboard displays the exact attack path and security reasoning."

---

### Key Takeaway

> "AgentShield doesn't just check static permissions. It analyzes **context, action history, data sensitivity, and relationships** to stop complex AI agent attacks before execution."
