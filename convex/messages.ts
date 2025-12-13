import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Query to get messages for a user
export const getMessages = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()
  },
})

// Mutation to send a message
export const sendMessage = mutation({
  args: {
    userId: v.string(),
    content: v.string(),
    sender: v.union(v.literal("user"), v.literal("counselor")),
    type: v.union(v.literal("text"), v.literal("voice")),
    audioUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      userId: args.userId,
      content: args.content,
      sender: args.sender,
      type: args.type,
      audioUrl: args.audioUrl,
      timestamp: new Date().toISOString(),
    })
    return messageId
  },
})

// Cleanup function to remove duplicate welcome messages
export const cleanupDuplicateWelcomeMessages = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()
    
    // Find duplicate welcome messages
    const welcomeMessages = allMessages.filter(
      (msg) => msg.sender === "counselor" && 
      msg.content.includes("Hello, I'm here to listen")
    )
    
    // Keep only the first one, delete the rest
    if (welcomeMessages.length > 1) {
      const toDelete = welcomeMessages.slice(1) // Keep first, delete rest
      for (const msg of toDelete) {
        await ctx.db.delete(msg._id)
      }
      return { deleted: toDelete.length, kept: 1 }
    }
    
    return { deleted: 0, kept: welcomeMessages.length }
  },
})

