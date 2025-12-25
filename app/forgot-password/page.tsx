"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, KeyRound, Mail, CheckCircle2 } from "lucide-react"

// Basic sha256 function if not available in utils
async function hashPassword(text: string) {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export default function ForgotPasswordPage() {
    const router = useRouter()
    const generateToken = useMutation(api.auth_reset.generateResetToken)
    const resetPassword = useMutation(api.auth_reset.resetPasswordWithToken)

    const [step, setStep] = useState<1 | 2>(1)
    const [email, setEmail] = useState("")
    const [token, setToken] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [debugToken, setDebugToken] = useState("") // For demo purposes since we don't have email sending

    const handleRequestToken = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const result: any = await generateToken({ email });
            if (result.success) {
                setStep(2)
                if (result.debugToken) {
                    setDebugToken(result.debugToken)
                    toast.success(`Verification code sent! (Demo: ${result.debugToken})`)
                } else {
                    toast.success("Verification code sent to your email")
                }
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const passwordHash = await hashPassword(newPassword)
            const result = await resetPassword({
                email,
                token,
                newPasswordHash: passwordHash
            })

            if (result.success) {
                toast.success("Password reset successfully!")
                setTimeout(() => router.push("/login"), 1500)
            } else {
                toast.error(result.error || "Failed to reset password")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-white/50 backdrop-blur-sm relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-bl-full -z-0 opacity-50" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-tr-full -z-0 opacity-50" />

                <div className="relative z-10">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/login")}
                        className="mb-6 pl-0 hover:bg-transparent hover:text-purple-600 transition-colors"
                        disabled={isLoading}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Button>

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <KeyRound className="w-6 h-6 text-purple-600" />
                            Reset Password
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            {step === 1
                                ? "Enter your email address and we'll send you a verification code."
                                : "Enter the code sent to your email and choose a new password."}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleRequestToken} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        className="pl-10 h-10 rounded-xl"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-white shadow-lg shadow-purple-200 transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending Code..." : "Send Verification Code"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            {debugToken && (
                                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 mb-4 text-xs text-yellow-800">
                                    <strong>Demo Mode:</strong> Your code is {debugToken}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Verification Code</label>
                                <Input
                                    type="text"
                                    placeholder="123456"
                                    className="h-10 rounded-xl text-center tracking-widest font-mono text-lg"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">New Password</label>
                                <Input
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    className="h-10 rounded-xl"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 font-medium text-white shadow-lg shadow-green-200 transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? "Updating Password..." : "Set New Password"}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
