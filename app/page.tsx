"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { AvatarSelector } from "@/components/avatar-selector"
import { SplashScreen } from "@/components/splash-screen"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { setCurrentUserId } from "@/lib/user-session"
import { Shield, Lock, Heart } from "lucide-react"

const topics = [
  { value: "trauma", label: "Trauma" },
  { value: "anxiety", label: "Anxiety" },
  { value: "addiction", label: "Addiction" },
  { value: "grief", label: "Grief" },
]

export default function RegisterPage() {
  const router = useRouter()
  const createUser = useMutation(api.users.createUser)
  const [showSplash, setShowSplash] = useState(true)
  const [avatar, setAvatar] = useState("1")
  const [email, setEmail] = useState("")
  const [nickname, setNickname] = useState("")
  const [topic, setTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim() || !topic) return

    setIsLoading(true)

    try {
      const userId = await createUser({
        email: email.trim() || undefined,
        nickname: nickname.trim(),
        avatar,
        topic,
      })

      // Store the Convex user ID for session management
      setCurrentUserId(userId)

      // Small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 300))
      router.push("/chat")
    } catch (error) {
      console.error("Error creating user:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="pt-8 sm:pt-14 pb-6 sm:pb-8 px-4 sm:px-6 text-center safe-area-top">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-primary mb-4 sm:mb-5 shadow-lg animate-float">
          <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="currentColor" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          SafeSpace Salone
        </h1>
        <p className="text-sm sm:text-lg text-gray-600 font-medium">Your private mental health support</p>
      </header>

      {/* Form */}
      <main className="flex-1 px-4 sm:px-6 pb-6 sm:pb-8 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection */}
          <div className="space-y-5 bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-white/50">
            <Label className="text-lg sm:text-xl font-bold text-center block text-gray-800 mb-2">
              Choose your avatar ✨
            </Label>
            <AvatarSelector selected={avatar} onSelect={setAvatar} />
          </div>

          {/* Email (Optional) */}
          <div className="space-y-3 bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50">
            <Label htmlFor="email" className="text-base font-semibold text-gray-800">
              Email Address <span className="text-gray-500 text-sm font-normal">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-base rounded-xl border-2 focus:border-primary transition-all"
            />
            <p className="text-xs text-gray-600">
              Add your email to enable login later
            </p>
          </div>

          {/* Nickname */}
          <div className="space-y-3 bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50">
            <Label htmlFor="nickname" className="text-base font-semibold text-gray-800">
              Create a nickname
            </Label>
            <Input
              id="nickname"
              placeholder="Enter a private nickname..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="h-14 text-base rounded-xl border-2 focus:border-primary transition-all"
              maxLength={20}
            />
          </div>

          {/* Topic */}
          <div className="space-y-3 bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50">
            <Label className="text-base font-semibold text-gray-800">What would you like to talk about?</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="h-14 text-base rounded-xl border-2 focus:border-primary transition-all">
                <SelectValue placeholder="Select a topic..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {topics.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-base">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Privacy badges */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>Anonymous</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <Lock className="h-4 w-4 text-primary" />
              <span>Encrypted</span>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!nickname.trim() || !topic || isLoading}
            className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold rounded-2xl gradient-primary text-white shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-[0.98] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">✨</span>
                Connecting...
              </span>
            ) : (
              "Start Talking ❤️"
            )}
          </Button>
        </form>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 pb-6 sm:pb-8 text-center">
        <p className="text-sm text-gray-600 font-medium">Your identity is protected. All conversations are confidential. 🔒</p>
      </footer>
    </div>
  )
}
