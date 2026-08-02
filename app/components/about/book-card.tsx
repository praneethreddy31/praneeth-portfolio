import type { BookInfo } from "../../types";
import { cn } from "../../utils/cn";

interface BookCardProps {
  book: BookInfo;
}

const BOOK_CARD_TONES: Record<string, string> = {
  "1984":
    "bg-[radial-gradient(circle_at_12%_14%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(135deg,rgba(211,23,10,0.34),rgba(255,255,255,0.06)_46%,rgba(0,40,85,0.22))] ring-accent/28",
  dune:
    "bg-[radial-gradient(circle_at_18%_12%,rgba(255,228,160,0.24),transparent_30%),linear-gradient(135deg,rgba(184,106,25,0.42),rgba(211,23,10,0.14)_45%,rgba(255,255,255,0.06))] ring-orange-200/20",
  neuromancer:
    "bg-[radial-gradient(circle_at_18%_20%,rgba(0,255,171,0.18),transparent_30%),linear-gradient(135deg,rgba(0,40,85,0.48),rgba(24,185,134,0.16)_44%,rgba(255,255,255,0.06))] ring-cyan-200/18",
  "project-hail-mary":
    "bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.2),transparent_30%),linear-gradient(135deg,rgba(244,180,55,0.26),rgba(255,255,255,0.07)_45%,rgba(0,40,85,0.3))] ring-yellow-100/16",
  "the-martian":
    "bg-[radial-gradient(circle_at_20%_18%,rgba(255,190,120,0.22),transparent_30%),linear-gradient(135deg,rgba(211,23,10,0.3),rgba(178,77,24,0.24)_42%,rgba(255,255,255,0.06))] ring-orange-100/18",
  "the-three-body-problem":
    "bg-[radial-gradient(circle_at_18%_14%,rgba(140,170,255,0.18),transparent_30%),linear-gradient(135deg,rgba(0,40,85,0.46),rgba(255,255,255,0.07)_50%,rgba(211,23,10,0.14))] ring-blue-100/18",
};

const DEFAULT_BOOK_TONE =
  "bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.1),rgba(211,23,10,0.18),rgba(0,40,85,0.2))] ring-white/10";

export default function BookCard({ book }: BookCardProps) {
  return (
    <article
      className={cn(
        "relative min-h-[8.5rem] overflow-hidden rounded-[1.25rem] p-3 shadow-[0_18px_46px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1",
        BOOK_CARD_TONES[book.id] ?? DEFAULT_BOOK_TONE,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/35" />
      <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-white/14 blur-2xl" />
      <div className="relative flex h-full items-start gap-3">
        <div className="relative h-20 w-14 flex-none overflow-hidden rounded-md bg-black/34 shadow-[0_12px_28px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/18">
          {book.thumbnail ? (
            <img
              src={book.thumbnail}
              alt={book.title}
              className="h-full w-full object-cover saturate-[1.18] contrast-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[0.6rem] uppercase tracking-[0.18em] text-white/40">
              cover
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-0.5">
          <div className="space-y-1">
            <p className="text-[0.82rem] font-semibold leading-snug text-white line-clamp-2">
              {book.title}
            </p>
            <p className="text-[0.68rem] leading-snug text-white/62 line-clamp-2">
              {book.authors.length
                ? book.authors.join(", ")
                : "Unknown author"}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/16 pt-2 font-mono text-[0.54rem] uppercase tracking-[0.2em] text-white/52">
            <span>book</span>
            <span>{book.publishedDate ?? "n/a"}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
