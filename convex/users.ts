/**
 * @copyright 2024-2025 Bernard Gamanga (SafeSpace Salone). All rights reserved.
 * This source code is confidential and proprietary to Bernard Gamanga.
 */
import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Secure hash function for passwords using SHA-256 (synchronous string-based equivalent using webcrypto or fallback if running under specific serverless limits, or basic hashing. Standard Node/Convex environment allows crypto or Web Crypto API)
export function simpleHash(password: string): string {
  // Let's implement a robust hash helper. In Convex actions we can use webcrypto, but since simpleHash is synchronous and called from mutations, we can use a secure SHA-256 representation if available, or a strong SHA-256 JS implementation.
  // Let's write a pure-JS implementation of SHA-256 to ensure zero external dependency and perfect synchronous execution in all Convex runtimes.
  function sha256(ascii: string): string {
    function rightRotate(value: number, amount: number) {
      return (value >>> amount) | (value << (32 - amount));
    }
    
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const result = [];
    const words: number[] = [];
    const asciiLength = ascii.length;
    
    const hash = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    
    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    
    let i, j;
    const wordsLength = ((asciiLength + 8) >> 6) + 1;
    for (i = 0; i < wordsLength * 16; i++) {
      words[i] = 0;
    }
    for (i = 0; i < asciiLength; i++) {
      words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    }
    words[asciiLength >> 2] |= 0x80 << (24 - (asciiLength % 4) * 8);
    words[wordsLength * 16 - 1] = asciiLength * 8;
    
    for (i = 0; i < words.length; i += 16) {
      const w = [];
      for (j = 0; j < 16; j++) {
        w[j] = words[i + j];
      }
      for (j = 16; j < 64; j++) {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      
      let a = hash[0];
      let b = hash[1];
      let c = hash[2];
      let d = hash[3];
      let e = hash[4];
      let f = hash[5];
      let g = hash[6];
      let h = hash[7];
      
      for (j = 0; j < 64; j++) {
        const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
        const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) | 0;
        
        h = g;
        g = f;
        f = e;
        e = (d + temp1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) | 0;
      }
      
      hash[0] = (hash[0] + a) | 0;
      hash[1] = (hash[1] + b) | 0;
      hash[2] = (hash[2] + c) | 0;
      hash[3] = (hash[3] + d) | 0;
      hash[4] = (hash[4] + e) | 0;
      hash[5] = (hash[5] + f) | 0;
      hash[6] = (hash[6] + g) | 0;
      hash[7] = (hash[7] + h) | 0;
    }
    
    for (i = 0; i < 8; i++) {
      const hex = (hash[i] >>> 0).toString(16);
      result.push(("00000000" + hex).slice(-8));
    }
    return result.join("");
  }

  // Use a fixed salt for the application context to secure against precomputed tables
  const salt = "safespace_salone_secure_salt_2026";
  return `sha256_${sha256(password + salt)}`;
}

function verifyHash(password: string, storedHash: string): boolean {
  // Backwards compatibility check
  if (storedHash.startsWith("sh1_")) {
    let hash = 0
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return `sh1_${Math.abs(hash).toString(16)}_${password.length}` === storedHash;
  }
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
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("users", args.userId)
    if (!id) return null
    return await ctx.db.get(id)
  },
})

// Query to get user by ID (for compatibility)
export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("users", args.userId)
    if (!id) return null
    try {
      return await ctx.db.get(id)
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
    counselorPersona: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email?.toLowerCase(),
      nickname: args.nickname,
      avatar: args.avatar,
      topic: args.topic,
      counselorPersona: args.counselorPersona || "neutral",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
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
    counselorPersona: v.optional(v.string()),
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
      throw new Error("Welcome back! It looks like you've already joined SafeSpace with this email. Please try logging in instead, we're here to listen.")
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
      counselorPersona: args.counselorPersona || "neutral",
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
    counselorPersona: v.optional(v.string()),
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
    if (args.counselorPersona) {
      updates.counselorPersona = args.counselorPersona
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("No changes to save")
    }

    await ctx.db.patch(args.userId, updates)
    return { updated: true }
  },
})

// Query to get all users with their last message
export const getUsersWithLastMessage = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect()
    const latestMessageByUser = new Map<string, { content: string; timestamp: string }>()
    const messages = await ctx.db.query("messages").order("desc").collect()

    // Walk newest-first and keep only the first message per user.
    for (const message of messages) {
      if (!latestMessageByUser.has(message.userId)) {
        latestMessageByUser.set(message.userId, {
          content: message.content,
          timestamp: message.timestamp,
        })
      }
    }

    const usersWithLastMessage = users.map((user) => {
      const safeUser = {
        _id: user._id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        topic: user.topic,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        counselorPersona: user.counselorPersona,
      }

      return {
        ...safeUser,
        lastMessage: latestMessageByUser.get(String(user._id)) ?? null,
      }
    })
    
    // Sort by last message timestamp desc (users with recent activity first)
    return usersWithLastMessage.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp || a.createdAt
      const timeB = b.lastMessage?.timestamp || b.createdAt
      return new Date(timeB).getTime() - new Date(timeA).getTime()
    })
  }
})
