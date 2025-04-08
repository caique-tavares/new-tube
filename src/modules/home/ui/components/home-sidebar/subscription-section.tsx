"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { UserAvatar } from "@/components/user-avatar";
import { ListIcon } from "lucide-react";

export const SubscriptionSection = () => {
  const pathname = usePathname();
  const { data } = trpc.subscriptions.getMany.useInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {data?.pages
            .flatMap((page) => page.items)
            .map((subscription) => (
              <SidebarMenuItem
                key={`${subscription.creatorId}-${subscription.viewerId}`}
              >
                <SidebarMenuButton
                  tooltip={subscription.user.name}
                  asChild
                  isActive={pathname === `/users/${subscription.user.id}`}
                >
                  <Link
                    href={`/users/${subscription.user.id}`}
                    className="flex items-center gap-4"
                  >
                    <UserAvatar
                      size="xs"
                      imageUrl={subscription.user.imageUrl}
                      name={subscription.user.name}
                    />
                    <span className="text-sm">{subscription.user.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/subscriptions"}>
              <Link href="/subscriptions" className="flex items-center gap-4">
                <ListIcon className="size-4" />
                <span className="text-sm">All subscriptions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
