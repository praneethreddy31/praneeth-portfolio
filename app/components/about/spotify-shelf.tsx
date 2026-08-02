import { textStyles } from "../../config/ui";
import type { SpotifyPlaylist } from "../../types";
import SectionHeadingRow from "../ui/section-heading-row";

interface SpotifyShelfProps {
  playlists: SpotifyPlaylist[];
}

export default function SpotifyShelf({ playlists }: SpotifyShelfProps) {
  return (
    <section>
      <SectionHeadingRow
        label="records shelf"
        labelClassName={textStyles.shelfLabel}
        title="playlists"
        titleClassName={textStyles.shelfTitle}
      />

      <div className="mt-5 max-w-full overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max max-w-none gap-4 sm:gap-5">
          {playlists.map((playlist) => (
            <div
              key={playlist.embedUrl}
              className="w-[min(17.5rem,calc(100vw-4rem))] flex-none space-y-2 sm:w-72"
            >
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/58">
                {playlist.title}
              </p>
              <div className="overflow-hidden rounded-[1.4rem] bg-theme-black/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/6">
                <iframe
                  title={playlist.title}
                  src={playlist.embedUrl}
                  className="block h-[152px]"
                  width="100%"
                  height="152"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
