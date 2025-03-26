import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/server";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();
console.log("Uploadthing initialized", f);

export const ourFileRouter = {
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ videoId: z.string().uuid() }))
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();

      console.log("Clerk User ID:", clerkUserId);

      if (!clerkUserId) {
        console.error("Middleware- Unathorized");
        throw new UploadThingError("Unauthorized");
      }

      console.log("passou por aqui");

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));

      console.log("Database Query Result:", user);

      if (!user) {
        console.error("Middleware- User not found");
        throw new UploadThingError("User not found");
      }

      return { user, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Metadata received:", metadata);
      console.log("File received:", file);
      await db
        .update(videos)
        .set({
          thumbnailUrl: file.url,
        })
        .where(
          and(
            eq(videos.id, metadata.videoId),
            eq(videos.userId, metadata.user.id)
          )
        );
      return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
