import { useEffect, useState } from "react";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { cn } from "../../utils/cn";

type StatefulButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  onAction?: () => Promise<void> | void;
};

export function StatefulButton({ children, className, onAction, onClick, ...props }: StatefulButtonProps) {
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const resetAfterReturn = () => setIsWorking(false);
    window.addEventListener("pageshow", resetAfterReturn);
    return () => window.removeEventListener("pageshow", resetAfterReturn);
  }, []);

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isWorking) return;
    setIsWorking(true);
    try {
      await onAction?.();
    } finally {
      setIsWorking(false);
    }
  };

  return <button {...props} className={cn("stateful-button", className)} data-working={isWorking} onClick={handleClick}>{isWorking ? "Opening…" : children}</button>;
}
