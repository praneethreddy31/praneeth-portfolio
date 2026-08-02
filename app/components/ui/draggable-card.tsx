import { useRef } from "react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { cn } from "../../utils/cn";

export function DraggableCardContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("draggable-card-container", className)}>{children}</div>;
}

export function DraggableCardBody({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const card = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number }>();

  const start = (event: PointerEvent<HTMLDivElement>) => {
    const element = card.current;
    if (!element) return;
    event.preventDefault();
    drag.current = { x: event.clientX, y: event.clientY };
    element.setPointerCapture(event.pointerId);
    element.classList.add("is-dragging");
    element.style.zIndex = "8";
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const element = card.current;
    const state = drag.current;
    if (!element || !state) return;
    element.style.translate = `${event.clientX - state.x}px ${event.clientY - state.y}px`;
    element.style.zIndex = "8";
  };
  const end = (event?: PointerEvent<HTMLDivElement>) => {
    const element = card.current;
    if (event && element?.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
    element?.classList.remove("is-dragging");
    drag.current = undefined;
  };

  return <div ref={card} className={cn("draggable-card", className)} style={style} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={() => end()}>{children}</div>;
}
