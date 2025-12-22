// Main AI Orchestrator - Coordinates all AI components

import { IntentClassifier } from "./intentClassifier"
import { SierraLeoneResponseGenerator } from "./responseGenerators"
import { SierraLeoneCulturalAdapter } from "./culturalAdapter"

export class FineTunedSierraLeoneAI {
  private intentClassifier: IntentClassifier
  private responseGenerator: SierraLeoneResponseGenerator
  private culturalAdapter: SierraLeoneCulturalAdapter

  private conversationMemory: Array<{
    message: string
    response: string
    timestamp: number
  }> = []

  private userContext: {
    topic?: string
    location?: string
    gender?: "male" | "female"
    ageGroup?: "teen" | "young_adult" | "adult" | "elder"
    sessionCount: number
  } = { sessionCount: 0 }

  constructor() {
    this.intentClassifier = new IntentClassifier()
    this.responseGenerator = new SierraLeoneResponseGenerator()
    this.culturalAdapter = new SierraLeoneCulturalAdapter()
  }

  async processMessage(
    userMessage: string,
    context?: Partial<typeof this.userContext>,
    facts?: string[]
  ): Promise<{
    response: string
    isEmergency: boolean
    requiresFollowup: boolean
    suggestedResources: string[]
    confidence: number
  }> {
    // Update context
    if (context) {
      this.userContext = { ...this.userContext, ...context }
    }

    // Analyze intent
    const intent = this.intentClassifier.classify(userMessage)

    // Check for emergency or crisis
    const isEmergency = intent.primaryIntent === "emergency" || intent.confidence > 5
    const isCrisis = intent.primaryIntent === "crisis" || intent.confidence > 3

    // Check for advice requests
    const isAdviceRequest = userMessage.toLowerCase().includes("what do you advise") ||
      userMessage.toLowerCase().includes("what should i do") ||
      userMessage.toLowerCase().includes("what can i do") ||
      userMessage.toLowerCase().includes("how can you help")

    // Generate base response
    let response: string
    if (isEmergency) {
      response = this.responseGenerator.generateResponse("emergency", userMessage)
    } else if (isCrisis) {
      response = this.responseGenerator.generateResponse("crisis", userMessage)
    } else if (isAdviceRequest) {
      // Use conversation memory to determine topic for advice
      const recentTopic = this.extractTopics(this.conversationMemory.map(m => m.message))[0] ||
        this.userContext.topic
      response = this.responseGenerator.getAdviceResponse(recentTopic || intent.primaryIntent)
    } else {
      // Use facts if available to enrich general response
      response = this.responseGenerator.generateResponse(
        intent.primaryIntent,
        userMessage,
        facts
      )
    }

    // Adapt to Sierra Leone context
    response = this.culturalAdapter.adaptResponse(
      response,
      this.userContext.location,
      isEmergency
    )

    // Personalize with user context
    if (this.userContext.gender) {
      const address = this.userContext.gender === "male" ? "brother" : "sister"
      response = response.replace(/my brother\/sister/g, `my ${address}`)
    }

    // Use conversation memory to avoid repetition
    if (this.conversationMemory.length > 0) {
      const recentTopics = this.extractTopics(this.conversationMemory.map(m => m.message))
      if (recentTopics.length > 0 && Math.random() < 0.3) {
        response = this.addContextualReference(response, recentTopics, userMessage)
      }
    }

    // Store in conversation memory
    this.conversationMemory.push({
      message: userMessage,
      response,
      timestamp: Date.now()
    })

    // Keep only last 10 messages
    if (this.conversationMemory.length > 10) {
      this.conversationMemory.shift()
    }

    // Generate follow-up question 40% of the time (not for emergencies)
    let requiresFollowup = false
    if (!isEmergency && !isCrisis && Math.random() < 0.4) {
      const followUps = [
        "How does that make you feel?",
        "Can you tell me more about that?",
        "What happened next?",
        "How long have you felt this way?",
        "What do you think would help?",
        "What's been most difficult about this?",
        "Who in your life knows about this?"
      ]
      response += ` ${followUps[Math.floor(Math.random() * followUps.length)]}`
      requiresFollowup = true
    }

    return {
      response,
      isEmergency,
      requiresFollowup,
      suggestedResources: this.getSuggestedResources(intent.primaryIntent, this.userContext.location),
      confidence: intent.confidence
    }
  }

