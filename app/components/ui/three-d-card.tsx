import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ElementType, MouseEvent, ReactNode } from "react";
import { cn } from "../../utils/cn";

const MouseEnterContext = createContext(false);

export function CardContainer({ children, className, containerClassName }: { children: ReactNode; className?: string; containerClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds || !ref.current) return;
    const x = (event.clientX - bounds.left - bounds.width / 2) / 25;
    const y = (event.clientY - bounds.top - bounds.height / 2) / 25;
    ref.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  };
  return <MouseEnterContext.Provider value={entered}><div className={cn("card-3d-container", containerClassName)} style={{ perspective: "1000px" }}><div ref={ref} className={cn("card-3d-stage", className)} style={{ transformStyle: "preserve-3d" }} onMouseEnter={() => setEntered(true)} onMouseMove={handleMouseMove} onMouseLeave={() => { setEntered(false); if (ref.current) ref.current.style.transform = "rotateY(0deg) rotateX(0deg)"; }}>{children}</div></div></MouseEnterContext.Provider>;
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("card-3d-body", className)}>{children}</div>;
}

export function CardItem({ as: Tag = "div", children, className, translateX = 0, translateY = 0, translateZ = 0, rotateX = 0, rotateY = 0, rotateZ = 0, ...rest }: { as?: ElementType; children: ReactNode; className?: string; translateX?: number; translateY?: number; translateZ?: number; rotateX?: number; rotateY?: number; rotateZ?: number; [key: string]: unknown }) {
  const ref = useRef<HTMLElement>(null);
  const entered = useContext(MouseEnterContext);
  useEffect(() => { if (ref.current) ref.current.style.transform = entered ? `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)` : "translateX(0) translateY(0) translateZ(0) rotateX(0) rotateY(0) rotateZ(0)"; }, [entered, rotateX, rotateY, rotateZ, translateX, translateY, translateZ]);
  const Component = Tag;
  return <Component ref={ref} className={cn("card-3d-item", className)} {...rest}>{children}</Component>;
}
