import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
}

const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a Youtube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to imporve discoverability
- Highlight the most compellling or unique aspect of the video content
- Avoid jargon or overly complex language unless it directly supports searchability
- Use action-orinted pharsing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- Only return the title as plain text. Do not add quotes or any additional formatting`;

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { videoId, userId } = input;

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

  const transcript = await context.run("get-transcript", async () => {
    console.log("KKKKKKKKKKK MANO OLHA ISSO:", video.muxPlaybackId);
    console.log("muxTrackId:", video.muxTrackId);
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    const response = await fetch(trackUrl);
    const text = await response.text();

    if (!text) {
      throw new Error("Transcript not found");
    }

    return text;
  });

  const { body } = await context.api.openai.call("generate-title", {
    token: process.env.OPENAI_API_KEY!,
    operation: "chat.completions.create",
    body: {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: TITLE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: transcript,
        },
      ],
    },
  });
  const title = body.choices[0]?.message.content;

  if (!title) {
    throw new Error("Title not found");
  }

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        title: title || "nothing seems right",
      })
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
  });
});
