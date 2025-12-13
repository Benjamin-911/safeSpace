// Helper to manage current user session with Convex
// Stores the Convex user ID in localStorage for quick access

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("safespace_convex_user_id")
}

export function setCurrentUserId(userId: string): void {
  localStorage.setItem("safespace_convex_user_id", userId)
}

export function clearCurrentUserId(): void {
  localStorage.removeItem("safespace_convex_user_id")
}

