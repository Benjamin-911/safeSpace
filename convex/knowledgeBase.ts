import { ActionCtx, action, mutation, query } from "./_generated/server"
import { api } from "./_generated/api"
import { v } from "convex/values"

// Insert a factual fact into the knowledge base
export const insertFact = mutation({
    args: {
        content: v.string(),
        embedding: v.array(v.float64()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("knowledgeBase", {
            content: args.content,
            embedding: args.embedding,
            metadata: args.metadata,
        })
    },
})

// Action to generate embedding using Google Gemini
export const generateAndInsertFact = action({
    args: {
        content: v.string(),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) throw new Error("GEMINI_API_KEY not set")

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: {
                    parts: [{ text: args.content }]
                }
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(`Gemini error: ${JSON.stringify(error)}`)
        }

        const result = await response.json()
        const embedding = result.embedding.values

        await ctx.runMutation(api.knowledgeBase.insertFact, {
            content: args.content,
            embedding: embedding,
            metadata: args.metadata,
        })
    },
})

// Search the knowledge base using Gemini
export const searchKnowledge = action({
    args: {
        query: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) throw new Error("GEMINI_API_KEY not set")

        // 1. Generate embedding for the query
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: {
                    parts: [{ text: args.query }]
                }
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(`Gemini error: ${JSON.stringify(error)}`)
        }

        const result = await response.json()
        const embedding = result.embedding.values

        // 2. Perform vector search in Convex
        const results = await ctx.vectorSearch("knowledgeBase", "by_embedding", {
            vector: embedding,
            limit: args.limit || 3,
        })

        // 3. Fetch the full documents
        return Promise.all(
            results.map(async (res): Promise<{ content: string; score: number; metadata: any }> => {
                const doc = await ctx.runQuery(api.knowledgeBase.getById, { id: res._id as any })
                if (!doc) throw new Error("Document not found")
                return {
                    content: doc.content,
                    score: res._score,
                    metadata: doc.metadata,
                }
            })
        )
    },
})

// Internal query to get document by ID
export const getById = query({
    args: { id: v.id("knowledgeBase") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id)
    },
})
