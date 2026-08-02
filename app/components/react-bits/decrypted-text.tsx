import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

interface DecryptedTextProps {
  text: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  speed?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end";
  animateOn?: "view" | "hover";
}

function getRandomCharacter(): string {
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}

export default function DecryptedText({
  text,
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  speed = 42,
  sequential = true,
  revealDirection = "start",
  animateOn = "view",
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (animateOn !== "view" || hasPlayed || !containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        setHasPlayed(true);
        setIsAnimating(true);
        observer.disconnect();
      },
      { threshold: 0.45 },
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [animateOn, hasPlayed]);

  useEffect(() => {
    if (!isAnimating) {
      return;
    }

    let progress = 0;
    const characters = [...text];
    const total = characters.length;

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(() => {
      progress += 1;

      setDisplayText(
        characters
          .map((character, index) => {
            if (character === " ") {
              return " ";
            }

            const isRevealed = sequential
              ? revealDirection === "start"
                ? index < progress
                : index >= total - progress
              : progress > total / 2;

            return isRevealed ? character : getRandomCharacter();
          })
          .join(""),
      );

      if (progress > total) {
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
        }
        setDisplayText(text);
        setIsAnimating(false);
      }
    }, speed);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isAnimating, revealDirection, sequential, speed, text]);

  const startOnHover =
    animateOn === "hover"
      ? () => {
          setDisplayText(text);
          setIsAnimating(true);
        }
      : undefined;

  return (
    <span
      ref={containerRef}
      className={parentClassName}
      onMouseEnter={startOnHover}
    >
      {[...displayText].map((character, index) => {
        const originalCharacter = text[index];
        const isEncrypted =
          character !== " " && character !== originalCharacter && isAnimating;

        return (
          <motion.span
            key={`${character}-${index}`}
            initial={{ opacity: 0.35, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`${className} ${isEncrypted ? encryptedClassName : ""}`.trim()}
          >
            {character}
          </motion.span>
        );
      })}
    </span>
  );
}
