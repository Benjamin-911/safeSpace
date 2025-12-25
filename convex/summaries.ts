import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get the most recent summary for a user.
 */
export const getLatestSummary = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("summaries")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .first();
    },
});

/**
 * Save a new conversation summary.
 */
export const saveSummary = mutation({
    args: {
        userId: v.string(),
        content: v.string(),
        messageCount: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("summaries", {
            userId: args.userId,
            content: args.content,
            messageCount: args.messageCount,
            timestamp: new Date().toISOString(),
        });
    },
});