  private extractTopics(messages: string[]): string[] {
    const topics: string[] = []
    const allText = messages.join(" ").toLowerCase()

    const topicKeywords: Record<string, string[]> = {
      trauma: ["trauma", "traumatic", "accident", "crash", "ptsd", "flashback", "nightmare"],
      addiction: ["addiction", "addicted", "kush", "tramadol", "drug", "alcohol", "substance"],
      anxiety: ["anxious", "anxiety", "worried", "nervous", "panic", "stress"],
      depression: ["depressed", "sad", "hopeless", "down", "empty"],
      grief: ["grief", "grieving", "death", "died", "loss", "mourning"],
      work: ["work", "job", "boss", "office"],
      family: ["family", "parent", "mother", "father"],
      relationship: ["partner", "boyfriend", "girlfriend", "spouse"],
      health: ["sick", "ill", "pain", "health"],
      financial: ["money", "financial", "bills", "debt"]
    }

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        topics.push(topic)
      }
    }

    return topics
  }

  private addContextualReference(response: string, recentTopics: string[], currentMessage: string): string {
    // Don't add if already referenced
    if (recentTopics.some(topic => response.toLowerCase().includes(topic))) {
      return response
    }

    const topic = recentTopics[0]
    const references: Record<string, string> = {
      work: "Earlier you mentioned work - is this related?",
      family: "You mentioned family before - is this connected?",
      relationship: "This seems related to what you said about your relationship earlier.",
      health: "Is this related to the health concerns you mentioned?",
      financial: "This connects to the money worries you shared earlier."
    }

    if (references[topic] && Math.random() < 0.5) {
      return `${response} ${references[topic]}`
    }

    return response
  }

  private getSuggestedResources(intent: string, location?: string): string[] {
    const resources: Record<string, string[]> = {
      emergency: ["116 Emergency", "919 Mental Health Helpline", "Kissy Hospital (24/7)"],
      crisis: ["919 Mental Health Helpline", "Kissy Hospital", "Call 116"],
      trauma: ["RAIC Support Groups", "Mental Health Coalition SL", "Trauma Healing Workshops"],
      addiction: ["NACOB Helpline - 079-797979", "Drug Rehabilitation Centers", "Faith-based Recovery"],
      anxiety: ["Breathing Exercises", "Community Support Groups", "YWCA Skills Training"],
      depression: ["Mental Health Coalition", "Community Support", "Ministry of Health Services"],
      grief: ["Community Elders", "Funeral Traditions", "Spiritual Leaders"],
      relationships: ["Family Mediation", "Community Elders", "Religious Counselors"],
      practical: ["Ministry of Social Welfare", "Local NGOs", "Community Resources"],
      health: ["Connaught Hospital", "Local Health Centers", "Traditional Healers"]
    }

    const baseResources = resources[intent] || ["Ministry of Health Hotline", "Local Health Center"]

    // Add location-specific resources if available
    if (location) {
      const localResources = this.culturalAdapter.getLocalResources(location)
      if (localResources.length > 0) {
        return [...baseResources, ...localResources.slice(0, 2)]
      }
    }

    return baseResources.slice(0, 5) // Limit to 5 resources
  }

  // Reset conversation memory (for new sessions)
  resetConversation(): void {
    this.conversationMemory = []
  }

  // Get conversation summary for context
  getConversationSummary(): string {
    if (this.conversationMemory.length === 0) return ""

    const topics = this.extractTopics(this.conversationMemory.map(m => m.message))
    return `User has discussed: ${topics.join(", ") || "general concerns"}.`
  }
}

