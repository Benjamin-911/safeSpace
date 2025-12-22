import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get API key from environment or use default
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim()

    if (!geminiApiKey) {
      return NextResponse.json(
        { 
          valid: false,
          error: "No API key provided",
          message: "Please set GEMINI_API_KEY in .env.local or update the default key"
        },
        { status: 400 }
      )
    }

    // Validate API key format
    if (!geminiApiKey.startsWith("AIza")) {
      return NextResponse.json(
        { 
          valid: false,
          error: "Invalid API key format",
          message: "Gemini API keys should start with 'AIza'"
        },
        { status: 400 }
      )
    }

    // First, try to list available models to see what's available
    console.log("[Gemini Test] Listing available models...")
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`
    
    let availableModels: string[] = []
    try {
      const listResponse = await fetch(listUrl)
      if (listResponse.ok) {
        const listData = await listResponse.json()
        availableModels = listData.models?.map((m: any) => m.name) || []
        console.log("[Gemini Test] Available models:", availableModels)
      }
    } catch (err) {
      console.log("[Gemini Test] Could not list models, will try common ones")
    }

    // Try models in order of preference
    const modelsToTry = [
      "gemini-pro",
      "gemini-1.5-pro", 
      "gemini-1.5-flash",
      "models/gemini-pro",
      "models/gemini-1.5-pro",
      "models/gemini-1.5-flash"
    ]

    // If we got available models, prioritize those
    if (availableModels.length > 0) {
      const modelNames = availableModels.filter((m: string) => 
        m.includes("gemini") && !m.includes("embedding")
      )
      if (modelNames.length > 0) {
        modelsToTry.unshift(...modelNames.slice(0, 3))
      }
    }

    console.log("[Gemini Test] Testing API key with models:", modelsToTry.slice(0, 3))
    
    // Try v1beta first
    let response: Response | null = null
    let workingModel = ""
    let lastError: any = null

    for (const modelName of modelsToTry) {
      const cleanModelName = modelName.replace("models/", "")
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModelName}:generateContent?key=${geminiApiKey}`
      
      try {
        response = await fetch(testUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{ text: "Say 'Hello' if you can read this." }]
            }],
            generationConfig: {
              maxOutputTokens: 10,
            },
          }),
        })

        if (response.ok) {
          workingModel = cleanModelName
          break
        }

        const errorData = await response.json().catch(() => ({}))
        lastError = errorData
        console.log(`[Gemini Test] ${cleanModelName} failed: ${response.status}`)
        
        // If 401/403, don't try other models
        if (response.status === 401 || response.status === 403) {
          break
        }
      } catch (err) {
        lastError = err
        continue
      }
    }

    if (response && response.ok) {
      const responseData = await response.json().catch(() => ({}))
      const content = responseData.candidates?.[0]?.content?.parts?.[0]?.text
      return NextResponse.json({
        valid: true,
        message: "API key is valid and working!",
        testResponse: content || "Received response",
        model: workingModel,
        apiVersion: "v1beta",
        availableModels: availableModels.length > 0 ? availableModels : undefined,
        status: response.status
      })
    }

    // If v1beta failed, try v1 API
    if (response && response.status === 404) {
      console.log("[Gemini Test] Trying v1 API...")
      for (const modelName of modelsToTry.slice(0, 3)) {
        const cleanModelName = modelName.replace("models/", "")
        const v1Url = `https://generativelanguage.googleapis.com/v1/models/${cleanModelName}:generateContent?key=${geminiApiKey}`
        
        try {
          const v1Response = await fetch(v1Url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                role: "user",
                parts: [{ text: "Say 'Hello' if you can read this." }]
              }],
              generationConfig: {
                maxOutputTokens: 10,
              },
            }),
          })

          if (v1Response.ok) {
            const v1Data = await v1Response.json().catch(() => ({}))
            const content = v1Data.candidates?.[0]?.content?.parts?.[0]?.text
            return NextResponse.json({
              valid: true,
              message: "API key is valid and working!",
              testResponse: content || "Received response",
              model: cleanModelName,
              apiVersion: "v1",
              availableModels: availableModels.length > 0 ? availableModels : undefined,
              status: v1Response.status
            })
          }
        } catch (err) {
          continue
        }
      }
    }

    // Handle different error cases
    if (response && (response.status === 401 || response.status === 403)) {
      const responseData = await response.json().catch(() => ({}))
      return NextResponse.json({
        valid: false,
        error: "Invalid API key",
        message: "The API key is invalid or expired. Please check your key.",
        status: response.status,
        details: responseData.error?.message || responseData.message
      }, { status: 401 })
    }

    const responseData = lastError || {}
    return NextResponse.json({
      valid: false,
      error: "API test failed",
      message: `Unable to connect to Gemini API. Status: ${response?.status || "unknown"}`,
      status: response?.status || 500,
      details: responseData.error?.message || responseData.message || "Unknown error",
      availableModels: availableModels.length > 0 ? availableModels : "Could not list models",
      triedModels: modelsToTry.slice(0, 5)
    }, { status: response?.status || 500 })

  } catch (error) {
    console.error("[Gemini Test] Error:", error)
    return NextResponse.json({
      valid: false,
      error: "Test failed",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      type: error instanceof TypeError ? "Network error - check your internet connection" : "Unknown error"
    }, { status: 500 })
  }
}

