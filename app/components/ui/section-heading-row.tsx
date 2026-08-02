import { cn } from "../../utils/cn";

interface SectionHeadingRowProps {
  label: string;
  labelClassName: string;
  title: string;
  titleClassName: string;
}

export default function SectionHeadingRow({
  label,
  labelClassName,
  title,
  titleClassName,
}: SectionHeadingRowProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className={titleClassName}>{title}</h2>
      <p className={cn(labelClassName)}>{label}</p>
    </div>
  );
}
