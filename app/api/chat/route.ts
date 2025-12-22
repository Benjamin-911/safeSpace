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
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim() || process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim()

    console.log("[Chat API] API Key present:", !!geminiApiKey)

    if (!geminiApiKey) {
      console.error("[Chat API] Gemini API key not configured")
      return NextResponse.json(
        {
          error: "Gemini API key not configured",
          message: "Please add GEMINI_API_KEY to your .env.local file and restart the server.",
          code: "API_KEY_MISSING",
          fallback: true
        },
        { status: 500 }
      )
    }

    // Build conversation history for Gemini
    const contents: Array<{ role: "user" | "model"; parts: [{ text: string }] }> = []

    // Add system instruction (Gemini 1.5 supports system_instruction, but for simplicity we'll prepend it to the first message if needed, or use the dedicated property)
    const systemInstruction = `You are a compassionate, empathetic, and professional mental health counselor based in Sierra Leone.
Your goals are to provide support, listen actively, and guide users toward appropriate resources.
Respond with cultural sensitivity to the Sierra Leonean context. You may use Krio greetings like 'Kushe' or 'Na so' ONLY at the very beginning of a conversation or when greeting someone for the first time. Do not use them in follow-up messages.
Provide thoughtful, complete responses that help users feel heard and supported.`

    // Add current user message with system instruction if it's the first message
    const history = (conversationHistory || []).slice(-10)

    // Convert history to Gemini format
    for (let i = 0; i < history.length; i += 2) {
      const userMsg = history[i]
      const modelMsg = history[i + 1]

      if (userMsg) contents.push({ role: "user", parts: [{ text: userMsg }] })
      if (modelMsg) contents.push({ role: "model", parts: [{ text: modelMsg }] })
    }

    // Add current message
    contents.push({ role: "user", parts: [{ text: message }] })

    console.log(`[Chat API] Sending to Gemini: ${contents.length} messages`)

    // Make request to Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1200,
        },
      }),
    })

    console.log(`[Gemini] Response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData.error?.message || errorData.message || `Status ${response.status}`

      console.error(`[Gemini] ✗ Error (${response.status}):`, errorMsg)
      return NextResponse.json(
        {
          error: "Gemini API error",
          message: errorMsg,
          code: "API_ERROR",
          fallback: true
        },
        { status: response.status }
      )
    }

    // Parse the successful response
    const data = await response.json()
    const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiContent || typeof aiContent !== "string") {
      console.error("Invalid response format from Gemini:", data)
      return NextResponse.json(
        {
          error: "No response from Gemini",
          message: "Gemini returned an unexpected response format.",
          code: "INVALID_RESPONSE",
          fallback: true
        },
        { status: 500 }
      )
    }

    console.log(`[Gemini] ✓ Successfully generated response`)

    return NextResponse.json({
      content: aiContent.trim(),
      model: "gemini-flash-latest",
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
