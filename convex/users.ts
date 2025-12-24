import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Simple hash function for passwords (for production, consider bcrypt via external action)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Add salt-like prefix for basic security
  return `sh1_${Math.abs(hash).toString(16)}_${password.length}`
}

function verifyHash(password: string, storedHash: string): boolean {
  return simpleHash(password) === storedHash
}

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

// Mutation to create a user (legacy - for anonymous users without password)
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

// Register a new user with email and password
export const registerUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    nickname: v.string(),
    avatar: v.string(),
    topic: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate password length
    if (args.password.length < 6) {
      throw new Error("Password must be at least 6 characters")
    }

    // Validate email
    if (!args.email.includes("@")) {
      throw new Error("Please enter a valid email address")
    }

    // Check if email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first()

    if (existingUser) {
      throw new Error("An account with this email already exists. Please login instead.")
    }

    // Hash the password
    const passwordHash = simpleHash(args.password)

    // Create user
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      passwordHash,
      nickname: args.nickname,
      avatar: args.avatar,
      topic: args.topic,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    })

    return userId
  },
})

// Login user with email and password
export const loginUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first()

    if (!user) {
      throw new Error("No account found with this email. Please register first.")
    }

    // Check if user has a password (registered user vs anonymous)
    if (!user.passwordHash) {
      throw new Error("This account was created without a password. Please register with a password.")
    }

    // Verify password
    if (!verifyHash(args.password, user.passwordHash)) {
      throw new Error("Incorrect password. Please try again.")
    }

    // Update last login time
    await ctx.db.patch(user._id, {
      lastLoginAt: new Date().toISOString(),
    })

    return user._id
  },
})

// Update last login timestamp
export const updateLastLogin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastLoginAt: new Date().toISOString(),
    })
  },
})

// Delete user and all their data (GDPR compliance)
export const deleteUserData = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Delete all user messages first
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId as any))
      .collect()

    for (const message of messages) {
      await ctx.db.delete(message._id)
    }

    // Delete the user
    await ctx.db.delete(args.userId)

    return {
      deleted: true,
      messagesDeleted: messages.length
    }
  },
})

// Update user profile (nickname, avatar, topic)
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    nickname: v.optional(v.string()),
    avatar: v.optional(v.string()),
    topic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, string> = {}

    if (args.nickname?.trim()) {
      updates.nickname = args.nickname.trim()
    }
    if (args.avatar) {
      updates.avatar = args.avatar
    }
    if (args.topic) {
      updates.topic = args.topic
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("No changes to save")
    }

    await ctx.db.patch(args.userId, updates)
    return { updated: true }
  },
})
