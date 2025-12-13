// localStorage helpers for demo data

export interface User {
  id: string
  email?: string
  nickname: string
  avatar: string
  topic: string
  createdAt: string
}

export interface Message {
  id: string
  userId: string
  content: string
  sender: "user" | "counselor"
  type: "text" | "voice"
  audioUrl?: string
  timestamp: string
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("safespace_users")
  return data ? JSON.parse(data) : []
}

export function saveUser(user: User): void {
  const users = getUsers()
  const existing = users.findIndex((u) => u.id === user.id)
  if (existing >= 0) {
    users[existing] = user
  } else {
    users.push(user)
  }
  localStorage.setItem("safespace_users", JSON.stringify(users))
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem("safespace_current_user")
  return data ? JSON.parse(data) : null
}

export function setCurrentUser(user: User): void {
  localStorage.setItem("safespace_current_user", JSON.stringify(user))
}

export function getMessages(userId: string): Message[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(`safespace_messages_${userId}`)
  return data ? JSON.parse(data) : []
}

export function saveMessage(userId: string, message: Message): void {
  const messages = getMessages(userId)
  messages.push(message)
  localStorage.setItem(`safespace_messages_${userId}`, JSON.stringify(messages))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function getUserByEmail(email: string): User | null {
  const users = getUsers()
  return users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null
}

export function loginWithEmail(email: string): User | null {
  const user = getUserByEmail(email)
  if (user) {
    setCurrentUser(user)
  }
  return user
}

// Helper to create a test user with email (for initial setup)
export function createTestUser(email: string): User {
  const existingUser = getUserByEmail(email)
  if (existingUser) {
    return existingUser
  }

  const user: User = {
    id: generateId(),
    email: email.toLowerCase(),
    nickname: email.split("@")[0], // Use email prefix as default nickname
    avatar: "1",
    topic: "anxiety", // Default topic
    createdAt: new Date().toISOString(),
  }

  saveUser(user)
  setCurrentUser(user)
  return user
}
