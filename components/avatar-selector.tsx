"use client"

import { cn } from "@/lib/utils"

const avatars = [
  { id: "1", emoji: "🌸", bg: "bg-gradient-to-br from-pink-200 to-pink-300" },
  { id: "2", emoji: "🌿", bg: "bg-gradient-to-br from-green-200 to-emerald-300" },
  { id: "3", emoji: "🌊", bg: "bg-gradient-to-br from-blue-200 to-cyan-300" },
  { id: "4", emoji: "☀️", bg: "bg-gradient-to-br from-yellow-200 to-orange-300" },
  { id: "5", emoji: "🦋", bg: "bg-gradient-to-br from-purple-200 to-pink-300" },
  { id: "6", emoji: "🌙", bg: "bg-gradient-to-br from-indigo-200 to-purple-300" },
]

interface AvatarSelectorProps {
  selected: string
  onSelect: (id: string) => void
}

export function AvatarSelector({ selected, onSelect }: AvatarSelectorProps) {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[280px] sm:max-w-[320px] place-items-center">
        {avatars.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={cn(
              "flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full text-4xl sm:text-5xl transition-all duration-300 touch-manipulation border-4",
              avatar.bg,
              selected === avatar.id 
                ? "ring-4 ring-purple-500 ring-offset-4 scale-125 shadow-2xl border-white animate-pulse-glow" 
                : "border-transparent hover:scale-110 active:scale-95 hover:shadow-xl hover:border-purple-200",
            )}
          >
            {avatar.emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

export function getAvatarById(id: string) {
  return avatars.find((a) => a.id === id) || avatars[0]
}
