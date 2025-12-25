/**
 * @copyright 2024-2025 Angel Maborneh (SafeSpace Salone). All rights reserved.
 * This source code is confidential and proprietary to Angel Maborneh.
 */
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { setCurrentUserId } from "@/lib/user-session"
import { SplashScreen } from "@/components/splash-screen"
import { Heart, Lock, Mail, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()
  const loginUser = useMutation(api.users.loginUser)
  const [showSplash, setShowSplash] = useState(true)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password) {
      setError("Please enter your email and password")
      return
    }

    setIsLoading(true)

    try {
      const userId = await loginUser({
        email: email.trim(),
        password,
      })

      // Store the Convex user ID for session management
      setCurrentUserId(userId)

      // Redirect to chat
      router.push("/chat")
    } catch (err: any) {
      console.error("Login error:", err)
      // Extract clean error message from Convex error
      let errorMessage = "Login failed. Please try again."
      if (err.message) {
        // Convex errors often have format: "Uncaught Error: actual message"
        const match = err.message.match(/Uncaught Error: (.+?)(?:\.|$)/)
        if (match) {
          errorMessage = match[1]
        } else if (err.message.includes("No account found")) {
          errorMessage = "No account found with this email. Please register first."
        } else if (err.message.includes("Incorrect password")) {
          errorMessage = "Incorrect password. Please try again."
        } else if (!err.message.includes("[CONVEX")) {
          errorMessage = err.message
        }
      }
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="pt-10 sm:pt-14 pb-4 sm:pb-6 px-4 sm:px-6 text-center safe-area-top">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-primary mb-4 sm:mb-5 shadow-lg animate-float">
          <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="currentColor" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          SafeSpace Salone
        </h1>
        <p className="text-sm sm:text-lg text-gray-600 font-medium">
          Your private mental health support
        </p>
      </header>

      {/* Form */}
      <main className="flex-1 px-4 sm:px-6 pb-6 sm:pb-8 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-3 bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50">
            <Label htmlFor="email" className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-500" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-base rounded-xl border-2 focus:border-primary transition-all"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-3 bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50">
            <Label htmlFor="password" className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-500" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 text-base rounded-xl border-2 focus:border-primary transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!email.trim() || !password || isLoading}
            className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold rounded-2xl gradient-primary text-white shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-[0.98] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">✨</span>
                Signing in...
              </span>
            ) : (
              "Sign In ❤️"
            )}
          </Button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-purple-600 font-semibold hover:text-purple-700 underline">
              Create one here
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 pb-6 sm:pb-8 text-center">
        <p className="text-sm text-gray-600 font-medium">
          Your conversations are always confidential 🔒
        </p>
      </footer>
    </div>
  )
}
