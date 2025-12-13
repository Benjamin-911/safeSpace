import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    email: v.optional(v.string()),
    nickname: v.string(),
    avatar: v.string(),
    topic: v.string(),
    createdAt: v.string(),
  }).index("by_email", ["email"]),
  
  messages: defineTable({
    userId: v.string(),
    content: v.string(),
    sender: v.union(v.literal("user"), v.literal("counselor")),
    type: v.union(v.literal("text"), v.literal("voice")),
    audioUrl: v.optional(v.string()),
    timestamp: v.string(),
  }).index("by_user", ["userId"]),
})

