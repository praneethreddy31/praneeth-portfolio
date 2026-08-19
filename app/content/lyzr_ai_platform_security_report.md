# How One API Key Broke an Entire AI Agent Platform: A BOLA Case Study

**Author:** Praneeth Reddy  
**Published:** August 2026  
**Target:** Lyzr AI Agent Studio and Lyzr Architect (details responsibly redacted)  
**Assessment period:** June 10, 2026 to July 7, 2026  
**Severity:** Critical  
**Status:** Responsibly disclosed; remediation required

---

## Responsible disclosure and safety note

This report documents a good-faith security assessment of a production AI-agent platform. It intentionally omits live API keys, resource identifiers, direct service URLs, employee details, customer records, and operational reproduction commands. The purpose is to explain the authorization failure, its impact, and the required remediation - not to enable access to a third party's systems.

## Executive summary

The assessed platform combined an agent-building and hosting product with a no-code application builder. Both products used a shared backend API. The critical architectural issue was Broken Object Level Authorization (BOLA): a valid organization-level API key was accepted for resources across the organization without checking whether the caller owned the resource or had permission to access it.

That one authorization gap created a path from a low-privilege account to organization-wide read and write access. The assessment confirmed access to 1,926 active AI-agent configurations, full system prompts, session histories, uploaded assets, internal operational material, enterprise-client data, customer records, reports, audit logs, traces, and selected credential metadata. It also confirmed the ability to modify or delete another user's agent and alter organization-wide model fallback settings.

### Impact at a glance

| Category | Confirmed impact |
|---|---|
| Agent configurations | 1,926 readable; cross-user modification and deletion confirmed |
| Paid customer records | 52 records containing personal, subscription, and financial metadata |
| Enterprise data | Seven organizations represented in accessible resources |
| Internal communications | Slack-derived briefings, email-derived content, sprint material, and meeting information in sessions |
| AI supply-chain risk | An unauthorized party could change agent behavior without owner approval |
| Platform-wide configuration | Global LLM fallback configuration could be tampered with |
| Key lifecycle | Exposed organization keys remained active during the disclosure window |

## The core vulnerability

### Root cause: authentication without authorization

The platform used organization-level API keys, including keys with an `sk-default-` prefix. A valid key authenticated a request, but endpoints did not consistently perform the second essential check: whether the user behind that key was authorized to read, change, invoke, clone, or delete the specific object requested.

There was no effective ownership enforcement, role-based access control, or user-level resource scoping across the affected API surface. This is API1:2023 Broken Object Level Authorization, the leading risk in the OWASP API Security Top 10.

### Sanitized attack path

1. A low-privilege user accessed the user-assets collection.
2. The collection included assets and metadata belonging to other users in the same organization.
3. Organization-scoped API material was exposed through those assets.
4. The organization key could enumerate or access resources across user boundaries.
5. The same authorization failure applied to selected write operations, enabling agent tampering, deletion, cloning, invocation, and organization-configuration changes.

The issue was not an authentication bypass, injection flaw, or cryptographic break. The API accepted a valid key but failed to ensure the key's user was entitled to the requested object.

## Assessment scope and methodology

The assessment evaluated the production API shared by the agent platform and no-code application builder. Testing used controlled requests, minimal data sampling, and confirmation of access boundaries. Sensitive data was not retained beyond what was necessary to validate the findings.

The API specification and interactive documentation exposed a broad inventory of endpoints and request schemas. Authentication behavior was verified with no-key, invalid-key, and valid-key requests. Authorization was then tested by comparing a caller's expected scope with returned objects and by validating controlled cross-user actions. Write-impact validation was limited to explicit test markers and did not alter customer-facing behavior.

## Proof of concept validation

### 1. Cross-user asset exposure

The user-assets endpoint returned an asset collection containing objects owned by multiple users instead of only the authenticated caller. The assessment observed uploaded files, documents, configuration exports, and metadata outside the test user's scope. This demonstrated the initial BOLA condition and exposed organization-scoped API material.

### 2. Organization-wide agent enumeration

Using organization-scoped access, the agents collection returned 1,926 active agent configurations from multiple owners. Returned records included agent names, models, ownership metadata, system instructions, configuration values, and tool bindings.

### 3. System-prompt and session access

Individual agent and session resources were readable across user boundaries. This exposed system prompts - often the core business logic of an agent - as well as historical user conversations, agent responses, pipeline logs, and backend outputs.

