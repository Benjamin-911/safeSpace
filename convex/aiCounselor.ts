import { FineTunedSierraLeoneAI } from "./ai/mainOrchestrator"
import { action, mutation, query } from "./_generated/server"
import { api } from "./_generated/api"
import { v } from "convex/values"

import { GeminiProvider, GroqProvider, cascadeAIProviders } from "./ai/aiProviders"

// Singleton instance (recreated per request in serverless, but cached per execution)
let aiInstance: FineTunedSierraLeoneAI | null = null

function getAIInstance(): FineTunedSierraLeoneAI {
  if (!aiInstance) {
    aiInstance = new FineTunedSierraLeoneAI()
  }
  return aiInstance
}

export const processMessage = action({
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

    // 1. Search Knowledge Base for facts
    let facts: string[] = []
    try {
      const searchResults = await ctx.runAction(api.knowledgeBase.searchKnowledge, {
        query: args.message,
        limit: 2
      })
      facts = searchResults.map((r: any) => r.content)
    } catch (e) {
      console.warn("Knowledge search failed:", e)
    }

    // 2. Get user context
    const user = await ctx.runQuery(api.users.getUserById, { userId: args.userId as any })

    const enhancedContext: any = {
      ...args.context,
      topic: args.context?.topic || (user as any)?.topic,
      sessionCount: ((user as any)?.sessionCount || 0) + 1
    }

    // 3. Analyze intent locally first (for emergency detection)
    const intent = ai.intentClassifier.classify(args.message)
    const isEmergency = intent.primaryIntent === "emergency" || intent.confidence > 5

    if (isEmergency) {
      const result = await ai.processMessage(args.message, enhancedContext, facts)
      return {
        response: result.response,
        isEmergency: true,
        resources: result.suggestedResources,
        confidence: result.confidence,
        timestamp: Date.now()
      }
    }

    // 4. For non-emergencies, use AI cascade (Gemini → Groq → Templates)
    const systemInstruction = `You are a compassionate, empathetic, and professional mental health counselor based in Sierra Leone. 
    Your goals are to provide support, listen actively, and guide users toward appropriate resources.
    Respond with cultural sensitivity to the Sierra Leonean context. You may use Krio greetings like 'Kushe' or 'Na so' ONLY at the very beginning of a conversation or when greeting someone for the first time. Do not use them in follow-up messages.
    If facts are provided below, synthesize them naturally into your response instead of listing them.`

    // Set up provider cascade
    const providers = [
      new GeminiProvider(),
      new GroqProvider()
    ]

    console.log("[AI Counselor] Attempting AI cascade...")
    const cascadeResult = await cascadeAIProviders(providers, args.message, systemInstruction, facts)

    if (cascadeResult.success && cascadeResult.response) {
      console.log(`[AI Counselor] ✓ ${cascadeResult.provider} succeeded!`)
      return {
        response: cascadeResult.response,
        isEmergency: false,
        resources: ai.getSuggestedResources(intent.primaryIntent, enhancedContext.location),
        confidence: 0.9,
        provider: cascadeResult.provider, // Track which provider was used
        timestamp: Date.now()
      }
    }

    // Fallback to local orchestrator if Gemini fails
    console.log("[AI Counselor] Falling back to local orchestrator for response generation")
    const result = await ai.processMessage(args.message, enhancedContext, facts)
    return {
      response: result.response,
      isEmergency: result.isEmergency,
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

