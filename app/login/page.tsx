"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { setCurrentUserId } from "@/lib/user-session"
import { Heart } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const createUser = useMutation(api.users.createUser)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [checkingUser, setCheckingUser] = useState(false)

  const userByEmail = useQuery(
    api.users.getUserByEmail,
    checkingUser && email.trim() ? { email: email.trim() } : "skip"
  )

  useEffect(() => {
    if (checkingUser && userByEmail !== undefined) {
      if (userByEmail) {
        // User exists, set their ID and redirect
        setCurrentUserId(userByEmail._id)
        router.push("/chat")
      } else if (userByEmail === null) {
        // User doesn't exist, create one
        handleCreateUser()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userByEmail, checkingUser, router])

  const handleCreateUser = async () => {
    try {
      const userId = await createUser({
        email: email.trim(),
        nickname: email.split("@")[0],
        avatar: "1",
        topic: "anxiety",
      })
      setCurrentUserId(userId)
      router.push("/chat")
    } catch (err) {
      console.error("Error creating user:", err)
      setError("Unable to login. Please try again.")
      setIsLoading(false)
      setCheckingUser(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    setCheckingUser(true)

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4 sm:p-6 safe-area-top safe-area-bottom">
      <Card className="w-full max-w-sm mx-auto glass shadow-2xl border-white/50 rounded-3xl overflow-hidden">
        <CardHeader className="text-center pb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4 mx-auto shadow-lg animate-float">
            <Heart className="h-8 w-8 text-white" fill="currentColor" />
          </div>
          <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base text-gray-600 font-medium mt-2">
            Login to continue your safe space
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-semibold text-gray-800">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-2 focus:border-primary transition-all bg-white/80"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border-2 border-red-200 font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!email.trim() || isLoading}
              className="w-full h-14 text-base font-bold rounded-xl gradient-primary text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">✨</span>
                  Logging in...
                </span>
              ) : (
                "Login 🚀"
              )}
            </Button>

            <div className="text-center text-sm text-gray-600 pt-2">
              <p className="mb-2 font-medium">Don't have an account?</p>
              <Button
                type="button"
                variant="link"
                onClick={() => router.push("/")}
                className="p-0 h-auto text-purple-600 font-bold hover:text-purple-700"
              >
                Register here →
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

