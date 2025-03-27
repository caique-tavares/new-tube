import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
}

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { videoId, userId, prompt } = input;

  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
    if (!existingVideo) {
      throw new Error("Video not found");
    }
    return existingVideo;
  });
  //   console.log("video: ", video);

  const { body } = await context.call<{ data: Array<{ url: string }> }>(
    "generate-thumbnail",
    {
      url: "https://api.openai.com/v1/images/generations",
      method: "POST",
      body: {
        prompt,
        n: 1,
        model: "dall-e-3",
        size: "1792x1024",
      },
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  const tempThumbnailUrl = body.data[0].url;

  if (!tempThumbnailUrl) {
    throw new Error("Thumbnail URL not found");
  }

  const uploadedThumbnail = await context.run("upload-thumbnail", async () => {
    const utapi = new UTApi();
    const { data, error } = await utapi.uploadFilesFromUrl(tempThumbnailUrl);

    if (error) {
      throw new Error("Error uploading thumbnail: " + error.message);
    }

    return data;
  });

  //   await context.run("cleanup-thumbnail", async () => {
  //     if(video.thumbnailKey) {

  //     }

  //     const utapi = new UTApi();

  //   })

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        thumbnailUrl: uploadedThumbnail.url || "nothing seems right",
      })
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
  });
});
