import { ConvexReactClient } from "convex/react"

// This will be set when you run `npx convex dev` or deploy
// The URL will be automatically generated and added to .env.local
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud"

// Create client with placeholder URL if not configured
// This allows the app to run without Convex configured
export const convex = new ConvexReactClient(convexUrl)

