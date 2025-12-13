import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[Chat API] Request received")
    
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[Chat API] Failed to parse request body:", parseError)
      return NextResponse.json(
        { 
          error: "Invalid request body",
          message: "Failed to parse request JSON.",
          code: "INVALID_REQUEST"
        },
        { status: 400 }
      )
    }
    
    const { message, conversationHistory } = body

    if (!message || typeof message !== "string") {
      console.error("[Chat API] Invalid message:", message)
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Get API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY?.trim()

    console.log("[Chat API] API Key present:", !!openaiApiKey)

    if (!openaiApiKey) {
      console.error("[Chat API] OpenAI API key not configured")
      return NextResponse.json(
        { 
          error: "OpenAI API key not configured",
          message: "Please add OPENAI_API_KEY to your .env.local file and restart the server.",
          code: "API_KEY_MISSING",
          fallback: true
        },
        { status: 500 }
      )
    }

    // Build conversation history for OpenAI
    // OpenAI uses an array of messages with role and content
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = []

    // Add system instruction
    const systemInstruction = `You are a compassionate, empathetic, and professional mental health counselor based in Sierra Leone, serving users through SafeSpace Salone. Your role is to:
- Provide supportive, non-judgmental responses that are culturally sensitive and appropriate for Sierra Leone
- Listen actively and validate the user's feelings, respecting Sierra Leonean cultural values, traditions, family structures, and community support systems
- Ask thoughtful questions to understand their situation better, being mindful of Sierra Leonean cultural context
- Offer gentle guidance and coping strategies that are culturally relevant and appropriate for Sierra Leone
- Be aware of Sierra Leonean family structures, extended family networks, community support systems, and cultural approaches to mental health
- Use examples and language that resonate with Sierra Leonean experiences, contexts, and daily life
- Understand the importance of community, family, and traditional support networks in Sierra Leonean culture
- Maintain professional boundaries while being warm and understanding
- Never provide medical diagnoses or replace professional therapy
- Keep responses conversational and natural (3-5 sentences when appropriate, up to 600 tokens)
- Use a warm, caring tone that makes the user feel heard and supported
- Be culturally aware and sensitive - respect Sierra Leonean perspectives, values, communication styles, and cultural norms
- Avoid making assumptions based on cultural stereotypes
- Focus primarily on the user's CURRENT message - respond to what they're saying right now
- Only reference past conversation context if the user explicitly mentions or brings up something from earlier
- Do NOT automatically bring up past topics unless the user references them
- For crisis situations (suicidal thoughts, self-harm, severe mental health crisis), provide Sierra Leone-specific resources:
  * Ministry of Health and Sanitation mental health services
  * Connaught Hospital and other major hospitals with mental health support
  * Local health centers and clinics
  * Community-based support systems and traditional support networks
  * Religious and spiritual support (if appropriate and welcomed by the user)
  * Emergency services: 999 (police/ambulance) for immediate emergencies
  * Local mental health organizations and NGOs in Sierra Leone
- Be natural and conversational, not robotic
- Never mention that you are an AI or artificial intelligence
- Respond as if you are a real human counselor in Sierra Leone with deep cultural awareness, sensitivity, and understanding of Sierra Leonean society`

    messages.push({ role: "system", content: systemInstruction })

    // Add conversation history - alternate between user and assistant messages
    const recentHistory = (conversationHistory || []).slice(-10)
    
    for (let i = 0; i < recentHistory.length; i += 2) {
      const userMsg = recentHistory[i]
      const assistantMsg = recentHistory[i + 1]
      
      if (userMsg && typeof userMsg === "string" && userMsg.trim()) {
        messages.push({ role: "user", content: userMsg.trim() })
      }
      if (assistantMsg && typeof assistantMsg === "string" && assistantMsg.trim()) {
        messages.push({ role: "assistant", content: assistantMsg.trim() })
      }
    }

    // Add current user message
    messages.push({ role: "user", content: message.trim() })

    console.log(`[Chat API] Sending to OpenAI: ${messages.length} messages`)

    // Make request to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost-effective model, good quality
        messages: messages,
        temperature: 0.8,
        max_tokens: 600,
      }),
    })

    console.log(`[OpenAI] Response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData.error?.message || errorData.message || `Status ${response.status}`
      
      // Handle rate limits
      if (response.status === 429) {
        console.error(`[OpenAI] ✗ Rate limit exceeded (429):`, errorMsg)
        return NextResponse.json(
          { 
            error: "Rate limit exceeded",
            message: `OpenAI API rate limit exceeded. ${errorMsg}. Using fallback AI.`,
            code: "RATE_LIMIT",
            fallback: true
          },
          { status: 429 }
        )
      }

      // Handle API key errors
      if (response.status === 401) {
        console.error(`[OpenAI] ✗ Invalid API key (401):`, errorMsg)
        return NextResponse.json(
          { 
            error: "Invalid API key",
            message: `Please check your OPENAI_API_KEY. Error: ${errorMsg}`,
            code: "INVALID_API_KEY",
            fallback: true
          },
          { status: 401 }
        )
      }

      // Handle other errors
      console.error(`[OpenAI] ✗ Error (${response.status}):`, errorMsg)
      return NextResponse.json(
        { 
          error: "OpenAI API error",
          message: errorMsg,
          code: "API_ERROR",
          fallback: true
        },
        { status: response.status }
      )
    }

    // Parse the successful response
    const data = await response.json()
    const aiContent = data.choices?.[0]?.message?.content

    if (!aiContent || typeof aiContent !== "string") {
      console.error("Invalid response format from OpenAI:", data)
      return NextResponse.json(
        { 
          error: "No response from OpenAI",
          message: "OpenAI returned an unexpected response format.",
          code: "INVALID_RESPONSE",
          fallback: true
        },
        { status: 500 }
      )
    }

    console.log(`[OpenAI] ✓ Successfully generated response`)

    return NextResponse.json({
      content: aiContent.trim(),
      model: data.model || "gpt-4o-mini",
      usage: data.usage,
    })
  } catch (error) {
    console.error("[Chat API] Unhandled error:", error)
    console.error("[Chat API] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { 
          error: "Network error",
          message: "Unable to connect to OpenAI API. Please check your internet connection.",
          code: "NETWORK_ERROR",
          fallback: true
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: errorMessage,
        code: "INTERNAL_ERROR",
        fallback: true
      },
      { status: 500 }
    )
  }
}
