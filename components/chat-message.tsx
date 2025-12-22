"use client"

import { cn } from "@/lib/utils"
import { Mic, Info, Phone, ExternalLink } from "lucide-react"

interface ChatMessageProps {
  message: {
    _id?: string
    id?: string
    content: string
    sender: "user" | "counselor"
    type: "text" | "voice"
    audioUrl?: string
    timestamp: string
    resources?: string[] // Optional resources for the current session
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user"

  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex flex-col max-w-[85%] sm:max-w-[70%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-md transition-all duration-300 relative group",
            isUser
              ? "gradient-primary text-white rounded-tr-none"
              : "bg-white/80 backdrop-blur-md text-gray-800 border border-white/40 rounded-tl-none shadow-purple-100"
          )}
        >
          {message.type === "voice" ? (
            <div className="flex flex-col gap-3 min-w-[200px]">
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Mic className="h-4 w-4" />
                <span>Voice Message</span>
              </div>
              {message.audioUrl && (
                <audio
                  src={message.audioUrl}
                  controls
                  className={cn(
                    "h-8 w-full brightness-95 contrast-125",
                    isUser ? "invert filter" : ""
                  )}
                />
              ) : (
              <p className="text-sm italic opacity-70">Audio recording...</p>
              )}
              {message.content && message.content !== "Voice message" && (
                <p className="text-sm leading-relaxed border-t border-white/20 pt-2 mt-1 italic">
                  "{message.content}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-[15px] sm:text-[16px] leading-relaxed break-words font-medium whitespace-pre-line text-pretty">
              {message.content}
            </p>
          )}

          <p className={cn(
            "text-[10px] mt-1.5 font-bold uppercase tracking-wider opacity-60",
            isUser ? "text-white/70" : "text-gray-400"
          )}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Suggested Resources Section */}
        {!isUser && message.resources && message.resources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
            {message.resources.map((resource, idx) => {
              // Try to parse name and contact info from resource string
              const hasPhone = resource.match(/(\d{3,4}[-\s]?\d{3,6}|\b\d{3}\b)/)

              return (
                <div
                  key={idx}
                  className="bg-white/90 backdrop-blur-sm border border-purple-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group/card max-w-[280px]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover/card:bg-purple-100 transition-colors">
                      {hasPhone ? <Phone className="w-4 h-4 text-purple-600" /> : <Info className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 line-clamp-2">{resource}</p>
                      <button
                        className="mt-2 text-[11px] font-bold text-purple-600 flex items-center gap-1 hover:text-purple-700 transition-colors"
                        onClick={() => {
                          if (hasPhone) window.location.href = `tel:${hasPhone[0]}`
                        }}
                      >
                        {hasPhone ? "Call Now" : "Learn More"}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
