interface AboutCopyProps {
  paragraphs: string[];
}

export default function AboutCopy({ paragraphs }: AboutCopyProps) {
  return (
    <div className="max-w-[74ch] space-y-0.5 lg:max-w-[78ch]">
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-white/92">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
