import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Query to get all users
export const getUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect()
  },
})

// Query to get a user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId)
  },
})

// Query to get user by ID (for compatibility)
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      return await ctx.db.get(args.userId)
    } catch {
      return null
    }
  },
})

// Query to get a user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first()
  },
})

// Mutation to create a user
export const createUser = mutation({
  args: {
    email: v.optional(v.string()),
    nickname: v.string(),
    avatar: v.string(),
    topic: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email?.toLowerCase(),
      nickname: args.nickname,
      avatar: args.avatar,
      topic: args.topic,
      createdAt: new Date().toISOString(),
    })
    return userId
  },
})

