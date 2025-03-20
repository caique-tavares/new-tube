"use client"

import { trpc } from "@/trpc/client"

export const VideoSection = () => {
    const [data] = trpc.studio.getMany.useSuspenseInfiniteQuery()
        <div>
            Videos Section
        </div>
    )
}
