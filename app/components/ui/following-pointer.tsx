import { useState } from "react";
import type { ReactNode, PointerEvent } from "react";
import { cn } from "../../utils/cn";

export function FollowerPointerCard({ children, title, className }: { children: ReactNode; title: ReactNode; className?: string }) {
  const [pointer, setPointer] = useState({ x: 0, y: 0, visible: false });
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPointer({ x: event.clientX - bounds.left, y: event.clientY - bounds.top, visible: true });
  };
  const hide = () => setPointer(current => ({ ...current, visible: false }));

  return <div className={cn("follower-pointer-card", className)} onPointerMove={move} onPointerEnter={move} onPointerLeave={hide} onPointerUp={hide} onPointerCancel={hide}>{children}<div className="follower-pointer" aria-hidden="true" style={{ left: pointer.x, top: pointer.y, opacity: pointer.visible ? 1 : 0 }}>{title}</div></div>;
}
