import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { FaArrowLeft } from "react-icons/fa6";
import { Fragment, type ReactNode } from "react";
import liciousReport from "../content/licious_supply_chain_article.md?raw";
import liciousTimelineReport from "../content/licious_disclosure_timeline.md?raw";
import tgsrtcReport from "../content/tgsrtc_booking_portal_report.md?raw";
import lyzrReport from "/Users/praneethreddy/Downloads/poc_blog_post.md?raw";
import { tgsrtcPaymentEvidence } from "../content/tgsrtc_evidence";
import { tgsrtcConfigEvidence } from "../content/tgsrtc_config_evidence";

const reportSlug = "licious-supply-chain-disclosure";
const liciousTimelineSlug = "licious-disclosure-timeline";
const tgsrtcSlug = "tgsrtc-booking-portal-disclosure";
const lyzrSlug = "lyzr-ai";
const legacyLyzrSlug = "lyzr-ai-platform-bola-disclosure";

function formatInline(value: string) {
  const cleaned = value
    .replace(/[—–]|--/g, " ")
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const parts = cleaned.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function MarkdownReport({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line === "[[LYZR_ATTACK_CHAIN]]") {
      blocks.push(
        <Fragment key="lyzr-attack-overview">
          <figure className="report-evidence" key="lyzr-attack-chain">
            <img
              src="/images/pocs/lyzr-ai-attack-chain.jpg"
              alt="Diagram of the Lyzr AI BOLA attack chain, from a free account to internal data access and agent tampering"
              loading="eager"
            />
            <figcaption>
              Simplified Lyzr.ai attack-chain overview. Sensitive names and identifiers are redacted in the supplied evidence.
            </figcaption>
          </figure>
          <figure className="report-flowchart" key="lyzr-attack-flow">
            <figcaption>How the Lyzr.ai authorization failure expands into a full compromise</figcaption>
            <pre className="report-flowchart-code">{`ATTACKER (free account, one API key)
    |
    |--- READS inward (internal leaks)
    |       |
    |       +---> Shadow Agent sessions (Slack messages, DMs)
    |       +---> Meeting recordings (client names, emails)
    |       +---> Linear tickets (engineering plans)
    |       +---> Revenue docs, GTM roadmap
    |       +---> Stripe payment CSVs (card IDs, customer emails)
    |       +---> Fundraising status
    |
    |--- WRITES outward (supply chain poison)
            |
            +---> Modify KPMG news agent (feed false intelligence)
            +---> Modify NFL travel agent (leak corporate policies)
            +---> Modify WTW finance agent (manipulate outputs)
            +---> Modify any of 2,041 agents silently
            +---> Reroute ALL LLM traffic via fallback config`}</pre>
          </figure>
          <section className="report-plain-summary" key="lyzr-plain-summary">
            <span>In plain English</span>
            <h2>What this could mean for ordinary people</h2>
            <ul>
              <li><strong>A free account could become a master key.</strong> Someone who should only see their own work could potentially reach company-wide material.</li>
              <li><strong>Private business information could become readable.</strong> Messages, meeting notes, customer records, payment-related files, and plans could be exposed.</li>
              <li><strong>Trusted AI assistants could be changed in secret.</strong> A customer might keep using the same assistant without knowing its answers or actions had been altered.</li>
              <li><strong>The effect could spread beyond Lyzr.ai.</strong> Connected email, spreadsheet, calendar, and research tools may turn one platform problem into a wider business risk.</li>
            </ul>
          </section>
        </Fragment>
      );
      index += 1;
      continue;
    }

    if (line === "[[TGSRTC_CONFIG_REDACTED]]") {
      blocks.push(
        <figure className="report-evidence" key={`config-${index}`}>
          <img src={tgsrtcConfigEvidence} alt="Redacted payment configuration evidence from the TGSRTC assessment" />
          <figcaption>Configuration evidence. Sensitive values are redacted in the supplied screenshot.</figcaption>
        </figure>
      );
      index += 1;
      continue;
    }

    if (line === "[[TGSRTC_PAYMENT_SCREENSHOT]]") {
      blocks.push(
        <figure className="report-evidence" key={`payment-${index}`}>
          <img src={tgsrtcPaymentEvidence} alt="TGSRTC checkout shown with a ₹1 payable amount" />
          <figcaption>Checkout evidence captured during the assessment. Sensitive details are not shown.</figcaption>
        </figure>
      );
      index += 1;
      continue;
    }

    if (line === "[[LICIOUS_VULNERABILITY_CHAIN]]") {
      blocks.push(
        <figure className="report-evidence" key={`licious-chain-${index}`}>
          <img
            src="/images/pocs/licious-security-vulnerability-chain.jpg"
            alt="Diagram showing the Licious security vulnerability chain from exposed internal services to customer profiles"
            loading="lazy"
          />
          <figcaption>Overview of the patched vulnerability chain documented in this report.</figcaption>
        </figure>
      );
      index += 1;
      continue;
    }

    const timelineEvidence: Record<string, { src: string; alt: string; caption: string }> = {
      "[[LICIOUS_TIMELINE_INITIAL]]": {
        src: "/images/pocs/licious-evidence/v1-v2-initial-response.png",
        alt: "Licious security response calling V1 a duplicate and V2 and V3 not reproducible",
        caption: "Initial triage response dated July 13, 2026. Sensitive account details are not shown.",
      },
      "[[LICIOUS_TIMELINE_REMEDIATION]]": {
        src: "/images/pocs/licious-evidence/remediation-evidence.png",
        alt: "Redacted remediation evidence showing DNS, HTTP, and JavaScript bundle changes",
        caption: "Post-report remediation checks recorded on July 13, 2026.",
      },
      "[[LICIOUS_TIMELINE_SUMMARY]]": {
        src: "/images/pocs/licious-evidence/researcher-summary.png",
        alt: "Redacted researcher summary describing the combined supply-chain impact",
        caption: "Researcher summary explaining the shared trust-boundary failure across V1, V2, and V3.",
      },
      "[[LICIOUS_TIMELINE_BOUNTY]]": {
        src: "/images/pocs/licious-evidence/bounty-response.png",
        alt: "Redacted Licious response describing the bounty cap and supply-chain impact",
        caption: "Final bounty response acknowledging the supply-chain impact and ₹15,000 program cap.",
      },
    };
    if (timelineEvidence[line]) {
      const evidence = timelineEvidence[line];
      blocks.push(
        <figure className="report-evidence timeline-evidence" key={`${line}-${index}`}>
          <img src={evidence.src} alt={evidence.alt} loading="lazy" />
          <figcaption>{evidence.caption}</figcaption>
        </figure>
      );
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3);
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push(
        <div
          className={`terminal-code ${
            language === "bash" || language === "json" ? "" : "plain-code"
          }`}
          key={`code-${index}`}
        >
          {language && <span>{language}</span>}
          <pre>{code.join("\n")}</pre>
        </div>
      );
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Tag = (`h${heading[1].length}` as "h1" | "h2" | "h3");
      blocks.push(<Tag key={`heading-${index}`}>{formatInline(heading[2])}</Tag>);
      index += 1;
      continue;
    }

    if (/^---+$/.test(line)) {
      blocks.push(<hr key={`rule-${index}`} />);
      index += 1;
      continue;
    }

    const metadata = [
      ...line.matchAll(/\*\*([^*]+):\*\*\s*(.*?)(?=\s+\*\*[^*]+:\*\*|$)/g),
    ];
    if (metadata.length && /^(Target|Date of Discovery|Date of Patch|Date of Report|Reported|Status|Severity|Classes|Findings)$/.test(metadata[0][1])) {
      blocks.push(
        <div className="report-meta-line" key={`meta-${index}`}>
          {metadata.map(([, label, value]) => (
            <span key={label}>
              <b>{label}:</b> {formatInline(value)}
            </span>
          ))}
        </div>
      );
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(<ul key={`list-${index}`}>{items.map((item) => <li key={item}>{formatInline(item)}</li>)}</ul>);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(<ol key={`list-${index}`}>{items.map((item) => <li key={item}>{formatInline(item)}</li>)}</ol>);
      continue;
    }

    if (line.includes("|")) {
      const table: string[] = [];
      while (index < lines.length && lines[index].includes("|")) {
        table.push(lines[index]);
        index += 1;
      }
      const rows = table
        .filter((row) => !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(row))
        .map((row) => row.replace(/^\s*\||\|\s*$/g, "").split("|").map((cell) => cell.trim()));
      const [header, ...body] = rows;
      blocks.push(
        <div className="markdown-table" key={`table-${index}`}>
          <table>
            <thead><tr>{header.map((cell) => <th key={cell}>{formatInline(cell)}</th>)}</tr></thead>
            <tbody>{body.map((row, rowIndex) => <tr key={`row-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{formatInline(cell)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].startsWith("```") &&
      !/^(#{1,3})\s+/.test(lines[index]) &&
      !/^---+$/.test(lines[index]) &&
      !/^[-*]\s+/.test(lines[index]) &&
      !/^\d+\.\s+/.test(lines[index]) &&
      !lines[index].includes("|")
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`}>{formatInline(paragraph.join(" "))}</p>);
  }

  return <div className="report-markdown">{blocks}</div>;
}

export const meta: MetaFunction = ({ params }) => [
  {
    title:
      params.slug === reportSlug
        ? "Licious Supply-chain Disclosure — Praneeth Reddy"
        : params.slug === liciousTimelineSlug
          ? "They Called It Unreproducible — Praneeth Reddy"
        : params.slug === tgsrtcSlug
          ? "TGSRTC Booking Portal Disclosure — Praneeth Reddy"
        : params.slug === lyzrSlug || params.slug === legacyLyzrSlug
          ? "Lyzr.ai — Praneeth Reddy"
        : "POC not found — Praneeth Reddy",
  },
];

export default function PocDetail() {
  const { slug } = useParams();

  const isLyzrReport = slug === lyzrSlug || slug === legacyLyzrSlug;

  if (slug !== reportSlug && slug !== liciousTimelineSlug && slug !== tgsrtcSlug && !isLyzrReport) {
    return (
      <main className="poc-page">
        <section className="poc-shell">
          <Link to="/#cyber" className="poc-back">
            <FaArrowLeft /> Back to research
          </Link>
          <h1>POC not found.</h1>
        </section>
      </main>
    );
  }

  const report = slug === tgsrtcSlug
    ? tgsrtcReport
    : slug === liciousTimelineSlug
      ? liciousTimelineReport
    : isLyzrReport
        ? lyzrReport
          .replace(
            "# How One API Key Broke an Entire AI Agent Platform: A BOLA Case Study",
            "# The Key That Opened an Entire AI Agent Company: LYZR.AI"
          )
          .replace(
            "**Author:** Praneeth Reddy\n**Published:** August 2026\n**Tags:** API Security, BOLA, OWASP Top 10, AI Security, Supply Chain Attack",
            "**Target:** Lyzr.ai  **Date of Discovery:** June 10, 2026  **Date of Report:** August 2026  **Status:** Responsibly disclosed  **Severity:** Critical  **Author:** Praneeth Reddy"
          )
          .replace(
            "During a security assessment of a production AI agent platform (details redacted)",
            "During a security assessment of Lyzr.ai's production AI agent platform (details redacted)"
          )
          .replace("## Phase 1: Reconnaissance (Zero Authentication Required)", "[[LYZR_ATTACK_CHAIN]]\n\n## Phase 1: Reconnaissance of the Lyzr.ai API\n\nThe first step was simply understanding what Lyzr.ai had placed on the public internet. No account or special access was required to map the available API surface and learn how its resources were structured.")
          .replace("## Phase 2: The Entry Point (BOLA on User Assets)", "## Phase 2: The Entry Point - BOLA on Lyzr.ai User Assets\n\nThis was the first broken boundary: a normal account could see uploaded assets that belonged to other people. That turned a routine file-listing feature into the starting point for wider access.")
          .replace("## Phase 3: Full Enumeration", "## Phase 3: Lyzr.ai Organization-Wide Enumeration\n\nOnce the organization-level key was available, the platform treated it like a master key. The assessment could list and inspect agents, prompts, sessions, and configuration across user boundaries.")
          .replace("## Phase 4: The Surveillance Agent", "## Phase 4: Lyzr.ai Internal Surveillance Agent\n\nThe impact was not limited to application settings. Internal communications had already been collected and organized by an AI agent, making sensitive company context easy to retrieve from session history.")
          .replace("## Phase 5: The Supply Chain Attack", "## Phase 5: Supply-Chain Impact on Lyzr.ai Customers\n\nThe risk changed from reading data to changing what customers receive. An unauthorized prompt edit could quietly alter a trusted agent's answers, actions, or use of connected tools.")
          .replace("## Phase 6: Financial and Payment Data", "## Phase 6: Lyzr.ai Financial and Payment Data\n\nThe accessible assets also included business and payment-related material. This shows why an AI platform must protect uploaded data with the same care as a finance or customer-data system.")
          .replace("## Phase 7: Operational Intelligence", "## Phase 7: Lyzr.ai Operational Intelligence\n\nThe same access path exposed the company's operational picture: who was active, what agents cost, and whether unusual activity might be noticed. That information can make an incident harder to detect and contain.")
          .replace("## Phase 8: OAuth and Integration Exposure", "## Phase 8: Lyzr.ai OAuth and Integration Exposure\n\nConnected services extend the impact beyond Lyzr.ai itself. If an attacker can invoke an agent with trusted integrations, the agent can become a bridge to email, spreadsheets, calendars, and other business systems.")
          .replace("## The Remediation Gap", "## The Lyzr.ai Remediation Gap")
          .replace("## Summary of Findings", "## Lyzr.ai Summary of Findings")
          .replace("## Conclusion", "## Conclusion: Authorization at Lyzr.ai")
        : liciousReport;

  return (
    <main className="poc-page">
      <article className="poc-shell poc-raw-report">
        <Link to="/#cyber" className="poc-back">
          <FaArrowLeft /> Back to research
        </Link>
        {(slug === reportSlug || slug === liciousTimelineSlug) && (
          <div className="poc-brand-mark" aria-label="Licious">
            <img
              src="/images/poc-logos/licious-logo.png"
              alt="Licious"
              width="150"
              height="55"
              loading="eager"
            />
          </div>
        )}
        {isLyzrReport && (
          <div className="poc-brand-mark" aria-label="Lyzr AI">
            <img
              src="/images/company-logos/lyzr-ai.png"
              alt="Lyzr AI"
              width="150"
              height="55"
              loading="eager"
            />
          </div>
        )}
        <MarkdownReport source={report} />
      </article>
    </main>
  );
}
