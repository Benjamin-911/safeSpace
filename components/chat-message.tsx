"use client"

import { cn } from "@/lib/utils"
import { Mic } from "lucide-react"

interface ChatMessageProps {
  message: {
    _id?: string
    id?: string
    content: string
    sender: "user" | "counselor"
    type: "text" | "voice"
    audioUrl?: string
    timestamp: string
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[90%] sm:max-w-[75%] rounded-3xl px-4 py-3 sm:px-5 sm:py-4 shadow-lg transition-all duration-300",
          isUser
            ? "gradient-primary text-white rounded-br-md"
            : "bg-white text-gray-800 border-2 border-purple-100 rounded-bl-md backdrop-blur-sm",
        )}
      >
        {message.type === "voice" ? (
          <div className="flex items-center gap-2 flex-wrap">
            <Mic className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Voice message</span>
            {message.audioUrl && (
              <audio 
                src={message.audioUrl} 
                controls 
                className="h-8 max-w-full sm:max-w-[200px] flex-1 min-w-[120px]" 
              />
            )}
          </div>
        ) : (
          <p className="text-base sm:text-base leading-relaxed break-words font-medium whitespace-pre-line">{message.content}</p>
        )}
        <p className={cn("text-xs mt-2 font-medium", isUser ? "text-white/80" : "text-gray-500")}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  )
}
