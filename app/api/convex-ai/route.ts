// API Route to call Convex AI from client-side
// This is a workaround since we can't directly call Convex mutations from lib/ai.ts

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, userId, context } = body

    if (!message || !userId) {
      return NextResponse.json(
        { error: "Missing message or userId" },
        { status: 400 }
      )
    }

    // For now, return a response indicating Convex AI should be called from the component
    // In production, you might want to set up a server-side Convex client here
    return NextResponse.json({
      error: "Convex AI should be called directly from the component using useMutation",
      message: "Use the Convex AI directly in the component instead"
    }, { status: 501 })
  } catch (error) {
    console.error("Error in convex-ai route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

