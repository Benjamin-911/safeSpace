// AI Provider Interface and Implementations

export interface AIProvider {
    name: string
    generateResponse(prompt: string, systemInstruction: string, facts: string[]): Promise<string>
}

export interface AIProviderResult {
    success: boolean
    response?: string
    provider?: string
    error?: string
}

// Gemini Provider
export class GeminiProvider implements AIProvider {
    name = "Gemini 1.5 Flash"

    async generateResponse(prompt: string, systemInstruction: string, facts: string[]): Promise<string> {
        const geminiApiKey = process.env.GEMINI_API_KEY
        if (!geminiApiKey) {
            throw new Error("GEMINI_API_KEY not configured")
        }

        const factsContext = facts.length > 0
            ? `\n\nUSE THESE FACTS TO INFORM YOUR RESPONSE:\n${facts.join("\n")}`
            : ""

        const fullSystemInstruction = systemInstruction + factsContext

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: fullSystemInstruction }] },
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Gemini API error (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!aiResponse) {
            throw new Error("Gemini returned empty response")
        }

        return aiResponse.trim()
    }
}

// Groq Provider (Llama 3.1 70B)
export class GroqProvider implements AIProvider {
    name = "Groq (Llama 3.1)"

    async generateResponse(prompt: string, systemInstruction: string, facts: string[]): Promise<string> {
        const groqApiKey = process.env.GROQ_API_KEY
        if (!groqApiKey) {
            throw new Error("GROQ_API_KEY not configured")
        }

        const factsContext = facts.length > 0
            ? `\n\nUSE THESE FACTS TO INFORM YOUR RESPONSE:\n${facts.join("\n")}`
            : ""

        const fullSystemInstruction = systemInstruction + factsContext

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${groqApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-70b-versatile",
                messages: [
                    { role: "system", content: fullSystemInstruction },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1200
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Groq API error (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        const aiResponse = data.choices?.[0]?.message?.content

        if (!aiResponse) {
            throw new Error("Groq returned empty response")
        }

        return aiResponse.trim()
    }
}

// Cascade orchestrator - tries providers in order until one succeeds
export async function cascadeAIProviders(
    providers: AIProvider[],
    prompt: string,
    systemInstruction: string,
    facts: string[]
): Promise<AIProviderResult> {
    for (const provider of providers) {
        try {
            console.log(`[AI Cascade] Trying ${provider.name}...`)
            const response = await provider.generateResponse(prompt, systemInstruction, facts)
            console.log(`[AI Cascade] ✓ ${provider.name} succeeded`)
            return {
                success: true,
                response,
                provider: provider.name
            }
        } catch (error) {
            console.warn(`[AI Cascade] ✗ ${provider.name} failed:`, error)
            // Continue to next provider
            continue
        }
    }

    // All providers failed
    return {
        success: false,
        error: "All AI providers failed"
    }
}
