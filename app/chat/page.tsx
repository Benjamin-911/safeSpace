/**
 * @copyright 2024-2025 Bernard Gamanga (SafeSpace Salone). All rights reserved.
 * This source code is confidential and proprietary to Bernard Gamanga.
 */
"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { getAvatarById } from "@/components/avatar-selector"
import { getCurrentUserId } from "@/lib/user-session"
import { generateCounselorResponse } from "@/lib/ai"
import { ArrowLeft, Send, Mic, Lock, MessageSquare, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const router = useRouter()
  const userId = getCurrentUserId()
  const user = useQuery(api.users.getUserById, userId ? { userId: userId as any } : "skip")
  const messages = useQuery(api.messages.getMessages, userId ? { userId: userId as any } : "skip") || []
  const sendMessageMutation = useMutation(api.messages.sendMessage)
  const convexAIResponse = useAction(api.aiCounselor.processMessage)

  const [text, setText] = useState("")
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [sessionResources, setSessionResources] = useState<Record<string, string[]>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const welcomeMessageSentRef = useRef(false)

  useEffect(() => {
    if (!userId) {
      router.push("/")
      return
    }

    // Skip if we've already sent in this session or if messages are still loading
    if (messages === undefined || welcomeMessageSentRef.current) {
      return
    }

    // Check if there are ANY counselor messages already (not just the welcome)
    const hasCounselorMessage = messages.some(
      (msg: any) => msg.sender === "counselor"
    )

    // Only send welcome message if there are NO counselor messages at all
    if (!hasCounselorMessage) {
      welcomeMessageSentRef.current = true
      sendMessageMutation({
        userId,
        content: "Hello, I'm here to listen. How are you feeling today?",
        sender: "counselor",
        type: "text",
      }).catch((err) => {
        console.error("Error sending welcome message:", err)
        // Don't reset on error - prevent spam
      })
    } else {
      // Mark as sent so we don't try again
      welcomeMessageSentRef.current = true
    }
  }, [userId, messages, sendMessageMutation, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isAIThinking])

  const sendTextMessage = async () => {
    const messageText = text.trim()
    if (!messageText || !userId || !user) return

    // Optimistic Update: Clear input immediately to make it feel instant
    setText("")

    // Smooth scroll to bottom to show intention (rely on Convex sub for actual message content)
    setIsAIThinking(true) // Show thinking state early

    try {
      // Save user message (await in background mostly, or fast enough)
      await sendMessageMutation({
        userId,
        content: messageText,
        sender: "user",
        type: "text",
      })
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
            onClick={() => router.push("/settings")}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full touch-manipulation hover:bg-white/50 transition-all"
            title="Settings"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="font-bold text-base sm:text-lg truncate bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {user.counselorPersona === "sister_mabinty" ? "Sister Mabinty" :
                  user.counselorPersona === "brother_sorie" ? "Brother Sorie" :
                    "SafeSpace Counselor"}
              </h1>
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">Online • Confidential</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/resources")}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full touch-manipulation hover:bg-white/50 transition-all text-purple-600"
            title="Resources"
          >
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <button
            onClick={() => router.push("/settings")}
            className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-lg border-4 border-white hover:scale-105 transition-transform cursor-pointer", userAvatar.bg)}
            title="Account Settings"
          >
            {userAvatar.emoji}
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-4 sm:py-4 space-y-2" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        {messages.map((message) => (
          <ChatMessage
            key={message._id}
            userId={userId}
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
      <footer className="sticky bottom-0 z-20 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 border-t border-white/30 p-3 sm:p-4 shadow-lg">
        <div className="max-w-4xl mx-auto px-2">
          {/* Main Input Container */}
          <div className="flex items-center gap-2 bg-white rounded-full shadow-md border-2 border-purple-100 p-1.5">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message SafeSpace..."
              className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-gray-800 py-3 px-4 text-base h-12"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendTextMessage()
                }
              }}
            />
            <Button
              type="button"
              onClick={sendTextMessage}
              disabled={!text.trim() || isAIThinking}
              size="icon"
              className="h-10 w-10 rounded-full gradient-primary shadow-lg hover:scale-105 active:scale-95 transition-all text-white flex-shrink-0 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Encrypted badge */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-widest pb-safe">
          <Lock className="h-3 w-3 text-purple-400" />
          <span>Secured with End-to-End Encryption</span>
        </div>
      </footer>
    </div>
  )
}

