"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { PlayListGridCard } from "../ui/components/playlist-grid-card";

export const PlaylistsSection = () => {
  return (
    <Suspense
      fallback={<Loader2Icon className="self-center animate-spin size-20" />}
    >
      <ErrorBoundary fallback={<p>errooo</p>}>
        <PlaylistsSetcionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const PlaylistsSetcionSuspense = () => {
  const [playlists, query] = trpc.playlists.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  if (!playlists.pages || playlists.pages.length === 0) {
    return <p>Nenhum vídeo encontrado.</p>;
  }

  return (
    <div>
      <div
        className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4
      [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6 "
      >
        {playlists.pages
          .flatMap((page) => page.items)
          .map((playlist) => (
            <PlayListGridCard key={playlist.id} data={playlist} />
          ))}
      </div>

      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
