import { mutation } from "./_generated/server"

export const clearKnowledgeBase = mutation({
    args: {},
    handler: async (ctx) => {
        const allFacts = await ctx.db.query("knowledgeBase").collect()
        for (const fact of allFacts) {
            await ctx.db.delete(fact._id)
        }
    },
})
