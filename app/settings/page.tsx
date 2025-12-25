"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AvatarSelector } from "@/components/avatar-selector"
import { getCurrentUserId, clearCurrentUserId } from "@/lib/user-session"
import { getAvatarById } from "@/components/avatar-selector"
import { ArrowLeft, LogOut, Trash2, Heart, Shield, AlertTriangle, Save, User, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const topics = [
    { value: "trauma", label: "Trauma" },
    { value: "anxiety", label: "Anxiety" },
    { value: "addiction", label: "Addiction" },
    { value: "grief", label: "Grief" },
]

const personas = [
    { value: "neutral", label: "SafeSpace Counselor (Neutral)", icon: "✨" },
    { value: "sister_mabinty", label: "Sister Mabinty (Female)", icon: "🌸" },
    { value: "brother_sorie", label: "Brother Sorie (Male)", icon: "🛡️" },
]

export default function SettingsPage() {
    const router = useRouter()
    const userId = getCurrentUserId()
    const user = useQuery(api.users.getUserById, userId ? { userId: userId as any } : "skip")
    const deleteUserData = useMutation(api.users.deleteUserData)
    const updateProfile = useMutation(api.users.updateProfile)

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")

    // Editable fields
    const [editNickname, setEditNickname] = useState("")
    const [editAvatar, setEditAvatar] = useState("")
    const [editTopic, setEditTopic] = useState("")
    const [editPersona, setEditPersona] = useState("")
    const [hasChanges, setHasChanges] = useState(false)

    // Initialize edit fields when user loads
    if (user && !editNickname && !editAvatar && !editTopic && !editPersona) {
        setEditNickname(user.nickname)
        setEditAvatar(user.avatar)
        setEditTopic(user.topic)
        setEditPersona(user.counselorPersona || "neutral")
    }

    const handleFieldChange = (field: 'nickname' | 'avatar' | 'topic' | 'persona', value: string) => {
        if (field === 'nickname') setEditNickname(value)
        if (field === 'avatar') setEditAvatar(value)
        if (field === 'topic') setEditTopic(value)
        if (field === 'persona') setEditPersona(value)
        setHasChanges(true)
        setSuccessMessage("")
    }

    const handleSaveProfile = async () => {
        if (!userId || !hasChanges) return

        setIsSaving(true)
        try {
            await updateProfile({
                userId: userId as any,
                nickname: editNickname !== user?.nickname ? editNickname : undefined,
                avatar: editAvatar !== user?.avatar ? editAvatar : undefined,
                topic: editTopic !== user?.topic ? editTopic : undefined,
                counselorPersona: editPersona !== user?.counselorPersona ? editPersona : undefined,
            })
            setHasChanges(false)
            setSuccessMessage("Profile updated successfully!")
            setTimeout(() => setSuccessMessage(""), 3000)
        } catch (error) {
            console.error("Error updating profile:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleLogout = () => {
        clearCurrentUserId()
        router.push("/")
    }

    const handleDeleteData = async () => {
        if (!userId) return

        setIsDeleting(true)
        try {
            await deleteUserData({ userId: userId as any })
            clearCurrentUserId()
            router.push("/")
        } catch (error) {
            console.error("Error deleting data:", error)
            setIsDeleting(false)
        }
    }

    if (!user) {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        )
    }

    const currentAvatar = getAvatarById(editAvatar || user.avatar)

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
            {/* Header */}
            <header className="sticky top-0 z-10 glass border-b border-white/30 px-4 py-3 sm:px-4 sm:py-4 safe-area-top shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/chat")}
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full touch-manipulation hover:bg-white/50 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-bold text-base sm:text-lg truncate bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Account Settings
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 sm:px-6 py-6 max-w-md mx-auto w-full space-y-5 overflow-y-auto">
                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 animate-in fade-in slide-in-from-top-2 text-center font-medium">
                        ✓ {successMessage}
                    </div>
                )}

                {/* Profile Card with Avatar */}
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 shadow-xl border border-white/50">
                    <div className="flex items-center gap-4 mb-4">
                        <User className="h-5 w-5 text-purple-500" />
                        <h2 className="text-base font-bold text-gray-800">Profile</h2>
                    </div>

                    {/* Avatar Selector */}
                    <div className="mb-4">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Your Avatar</Label>
                        <AvatarSelector
                            selected={editAvatar || user.avatar}
                            onSelect={(avatar) => handleFieldChange('avatar', avatar)}
                        />
                    </div>

                    {/* Nickname */}
                    <div className="space-y-2">
                        <Label htmlFor="nickname" className="text-sm font-medium text-gray-700">Nickname</Label>
                        <Input
                            id="nickname"
                            value={editNickname}
                            onChange={(e) => handleFieldChange('nickname', e.target.value)}
                            className="h-12 text-base rounded-xl border-2 focus:border-primary transition-all"
                            maxLength={20}
                        />
                    </div>

                    <p className="text-xs text-gray-500 mt-3">{user.email}</p>
                </div>

                {/* Counselor Customization */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="h-5 w-5 text-purple-500" />
                        <h3 className="font-bold text-gray-800">Counselor Identity</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {personas.map((p) => (
                            <div
                                key={p.value}
                                onClick={() => handleFieldChange('persona', p.value)}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${editPersona === p.value
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-purple-50/50 bg-white/50 hover:border-purple-200"
                                    }`}
                            >
                                <span className="text-xl">{p.icon}</span>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800 text-sm">{p.label}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">
                                        {p.value === "sister_mabinty" ? "Caring & maternal tone" :
                                            p.value === "brother_sorie" ? "Supportive & brotherly tone" :
                                                "Professional and balanced"}
                                    </p>
                                </div>
                                {editPersona === p.value && (
                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Topic Selection */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50">
                    <div className="flex items-center gap-3 mb-3">
                        <MessageSquare className="h-5 w-5 text-purple-500" />
                        <Label className="text-base font-bold text-gray-800">Topic</Label>
                    </div>
                    <Select value={editTopic || user.topic} onValueChange={(value) => handleFieldChange('topic', value)}>
                        <SelectTrigger className="h-12 text-base rounded-xl border-2 border-purple-200 bg-white/90 backdrop-blur-sm text-gray-800 font-medium shadow-md hover:border-purple-300 focus:border-primary focus:ring-2 focus:ring-purple-200 transition-all">
                            <SelectValue placeholder="Select a topic..." />
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

                {/* Save Button */}
                {hasChanges && (
                    <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="w-full h-14 text-base font-bold rounded-2xl gradient-primary text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="h-5 w-5" />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                )}

                {/* Logout Button */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50">
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full h-14 text-base font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </Button>
                    <p className="mt-3 text-xs text-center text-gray-500">
                        You can sign back in anytime with your email and password
                    </p>
                </div>

                {/* Delete Data Section */}
                <div className="bg-red-50/60 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-red-100">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <h3 className="font-semibold text-red-700">Danger Zone</h3>
                    </div>

                    {!showDeleteConfirm ? (
                        <Button
                            onClick={() => setShowDeleteConfirm(true)}
                            variant="outline"
                            className="w-full h-12 text-sm font-semibold rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete All My Data
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-red-700 font-medium">
                                Are you sure? This will permanently delete your account and all conversation history. This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    variant="outline"
                                    className="flex-1 h-12 text-sm font-semibold rounded-xl"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDeleteData}
                                    className="flex-1 h-12 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Privacy Note */}
                <div className="text-center pb-4">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Heart className="h-3.5 w-3.5 text-purple-500" />
                        <span>SafeSpace Salone cares about your privacy</span>
                    </div>
                </div>
            </main>
        </div>
    )
}
