import { FineTunedSierraLeoneAI } from "./ai/mainOrchestrator"
import { action, mutation, query } from "./_generated/server"
import { api } from "./_generated/api"
import { v } from "convex/values"

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

    // 4. For non-emergencies, use Gemini for synthesis
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY
      console.log("[AI Counselor] Checking Gemini API Key presence:", !!geminiApiKey)

      if (!geminiApiKey) {
        console.warn("[AI Counselor] GEMINI_API_KEY not found in environment")
        throw new Error("GEMINI_API_KEY not set")
      }

      const factsContext = facts.length > 0
        ? `\n\nUSE THESE FACTS TO INFORM YOUR RESPONSE:\n${facts.join("\n")}`
        : ""

      const systemInstruction = `You are a compassionate, empathetic, and professional mental health counselor based in Sierra Leone. 
      Your goals are to provide support, listen actively, and guide users toward appropriate resources.
      Always respond with cultural sensitivity to the Sierra Leonean context (e.g., using Krio greetings like 'Kushe' or 'Na so' occasionally, acknowledging local challenges).
      If facts are provided below, synthesize them naturally into your response instead of listing them.
      ${factsContext}`

      console.log("[AI Counselor] Attempting Gemini synthesis...")

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: args.message }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (aiResponse) {
          console.log("[AI Counselor] Gemini synthesis successful!")
          return {
            response: aiResponse.trim(),
            isEmergency: false,
            resources: ai.getSuggestedResources(intent.primaryIntent, enhancedContext.location),
            confidence: 0.9,
            timestamp: Date.now()
          }
        } else {
          console.warn("[AI Counselor] Gemini returned empty response or invalid format")
        }
      } else {
        const errorText = await response.text()
        console.error(`[AI Counselor] Gemini API error (${response.status}):`, errorText)
      }
    } catch (e) {
      console.error("[AI Counselor] Gemini synthesis exception:", e)
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

