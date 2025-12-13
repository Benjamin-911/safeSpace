// Main AI Counselor Export for Convex

import { FineTunedSierraLeoneAI } from "./ai/mainOrchestrator"
import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Singleton instance (recreated per request in serverless, but cached per execution)
let aiInstance: FineTunedSierraLeoneAI | null = null

function getAIInstance(): FineTunedSierraLeoneAI {
  if (!aiInstance) {
    aiInstance = new FineTunedSierraLeoneAI()
  }
  return aiInstance
}

export const processMessage = mutation({
  args: {
    message: v.string(),
    userId: v.string(),
    context: v.optional(v.object({
      topic: v.optional(v.string()),
      location: v.optional(v.string()),
      gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
      ageGroup: v.optional(v.union(v.literal("teen"), v.literal("young_adult"), v.literal("adult"), v.literal("elder"))),
    }))
  },
  handler: async (ctx, args) => {
    const ai = getAIInstance()
    
    // Get user from database to enrich context
    let user = null
    try {
      user = await ctx.db.get(args.userId as any)
    } catch (e) {
      // User might not exist yet, continue anyway
    }
    
    const enhancedContext: Partial<{
      topic?: string
      location?: string
      gender?: "male" | "female"
      ageGroup?: "teen" | "young_adult" | "adult" | "elder"
      sessionCount: number
    }> = {
      ...args.context,
      topic: args.context?.topic || (user as any)?.topic,
      sessionCount: ((user as any)?.sessionCount || 0) + 1
    }
    
    const result = await ai.processMessage(args.message, enhancedContext)
    
    // If emergency, we could log it (but for now just return the response)
    // In production, you might want to notify counselors or log to emergency_logs table
    
    return {
      response: result.response,
      isEmergency: result.isEmergency,
      requiresFollowup: result.requiresFollowup,
      resources: result.suggestedResources,
      confidence: result.confidence,
      timestamp: Date.now()
    }
  }
})

// Query to get AI response (for read-only operations if needed)
export const getAIResponse = query({
  args: {
    message: v.string(),
    context: v.optional(v.object({
      topic: v.optional(v.string()),
      location: v.optional(v.string()),
    }))
  },
  handler: async (ctx, args) => {
    // For queries, we might want to use a simpler version
    // For now, use mutation for consistency
    const ai = getAIInstance()
    const result = await ai.processMessage(args.message, args.context || {})
    return {
      response: result.response,
      isEmergency: result.isEmergency,
      resources: result.suggestedResources
    }
  }
})

