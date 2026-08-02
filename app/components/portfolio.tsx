import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  FaArrowRight,
  FaBookOpen,
  FaEnvelope,
  FaFilm,
  FaGraduationCap,
  FaHouse,
  FaMagnifyingGlass,
  FaPlay,
  FaShieldHalved,
  FaXTwitter,
} from "react-icons/fa6";
import { FloatingDock } from "./ui/floating-dock";
import { CardBody, CardContainer, CardItem } from "./ui/three-d-card";
import { StatefulButton } from "./ui/stateful-button";
import { DraggableCardBody, DraggableCardContainer } from "./ui/draggable-card";
import { FollowerPointerCard } from "./ui/following-pointer";
import type { LetterboxdEntry } from "../lib/letterboxd.server";

const _projects = [
  {
    title: "Sentinel",
    type: "AI",
    desc: "An intelligent security copilot that turns noisy logs into explainable investigations.",
    tags: ["Python", "LLMs", "RAG"],
    color: "blue",
  },
  {
    title: "VectorShield",
    type: "Cybersecurity",
    desc: "A practical playground for identifying and defending against prompt-injection attacks.",
    tags: ["Security", "FastAPI", "Red Team"],
    color: "violet",
  },
  {
    title: "AgentForge",
    type: "Open Source",
    desc: "A composable workspace for prototyping reliable, tool-using AI agents.",
    tags: ["LangGraph", "MCP", "TypeScript"],
    color: "cyan",
  },
  {
    title: "Signal",
    type: "Research",
    desc: "Threat intelligence visualization for uncovering relationships across signals and sources.",
    tags: ["Graph ML", "React", "OSINT"],
    color: "emerald",
  },
];
const articles = [
  {
    kind: "ARTICLE",
    source: "Elastic Security Labs",
    title:
      "New North Korean campaign uses fake coding interviews to steal developer credentials",
    date: "Jul 18, 2026",
    tags: ["Threat Intel", "Malware"],
    href: "https://www.elastic.co/security-labs/contagious-interview-malware-svg-steganography",
    excerpt:
      "A DPRK-aligned campaign hides malware in SVG image files inside fake coding challenges, targeting developers and their credentials.",
    media: "site",
    previewBrand: "elastic",
    previewDomain: "elastic.co",
    previewHeadline: "Contagious Interview malware in SVG images",
    previewTag: "Security Labs",
  },
  {
    kind: "POST",
    source: "Waterloo Intern",
    title: "A note worth keeping from Waterloo Intern",
    date: "View on X",
    tags: ["Career", "Perspective"],
    href: "https://x.com/waterloo_intern/status/2081762065392541951",
    excerpt:
      "A saved post from Waterloo Intern — open the original thread on X.",
    media: "x",
    previewBrand: "𝕏  Waterloo Intern",
    previewDomain: "x.com",
    previewHeadline: "Open the original post and join the conversation.",
    previewTag: "View post",
  },
  {
    kind: "ARTICLE",
    source: "OpenAI",
    title:
      "OpenAI and Hugging Face partner to address security incident during model evaluation",
    date: "Jul 21, 2026",
    tags: ["AI Safety", "Security"],
    href: "https://openai.com/index/hugging-face-model-evaluation-security-incident/",
    excerpt:
      "A detailed incident update on advanced cyber-capability evaluations, containment, and the safeguards needed as models become more capable.",
    media: "site",
    previewBrand: "OpenAI",
    previewDomain: "openai.com",
    previewHeadline: "Security incident during model evaluation",
    previewTag: "Security update",
  },
  {
    kind: "VIDEO",
    source: "YouTube · SpaceX",
    title: "Starship — Critical Path",
    date: "Watch on YouTube",
    tags: ["Space", "Engineering"],
    href: "https://youtu.be/-a0ecQMq-rM",
    excerpt:
      "A SpaceX documentary following the engineers, test flights, and hard-won decisions behind Starship’s next chapter.",
    media: "video",
    thumbnail: "https://i.ytimg.com/vi/-a0ecQMq-rM/maxresdefault.jpg",
  },
  {
    kind: "ARTICLE",
    source: "brutecat",
    title: "Hacking Google with AI",
    date: "Read article",
    tags: ["AI", "Security"],
    href: "https://brutecat.com/articles/hacking-google-with-ai/",
    excerpt:
      "A technical security write-up on using AI to uncover and responsibly report an issue in Google systems.",
    media: "site",
    previewBrand: "brutecat",
    previewDomain: "brutecat.com",
    previewHeadline: "Hacking Google with AI",
    previewTag: "Security research",
  },
  {
    kind: "BLOG",
    source: "Archie Sengupta",
    title: "Writing on technology and systems",
    date: "Read blog",
    tags: ["Technology", "Writing"],
    href: "https://archiesengupta.com/blog",
    excerpt:
      "A thoughtful collection of notes and essays on technology, systems, and building things well.",
    media: "site",
    previewBrand: "Archie Sengupta",
    previewDomain: "archiesengupta.com",
    previewHeadline: "Notes on technology and systems",
    previewTag: "Blog",
  },
];
const movies = [
  {
    title: "Blade Runner 2049",
    genre: "Sci-Fi",
    rating: "9.0",
    quote: "Dying for the right cause.",
    tone: "blade",
  },
  {
    title: "The Matrix",
    genre: "Sci-Fi",
    rating: "9.2",
    quote: "There is no spoon.",
    tone: "matrix",
  },
  {
    title: "Oppenheimer",
    genre: "Drama",
    rating: "8.8",
    quote: "Now I am become Death.",
    tone: "oppen",
  },
  {
    title: "Arrival",
    genre: "Sci-Fi",
    rating: "9.1",
    quote: "Despite knowing the journey...",
    tone: "arrival",
  },
];
const hyderabadScreens = [
  {
    venue: "Prasads Cinemas",
    screen: "Screen 6",
    note: "PCX",
    href: "https://in.bookmyshow.com/cinemas/HYD/prasads-multiplex-hyderabad/buytickets/PRHN/",
  },
  {
    venue: "Prasads Cinemas",
    screen: "Screen 4",
    note: "PCX HDR by Barco",
    href: "https://in.bookmyshow.com/cinemas/HYD/prasads-multiplex-hyderabad/buytickets/PRHN/",
  },
  {
    venue: "Allu Cinemas",
    screen: "Dolby Screen",
    note: "Dolby",
    href: "https://in.bookmyshow.com/cinemas/HYD/allu-cinemas-kokapet/buytickets/ALUC/",
  },
  {
    venue: "AMB Cinemas",
    screen: "Screen 1",
    note: "HDR by Barco",
    href: "https://in.bookmyshow.com/cinemas/HYD/amb-cinemas-gachibowli/buytickets/AMBH/",
  },
];
const playlists = [
  {
    title: "My Playlist 01",
    embedUrl:
      "https://open.spotify.com/embed/playlist/5UrIU3Ul5MtzuySsd5MuFs?utm_source=generator",
  },
  {
    title: "My Playlist 02",
    embedUrl:
      "https://open.spotify.com/embed/playlist/07bxHaLvkkvpoUoIKtBvNC?utm_source=generator",
  },
];
const _skills = [
  ["Languages", ["Python", "TypeScript", "Go", "Rust", "C++"]],
  ["AI Systems", ["PyTorch", "OpenAI APIs", "LangGraph", "MCP", "RAG"]],
  ["Security", ["Burp Suite", "Wireshark", "Nmap", "Ghidra", "Frida"]],
  ["Cloud & Infra", ["Docker", "Kubernetes", "AWS", "Linux", "GitHub Actions"]],
];
const _learningResources = [
  {
    group: "AI & BUILDING",
    title: "Model Context Protocol",
    note: "A starting point for understanding how AI clients connect to tools and data.",
    type: "DOCS",
    href: "https://modelcontextprotocol.io/introduction",
  },
  {
    group: "AI & BUILDING",
    title: "LangGraph Academy",
    note: "Guides and videos for controllable, stateful agent systems.",
    type: "WATCH",
    href: "https://academy.langchain.com/",
  },
  {
    group: "CYBERSECURITY",
    title: "PortSwigger Web Security Academy",
    note: "Practical, hands-on labs for web security fundamentals and beyond.",
    type: "LABS",
    href: "https://portswigger.net/web-security",
  },
  {
    group: "CYBERSECURITY",
    title: "OWASP Top 10 for LLM Apps",
    note: "A strong reference for threat-modeling AI products.",
    type: "READ",
    href: "https://owasp.org/www-project-top-ten-for-large-language-model-applications/",
  },
  {
    group: "SYSTEMS",
    title: "The Missing Semester",
    note: "Practical command-line, Git, debugging, and developer workflow skills.",
    type: "COURSE",
    href: "https://missing.csail.mit.edu/",
  },
  {
    group: "SYSTEMS",
    title: "Computerphile",
    note: "Accessible YouTube explainers on computing, cryptography, and security.",
    type: "WATCH",
    href: "https://www.youtube.com/@Computerphile",
  },
  {
    group: "BEYOND TECH",
    title: "The Library of Babel",
    note: "A strange, beautiful rabbit hole about knowledge and possibility.",
    type: "EXPLORE",
    href: "https://libraryofbabel.info/",
  },
  {
    group: "BEYOND TECH",
    title: "Are.na",
    note: "A calm place to collect ideas, references, and visual research.",
    type: "EXPLORE",
    href: "https://www.are.na/",
  },
];
const _studySections = [
  { title: "AI RESOURCES", groups: ["AI & BUILDING"] },
  { title: "CYBER RESOURCES", groups: ["CYBERSECURITY", "SYSTEMS"] },
  { title: "OTHER RESOURCES", groups: ["BEYOND TECH"] },
];
const xAccounts = [
  {
    handle: "@the2ndfloorguy",
    name: "The 2nd Floor Guy",
    category: "HARDWARE",
    note: "Hardware, gadgets, and practical technology takes.",
    href: "https://x.com/the2ndfloorguy",
  },
  {
    handle: "@gow88",
    name: "Gowtham Oleti",
    category: "DESIGN",
    note: "Thoughtful web design, interaction, and visual craft.",
    href: "https://x.com/gow88",
  },
  {
    handle: "@mannupaaji",
    name: "Manu Arora",
    category: "DESIGN / BUILD",
    note: "Interfaces, motion, and creative work on the web.",
    href: "https://x.com/mannupaaji",
  },
  {
    handle: "@0x0SojalSec",
    name: "SojalSec",
    category: "CYBER",
    note: "Security research and useful defensive insight.",
    href: "https://x.com/0x0SojalSec",
  },
  {
    handle: "@ni5arga",
    name: "Ni5arga",
    category: "CYBER",
    note: "Security notes, research, and the wider infosec space.",
    href: "https://x.com/ni5arga",
  },
  {
    handle: "@IntCyberDigest",
    name: "International Cyber Digest",
    category: "CYBER",
    note: "A digest of cyber news, research, and developments.",
    href: "https://x.com/IntCyberDigest",
  },
  {
    handle: "@arpit_bhayani",
    name: "Arpit Bhayani",
    category: "DATABASES",
    note: "Deep explanations of databases and distributed systems.",
    href: "https://x.com/arpit_bhayani",
  },
  {
    handle: "@DealsDhamaka",
    name: "DealsDhamaka",
    category: "CREDIT CARD DEALS",
    note: "Deals, offers, and smart ways to save.",
    href: "https://x.com/DealsDhamaka",
  },
];
const disclosureCompanies = [
  {
    name: "Kore.ai",
    asset: "/images/company-logos/kore-ai.png",
    fallback: "K",
    href: "https://kore.ai",
  },
  {
    name: "Eternal",
    asset: "/images/company-logos/eternal.png",
    fallback: "Eternal",
    wordmark: true,
    href: "https://eternal.com",
  },
  {
    name: "Licious",
    asset: "/images/company-logos/licious.png",
    fallback: "Licious",
    wordmark: true,
    href: "https://www.licious.in",
  },
  {
    name: "Snabbit",
    asset: "/images/company-logos/snabbit.png",
    fallback: "S",
    href: "https://www.snabbit.com",
  },
  {
    name: "Lyzr.ai",
    asset: "/images/company-logos/lyzr-ai.png",
    fallback: "L",
    href: "https://www.lyzr.ai",
  },
  {
    name: "Exterview AI",
    asset: "/images/company-logos/exterview-ai.png",
    fallback: "E",
    href: "https://exterview.ai",
  },
  {
    name: "Virtusa",
    asset: "/images/company-logos/virtusa.png",
    fallback: "V",
    href: "https://www.virtusa.com",
  },
  {
    name: "Tata Sky",
    asset: "/images/company-logos/tata-play.png",
    fallback: "Tata Sky",
    wordmark: true,
    href: "https://www.tataplay.com",
  },
  {
    name: "Airtel",
    asset: "/images/company-logos/airtel.png",
    fallback: "airtel",
    wordmark: true,
    href: "https://www.airtel.in",
  },
  {
    name: "MakeMyTrip",
    asset: "/images/company-logos/makemytrip.png",
    fallback: "M",
    href: "https://www.makemytrip.com",
  },
  {
    name: "TurboHire",
    asset: "/images/company-logos/turbohire.png",
    fallback: "T",
    href: "https://turbohire.co",
  },
  {
    name: "TartanHQ",
    asset: "/images/company-logos/tartanhq.png",
    fallback: "T",
    href: "https://tartanhq.com",
  },
  { name: "10+ startups", asset: "", fallback: "10+ startups", wordmark: true },
];
const pocs = [
  {
    slug: "tgsrtc-booking-portal-disclosure",
    image: "/images/poc-logos/tgsrtc-logo.webp",
    logo: true,
    comingSoon: false,
    company: "TGSRTC",
    issue:
      "How a ₹1 checkout exposed failures across payment integrity and passenger-data access.",
  },
  {
    slug: "licious-supply-chain-disclosure",
    image: "/images/poc-logos/licious-logo.png",
    logo: true,
    comingSoon: true,
    company: "Licious",
    issue: "A public supply-chain trust failure that exposed data tied to 5M+ users.",
  },
];
const photos = [
  {
    id: "photo-01",
    image: "/images/photos/photo-01.jpeg",
    position: { top: "7%", left: "7%" },
    rotate: -6,
  },
  {
    id: "photo-02",
    image: "/images/photos/photo-02.jpeg",
    position: { top: "38%", left: "18%" },
    rotate: -8,
  },
  {
    id: "photo-03",
    image: "/images/photos/photo-03.jpeg",
    position: { top: "5%", left: "39%" },
    rotate: 7,
  },
  {
    id: "photo-04",
    image: "/images/photos/photo-04.jpeg",
    position: { top: "33%", left: "55%" },
    rotate: 9,
  },
  {
    id: "photo-05",
    image: "/images/photos/photo-05.jpeg",
    position: { top: "13%", right: "8%" },
    rotate: 2,
  },
  { id: "photo-06", image: "/images/photos/photo-06.jpeg", position: { top: "56%", left: "5%" }, rotate: 5 },
  { id: "photo-07", image: "/images/photos/photo-07.jpeg", position: { top: "61%", left: "31%" }, rotate: -4 },
  { id: "photo-08", image: "/images/photos/photo-08.jpeg", position: { top: "54%", left: "52%" }, rotate: 6 },
  { id: "photo-09", image: "/images/photos/photo-09.jpeg", position: { top: "65%", right: "8%" }, rotate: -7 },
  { id: "photo-10", image: "/images/photos/photo-10.jpeg", position: { top: "80%", left: "20%" }, rotate: 4 },
  { id: "photo-11", image: "/images/photos/photo-11.jpeg", position: { top: "81%", right: "24%" }, rotate: -3 },
];
const scrollScenes = [
  "about",
  "cyber",
  "learn",
  "blog",
  "socials",
  "movies",
  "playlists",
  "photography",
  "contact",
];

