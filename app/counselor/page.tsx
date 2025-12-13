"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatMessage } from "@/components/chat-message"
import { getAvatarById } from "@/components/avatar-selector"
import { getUsers, getMessages, saveMessage, generateId, type User, type Message } from "@/lib/storage"
import { Shield, ArrowLeft, Send, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CounselorPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoggedIn) {
      setUsers(getUsers())
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (selectedUser) {
      setMessages(getMessages(selectedUser.id))
    }
  }, [selectedUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple demo password
    if (password === "counselor123") {
      setIsLoggedIn(true)
    }
  }

  const sendReply = () => {
    if (!reply.trim() || !selectedUser) return

    const message: Message = {
      id: generateId(),
      userId: selectedUser.id,
      content: reply.trim(),
      sender: "counselor",
      type: "text",
      timestamp: new Date().toISOString(),
    }

    saveMessage(selectedUser.id, message)
    setMessages((prev) => [...prev, message])
    setReply("")
  }

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-background p-6">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Counselor Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="h-12"
                />
              </div>
              <Button type="submit" className="w-full h-12">
                Login
              </Button>
              <p className="text-xs text-center text-muted-foreground">Demo password: counselor123</p>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Chat view with selected user
  if (selectedUser) {
    const userAvatar = getAvatarById(selectedUser.avatar)

    return (
      <div className="min-h-dvh flex flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-4 py-2.5 sm:py-3 safe-area-top">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedUser(null)}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl flex-shrink-0", userAvatar.bg)}>
              {userAvatar.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-sm sm:text-base truncate">{selectedUser.nickname}</h1>
              <p className="text-xs text-muted-foreground capitalize">{selectedUser.topic}</p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3 pb-safe">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </main>

        {/* Reply Input */}
        <footer className="sticky bottom-0 bg-card border-t border-border p-3 sm:p-4 safe-area-bottom">
          <div className="flex items-center gap-2">
            <Input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 h-11 sm:h-12 rounded-full px-4 text-sm sm:text-base"
              onKeyDown={(e) => e.key === "Enter" && sendReply()}
            />
            <Button
              type="button"
              onClick={sendReply}
              disabled={!reply.trim()}
              size="icon"
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-full touch-manipulation"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </footer>
      </div>
    )
  }

  // User list view
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-4 py-3 sm:py-4 safe-area-top">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-sm sm:text-base">Counselor Dashboard</h1>
            <p className="text-xs text-muted-foreground">{users.length} users connected</p>
          </div>
        </div>
      </header>

      {/* User List */}
      <main className="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No users yet</p>
            <p className="text-xs text-muted-foreground mt-1">Users will appear here when they register</p>
          </div>
        ) : (
          users.map((u) => {
            const avatar = getAvatarById(u.avatar)
            const userMessages = getMessages(u.id)
            const lastMessage = userMessages[userMessages.length - 1]

            return (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className="w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-card rounded-xl border border-border hover:bg-secondary active:bg-secondary transition-colors text-left touch-manipulation"
              >
                <div
                  className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0", avatar.bg)}
                >
                  {avatar.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-medium text-sm sm:text-base truncate">{u.nickname}</span>
                    <span className="text-xs text-muted-foreground capitalize px-1.5 sm:px-2 py-0.5 bg-secondary rounded-full whitespace-nowrap">
                      {u.topic}
                    </span>
                  </div>
                  {lastMessage && <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">{lastMessage.content}</p>}
                </div>
              </button>
            )
          })
        )}
      </main>
    </div>
  )
}

