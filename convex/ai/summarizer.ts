import { ActionCtx, action } from "../_generated/server";
import { v } from "convex/values";
import { GeminiProvider, GroqProvider, cascadeAIProviders } from "../ai/aiProviders";
import { api } from "../_generated/api";

/**
 * AI Action to summarize a range of messages.
 */
export const summarizeConversation = action({
    args: {
        userId: v.string(),
        messages: v.array(v.object({
            role: v.union(v.literal("user"), v.literal("counselor")),
            content: v.string(),
        })),
    },
    handler: async (ctx: ActionCtx, args: { userId: string; messages: { role: "user" | "counselor"; content: string }[] }) => {
        if (args.messages.length === 0) return "";

        const conversationText = args.messages
            .map((m) => `${m.role === "user" ? "User" : "Counselor"}: ${m.content}`)
            .join("\n");

        const systemInstruction = `You are an expert mental health counselor's assistant. 
    Your task is to provide a concise, professional, and empathetic summary of the preceding conversation.
    Focus on:
    1. The user's primary concerns (e.g., anxiety, grief, relationship issues).
    2. Any progress made or coping strategies discussed.
    3. The general mood and tone of the user.
    4. Key facts mentioned (e.g., "User lost their job").
    
    Keep the summary to 3-4 sentences maximum. Write it in the third person.`;

        const prompt = `Summarize the following conversation between a user and their SafeSpace counselor:\n\n${conversationText}`;

        const providers = [new GeminiProvider(), new GroqProvider()];

        const result = await cascadeAIProviders(
            providers,
            prompt,
            systemInstruction,
            [], // No additional facts needed for summarization
            []  // No history needed for summarization itself
        );

        if (!result.success) {
            console.error("Summarization failed:", result.error);
            return "";
        }

        return result.response;
    },
});
