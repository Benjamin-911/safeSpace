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

    // 2. Get user context and long-term memory
    const user = await ctx.runQuery(api.users.getUserById, { userId: args.userId as any })
    const isGuest = !user?.email

    // Only fetch summary if not a guest - Respect "No Memory" for anonymous users
    const latestSummary = isGuest ? null : await ctx.runQuery(api.summaries.getLatestSummary, { userId: args.userId })
    const messages = await ctx.runQuery(api.messages.getMessages, { userId: args.userId })

    const enhancedContext: any = {
      ...args.context,
      topic: args.context?.topic || (user as any)?.topic,
      counselorPersona: (user as any)?.counselorPersona || "neutral",
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
    let personaInstruction = "You are a compassionate, empathetic, and professional mental health counselor based in Sierra Leone."
    if (enhancedContext.counselorPersona === "sister_mabinty") {
      personaInstruction = "You are Sister Mabinty, a compassionate, maternal, and empathetic mental health counselor based in Sierra Leone. Speak with the warmth and wisdom of a caring older sister or mother figure."
    } else if (enhancedContext.counselorPersona === "brother_sorie") {
      personaInstruction = "You are Brother Sorie, a supportive, protective, and empathetic mental health counselor based in Sierra Leone. Speak with the strength and guidance of a caring older brother or father figure."
    }

    const systemInstruction = `${personaInstruction} 
    Your name is ${enhancedContext.counselorPersona === "sister_mabinty" ? "Sister Mabinty" : enhancedContext.counselorPersona === "brother_sorie" ? "Brother Sorie" : "SafeSpace Counselor"}.
    Always introduce yourself by name if it's the beginning of the conversation.
    
    ${latestSummary ? `PAST CONTEXT (Summary of previous discussions): ${latestSummary.content}` : ""}
    
    Your goals are to provide support, listen actively, and guide users toward appropriate resources.
    Respond with cultural sensitivity to the Sierra Leonean context. You may use Krio greetings like 'Kushe' or 'Na so' or 'Padi' ONLY at the very beginning of a conversation or when greeting someone for the first time. Do not use them in follow-up messages.
    If facts are provided below, synthesize them naturally into your response instead of listing them.`

    // Fetch recent message history for context using a query (actions can't use ctx.db directly)
    const recentMessages = await ctx.runQuery(api.messages.getRecentMessages, {
      userId: args.userId,
      limit: 10
    })

    // Map to the format the cascade expects (role/content)
    const history = recentMessages.reverse().map((msg: { sender: string; content: string }) => ({
      role: msg.sender === "counselor" ? "assistant" as const : "user" as const,
      content: msg.content
    }))

    // Initialize AI providers for cascade
    const providers = [new GeminiProvider(), new GroqProvider()]

    console.log(`[AI Counselor] Attempting AI cascade with ${history.length} messages of context...`)
    const cascadeResult = await cascadeAIProviders(providers, args.message, systemInstruction, facts, history)

    let finalResponse: {
      response: string;
      isEmergency: boolean;
      resources: string[];
      confidence: number;
      timestamp: number;
      provider?: string;
    }

    if (cascadeResult.success && cascadeResult.response) {
      console.log(`[AI Counselor] ✓ ${cascadeResult.provider} succeeded!`)
      finalResponse = {
        response: cascadeResult.response,
        isEmergency: false,
        resources: ai.getSuggestedResources(intent.primaryIntent, enhancedContext.location),
        confidence: 0.9,
        provider: cascadeResult.provider,
        timestamp: Date.now()
      }
    } else {
      // Fallback to local orchestrator if cascade fails
      console.log("[AI Counselor] Falling back to local orchestrator for response generation")
      const result = await ai.processMessage(args.message, enhancedContext, facts)
      finalResponse = {
        response: result.response,
        isEmergency: result.isEmergency,
        resources: result.suggestedResources,
        confidence: result.confidence,
        timestamp: Date.now()
      }
    }

    // 5. Trigger long-term memory summarization if needed (background)
    // Only for full users - Guests have no long-term memory
    if (!isGuest) {
      const unsummarizedCount = messages.length - (latestSummary?.messageCount || 0)
      if (unsummarizedCount > 15) {
        console.log(`[summarization] Triggering summary for user ${args.userId}...`)
        const summaryPayload = messages.map(m => ({
          role: m.sender === "counselor" ? "counselor" as const : "user" as const,
          content: m.content
        }))

        // Run summarization action and save result
        ctx.runAction(api.ai.summarizer.summarizeConversation, {
          userId: args.userId,
          messages: summaryPayload
        }).then((summaryContent) => {
          if (summaryContent) {
            ctx.runMutation(api.summaries.saveSummary, {
              userId: args.userId,
              content: summaryContent,
              messageCount: messages.length
            }).catch(e => console.error("Failed to save summary:", e))
          }
        }).catch(e => console.error("Summarization action failed:", e))
      }
    }

    return finalResponse
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

