# TGSRTC Booking Portal: Payment Integrity and Access-Control POC

**Target:** **TGSRTC Booking Portal (tgsrtcbus.in)**

**Reported:** March 13, 2026 **Status:** Patched **Severity:** Critical (P1) **Classes:** CWE-200, CWE-345, and OWASP A01:2021 Broken Access Control

## Responsible Disclosure

This technical POC is published after remediation. The report keeps the technical findings, impact, and required controls, but excludes credentials, live request paths, payloads, and passenger information.

---

## Summary

The assessment identified three connected weaknesses in the booking, payment, and ticket-retrieval flow. A browser-accessible configuration exposed payment-integration material, the checkout flow lacked sufficient server-side payment verification, and ticket data could be requested without a consistent ownership decision. Together, these findings created risk to payment integrity and passenger privacy.

## Technical Walkthrough

### 1. Payment Configuration Exposure

**Type:** CWE-200 - Exposure of Sensitive Information

The application returned payment-gateway configuration through a browser-accessible response. The exposed data included payment metadata and fields associated with merchant and signing configuration. These values were intended to support the payment integration but were available outside the server-side trust boundary.

**Location:** https://www.tgsrtcbus.in/api/cms_booking_engine.json

**Leaked Secret:** mJywM6Au3PTZ0………………….

**Validated impact:** Any cryptographic or payment-control material exposed to a browser must be treated as public. This weakens the integrity guarantees of the gateway integration and can support downstream transaction-manipulation attempts.

[[TGSRTC_CONFIG_REDACTED]]

### 2. Payment Amount Integrity Failure

**Type:** CWE-345 - Insufficient Verification of Data Integrity

The booking flow did not independently verify the provider-confirmed amount before progressing to ticket issuance. During validation, the payment checkout could be reached with a nominal ₹1 amount instead of the original fare. The relevant weakness was the trust boundary between browser-controlled booking state and the authoritative provider-side payment result.

**Proof of Concept (PoC):**

1. Extracted the leaked Salt from Finding 1.
2. Calculated a new SHA-512 Hash for a transaction of ₹1.0 instead of the original ₹1040.0.
3. Submitted the tampered request to secure.payu.in.

**Result:** The PayU gateway accepted the cryptographic signature as valid. An attacker can purchase any high-value ticket for ₹1.0.

**Validated impact:** A final server-to-server provider verification was required before issuing a ticket. The backend must compare the original booking amount, currency, gateway transaction identifier, and final payment status against the provider’s authoritative response.

[[TGSRTC_PAYMENT_SCREENSHOT]]

### 3. Ticket Object Authorization Failure

**Type:** OWASP A01:2021 - Broken Access Control

**Endpoint:** /t_tickets/conpay?OrderID=[ID] and /upi/secureVerify

Ticket references were predictable and the ticket-retrieval flow did not consistently enforce that the current authenticated user owned the requested booking. A correctly formatted order reference was treated as sufficient to return data, rather than being paired with an ownership check on the server.

**Description:** The system generated predictable, timestamp-based Transaction IDs (for example, TG260313...). The server reflected Personal Identifiable Information (PII) without verifying the user's session.

**Data Exposed:** Full Name, Mobile Number, Email Address, and Fare Details.

**Impact:** By iterating through sequential IDs, an attacker could automate the scraping of the entire passenger database for a specific date (for example, 12/02/2026).

---

## Remediation

The issues were patched after responsible disclosure. Payment material was required to move out of browser-visible configuration and into server-side secret management. Ticket issuance must depend on direct server-to-server verification of the payment provider’s final state, rather than any browser-returned payment value. Ticket data must enforce authenticated ownership for every retrieval request, and non-predictable identifiers should replace sequential or time-derived references where possible.