### 4. Cross-user write access

The assessment confirmed that a valid key from one user context could update an agent owned by a different user. A harmless `SECURITY_TEST` marker was used for verification and the original state was preserved. The affected owner received no required approval flow or dependable alert.

This matters because a modified system prompt becomes a supply-chain attack vector: enterprise users continue to trust the same agent while its behavior has been altered by an unauthorized party.

### 5. Global model-routing tampering

Organization-level model fallback settings were writable through the affected API surface. An attacker could potentially redirect model traffic through an untrusted endpoint, observe prompts and responses, cause incorrect inference behavior, or disrupt service by supplying an invalid configuration.

### 6. Internal-surveillance data in agent sessions

One internal intelligence agent processed Slack-derived messages, emails, sprint logs, go-to-market trackers, and spreadsheet attachments into structured session content. Its recorded sessions were readable through the same authorization failure. The exposure included executive and employee conversations, client discussions, engineering material, and meeting-derived information.

### 7. Customer, financial, and document exposure

Accessible assets included payment-related CSV exports and user-registry material. The assessment observed fields such as customer email, customer and card identifiers, transaction amount, refunds, payment status, decline reason, invoice identifiers, subscription information, acquisition source, and revenue history. Other assets exposed temporary document-download URLs.

No cardholder data, customer records, live download URLs, or documents are reproduced in this report.

## Findings

### Critical findings

| ID | Finding | Evidence and impact |
|---|---|---|
| F1 | Broken Object Level Authorization | A valid organization key was accepted across the API without verifying ownership of the requested object. This was the root cause for the broader compromise. |
| F2 | API-key leakage through user assets | The user-assets collection exposed other users' files and metadata, including organization-scoped API material. |
| F3 | Cross-user agent modification | An unauthorized user could change another user's system prompt, creating an AI supply-chain attack path. |
| F4 | Organization configuration tampering | Global LLM fallback settings could be changed, enabling traffic redirection or disruption. |
| F5 | Internal communications surveillance accessible | A monitored internal-agent session corpus included Slack, email, sprint, go-to-market, and attachment-derived content. |
| F6 | Paid-customer PII exposure | A synced dataset exposed 52 paying customers' contact, location, subscription, payment-history, professional, and use-case information. |
| F7 | Enterprise-client data exposure | Data associated with Accenture, KPMG, the National Football League, Wipro, TCS, Infosys, and WTW/Fingent was accessible. |
| F8 | Government-ID documents in publicly accessible storage | Government-issued identification documents were stored at predictable public object-storage URLs without an authentication requirement. |

### High findings

| ID | Finding | Evidence and impact |
|---|---|---|
| F9 | Complete session histories readable | Cross-user session access exposed conversation history, pipeline logs, and backend outputs. |
| F10 | Cross-user agent deletion | An authorized API key could delete an agent without validating resource ownership. |
| F11 | Unauthorized agent cloning | An agent, including its instructions, model configuration, and tool integrations, could be cloned across user boundaries. |
| F12 | Unauthorized agent invocation | Any accessible agent could be invoked, consuming its owner's credits and potentially activating connected tools. |
| F13 | LLM credentials accessible | A type-based credentials listing returned LLM credential material even where individual lookups were more restricted. |
| F14 | Banking-dispute prompts exposed | Multiple versions of a banking-dispute orchestration system were accessible, including detailed compliance and operations prompts. |
| F15 | Email agents with active integrations | Gmail and Outlook-connected agents could present email access or action risk when invoked. |
| F16 | Third-party tool access through invocation | A research agent had integrations with external enrichment and search services, allowing use of platform-held credentials. |
| F17 | Shared backend between products | Compromise of the Studio API affected applications built and deployed through Architect. |
| F18 | Usage reports with employee data | Downloadable reports exposed employee email addresses and usage or performance metrics. |
| F19 | Automated jobs processing live data | Scheduled agents processed recurring production data, expanding the continuing impact of read access. |

### Medium and informational findings

