import { ActionCtx, action } from "./_generated/server"
import { api } from "./_generated/api"

export const seedKnowledgeBase = action({
    args: {},
    handler: async (ctx) => {
        const facts = [
            {
                content: "RAIC (Rainbo Initiative) in Freetown offers confidential support for sexual violence. You can reach them at 0800-33333.",
                metadata: { category: "trauma", subcategory: "sexual_violence", location: "Freetown" }
            },
            {
                content: "National Emergency Services in Sierra Leone are available 24/7 by calling 116.",
                metadata: { category: "emergency" }
            },
            {
                content: "The Mental Health Helpline in Sierra Leone is 919.",
                metadata: { category: "emergency", subcategory: "mental_health" }
            },
            {
                content: "Kissy Psychiatric Hospital in Freetown provides 24/7 emergency care for mental health crises.",
                metadata: { category: "emergency", subcategory: "clinical", location: "Freetown" }
            },
            {
                content: "For suicide prevention, text 'HELP' to 8787 in Sierra Leone.",
                metadata: { category: "emergency", subcategory: "suicide_prevention" }
            },
            {
                content: "The Ministry of Social Welfare in Sierra Leone offers temporary assistance programs for those in financial distress.",
                metadata: { category: "practical", subcategory: "financial_aid" }
            },
            {
                content: "NACOB (National Drug Control Board) offers free counseling for addiction. They can be reached at 079-797979.",
                metadata: { category: "addiction", location: "Sierra Leone" }
            },
            {
                content: "The Mental Health Coalition in Sierra Leone provides support for war-affected individuals and trauma survivors.",
                metadata: { category: "trauma", subcategory: "war" }
            },
            {
                content: "YWCA in Freetown offers skills training programs which can help with economic stress and unemployment.",
                metadata: { category: "practical", subcategory: "employment", location: "Freetown" }
            },
            {
                content: "Spiritual concerns can be addressed through religious leaders at the Central Mosque or St. George's Cathedral in Freetown.",
                metadata: { category: "spiritual", location: "Freetown" }
            }
        ]

        console.log("Starting seeding process...")

        for (const fact of facts) {
            try {
                console.log(`Seeding fact: ${fact.content.substring(0, 30)}...`)
                await ctx.runAction(api.knowledgeBase.generateAndInsertFact, {
                    content: fact.content,
                    metadata: fact.metadata,
                })
            } catch (e) {
                console.error(`Failed to seed fact: ${fact.content} `, e)
            }
        }

        console.log("Seeding complete!")
    }
})
