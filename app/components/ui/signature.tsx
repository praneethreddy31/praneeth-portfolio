import { useEffect, useId, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

type Glyph = { advanceWidth?: number; getPath: (x: number, y: number, size: number) => { toPathData: (precision?: number) => string } };
type Font = { unitsPerEm: number; charToGlyph: (character: string) => Glyph };
type OpenTypeModule = { parse?: (buffer: ArrayBuffer) => Font; default?: { parse?: (buffer: ArrayBuffer) => Font } };

const fontCache = new Map<string, Font>();
const pathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 },
};

async function loadFont(): Promise<Font> {
  const path = "/LastoriaBoldRegular.otf";
  const cached = fontCache.get(path);
  if (cached) return cached;
  const response = await fetch(path);
  if (!response.ok) throw new Error("Signature font could not be loaded");
  const module = await import("opentype.js") as unknown as OpenTypeModule;
  const parse = module.default?.parse ?? module.parse;
  if (!parse) throw new Error("Signature font parser could not be loaded");
  const font = parse(await response.arrayBuffer());
  fontCache.set(path, font);
  return font;
}

export function Signature({ text = "Signature", color = "#000", fontSize = 14, duration = 1.5, delay = 0, className, inView = false, once = true }: {
  text?: string; color?: string; fontSize?: number; duration?: number; delay?: number; className?: string; inView?: boolean; once?: boolean;
}) {
  const [paths, setPaths] = useState<string[]>([]);
  const [width, setWidth] = useState(300);
  const signatureRef = useRef<SVGSVGElement>(null);
  const isInView = useInView(signatureRef, { once, amount: 0.2 });
  const maskId = `signature-${useId().replace(/:/g, "")}`;
  const baseline = Math.min(95, Math.max(5, (100 - fontSize) / 2) + fontSize);
  const padding = fontSize * 0.1;

  useEffect(() => {
    if (inView && !isInView) return;

    let cancelled = false;
    void loadFont().then((font) => {
      let x = padding;
      const nextPaths = [...text].map((character) => {
        const glyph = font.charToGlyph(character);
        const path = glyph.getPath(x, baseline, fontSize).toPathData(3);
        x += (glyph.advanceWidth ?? font.unitsPerEm) * (fontSize / font.unitsPerEm);
        return path;
      });
      if (!cancelled) { setPaths(nextPaths); setWidth(x + padding); }
    }).catch(() => { if (!cancelled) setWidth(text.length * fontSize * 0.6); });
    return () => { cancelled = true; };
  }, [text, fontSize, baseline, padding, inView, isInView]);

  const pathElements = (stroke: string, strokeWidth: number, linecap: "round" | "butt") => paths.map((d, index) => (
    <motion.path key={`${stroke}-${index}`} d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap={linecap} strokeLinejoin="round" vectorEffect="non-scaling-stroke" variants={pathVariants} transition={{ pathLength: { delay: delay + index * 0.2, duration, ease: "easeInOut" }, opacity: { delay: delay + index * 0.2 + 0.01, duration: 0.01 } }} />
  ));

  const shouldAnimate = !inView || (isInView && paths.length > 0);

  return <motion.svg ref={signatureRef} width={width} height={100} viewBox={`0 0 ${width} 100`} fill="none" className={className} initial="hidden" animate={shouldAnimate ? "visible" : "hidden"}>
    <defs><mask id={maskId}>{pathElements("white", fontSize * 0.22, "round")}</mask></defs>
    {pathElements(color, 2, "butt")}
    <g mask={`url(#${maskId})`}>{paths.map((d, index) => <path key={index} d={d} fill={color} />)}</g>
  </motion.svg>;
}