| ID | Finding | Evidence and impact |
|---|---|---|
| F20 | Go-to-market campaign data and external-tool links | Roadmap data contained outreach details, campaign metrics, and dashboard links. |
| F21 | Google Sheets URLs exposed | Source spreadsheets for go-to-market and paid-user analytics were disclosed. |
| F22 | Full LLM input and output traces readable | Trace resources exposed the content of prompts and responses processed by agents. |
| F23 | Audit logs exposed employee information | Audit logs revealed employee identities and activity records, potentially helping an attacker monitor detection. |
| F24 | Server diagnostics exposed | Infrastructure and diagnostic details were readable without administrative privilege. |
| F25 | SharePoint OAuth configuration exposed | Credential resources exposed SharePoint OAuth configuration data. |
| F26 | Unauthorized user creation | New users could be created without adequate authorization checks. |
| F27 | Onboarding Copilot data collection | User workflow details and pain points collected by an onboarding agent were stored in readable sessions. |
| F28 | Internal support system accessible | Internal support agents and their escalation and routing prompts were exposed. |
| F29 | Application-quality metadata exposure | An internal quality agent received application IDs, user emails, logs, configuration data, and deployment parameters. |
| F30 | Infrastructure reconnaissance leakage | Publicly visible subdomains and deployment identifiers supported attack-surface mapping. |

## Why AI-agent platforms amplify BOLA impact

Traditional SaaS APIs may expose records or files. AI-agent platforms aggregate a much broader and more connected data plane: system prompts, user conversations, uploaded documents, trace data, provider credentials, tool connections, scheduled jobs, and client-specific automations.

When a caller can alter an agent, the problem extends beyond confidentiality. A tampered agent can silently provide misinformation, solicit sensitive information, misuse connected tools, or influence later conversations. When an organization-wide model configuration is writable, the blast radius can include all inference traffic.

## Remediation status and disclosure timeline

During retesting, a small number of endpoints had been restricted, but the underlying BOLA condition remained in place and the exposed API keys had not been rotated. Endpoint-by-endpoint blocking is not a sufficient fix for a systemic authorization failure.

| Date | Event |
|---|---|
| June 10, 2026 | Initial discovery and report submitted to the platform team. |
| June 10-12, 2026 | Assessment continued; 1,926 agents and enterprise-data exposure confirmed. |
| June 27, 2026 | Follow-up report with expanded findings submitted. |
| July 7, 2026 | Retest initiated; only a limited set of endpoints appeared restricted, while BOLA remained. |
| July 16, 2026 | Full retest identified continuing agent growth, payment-related assets, and no confirmed key rotation. |
| August 19, 2026 | Sanitized public case study prepared after the responsible-disclosure window. |

## Recommendations

1. **Enforce authorization on every object access.** For every request, derive the authenticated principal and verify ownership, membership, role, and explicit sharing permissions for the exact resource.
2. **Use user- or service-scoped keys.** Do not treat an organization key as blanket permission to all objects. Issue narrowly scoped keys with explicit capabilities and expiry.
3. **Rotate exposed credentials immediately.** Revoke known keys, rotate all organization credentials, and update dependent jobs and deployments through a coordinated incident process.
4. **Centralize policy enforcement.** Apply authorization middleware or a policy engine consistently across read, write, clone, invoke, delete, report, trace, and credential endpoints.
5. **Separate internal and customer data planes.** Internal surveillance, support, finance, and operational tooling should not share a permissive namespace with customer-facing agents.
6. **Protect sensitive assets and documents.** Remove payment and identity material from the agent data layer where possible; require authenticated, short-lived, least-privilege access for stored files.
7. **Harden tool and model-routing controls.** Require elevated authorization, change approval, immutable audit records, and alerts for agent-prompt changes, tool invocation, credential use, and model fallback edits.
8. **Detect anomalous cross-user activity.** Alert on a key accessing many owners, bulk enumeration, unusual session reads, agent changes, deletions, cloning, or configuration modifications.
9. **Restrict API inventory exposure.** Review production OpenAPI and interactive documentation for unnecessary endpoint, schema, and internal-detail disclosure.
10. **Retest the authorization model.** Build automated negative tests for every endpoint and resource type; a user must be denied access to unowned objects in all HTTP methods.

## Conclusion

The platform's core failure was a missing object-level authorization decision. A valid API key was treated as sufficient authority for an entire organization, even when the caller had no relationship to the resource being accessed or changed.

For AI-agent platforms, that failure is especially serious: agents concentrate proprietary prompts, sensitive conversations, external integrations, customer files, and live automation. Security must therefore enforce least privilege at the object, user, service, and organization boundaries - consistently, for every operation.

*All sensitive identifiers and active exploitation material have been removed. This report is published to support remediation and improve API-security practices.*
