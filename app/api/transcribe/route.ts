// API Route for OpenAI Whisper Audio Transcription

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const model = formData.get("model") || "whisper-1"
    const language = formData.get("language") || "en"

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      )
    }

    const openAIApiKey = process.env.OPENAI_API_KEY

    if (!openAIApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Using fallback transcription." },
        { status: 500 }
      )
    }

    // Convert File to format OpenAI expects
    const audioFile = new File([file], file.name, { type: file.type || "audio/webm" })

    // Call OpenAI Whisper API
    const whisperFormData = new FormData()
    whisperFormData.append("file", audioFile)
    whisperFormData.append("model", model as string)
    if (language) {
      whisperFormData.append("language", language as string)
    }

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: whisperFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error?.message || "Transcription failed" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      text: data.text,
      transcript: data.text, // Alias for compatibility
    })
  } catch (error: any) {
    console.error("Transcription error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

