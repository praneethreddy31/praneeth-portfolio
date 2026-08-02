import { effects } from "../../config/ui";
import { cn } from "../../utils/cn";

interface GlassSheenProps {
  className: string;
}

export default function GlassSheen({ className }: GlassSheenProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(effects.glassSheen, className)}
    />
  );
}
