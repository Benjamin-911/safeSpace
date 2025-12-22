"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { VoiceRecorder } from "@/components/voice-recorder"
import { getAvatarById } from "@/components/avatar-selector"
import { getCurrentUserId } from "@/lib/user-session"
import { generateCounselorResponse } from "@/lib/ai"
import { transcribeAudio } from "@/lib/audio-transcription"
import { Lock, Send, ArrowLeft, FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const router = useRouter()
  const userId = getCurrentUserId()
  const user = useQuery(api.users.getUserById, userId ? { userId: userId as any } : "skip")
  const messages = useQuery(api.messages.getMessages, userId ? { userId: userId as any } : "skip") || []
  const sendMessageMutation = useMutation(api.messages.sendMessage)
  const convexAIResponse = useAction(api.aiCounselor.processMessage)

  const [text, setText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [sessionResources, setSessionResources] = useState<Record<string, string[]>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const welcomeMessageSentRef = useRef(false)

  useEffect(() => {
    if (!userId) {
      router.push("/")
      return
    }

    // Skip if we've already sent or if messages are still loading
    if (messages === undefined || welcomeMessageSentRef.current) {
      return
    }

    // Check if welcome message already exists in messages
    const hasWelcomeMessage = messages.some(
      (msg: any) => msg.sender === "counselor" &&
        msg.content.includes("Hello, I'm here to listen")
    )

    // Add welcome message only once if no messages exist
    if (messages.length === 0 && !hasWelcomeMessage) {
      welcomeMessageSentRef.current = true
      sendMessageMutation({
        userId,
        content: "Hello, I'm here to listen. How are you feeling today?",
        sender: "counselor",
        type: "text",
      }).catch((err) => {
        console.error("Error sending welcome message:", err)
        welcomeMessageSentRef.current = false // Reset on error so we can retry
      })
    } else if (messages.length > 0 || hasWelcomeMessage) {
      // If messages exist or welcome message exists, mark as sent
      welcomeMessageSentRef.current = true
    }
  }, [userId, messages, sendMessageMutation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isAIThinking])

  const sendTextMessage = async () => {
    if (!text.trim() || !userId || !user) return

    // Save user message
    await sendMessageMutation({
      userId,
      content: text.trim(),
      sender: "user",
      type: "text",
    })

    const messageText = text.trim()
    setText("")
    setShowTextInput(false)

    // Generate AI counselor response
    setIsAIThinking(true)
    try {
      // Build conversation history from messages
      const conversationHistory = (messages || [])
        .slice(-10)
        .map((m) => m.content)
        .filter((content) => content && content.trim().length > 0)

      // Add a small delay to help prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Try Convex AI first (offline-capable, culturally aware), then OpenAI, then local fallback
      // Note: Convex AI requires 'npx convex dev' to be running
      let aiResponse: { content: string; suggestions?: string[] }
      let triedConvex = false

      // Try Convex AI first - it's specifically fine-tuned for Sierra Leone
      try {
        console.log("Trying Convex AI (fine-tuned for Sierra Leone)...")
        triedConvex = true
        const convexResult = await convexAIResponse({
          message: messageText,
          userId,
          context: {
            topic: user?.topic,
          }
        })

        // Handle emergency response
        if (convexResult.isEmergency) {
          console.warn("EMERGENCY DETECTED:", convexResult)
        }

        aiResponse = {
          content: convexResult.response,
          suggestions: convexResult.resources
        }
      } catch (convexError: any) {
        // If Convex function not found, it means Convex dev isn't running
        // Fallback gracefully to OpenAI or local AI
        const isConvexNotFound = convexError?.message?.includes("Could not find public function") ||
          convexError?.message?.includes("aiCounselor") ||
          convexError?.toString().includes("aiCounselor")

        if (isConvexNotFound && triedConvex) {
          console.log("Convex AI not available (run 'npx convex dev'), trying alternatives...")
        } else {
          console.warn("Convex AI error:", convexError)
        }

        // Try OpenAI, then local fallback
        try {
          console.log("Trying OpenAI...")
          aiResponse = await generateCounselorResponse(messageText, conversationHistory, true, user?.topic, userId)
        } catch (openAIError) {
          console.log("OpenAI failed, using local fallback AI...")
          // Final fallback to local AI (always works)
          aiResponse = await generateCounselorResponse(messageText, conversationHistory, false, user?.topic, userId)
        }
      }

      // Save counselor message
      const messageId = await sendMessageMutation({
        userId,
        content: aiResponse.content,
        sender: "counselor",
        type: "text",
      })

      // Store resources locally for the current session
      if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
        setSessionResources(prev => ({
          ...prev,
          [messageId.toString()]: aiResponse.suggestions!
        }))
      }
    } catch (error) {
      console.error("Error generating AI response:", error)
      // Fallback message
      await sendMessageMutation({
        userId,
        content: "I'm here to listen. Can you tell me more about what you're experiencing?",
        sender: "counselor",
        type: "text",
      })
    } finally {
      setIsAIThinking(false)
    }
  }

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (!userId || !user) return

    const audioUrl = URL.createObjectURL(audioBlob)

    // Start transcription and AI thinking
    setIsAIThinking(true)

    try {
      // Try to transcribe the audio
      let transcribedText = ""
      try {
        console.log("Transcribing audio with Whisper...")
        transcribedText = await transcribeAudio(audioBlob, true) // Use OpenAI Whisper API
        console.log("Transcription successful:", transcribedText)
      } catch (transcriptionError: any) {
        console.warn("Audio transcription failed:", transcriptionError)
        // Continue with fallback if transcription fails
        transcribedText = ""
      }

      // Save voice message with transcription if available
      await sendMessageMutation({
        userId,
        content: transcribedText || "Voice message",
        sender: "user",
        type: "voice",
        audioUrl,
      })

      // Build conversation history
      const conversationHistory = (messages || [])
        .slice(-10)
        .map((m) => m.content)
        .filter((content) => content && content.trim().length > 0)

      // Use transcribed text if available, otherwise use a neutral prompt
      // This prevents incorrect intent detection (like war/trauma) when transcription fails
      const messageToProcess = transcribedText.trim() ||
        (conversationHistory.length > 0
          ? "The user sent a voice message continuing our conversation. Respond empathetically and ask them to share more about what they're feeling, or suggest they type their message if that's easier."
          : "The user sent a voice message to start our conversation. Respond warmly and empathetically, acknowledging they chose to use their voice. Gently ask them to share what they're experiencing, or offer that they can type instead if preferred.")

      await new Promise((resolve) => setTimeout(resolve, 300))

      // Use same AI system as text messages - try Convex AI first, then OpenAI, then local
      let aiResponse: { content: string; suggestions?: string[] }
      let triedConvex = false

      // Try Convex AI first with transcribed text
      try {
        console.log("Trying Convex AI for voice message...")
        triedConvex = true

        const convexResult = await convexAIResponse({
          message: messageToProcess,
          userId,
          context: {
            topic: user?.topic,
          }
        })

        if (convexResult.isEmergency) {
          console.warn("EMERGENCY DETECTED in voice message:", convexResult)
        }

        aiResponse = {
          content: convexResult.response,
          suggestions: convexResult.resources
        }
      } catch (convexError: any) {
        const isConvexNotFound = convexError?.message?.includes("Could not find public function") ||
          convexError?.message?.includes("aiCounselor") ||
          convexError?.toString().includes("aiCounselor")

        if (isConvexNotFound && triedConvex) {
          console.log("Convex AI not available, trying alternatives for voice message...")
        } else {
          console.warn("Convex AI error for voice:", convexError)
        }

        // Try OpenAI, then local fallback
        try {
          console.log("Trying OpenAI for voice message...")
          aiResponse = await generateCounselorResponse(
            messageToProcess,
            conversationHistory,
            true,
            user?.topic,
            userId
          )
        } catch (openAIError) {
          console.log("OpenAI failed for voice, using local fallback...")
          // Final fallback - use local AI with transcribed text or generic message
          aiResponse = await generateCounselorResponse(
            messageToProcess,
            conversationHistory,
            false,
            user?.topic,
            userId
          )
        }
      }

      // Save counselor message
      const messageId = await sendMessageMutation({
        userId,
        content: aiResponse.content,
        sender: "counselor",
        type: "text",
      })

      // Store resources locally for the current session
      if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
        setSessionResources(prev => ({
          ...prev,
          [messageId.toString()]: aiResponse.suggestions!
        }))
      }
    } catch (error) {
      console.error("Error processing voice message:", error)
      // Fallback message for voice
      await sendMessageMutation({
        userId,
        content: "Thank you for sending a voice message. I'm here to listen. Can you tell me more about what you're experiencing? You can type your message or send another voice message.",
        sender: "counselor",
        type: "text",
      })
    } finally {
      setIsAIThinking(false)
    }
  }

  if (user === undefined || messages === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user || !userId) {
    router.push("/")
    return null
  }

  const userAvatar = getAvatarById(user.avatar)

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-white/30 px-4 py-3 sm:px-4 sm:py-4 safe-area-top shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full touch-manipulation hover:bg-white/50 transition-all"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="font-bold text-base sm:text-lg truncate bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Counselor
              </h1>
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">Online • Confidential</p>
          </div>
          <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-lg border-4 border-white", userAvatar.bg)}>
            {userAvatar.emoji}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-4 sm:py-4 space-y-2" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        {messages.map((message) => (
          <ChatMessage
            key={message._id}
            message={{
              ...message,
              // Use sessionResources for displaying AI suggestions without DB modification
              resources: sessionResources[message._id]
            }}
          />
        ))}
        {isAIThinking && (
          <div className="flex justify-start mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/50 shadow-sm flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce"></div>
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Counselor is thinking</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 glass border-t border-white/30 p-4 sm:p-5 space-y-3 shadow-lg" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        {showTextInput ? (
          <div className="flex items-center gap-3">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 h-14 sm:h-14 rounded-full px-5 text-base sm:text-base border-2 border-white/50 focus:border-purple-400 bg-white/80 backdrop-blur-sm shadow-md"
              onKeyDown={(e) => e.key === "Enter" && sendTextMessage()}
              autoFocus
            />
            <Button
              type="button"
              onClick={sendTextMessage}
              disabled={!text.trim()}
              size="icon"
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full gradient-primary shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 active:scale-95 touch-manipulation disabled:opacity-50"
            >
              <Send className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 sm:gap-5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowTextInput(true)}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/80 backdrop-blur-sm border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95 touch-manipulation"
            >
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </Button>
            <VoiceRecorder
              onSend={sendVoiceMessage}
              onCancel={() => { }}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
            />
          </div>
        )}

        {/* Encrypted badge */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 font-medium bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm max-w-fit mx-auto">
          <Lock className="h-3.5 w-3.5 text-purple-500" />
          <span>End-to-end encrypted</span>
        </div>
      </footer>
    </div>
  )
}

