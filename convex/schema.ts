import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    email: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    nickname: v.string(),
    avatar: v.string(),
    topic: v.string(),
    createdAt: v.string(),
    lastLoginAt: v.optional(v.string()),
    counselorPersona: v.optional(v.string()),
    resetToken: v.optional(v.string()),
    resetTokenExpiry: v.optional(v.number()),
  }).index("by_email", ["email"]),

  messages: defineTable({
    userId: v.string(),
    content: v.string(),
    sender: v.union(v.literal("user"), v.literal("counselor")),
    type: v.union(v.literal("text"), v.literal("voice")),
    audioUrl: v.optional(v.string()),
    timestamp: v.string(),
  }).index("by_user", ["userId"]),

  knowledgeBase: defineTable({
    content: v.string(),
    embedding: v.array(v.float64()),
    metadata: v.optional(v.any()),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 768,
  }),

  summaries: defineTable({
    userId: v.string(),
    content: v.string(),
    timestamp: v.string(),
    messageCount: v.number(), // Number of messages summarized so far
  }).index("by_user", ["userId"]),

  savedResources: defineTable({
    userId: v.string(),
    title: v.string(),
    category: v.string(),
    content: v.optional(v.string()),
    phone: v.optional(v.string()),
    link: v.optional(v.string()),
    timestamp: v.string(),
  }).index("by_user", ["userId"]),
})

