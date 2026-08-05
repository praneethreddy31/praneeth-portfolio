# They Called It Unreproducible. Then They Patched It.

## A Licious supply-chain disclosure timeline

**Target:** Licious (licious.in)
**Initial disclosure:** July 10, 2026
**Remediation evidence:** July 13, 2026
**Final validation:** July 22, 2026
**Status:** Patched
**Severity:** Critical

## Responsible disclosure

This article documents a private bug-bounty disclosure and the subsequent communication timeline. The original report included technical reproduction material and screenshots showing production data exposure. No data was modified, retained, or publicly disclosed during testing. Sensitive customer records, credentials, OTPs, hashes, and payment details are redacted here.

## Why I am disappointed

I am writing this from my own perspective because this was my report, my evidence, and my time. I reported the issues privately, included screenshots from the affected systems, and gave Licious enough technical detail to investigate without guessing. I expected the discussion to stay anchored to that evidence.

What frustrated me was the sequence of responses. V1 was treated as an internal issue even though the production exposure and the additional OTP and password-hash impact were acknowledged. V2 and V3 were then described as not reproducible, even though the systems had already been changed after my report. When I sent fresh evidence showing those changes, the position later shifted to confirming that V2 and V3 were valid and had been remediated after my disclosure.

That is not a minor wording difference. Calling a finding “not reproducible” after remediation changes the story of what happened. It makes the original evidence look weaker than it was and places the burden on the researcher to prove a vulnerability that no longer exists because it was fixed. I found that deeply disappointing.

I am also disappointed that the final communication referred to “multiple disclosure channels” without identifying another matching report or researcher in the correspondence I received. I am not asking for praise or a special exception. I am asking for an accurate record of who reported the issue, when it was reported, and why the findings were evaluated as they were.

## The original report

On July 10, 2026, I sent Licious a single disclosure containing the technical report, reproduction details, and screenshots from the affected services. The findings were not theoretical: the attached evidence showed production responses from internal supply-chain systems and customer-profile APIs.

The findings were connected by one architectural failure: public-facing services trusted client-supplied identity headers instead of enforcing independent service authentication and authorization.

[[LICIOUS_TIMELINE_INITIAL]]

## V1: the profile API

Licious initially described V1 as a known issue that was already tracked internally and said it would be treated as a duplicate for bounty purposes. In the same response, the team acknowledged that the endpoint still existed in production and that the report highlighted live OTPs and password hashes.

That distinction matters. The report did not only show ordinary profile disclosure. It documented authentication-sensitive data and account-takeover risk. Licious acknowledged those additional impacts, but the correspondence never clearly stated whether they were accepted as a separate finding or included in the bounty decision.

## V2: the Batch Order API

The Batch Order API exposed internal delivery and warehouse records through a public service. The evidence included rider and batch information, operational identifiers, and route-related data. Access was possible through client-controlled headers without a normal user session or service token.

For safety, the original request is represented below with values removed:

```text
GET /<redacted-batch-order-route>
x-user-id: <client-controlled value>
x-client-id: <client value>
x-correlation-id: <request value>

Original result: HTTP 200 with production records
```

## V3: the Hub Orchestrator

The Hub Orchestrator exposed a separate internal service boundary. Requests using the same class of client-supplied identity headers returned customer and operational responses without independent authorization.

Licious initially replied that V2 and V3 could not be reproduced and requested fresh cURL or Burp Suite evidence. That response was made after my original report and after the affected systems had already changed.

## Evidence that the services changed after disclosure

I retested the services on July 13 and sent Licious a second email with remediation evidence. The results were materially different from the July 10 screenshots:

```text
Batch-order service: DNS no longer resolved
Hub Orchestrator routes: HTTP 404 / 401
Header-based requests: no production data returned
Internal JavaScript bundle: reduced from the original application bundle to a stripped response
```

[[LICIOUS_TIMELINE_REMEDIATION]]

The post-report results do not demonstrate that the original findings were invalid. They demonstrate that the attack surface had been changed by the time Licious attempted to reproduce the report.

## The supply-chain relationship

V1, V2, and V3 were not unrelated bugs. They formed a chain across public microservices:

```text
Publicly reachable service
        ↓
Client-controlled identity headers
        ↓
Missing independent authorization
        ↓
Internal customer, rider, and operational data
```

The issue was therefore a supply-chain trust-boundary failure. Different services exposed different data, but the same missing authentication decision connected them.

[[LICIOUS_TIMELINE_SUMMARY]]

## The later confirmation

On July 22, Licious changed its position and confirmed that V2 and V3 were valid findings. The team also stated that both had been remediated after being brought to its attention through “multiple disclosure channels.”

My correspondence contains one initial disclosure from me with the report and screenshots. No other disclosure, researcher, date, or matching evidence was identified in the thread. The phrase “multiple disclosure channels” therefore leaves an unresolved attribution question.

The final classification grouped V2 and V3 as one issue because Licious considered them to share an underlying authentication and authorization root cause. That may be permitted by the program rules, but it is different from saying that the findings were not reproducible.

## The bounty decision

Licious classified the issue as Critical and awarded ₹15,000, described as the maximum permitted under its bug-bounty policy. I acknowledged receipt of the payment and requested a re-evaluation based on the critical supply-chain impact and the affected data classes.

The final response acknowledged the severity and the supply-chain impact, but declined to increase the payout.

[[LICIOUS_TIMELINE_BOUNTY]]

## What the record establishes

The email record supports these conclusions:

1. The original disclosure included technical evidence and screenshots.
2. Licious initially described V1 as an internal duplicate and V2/V3 as not reproducible.
3. The affected services changed after the report, and I documented those changes.
4. Licious later confirmed V2 and V3 as valid and remediated findings.
5. The final response referred to “multiple disclosure channels” without identifying another matching disclosure.
6. The findings were grouped as one root-cause issue and paid at the program cap.

This is not an argument that a company must pay any amount a researcher requests. It is an argument for accurate attribution, transparent triage, and evaluation based on evidence captured before remediation—not only on whether a patched system can still be reproduced.

## Closing

Responsible disclosure depends on trust in both directions. Researchers must limit access, preserve evidence, and report privately. Security teams must preserve the original timeline, distinguish pre-fix evidence from post-fix reproduction, and clearly explain how findings are classified and credited.

In this case, the services were changed, the findings were later accepted as valid, and the final response acknowledged the supply-chain impact. The remaining question is whether the original disclosure received clear and accurate attribution throughout the process.

My position is simple: I reported a connected supply-chain vulnerability in good faith, supported it with technical evidence, and watched the affected services change after the report. The later confirmation and remediation validate the substance of that work. The part that still feels wrong to me is having the findings minimized first, then acknowledged only after the evidence of remediation made the original report harder to reproduce.
