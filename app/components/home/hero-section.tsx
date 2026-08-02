import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { styleUnlessReduced, textStyles } from "../../config/ui";
import DecryptedText from "../react-bits/decrypted-text";

interface HeroSectionProps {
  title: string;
  subtitle: string;
}

export default function HeroSection({
  title,
  subtitle,
}: HeroSectionProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.34]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 165]);
  const imageX = useTransform(scrollYProgress, [0, 1], [0, -34]);
  const ghostX = useTransform(scrollYProgress, [0, 1], [18, -42]);
  const ghostY = useTransform(scrollYProgress, [0, 1], [-10, 92]);
  const ghostOpacity = useTransform(scrollYProgress, [0, 0.22, 0.85], [0.12, 0.28, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.82], [0, -172]);
  const textX = useTransform(scrollYProgress, [0, 0.82], [0, 42]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.68], [1, 0]);
  const textFilter = useTransform(scrollYProgress, [0, 0.74], ["blur(0px)", "blur(10px)"]);
  const scanOpacity = useTransform(scrollYProgress, [0, 1], [0.18, 0.58]);
  const gridOpacity = useTransform(scrollYProgress, [0, 1], [0.08, 0.34]);
  const lightOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.14, 0.42, 0.12]);
  const lightX = useTransform(scrollYProgress, [0, 1], ["-18%", "24%"]);
  const scanBeamOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.18, 0.56, 0.2]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative isolate min-h-[100svh] overflow-hidden"
    >
      <div className="absolute inset-0">
        <motion.img
          src="/background.png"
          alt=""
          className="h-full w-full object-cover object-center will-change-transform"
          style={styleUnlessReduced(reducedMotion, {
            scale: imageScale,
            x: imageX,
            y: imageY,
          })}
        />
      </div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[url('/background.png')] bg-cover bg-center opacity-20 mix-blend-screen will-change-transform [clip-path:polygon(0_8%,100%_0,100%_18%,0_28%)]"
        style={
          reducedMotion
            ? { opacity: 0 }
            : { opacity: ghostOpacity, x: ghostX, y: ghostY }
        }
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] mix-blend-screen motion-safe:animate-hero-static [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_1px,transparent_1px,transparent_4px),radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_72%_76%,rgba(211,23,10,0.22),transparent_34%)]"
        style={reducedMotion ? { opacity: 0.1 } : { opacity: scanOpacity }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:32px_32px]"
        style={reducedMotion ? { opacity: 0.08 } : { opacity: gridOpacity }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4] opacity-[0.09] motion-safe:animate-hero-static [background-image:radial-gradient(rgba(255,255,255,0.95)_0.7px,transparent_0.7px)] [background-size:5px_5px]"
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-1/2 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.26),rgba(211,23,10,0.18),transparent)] mix-blend-screen blur-sm motion-safe:animate-scan-roll"
        style={reducedMotion ? { opacity: 0 } : { opacity: scanBeamOpacity }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-18%] top-[-28%] z-[5] h-[42rem] rotate-[-9deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)] blur-2xl"
        style={
          reducedMotion
            ? { opacity: 0.14 }
            : { opacity: lightOpacity, x: lightX }
        }
      />
      <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="relative w-full max-w-5xl -translate-y-10 sm:-translate-y-20 lg:-translate-y-24">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -z-10 h-72 w-[min(92vw,54rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/58 blur-[78px] sm:h-[22rem] md:h-[26rem]"
          />
          <motion.div
            className="relative"
            style={
              styleUnlessReduced(reducedMotion, {
                filter: textFilter,
                opacity: textOpacity,
                x: textX,
                y: textY,
              })
            }
          >
            <h1 className={textStyles.heroTitle}>
              <DecryptedText
                text={title}
                speed={96}
                sequential
                animateOn="view"
                encryptedClassName="text-white/55"
              />
            </h1>
            <p className={textStyles.heroSubtitle}>
              <DecryptedText
                text={subtitle}
                speed={74}
                sequential
                animateOn="view"
                encryptedClassName="text-white/45"
              />
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
