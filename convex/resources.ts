import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get all saved resources for a user.
 */
export const getSavedResources = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("savedResources")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

/**
 * Save a new resource for a user.
 */
export const saveResource = mutation({
    args: {
        userId: v.string(),
        title: v.string(),
        category: v.string(),
        content: v.optional(v.string()),
        phone: v.optional(v.string()),
        link: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check for duplicates
        const existing = await ctx.db
            .query("savedResources")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("title"), args.title))
            .first();

        if (existing) {
            return existing._id;
        }

        return await ctx.db.insert("savedResources", {
            userId: args.userId,
            title: args.title,
            category: args.category,
            content: args.content,
            phone: args.phone,
            link: args.link,
            timestamp: new Date().toISOString(),
        });
    },
});

/**
 * Remove a saved resource.
 */
export const removeResource = mutation({
    args: { id: v.id("savedResources") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
