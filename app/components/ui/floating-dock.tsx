import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";

export interface FloatingDockItem {
  title: string;
  icon: ReactNode;
  onClick: () => void;
}

export function FloatingDock({ items }: { items: FloatingDockItem[] }) {
  const mouseX = useMotionValue(Infinity);
  const [open, setOpen] = useState(false);

  return <>
    <motion.nav className="floating-dock" aria-label="Portfolio navigation" onMouseMove={(event) => mouseX.set(event.pageX)} onMouseLeave={() => mouseX.set(Infinity)}>
      {items.map((item) => <DockItem item={item} mouseX={mouseX} key={item.title} />)}
    </motion.nav>
    <div className="floating-dock-mobile">
      <AnimatePresence>{open && <motion.div className="floating-dock-mobile-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
        {items.map((item, index) => <motion.button key={item.title} aria-label={item.title} title={item.title} onClick={() => { item.onClick(); setOpen(false); }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035 }}>{item.icon}</motion.button>)}
      </motion.div>}</AnimatePresence>
      <button className="floating-dock-toggle" aria-label="Open navigation" onClick={() => setOpen(!open)}>{open ? "×" : "☰"}</button>
    </div>
  </>;
}

function DockItem({ item, mouseX }: { item: FloatingDockItem; mouseX: ReturnType<typeof useMotionValue<number>> }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const distance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return value - bounds.x - bounds.width / 2;
  });
  const size = useSpring(useTransform(distance, [-150, 0, 150], [38, 62, 38]), { mass: 0.1, stiffness: 180, damping: 13 });
  const iconSize = useSpring(useTransform(distance, [-150, 0, 150], [17, 29, 17]), { mass: 0.1, stiffness: 180, damping: 13 });

  return <motion.button ref={ref} className="floating-dock-item" style={{ width: size, height: size }} onClick={item.onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} aria-label={item.title}>
    <AnimatePresence>{hovered && <motion.span className="floating-dock-tooltip" initial={{ opacity: 0, y: 7, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 4, x: "-50%" }}>{item.title}</motion.span>}</AnimatePresence>
    <motion.span className="floating-dock-icon" style={{ width: iconSize, height: iconSize }}>{item.icon}</motion.span>
  </motion.button>;
}
