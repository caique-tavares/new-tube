"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { SubscriptionItem } from "../components/subscription-item";

export const SubscriptionsSection = () => {
  return (
    <Suspense
      fallback={<Loader2Icon className="self-center animate-spin size-20" />}
    >
      <ErrorBoundary fallback={<p>errooo</p>}>
        <SubscriptionsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const SubscriptionsSectionSuspense = () => {
  const utils = trpc.useUtils();
  const [subscriptions, query] =
    trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  const unsubscribe = trpc.subscriptions.remove.useMutation<[]>({
    onSuccess: (data) => {
      toast.success("Unsubscribed");
      utils.subscriptions.getMany.invalidate();
      utils.videos.getManySubscribed.invalidate();
      utils.users.getOne.invalidate({ id: data.creatorId });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  if (!subscriptions.pages || subscriptions.pages.length === 0) {
    return <p>Nenhum vídeo encontrado.</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 ">
        {subscriptions.pages
          .flatMap((page) => page.items)
          .map((subscription) => (
            <Link
              key={subscription.creatorId}
              href={`/user/${subscription.user.id}`}
            >
              <SubscriptionItem
                name={subscription.user.name}
                imageUrl={subscription.user.imageUrl}
                subscriberCount={subscription.user.subscriberCount}
                onUnsubscribe={() => {
                  unsubscribe.mutate({ userId: subscription.creatorId });
                }}
                disabled={unsubscribe.isPending}
              />
            </Link>
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
