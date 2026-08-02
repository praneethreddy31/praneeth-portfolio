import { textStyles } from "../../config/ui";
import type { BookInfo } from "../../types";
import SectionHeadingRow from "../ui/section-heading-row";
import BookCard from "./book-card";

interface BooksShelfProps {
  books?: BookInfo[];
  loading?: boolean;
}

function BookCardSkeleton() {
  return (
    <div className="relative h-full min-h-[8.5rem] overflow-hidden rounded-[1.25rem] bg-white/[0.045] p-3 ring-1 ring-white/10">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="flex h-full gap-3">
        <div className="h-20 w-14 rounded-md bg-white/10" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <div className="h-3.5 w-5/6 rounded bg-white/14" />
          <div className="h-3 w-3/5 rounded bg-white/10" />
          <div className="h-2.5 w-1/3 rounded bg-white/8" />
        </div>
      </div>
    </div>
  );
}

export default function BooksShelf({
  books = [],
  loading = false,
}: BooksShelfProps) {
  return (
    <section>
      <SectionHeadingRow
        label="reading stack"
        labelClassName={textStyles.shelfLabel}
        title="books"
        titleClassName={textStyles.shelfTitle}
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }, (_, index) => (
              <BookCardSkeleton key={index} />
            ))
          : books.map((book) => <BookCard key={book.id} book={book} />)}
      </div>
    </section>
  );
}
