"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { AvatarSelector } from "@/components/avatar-selector"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { setCurrentUserId } from "@/lib/user-session"
import { Shield, Lock, Heart, Eye, EyeOff, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

const topics = [
    { value: "trauma", label: "Trauma" },
    { value: "anxiety", label: "Anxiety" },
    { value: "addiction", label: "Addiction" },
    { value: "grief", label: "Grief" },
]

export default function RegisterPage() {
    const router = useRouter()
    const registerUser = useMutation(api.users.registerUser)
    const [avatar, setAvatar] = useState("1")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [nickname, setNickname] = useState("")
    const [topic, setTopic] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validation
        if (!email.trim()) {
            setError("Please enter your email address")
            return
        }
        if (!password) {
            setError("Please create a password")
            return
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }
        if (password !== confirmPassword) {
            setError("Passwords don't match")
            return
        }
        if (!nickname.trim()) {
            setError("Please enter a nickname")
            return
        }
        if (!topic) {
            setError("Please select a topic")
            return
        }

        setIsLoading(true)

        try {
            const userId = await registerUser({
                email: email.trim(),
                password,
                nickname: nickname.trim(),
                avatar,
                topic,
            })

            // Store the Convex user ID for session management
            setCurrentUserId(userId)

            // Small delay for UX
            await new Promise((resolve) => setTimeout(resolve, 300))
            router.push("/chat")
        } catch (err: any) {
            console.error("Error creating user:", err)
            setError(err.message || "Registration failed. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
            {/* Header */}
            <header className="pt-4 sm:pt-6 pb-2 sm:pb-4 px-4 sm:px-6 text-center safe-area-top">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/")}
                        className="h-10 w-10 rounded-full touch-manipulation hover:bg-white/50 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-700" />
                    </Button>
                    <div className="flex-1 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full gradient-primary shadow-lg animate-float">
                            <Heart className="h-6 w-6 text-white" fill="currentColor" />
                        </div>
                    </div>
                    <div className="w-10" /> {/* Spacer for alignment */}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                    Create Your Account
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Join SafeSpace Salone</p>
            </header>

            {/* Form */}
            <main className="flex-1 px-4 sm:px-6 pb-6 sm:pb-8 max-w-2xl mx-auto w-full overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {/* Avatar Selection */}
                    <div className="space-y-3 bg-white/60 backdrop-blur-sm rounded-3xl p-5 shadow-xl border border-white/50">
                        <Label className="text-base font-bold text-center block text-gray-800 mb-2">
                            Choose your avatar ✨
                        </Label>
                        <AvatarSelector selected={avatar} onSelect={setAvatar} />
                    </div>

                    {/* Email */}
                    <div className="space-y-2 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-purple-500" />
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 text-base rounded-xl border-2 focus:border-primary transition-all"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                        <Label htmlFor="password" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <Lock className="h-4 w-4 text-purple-500" />
                            Create Password <span className="text-gray-500 text-xs font-normal">(min 6 chars)</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 text-base rounded-xl border-2 focus:border-primary transition-all pr-12"
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
                        <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-12 text-base rounded-xl border-2 focus:border-primary transition-all mt-2"
                            required
                        />
                    </div>

                    {/* Nickname */}
                    <div className="space-y-2 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                        <Label htmlFor="nickname" className="text-sm font-semibold text-gray-800">
                            Create a nickname
                        </Label>
                        <Input
                            id="nickname"
                            placeholder="Enter a private nickname..."
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="h-12 text-base rounded-xl border-2 focus:border-primary transition-all"
                            maxLength={20}
                        />
                    </div>

                    {/* Topic */}
                    <div className="space-y-2 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                        <Label className="text-sm font-semibold text-gray-800">What would you like to talk about?</Label>
                        <Select value={topic} onValueChange={setTopic}>
                            <SelectTrigger className="h-12 text-base rounded-xl border-2 border-purple-200 bg-white/90 backdrop-blur-sm text-gray-800 font-medium shadow-md hover:border-purple-300 focus:border-primary focus:ring-2 focus:ring-purple-200 transition-all">
                                <SelectValue placeholder="Select a topic..." className="text-gray-800" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-white border-2 border-purple-100 shadow-xl">
                                {topics.map((t) => (
                                    <SelectItem key={t.value} value={t.value} className="text-base text-gray-800 font-medium cursor-pointer hover:bg-purple-50 focus:bg-purple-50">
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Privacy badges */}
                    <div className="flex items-center justify-center gap-3 sm:gap-5 pt-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <Shield className="h-3.5 w-3.5 text-primary" />
                            <span>Anonymous</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <Lock className="h-3.5 w-3.5 text-primary" />
                            <span>Encrypted</span>
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={!email.trim() || !password || !nickname.trim() || !topic || isLoading}
                        className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold rounded-2xl gradient-primary text-white shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-[0.98] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">✨</span>
                                Creating account...
                            </span>
                        ) : (
                            "Start Talking ❤️"
                        )}
                    </Button>
                </form>

                {/* Login Link */}
                <div className="mt-4 text-center">
                    <p className="text-gray-600 text-sm">
                        Already have an account?{" "}
                        <Link href="/" className="text-purple-600 font-semibold hover:text-purple-700 underline">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-4 sm:px-6 pb-4 sm:pb-6 text-center">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Your identity is protected. All conversations are confidential. 🔒</p>
            </footer>
        </div>
    )
}