export default function Portfolio({
  letterboxd = [],
}: {
  letterboxd?: LetterboxdEntry[];
}) {
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState("");
  const [activeScene, setActiveScene] = useState("about");
  const [dockScale, setDockScale] = useState(1);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress =
        (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100;
      if (progressRef.current) progressRef.current.style.width = `${progress}%`;
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const hotkey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
    };
    update();
    addEventListener("scroll", requestUpdate, { passive: true });
    addEventListener("resize", requestUpdate);
    addEventListener("keydown", hotkey);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", requestUpdate);
      removeEventListener("resize", requestUpdate);
      removeEventListener("keydown", hotkey);
    };
  }, []);
  useEffect(() => {
    const updateDockScale = () => {
      const dockWidth = 338;
      const availableWidth = innerWidth - 12;
      const scale = innerWidth < 800 ? Math.min(1, availableWidth / dockWidth) : 1;
      setDockScale(Math.max(0.82, Number(scale.toFixed(3))));
    };
    updateDockScale();
    addEventListener("resize", updateDockScale);
    return () => removeEventListener("resize", updateDockScale);
  }, []);
  useEffect(() => {
    const touchDevice = matchMedia("(hover: none), (pointer: coarse)");
    if (!touchDevice.matches) return;

    const selector = [
      ".about-name-button",
      ".btn-23",
      ".review-author-button",
      ".shelf-card",
      ".cyber-shelf-card",
      ".poc-tilt-card",
      ".resource-link-card",
      ".project-card",
      ".article-card",
      ".skill-card",
      ".draggable-card",
      ".stateful-button",
      ".button",
      ".about-contact-logo",
      ".disclosure-logo-cloud",
      ".floating-dock-item",
    ].join(",");

    const setTouchHover = (target: HTMLElement) => {
      const wasActive = target.classList.contains("touch-hover");
      document
        .querySelectorAll<HTMLElement>(".touch-hover")
        .forEach((element) => element.classList.remove("touch-hover"));
      target.classList.add("touch-hover");
      return wasActive;
    };

    const activateTouchState = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>(selector);
      if (!target) return;
      const wasActive = setTouchHover(target);

      // A card-link gets a preview tap first; the next tap follows the link.
      if (target instanceof HTMLAnchorElement && !wasActive) {
        event.preventDefault();
      }
    };

    const previewWithMouse = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>(selector);
      if (target) setTouchHover(target);
    };

    document.addEventListener("click", activateTouchState);
    document.addEventListener("pointermove", previewWithMouse);
    return () => {
      document.removeEventListener("click", activateTouchState);
      document.removeEventListener("pointermove", previewWithMouse);
    };
  }, []);
  useEffect(() => {
    const headings = document.querySelectorAll<HTMLElement>(
      ".section-title, .about-label, .cyber-shelf-heading, .screen-guide-heading, .accounts-heading, .contact-section h2"
    );
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    headings.forEach((heading) => heading.classList.add("scroll-heading"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6%" }
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let frame = 0;
    const sections = scrollScenes
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    const updateScene = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const focus = innerHeight * 0.52;
        let closest = sections[0]?.id ?? "about";
        let closestDistance = Number.POSITIVE_INFINITY;
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const distance = Math.abs(rect.top + rect.height / 2 - focus);
          if (distance < closestDistance) {
            closest = section.id;
            closestDistance = distance;
          }
        });
        setActiveScene((current) => (current === closest ? current : closest));
      });
    };
    updateScene();
    addEventListener("scroll", updateScene, { passive: true });
    addEventListener("resize", updateScene);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", updateScene);
      removeEventListener("resize", updateScene);
    };
  }, []);
  const jump = (target: string) => {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    setPalette(false);
  };
  const nav = [
    "Home",
    "Cyber",
    "Blog",
    "Playlists",
    "Movies",
    "Learn",
    "Photography",
    "Socials",
    "Contact",
  ];

  const dockItems = [
    { title: "Home", icon: <FaHouse />, onClick: () => jump("#home") },
    { title: "About", icon: <FaBookOpen />, onClick: () => jump("#about") },
    { title: "Cyber", icon: <FaShieldHalved />, onClick: () => jump("#cyber") },
    { title: "Blog", icon: <FaBookOpen />, onClick: () => jump("#blog") },
    { title: "Reviews", icon: <FaFilm />, onClick: () => jump("#movies") },
    {
      title: "Learn",
      icon: <FaGraduationCap />,
      onClick: () => jump("#learn"),
    },
  ];

  return (
    <div className={`portfolio light scene-${activeScene}`}>
      <div ref={progressRef} className="progress" />
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="dot-field" />
      <div className="scroll-scenes" aria-hidden="true">
        {scrollScenes.map((scene) => (
          <div
            key={scene}
            className={`scroll-scene scene-${scene} ${
              activeScene === scene ? "is-active" : ""
            }`}
          />
        ))}
      </div>
      <header className="topbar" style={{ "--dock-scale": dockScale } as CSSProperties}>
        <FloatingDock items={dockItems} />
      </header>

      <main>
        <section id="home" className="ohsh-hero">
          <div className="hero-crt" />
          <div className="hero-gridlines" />
          <div className="hero-vignette" />
          <div className="ohsh-copy">
            <h1>hi, im praneeth.</h1>
            <p>AI ENGINEER. CYBERSECURITY RESEARCHER.</p>
            <span>hyderabad, india</span>
          </div>
          <div className="hero-corner bottom">SCROLL TO EXPLORE ↓</div>
        </section>

        <section id="about" className="section-shell about-section">
          <div className="about-label">ABOUT</div>
          <div className="about-layout">
            <div className="about-copy">
              <p>
                I’m{" "}
                <span className="btn-23 about-name-button">
                  <span className="text">Praneeth Reddy</span>
                  <i className="name-language name-telugu" aria-hidden="true">
                    ప్రణీత్ రెడ్డి
                  </i>
                  <i className="name-language name-hindi" aria-hidden="true">
                    प्रणीत रेड्डी
                  </i>
                </span>
                , based in Hyderabad, India. I’m a 2025 AI &amp; ML graduate
                drawn to the systems behind technology: how they work, where
                they break, and how they can be made more useful.
              </p>
              <p>
                I currently consult on product security for two products valued
                at $500M+, and have earned bug bounties across a range of
                organisations. I like figuring out how things work, where they
                can break, and how to make them better.
              </p>
              <p>
                When I’m away from a screen, I’m usually at a
                first-day-first-show, following cricket, hunting for good food,
                or planning the next journey.
              </p>
              <p className="about-work">
                I’m open to work with teams looking to lock down a product
                beyond paper compliance. I specialise in VAPT, vulnerability
                assessments, and application security. Let’s build something
                actually secure, not just compliant. Reach me out at{" "}
                <a
                  className="about-contact-logo"
                  href="https://x.com/messages/compose?recipient_id=0"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Message Praneeth on X"
                >
                  <FaXTwitter />
                </a>{" "}
                <a className="about-contact-logo" href="mailto:hello@praneethreddy.work" aria-label="Email Praneeth"><FaEnvelope /></a>.
              </p>
            </div>
            <ul className="about-facts">
              <li>
                <span>EDUCATION</span>
                <strong>AI &amp; ML · 2025</strong>
              </li>
              <li>
                <span>INTERESTS</span>
                <strong>Systems · Tech · Cyber</strong>
              </li>
              <li>
                <span>OFF THE CLOCK</span>
                <strong>FDFS · Cricket · Travel</strong>
              </li>
            </ul>
          </div>
        </section>

        <section id="cyber" className="cyber-research section-shell">
          <SectionTitle
            no="02"
            label="CYBERSECURITY RESEARCH"
            title={
              <>
                Responsible research,
                <br />
                clearer <i>systems.</i>
              </>
            }
          />
          <div className="cyber-shelf-heading poc-heading">
            <div>
              <h3>Vulnerability POCs</h3>
            </div>
          </div>
          <div className="cyber-shelf-row poc-tilt-row">
            {pocs.map((poc) => (
              <CardContainer
                key={poc.slug}
                containerClassName="poc-tilt-container"
              >
                <CardBody className="poc-tilt-card">
                  <CardItem translateZ={100} className="poc-tilt-image">
                    <img
                      className={poc.logo ? "poc-logo-image" : undefined}
                      src={poc.image}
                      alt={`${poc.company} logo`}
                    />
                  </CardItem>
                  <CardItem translateZ={65}>
                    <h3>{poc.company}</h3>
                  </CardItem>
                  <CardItem translateZ={50}>
                    <p>{poc.issue}</p>
                  </CardItem>
                  <CardItem translateZ={30} className="poc-read-action">
                    {poc.comingSoon ? (
                      <button className="stateful-button" disabled>
                        Soon
                      </button>
                    ) : (
                      <StatefulButton
                        onAction={async () => {
                          await new Promise((resolve) =>
                            setTimeout(resolve, 180)
                          );
                          window.location.href = `/pocs/${poc.slug}`;
                        }}
                      >
                        Read
                      </StatefulButton>
                    )}
                  </CardItem>
                </CardBody>
              </CardContainer>
            ))}
          </div>
          <p className="more-pocs-note">MORE POCs SOON</p>
          <p className="bug-bounty-caption">BUG BOUNTY / PATCHED FLAWS IN</p>
          <div
            className="disclosure-logo-cloud"
            aria-label="Organizations where responsible reports were acknowledged"
          >
            {disclosureCompanies.map((company) => (
              <a
                className={`disclosure-logo company-logo ${
                  company.wordmark ? "company-wordmark" : ""
                }`}
                key={company.name}
                title={company.name}
                href={company.href}
                target={company.href ? "_blank" : undefined}
                rel={company.href ? "noreferrer" : undefined}
              >
                {company.asset && !company.wordmark ? (
                  <img
                    src={company.asset}
                    alt={company.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      event.currentTarget.nextElementSibling?.classList.remove(
                        "is-hidden"
                      );
                    }}
                  />
                ) : null}
                <span
                  className={
                    company.asset && !company.wordmark ? "is-hidden" : ""
                  }
                  aria-hidden="true"
                >
                  {company.fallback}
                </span>
              </a>
            ))}
          </div>
        </section>

        <section id="blog" className="section-shell section-tint">
          <SectionTitle
            no="03"
            label="USEFUL LINKS"
            title={
              <>
                Things worth
                <br />
                <i>opening.</i>
              </>
            }
          />
          <div className="resource-link-grid">
            {articles
              .filter(
                (a) =>
                  !query ||
                  `${a.title} ${a.kind} ${a.tags.join(" ")}`
                    .toLowerCase()
                    .includes(query.toLowerCase())
              )
              .map((a) => (
                <a
                  className={`resource-link-card ${a.media}`}
                  href={a.href}
                  target="_blank"
                  rel="noreferrer"
                  key={a.title}
                >
                  <div className="resource-link-media">
                    {a.media === "video" ? (
                      <>
                        <img
                          src={a.thumbnail}
                          alt="Starship — Critical Path video thumbnail"
                        />
                        <span className="resource-play">
                          <FaPlay />
                        </span>
                      </>
                    ) : (
                      <div className="site-preview">
                        <div>
                          <b>{a.previewBrand}</b>
                          <span>{a.previewDomain}</span>
                        </div>
                        <p>{a.previewHeadline}</p>
                        <i>{a.previewTag}</i>
                      </div>
                    )}
                  </div>
                  <div className="resource-link-copy">
                    <div>
                      <span>{a.kind}</span>
                    </div>
                    <h3>{a.title}</h3>
                  </div>
                </a>
              ))}
          </div>
        </section>

        <section id="playlists" className="section-shell playlist-shelf">
          <SectionTitle
            no="03"
            label="RECORDS SHELF"
            title={
              <>
                Soundtracks for
                <br />
                the way <i>there.</i>
              </>
            }
          />
          <div className="ohshin-playlist-row">
            {playlists.map((item, index) => (
              <div className="ohshin-playlist" key={item.embedUrl}>
                <div className="ohshin-embed">
                  <iframe
                    id={index === 0 ? "playlist-one" : undefined}
                    title={item.title}
                    src={
                      index === 0
                        ? `${item.embedUrl}&autoplay=1`
                        : item.embedUrl
                    }
                    width="100%"
                    height="152"
                    loading={index === 0 ? "eager" : "lazy"}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="movies" className="section-shell">
          <SectionTitle
            no="04"
            label="OFF THE CLOCK"
            title={
              <>
                Latest movie
                <br />
                <i>reviews.</i>
              </>
            }
          />
          <div className="movie-source">
            <span>
              <b /> REVIEWS FROM MY FRIEND,{" "}
              <a
                className="review-author-button"
                href="https://x.com/saichndra"
                target="_blank"
                rel="noreferrer"
                aria-label="Sai Chandra on X"
              >
                <i className="review-author-decor" />
                <i className="review-author-content">
                  <i className="review-author-icon">
                    <FaXTwitter />
                  </i>
                  <i className="review-author-text">SAI CHANDRA</i>
                </i>
              </a>
            </span>
            <div className="movie-source-links">
              <a
                href="https://letterboxd.com/saichndra/"
                target="_blank"
                rel="noreferrer"
              >
                Letterboxd ↗
              </a>
            </div>
          </div>
          <div className="movie-grid">
            {(letterboxd.length
              ? letterboxd
                  .slice(0, 4)
                  .map((item, i) => ({
                    title: item.title,
                    genre: "Letterboxd diary",
                    rating: item.rating || "watched",
                    quote: item.review || "Logged on Letterboxd.",
                    tone: movies[i % movies.length].tone,
                    link: item.link,
                    poster: item.poster,
                  }))
              : movies.map((item) => ({
                  ...item,
                  link: "https://letterboxd.com/saichndra/",
                  poster: undefined as string | undefined,
                }))
            ).map((m, i) => (
              <a
                className={`movie-card shelf-card ${m.tone}`}
                href={m.link}
                target="_blank"
                rel="noreferrer"
                key={`${m.title}-${i}`}
              >
                <div
                  className="movie-poster"
                  style={
                    m.poster
                      ? {
                          backgroundImage: `linear-gradient(to top,rgba(4,7,12,.94),transparent 64%),url('${m.poster}')`,
                        }
                      : undefined
                  }
                />
                <div className="movie-overlay">
                  <span>{letterboxd.length ? "RECENT" : `TOP ${i + 1}`}</span>
                  <span className="movie-open">
                    <FaArrowRight />
                  </span>
                </div>
                <div className="movie-details">
                  <div>
                    <h3>{m.title}</h3>
                    <p>
                      {m.genre} · <b>{m.rating}</b>
                    </p>
                  </div>
                  <q>{m.quote}</q>
                </div>
              </a>
            ))}
          </div>
          <div className="screen-guide">
            <div className="screen-guide-heading">
              <h3>Best screens in Hyderabad</h3>
            </div>
            <ol>
              {hyderabadScreens.map((screen, index) => (
                <li key={`${screen.venue}-${screen.screen}`}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <div>
                    <strong>{screen.venue}</strong>
                    <span>{screen.screen}</span>
                  </div>
                  <em>{screen.note}</em>
                  <a
                    className="ticket-link"
                    href={screen.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Book tickets for ${screen.venue} ${screen.screen}`}
                  />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="learn" className="section-shell section-tint">
          <SectionTitle
            no="02"
            label="CONTINUOUS LEARNING"
            title={
              <>
                A study shelf for
                <br />
                curious <i>people.</i>
              </>
            }
          />
          <p className="learning-soon">
            Adding soon — <i>Cyber</i> and <i>AI</i> resources, and roadmaps.
          </p>
        </section>

        <section id="photography" className="section-shell photography-section">
          <SectionTitle
            no="06"
            label="PHOTOGRAPHY"
            title={
              <>
                Small frames from
                <br />
                the <i>outside world.</i>
              </>
            }
          />
          <FollowerPointerCard title="Drag">
            <DraggableCardContainer>
              {photos.map((photo) => (
                <DraggableCardBody
                  key={photo.id}
                  style={{ ...photo.position, rotate: `${photo.rotate}deg` }}
                >
                  <img
                    src={photo.image}
                    alt="Personal photograph"
                    loading="lazy"
                    decoding="async"
                  />
                </DraggableCardBody>
              ))}
            </DraggableCardContainer>
          </FollowerPointerCard>
        </section>

        <section id="socials" className="section-shell socials-section">
          <SectionTitle
            no="07"
            label="X / SOCIALS"
            title={
              <>
                Things I’m sharing
                <br />
                and <i>following.</i>
              </>
            }
          />
          <div className="x-profile x-profile-card">
            <div className="x-brand" aria-hidden="true">
              <FaXTwitter />
            </div>
            <img
              className="x-avatar"
              src="https://unavatar.io/x/praneethreddy33"
              alt="Praneeth Reddy on X"
              referrerPolicy="no-referrer"
            />
            <div className="x-profile-copy">
              <p>FOLLOW ON X</p>
              <h3>
                Praneeth Reddy <span>@praneethreddy33</span>
              </h3>
              <p className="x-bio">23 / farming / engineering +++</p>
              <div className="x-stats">
                Followers <b>1.6K+</b> <i /> Following <b>1.3K+</b>
              </div>
            </div>
            <a
              href="https://x.com/praneethreddy33"
              target="_blank"
              rel="noreferrer"
            >
              Follow <FaXTwitter />
            </a>
          </div>
          <div className="accounts-heading">
            <span>WORTH FOLLOWING ON X</span>
          </div>
          <div className="x-account-grid">
            {xAccounts.map((account) => (
              <a
                className="x-account shelf-card"
                href={account.href}
                target="_blank"
                rel="noreferrer"
                key={account.handle}
              >
                <div>
                  <span>{account.category}</span>
                  <b>
                    <FaXTwitter />
                  </b>
                </div>
                <h3>{account.name}</h3>
                <strong>{account.handle}</strong>
                <p>{account.note}</p>
              </a>
            ))}
          </div>
        </section>

        <section id="contact" className="contact-section section-shell">
          <p className="kicker">08 / CONTACT</p>
          <h2>
            work hard · earn $ · <i>travel.</i>
          </h2>
          <div className="contact-grid">
            <a className="contact-mail" href="mailto:hello@praneethreddy.work">
              hello@praneethreddy.work
            </a>
            <a
              className="contact-x"
              href="https://x.com/praneethreddy33"
              target="_blank"
              rel="noreferrer"
            >
              <FaXTwitter /> @praneethreddy33
            </a>
          </div>
        </section>
      </main>
      <footer>
        <span>© 2026 PRANEETH REDDY</span>
        <span>DESIGNED &amp; DEVELOPED WITH INTENT</span>
        <button onClick={() => jump("#home")}>BACK TO TOP ↑</button>
      </footer>
      <button className="back-top" onClick={() => jump("#home")}>
        ↑
      </button>
      {palette && (
        <div className="palette-backdrop">
          <div
            className="palette"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <button
              className="palette-close"
              type="button"
              aria-label="Close command palette"
              onClick={() => setPalette(false)}
            >
              ×
            </button>
            <div>
              <FaMagnifyingGlass />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages and notes…"
              />
            </div>
            <p>QUICK JUMP</p>
            {nav.map((item) => (
              <button key={item} onClick={() => jump(`#${item.toLowerCase()}`)}>
                <span>{item}</span>
                <kbd>↵</kbd>
              </button>
            ))}
            <small>ESC TO CLOSE · ⌘ K TO OPEN</small>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({
  no,
  label,
  title,
}: {
  no: string;
  label: string;
  title: React.ReactNode;
}) {
  return (
    <div className="section-title">
      <div className="section-label">
        <span>{no}</span>
        <p>{label}</p>
      </div>
      <h2>{title}</h2>
    </div>
  );
}
