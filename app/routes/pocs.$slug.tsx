import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { FaArrowLeft } from "react-icons/fa6";
import liciousReport from "../content/licious_supply_chain_article.md?raw";
import tgsrtcReport from "../content/tgsrtc_booking_portal_report.md?raw";
import { tgsrtcPaymentEvidence } from "../content/tgsrtc_evidence";
import { tgsrtcConfigEvidence } from "../content/tgsrtc_config_evidence";

const reportSlug = "licious-supply-chain-disclosure";
const tgsrtcSlug = "tgsrtc-booking-portal-disclosure";

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
  const blocks: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
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
        : params.slug === tgsrtcSlug
          ? "TGSRTC Booking Portal Disclosure — Praneeth Reddy"
        : "POC not found — Praneeth Reddy",
  },
];

export default function PocDetail() {
  const { slug } = useParams();

  if (slug !== reportSlug && slug !== tgsrtcSlug) {
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

  const report = slug === tgsrtcSlug ? tgsrtcReport : liciousReport;

  return (
    <main className="poc-page">
      <article className="poc-shell poc-raw-report">
        <Link to="/#cyber" className="poc-back">
          <FaArrowLeft /> Back to research
        </Link>
        <MarkdownReport source={report} />
      </article>
    </main>
  );
}
