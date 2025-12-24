import { action } from "./_generated/server"
import { v } from "convex/values"

export const testGroqConnection = action({
    args: {},
    handler: async (ctx) => {
        const groqApiKey = process.env.GROQ_API_KEY
        if (!groqApiKey) {
            return { success: false, error: "GROQ_API_KEY is not set in Convex environment variables." }
        }

        console.log("Testing Groq connection with model: llama-3.3-70b-versatile...")

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${groqApiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "user", content: "Hello, say 'Groq is Working' if you can read this." }
                    ],
                    max_tokens: 50
                }),
            })

            if (!response.ok) {
                const errorText = await response.text()
                return {
                    success: false,
                    status: response.status,
                    error: errorText,
                    tip: "Check if the API key is correct and if the model ID is still valid."
                }
            }

            const data = await response.json()
            return {
                success: true,
                response: data.choices?.[0]?.message?.content,
                modelUsed: data.model
            }
        } catch (e: any) {
            return { success: false, error: e.message }
        }
    },
})
