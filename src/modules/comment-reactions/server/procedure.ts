import { db } from "@/db";
import { commentsReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";

import { z } from "zod";

export const commentReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const { id: userId } = ctx.user;

      const [existingCommentReactiononLike] = await db
        .select()
        .from(commentsReactions)
        .where(
          and(
            eq(commentsReactions.userId, userId),
            eq(commentsReactions.commentId, commentId),
            eq(commentsReactions.type, "liked")
          )
        );

      if (existingCommentReactiononLike) {
        const [deletedVideoReaction] = await db
          .delete(commentsReactions)
          .where(
            and(
              eq(commentsReactions.userId, userId),
              eq(commentsReactions.commentId, commentId)
            )
          )
          .returning();

        return deletedVideoReaction;
      }

      const [createdCommentReaction] = await db
        .insert(commentsReactions)
        .values({
          userId,
          commentId,
          type: "liked",
        })
        .onConflictDoUpdate({
          target: [commentsReactions.userId, commentsReactions.commentId],
          set: {
            type: "liked",
          },
        })
        .returning();

      return createdCommentReaction;
    }),
  dislike: protectedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const { id: userId } = ctx.user;

      const [existingCommentReactiononDeslike] = await db
        .select()
        .from(commentsReactions)
        .where(
          and(
            eq(commentsReactions.userId, userId),
            eq(commentsReactions.commentId, commentId),
            eq(commentsReactions.type, "disliked")
          )
        );

      if (existingCommentReactiononDeslike) {
        const [deletedCommentReaction] = await db
          .delete(commentsReactions)
          .where(
            and(
              eq(commentsReactions.userId, userId),
              eq(commentsReactions.commentId, commentId)
            )
          )
          .returning();

        return deletedCommentReaction;
      }

      const [createdCommentReaction] = await db
        .insert(commentsReactions)
        .values({
          userId,
          commentId,
          type: "disliked",
        })
        .onConflictDoUpdate({
          target: [commentsReactions.userId, commentsReactions.commentId],
          set: {
            type: "disliked",
          },
        })
        .returning();

      return createdCommentReaction;
    }),
});
