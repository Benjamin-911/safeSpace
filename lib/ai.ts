// AI Counselor Response Generator
// This simulates an AI counselor that provides empathetic, supportive responses

export interface AIResponse {
  content: string
  suggestions?: string[]
}

const counselorPersonalities = [
  "empathetic",
  "supportive",
  "non-judgmental",
  "encouraging",
  "understanding",
]

const responseTemplates = {
  greeting: [
    "Hello, I'm here to listen. How are you feeling today?",
    "Hi there. I'm glad you reached out. What's on your mind?",
    "Welcome. I'm here to support you. How can I help today?",
  ],
  acknowledgment: [
    "I hear you, and I want you to know that your feelings are valid.",
    "Thank you for sharing that with me. It takes courage to open up.",
    "I understand this is difficult for you. You're not alone in this.",
  ],
  support: [
    "It's okay to feel this way. Your emotions are important.",
    "You're doing the best you can, and that's enough.",
    "Remember, it's okay to not be okay. We all have difficult moments.",
  ],
  exploration: [
    "Can you tell me more about what's making you feel this way?",
    "What do you think might help you feel better right now?",
    "How long have you been feeling like this?",
  ],
  encouragement: [
    "You're stronger than you think. You've already taken a step by reaching out.",
    "Progress isn't always linear. Be patient with yourself.",
    "Every small step forward counts. You're doing great.",
  ],
  closing: [
    "Remember, I'm here whenever you need to talk.",
    "Take care of yourself. You matter.",
    "You're not alone. I'm here to support you.",
  ],
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Extract topics from conversation history for context awareness
function extractTopics(conversationHistory: string[]): string[] {
  const topics: string[] = []
  const allText = conversationHistory.join(" ").toLowerCase()
  
  const topicKeywords = {
    work: ["work", "job", "boss", "colleague", "office"],
    school: ["school", "exam", "study", "assignment", "teacher", "university"],
    family: ["family", "parent", "mother", "father", "sibling", "brother", "sister"],
    relationship: ["partner", "boyfriend", "girlfriend", "spouse", "relationship"],
    health: ["sick", "ill", "pain", "health", "doctor", "hospital"],
    financial: ["money", "financial", "bills", "debt", "salary", "income"],
    anxiety: ["anxious", "worried", "nervous", "overwhelmed", "stressed"],
    sadness: ["sad", "depressed", "down", "hopeless", "worthless"],
    anger: ["angry", "frustrated", "mad", "rage", "irritated"]
  }
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      topics.push(topic)
    }
  }
  
  return topics
}

function detectMessageIntent(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Crisis detection - expanded
  if (lowerMessage.includes("suicide") || lowerMessage.includes("kill myself") || lowerMessage.includes("end it all") || 
      lowerMessage.includes("not worth living") || lowerMessage.includes("feel like dying") || 
      lowerMessage.includes("want to die") || lowerMessage.includes("end my life") ||
      lowerMessage.includes("hurt myself") || lowerMessage.includes("self harm")) {
    return "crisis"
  }
  
  // Greeting detection - expanded
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey") ||
      lowerMessage.includes("good morning") || lowerMessage.includes("good afternoon") || 
      lowerMessage.includes("good evening") || lowerMessage === "hey" || lowerMessage === "hi") {
    return "greeting"
  }
  
  // Relationship issues
  if (lowerMessage.includes("partner") || lowerMessage.includes("boyfriend") || lowerMessage.includes("girlfriend") ||
      lowerMessage.includes("spouse") || lowerMessage.includes("husband") || lowerMessage.includes("wife") ||
      lowerMessage.includes("relationship") || lowerMessage.includes("breakup") || lowerMessage.includes("divorce")) {
    return "relationship_issue"
  }
  
  // Work/school stress
  if (lowerMessage.includes("work") || lowerMessage.includes("job") || lowerMessage.includes("boss") ||
      lowerMessage.includes("school") || lowerMessage.includes("exam") || lowerMessage.includes("study") ||
      lowerMessage.includes("assignment") || lowerMessage.includes("deadline") || lowerMessage.includes("pressure")) {
    return "work_stress"
  }
  
  // Financial stress
  if (lowerMessage.includes("money") || lowerMessage.includes("financial") || lowerMessage.includes("broke") ||
      lowerMessage.includes("bills") || lowerMessage.includes("debt") || lowerMessage.includes("salary") ||
      lowerMessage.includes("income") || lowerMessage.includes("unemployed")) {
    return "financial_stress"
  }
  
  // Health concerns
  if (lowerMessage.includes("sick") || lowerMessage.includes("ill") || lowerMessage.includes("pain") ||
      lowerMessage.includes("health") || lowerMessage.includes("doctor") || lowerMessage.includes("hospital") ||
      lowerMessage.includes("symptoms") || lowerMessage.includes("medical")) {
    return "health_concern"
  }
  
  // Trauma
  if (lowerMessage.includes("trauma") || lowerMessage.includes("traumatic") || lowerMessage.includes("ptsd") ||
      lowerMessage.includes("flashback") || lowerMessage.includes("triggered") || lowerMessage.includes("abuse") ||
      lowerMessage.includes("violence") || lowerMessage.includes("assault") || lowerMessage.includes("victim")) {
    return "trauma"
  }
  
  // Addiction
  if (lowerMessage.includes("addiction") || lowerMessage.includes("addicted") || lowerMessage.includes("alcohol") ||
      lowerMessage.includes("drug") || lowerMessage.includes("substance") || lowerMessage.includes("using") ||
      lowerMessage.includes("withdrawal") || lowerMessage.includes("recovery") || lowerMessage.includes("sober") ||
      lowerMessage.includes("drinking") || lowerMessage.includes("smoking")) {
    return "addiction"
  }
  
  // Grief/loss
  if (lowerMessage.includes("death") || lowerMessage.includes("died") || lowerMessage.includes("loss") ||
      lowerMessage.includes("grief") || lowerMessage.includes("grieving") || lowerMessage.includes("mourning") || 
      lowerMessage.includes("funeral") || lowerMessage.includes("passed away") || lowerMessage.includes("lost someone")) {
    return "grief"
  }
  
  // Fear/panic
  if (lowerMessage.includes("fear") || lowerMessage.includes("afraid") || lowerMessage.includes("scared") ||
      lowerMessage.includes("panic") || lowerMessage.includes("terrified") || lowerMessage.includes("phobia")) {
    return "fear"
  }
  
  // Guilt/shame
  if (lowerMessage.includes("guilt") || lowerMessage.includes("guilty") || lowerMessage.includes("shame") ||
      lowerMessage.includes("ashamed") || lowerMessage.includes("embarrassed") || lowerMessage.includes("regret")) {
    return "guilt_shame"
  }
  
  // Sadness/depression - expanded
  if (lowerMessage.includes("sad") || lowerMessage.includes("depressed") || lowerMessage.includes("down") || 
      lowerMessage.includes("hopeless") || lowerMessage.includes("worthless") || lowerMessage.includes("empty") ||
      lowerMessage.includes("numb") || lowerMessage.includes("tears") || lowerMessage.includes("crying")) {
    return "sadness"
  }
  
  // Anxiety - expanded
  if (lowerMessage.includes("anxious") || lowerMessage.includes("anxiety") || lowerMessage.includes("worried") || 
      lowerMessage.includes("nervous") || lowerMessage.includes("overwhelmed") || lowerMessage.includes("stressed") ||
      lowerMessage.includes("tense") || lowerMessage.includes("restless")) {
    return "anxiety"
  }
  
  // Anger - expanded
  if (lowerMessage.includes("angry") || lowerMessage.includes("anger") || lowerMessage.includes("frustrated") || 
      lowerMessage.includes("mad") || lowerMessage.includes("rage") || lowerMessage.includes("irritated") ||
      lowerMessage.includes("annoyed") || lowerMessage.includes("furious")) {
    return "anger"
  }
  
  // Loneliness - expanded
  if (lowerMessage.includes("lonely") || lowerMessage.includes("loneliness") || lowerMessage.includes("alone") || 
      lowerMessage.includes("isolated") || lowerMessage.includes("disconnected") || lowerMessage.includes("abandoned")) {
    return "loneliness"
  }
  
  // Gratitude/thanks
  if (lowerMessage.includes("thank") || lowerMessage.includes("thanks") || lowerMessage.includes("grateful") ||
      lowerMessage.includes("appreciate") || lowerMessage.includes("helpful")) {
    return "gratitude"
  }
  
  // Questions/exploration
  if (lowerMessage.includes("?") || lowerMessage.includes("what") || lowerMessage.includes("how") || 
      lowerMessage.includes("why") || lowerMessage.includes("when") || lowerMessage.includes("where") ||
      lowerMessage.includes("can you") || lowerMessage.includes("could you") || lowerMessage.includes("help me")) {
    return "exploration"
  }
  
  return "acknowledgment"
}

// Topic-specific guidance information for Sierra Leone context
const topicGuidance: Record<string, { info: string; copingStrategies: string[]; resources: string[] }> = {
  trauma: {
    info: "Trauma can affect people in many ways - flashbacks, difficulty sleeping, feeling on edge, or avoiding reminders of what happened. In Sierra Leone, many people have experienced trauma, and healing often involves support from family, community, and sometimes professional help.",
    copingStrategies: [
      "Practice grounding techniques: Focus on 5 things you can see, 4 you can touch, 3 you can hear",
      "Connect with trusted family or community members who understand",
      "Engage in spiritual practices or prayer if that's meaningful to you",
      "Try to maintain a routine - regular meals, sleep, and daily activities can help",
      "Consider speaking with a traditional healer or community elder if that feels right for you"
    ],
    resources: [
      "Connaught Hospital - mental health services",
      "Local community elders for traditional support",
      "Religious leaders for spiritual guidance",
      "Trusted family members who can provide understanding"
    ]
  },
  anxiety: {
    info: "Anxiety is worry or fear that feels overwhelming. Physical symptoms can include rapid heartbeat, sweating, or difficulty breathing. In Sierra Leone, many people find relief through community support, spiritual practices, and connecting with family.",
    copingStrategies: [
      "Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, exhale for 8",
      "Practice grounding: notice what's around you right now in this moment",
      "Talk with family or community members - sharing worries can lighten the load",
      "Engage in activities you enjoy - even small things like listening to music or taking a walk",
      "Consider prayer or meditation if that brings you peace"
    ],
    resources: [
      "Community support groups",
      "Family members who can listen and support",
      "Spiritual or religious practices",
      "Connaught Hospital for severe anxiety"
    ]
  },
  addiction: {
    info: "Addiction involves depending on substances or behaviors in ways that harm your life. Recovery is possible, and in Sierra Leone, many people find strength through family support, community programs, and sometimes professional treatment.",
    copingStrategies: [
      "Reach out to family members - their support is crucial for recovery",
      "Avoid situations and people that trigger substance use",
      "Find alternative activities that bring you joy and meaning",
      "Connect with community programs or support groups if available",
      "Seek professional help - recovery is a journey, not a single event"
    ],
    resources: [
      "Family support - crucial for recovery in Sierra Leone",
      "Community elders who can provide guidance",
      "Connaught Hospital - substance use treatment services",
      "Religious or spiritual communities for support and accountability",
      "Local support groups or recovery programs if available"
    ]
  },
  grief: {
    info: "Grief is the natural response to loss. Everyone grieves differently - some people feel sadness, anger, numbness, or even guilt. In Sierra Leone, we often grieve as a community, finding strength in family, rituals, and shared memories.",
    copingStrategies: [
      "Allow yourself to grieve - there's no timeline for healing",
      "Connect with family and community - in Salone, we grieve together",
      "Participate in cultural rituals or ceremonies if they feel meaningful",
      "Share memories of the person you lost with others who knew them",
      "Take care of your basic needs - eating, sleeping, and staying hydrated matter",
      "Consider talking with a spiritual leader or community elder"
    ],
    resources: [
      "Family members - crucial support during grief",
      "Community members who share your loss",
      "Religious or spiritual leaders for comfort and rituals",
      "Community elders for wisdom and guidance",
      "Connaught Hospital if grief becomes overwhelming"
    ]
  }
}

// Detect if user mentions a topic
function detectMentionedTopic(message: string): string | null {
  const lower = message.toLowerCase()
  const topicKeywords: Record<string, string[]> = {
    trauma: ["trauma", "traumatic", "ptsd", "flashback", "triggered", "abuse", "violence", "assault"],
    anxiety: ["anxious", "anxiety", "worry", "worried", "panic", "overwhelmed", "stressed", "nervous"],
    addiction: ["addiction", "addicted", "alcohol", "drug", "substance", "using", "withdrawal", "recovery", "sober"],
    grief: ["grief", "grieving", "loss", "death", "died", "mourning", "funeral", "passed away", "lost someone"]
  }
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return topic
    }
  }
  
  return null
}

// Main function that uses OpenAI if available, otherwise falls back to Convex AI or local AI
export async function generateCounselorResponse(
  userMessage: string,
  conversationHistory: string[] = [],
  useOpenAI: boolean = true,
  userTopic?: string,
  userId?: string
): Promise<AIResponse> {
  // Try OpenAI first if enabled
  if (useOpenAI) {
    try {
      return await generateAIResponseWithOpenAI(userMessage, conversationHistory)
    } catch (error) {
      console.warn("OpenAI failed, using Convex AI fallback:", error)
      // Fall through to Convex AI
    }
  }

  // Try Convex AI (fine-tuned Sierra Leone AI) if userId provided
  if (userId) {
    try {
      return await generateAIResponseWithConvexAI(userMessage, userId, userTopic, conversationHistory)
    } catch (error) {
      console.warn("Convex AI failed, using local fallback:", error)
      // Fall through to local AI
    }
  }

  // Final fallback to local AI
  return generateLocalAIResponse(userMessage, conversationHistory, userTopic)
}

// Generate response using the fine-tuned Convex AI system
async function generateAIResponseWithConvexAI(
  userMessage: string,
  userId: string,
  userTopic?: string,
  conversationHistory: string[] = []
): Promise<AIResponse> {
  try {
    // Import dynamically to avoid SSR issues
    const { useMutation } = await import("convex/react")
    const { api } = await import("@/convex/_generated/api")
    
    // Call Convex AI mutation
    // Note: This needs to be called from a React component with useMutation
    // For now, we'll use fetch to call the Convex function directly
    const response = await fetch("/api/convex-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        userId,
        context: {
          topic: userTopic,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Convex AI error: ${response.status}`)
    }

    const data = await response.json()

    return {
      content: data.response,
      suggestions: data.resources?.slice(0, 5),
    }
  } catch (error) {
    console.error("Error calling Convex AI:", error)
    throw error
  }
}

// Extract key information from user's message for personalized responses
function extractMessageDetails(message: string): {
  specificFeelings: string[]
  mentionedPeople: string[]
  mentionedSituations: string[]
  questions: string[]
  intensity: "high" | "medium" | "low"
} {
  const lower = message.toLowerCase()
  const words = message.split(/\s+/)
  
  // Extract feelings mentioned
  const feelingWords = ["anxious", "worried", "sad", "angry", "frustrated", "lonely", "scared", "overwhelmed", 
    "hopeless", "worthless", "numb", "empty", "guilty", "ashamed", "tired", "exhausted", "stressed"]
  const specificFeelings = feelingWords.filter(feeling => lower.includes(feeling))
  
  // Extract people mentioned
  const peopleWords = ["boss", "teacher", "parent", "mother", "father", "friend", "partner", "spouse", 
    "husband", "wife", "boyfriend", "girlfriend", "colleague", "family", "sibling", "brother", "sister"]
  const mentionedPeople = peopleWords.filter(person => lower.includes(person))
  
  // Extract situations
  const situationWords = ["work", "job", "school", "exam", "money", "bills", "relationship", "health", 
    "family", "home", "future", "past", "present"]
  const mentionedSituations = situationWords.filter(situation => lower.includes(situation))
  
  // Extract questions
  const questions = message.split(/[.!?]+/).filter(s => s.trim().includes("?"))
  
  // Determine intensity based on words and length
  const intensityWords = ["very", "extremely", "really", "so", "too", "terrible", "awful", "horrible", 
    "devastated", "crushed", "destroyed", "can't", "cannot"]
  const hasIntensity = intensityWords.some(word => lower.includes(word))
  const isLong = message.length > 100
  const intensity = hasIntensity || isLong ? "high" : message.length > 30 ? "medium" : "low"
  
  return {
    specificFeelings,
    mentionedPeople,
    mentionedSituations,
    questions,
    intensity
  }
}

// Build reflective response that acknowledges what user actually said (counselor technique: reflective listening)
function buildReflectiveResponse(userMessage: string, details: ReturnType<typeof extractMessageDetails>): string {
  const lower = userMessage.toLowerCase()
  const sentences = userMessage.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0)
  const firstSentence = sentences[0] || userMessage
  
  // Build reflective opening - professional counselor technique
  let opening = ""
  
  // If they mention a specific feeling, reflect it back with validation
  if (details.specificFeelings.length > 0) {
    const feeling = details.specificFeelings[0]
    if (details.mentionedSituations.length > 0) {
      opening = `I hear that you're feeling ${feeling} about ${details.mentionedSituations[0]}. `
    } else if (details.mentionedPeople.length > 0) {
      opening = `I understand you're feeling ${feeling} about ${details.mentionedPeople[0]}. `
    } else {
      opening = `I hear that you're feeling ${feeling}. `
    }
  } else if (details.mentionedSituations.length > 0) {
    // If they mention a situation but no clear feeling, acknowledge the situation
    opening = `I hear you're dealing with ${details.mentionedSituations[0]}. `
  } else if (details.mentionedPeople.length > 0) {
    // If they mention people, acknowledge that
    opening = `I understand there are concerns about ${details.mentionedPeople[0]}. `
  } else {
    // Extract and reflect back a key phrase from their message (reflective listening)
    const keyPhrase = firstSentence.length > 100 
      ? firstSentence.substring(0, 100).trim() + "..." 
      : firstSentence.trim()
    
    // Use natural language to reflect back
    if (keyPhrase.length > 10) {
      opening = `You mentioned that ${keyPhrase.toLowerCase()}. `
    } else {
      opening = "I'm listening. "
    }
  }
  
  return opening
}

// Enhanced Local AI fallback with better prompts and Sierra Leone context
async function generateLocalAIResponse(
  userMessage: string, 
  conversationHistory: string[] = [],
  userTopic?: string
): Promise<AIResponse> {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700))

  const intent = detectMessageIntent(userMessage)
  const lowerMessage = userMessage.toLowerCase()
  const messageDetails = extractMessageDetails(userMessage)
  
  // Enhanced response generation with context awareness
  let response = ""
  
  // Check for crisis keywords first - expanded detection
  if (lowerMessage.includes("suicide") || lowerMessage.includes("kill myself") || lowerMessage.includes("end it all") || 
      lowerMessage.includes("not worth living") || lowerMessage.includes("feel like dying") || 
      lowerMessage.includes("want to die") || lowerMessage.includes("end my life") ||
      lowerMessage.includes("hurt myself") || lowerMessage.includes("self harm")) {
    response = "I'm very concerned about what you're sharing. Your life has value and there is help available. In Sierra Leone, please reach out immediately: Dial 999 for emergency services, contact Connaught Hospital, or reach out to a trusted family member or community leader. You don't have to go through this alone - there are people who want to help."
    return {
      content: response,
      suggestions: ["Call 999 (Emergency)", "Contact Connaught Hospital", "Talk to a trusted person"]
    }
  }

  // Extract conversation context
  const recentTopics = extractTopics(conversationHistory)
  const hasMentionedBefore = (topic: string) => recentTopics.includes(topic)
  
  // Build reflective opening that acknowledges what they said
  const reflectiveOpening = buildReflectiveResponse(userMessage, messageDetails)
  
  // Check if user mentioned a topic and provide topic-specific guidance
  const mentionedTopic = detectMentionedTopic(userMessage)
  const relevantTopic = mentionedTopic || userTopic
  
  // Generate context-aware responses with reflective listening
  switch (intent) {
    case "greeting":
      response = getRandomElement([
        "Hello, I'm here to listen. How are you feeling today?",
        "Hi there. I'm glad you reached out. What's on your mind?",
        "Welcome. I'm here to support you. How can I help you today?",
        "Na so? Welcome. I'm here to listen and support you. How are you doing today?",
        "Hello! Thank you for reaching out. I'm here to help. What would you like to talk about?",
        "Hi! I'm glad you're here. How can I support you today?",
        "Welcome to your safe space. I'm here to listen. How are you feeling?",
        "Hello! It takes courage to reach out. I'm here for you. What's on your mind?",
        "Hi there. I appreciate you taking this step. How can I help you today?",
        "Welcome. You're in a safe space. How are you feeling right now?"
      ])
      break
      
    case "anxiety":
      // Build personalized response based on what they actually said
      const anxietyContext = messageDetails.mentionedSituations.length > 0 
        ? messageDetails.mentionedSituations[0] 
        : "what's happening"
      const anxietyPeople = messageDetails.mentionedPeople.length > 0
        ? ` involving ${messageDetails.mentionedPeople[0]}`
        : ""
      
      response = reflectiveOpening + getRandomElement([
        `That sounds really overwhelming. In Sierra Leone, many people find comfort in connecting with family, community, or spiritual practices when dealing with anxiety. Can you tell me more about ${anxietyContext}${anxietyPeople} and what specifically is making you feel anxious?`,
        `Anxiety is really tough to deal with, especially when it's about ${anxietyContext}. You're not alone in this - many people in our communities experience similar feelings. What's been happening that's contributing to these anxious feelings?`,
        `I understand that feeling anxious about ${anxietyContext} can be really difficult. Your feelings are valid. Can you help me understand what's been worrying you most about this situation?`,
        `Anxiety can make everything feel bigger than it is. It sounds like ${anxietyContext}${anxietyPeople} is really weighing on you. In Salone, we often find strength in our communities. What specific aspects of this are causing you the most worry?`,
        `It's completely normal to feel anxious, especially when dealing with ${anxietyContext}. Many people in Freetown and across Sierra Leone experience this. Can you tell me more about what's been making this particularly difficult for you?`,
        `Thank you for sharing that with me. Feeling anxious about ${anxietyContext}${anxietyPeople} sounds really challenging. What do you think might help you feel more grounded right now?`
      ])
      break
      
    case "sadness":
      const sadnessContext = messageDetails.mentionedSituations.length > 0 
        ? messageDetails.mentionedSituations[0] 
        : "what you're going through"
      const sadnessIntensity = messageDetails.intensity === "high" ? "really difficult" : "difficult"
      
      response = reflectiveOpening + getRandomElement([
        `It takes courage to share these feelings. I can hear that ${sadnessContext} is ${sadnessIntensity} for you right now. In Sierra Leone, we often find strength in our communities and families. Can you tell me more about what's been contributing to these feelings?`,
        `Thank you for sharing that with me. Feeling sad or down is ${sadnessIntensity}, and it's completely okay to feel this way. Your emotions matter. What specifically about ${sadnessContext} has been weighing on you?`,
        `I hear you, and I want you to know that your feelings are valid. It sounds like ${sadnessContext} is really affecting you. Many people in Sierra Leone face challenges, and finding support in your community can help. What's been on your mind?`,
        `Sadness can feel heavy, especially when it's about ${sadnessContext}. You don't have to carry this alone - in our communities, we support each other. Can you help me understand what's been making this particularly hard for you?`,
        `Thank you for trusting me with your feelings. I can hear that ${sadnessContext} is really weighing on you. In Salone, we find strength in our families and communities. What would help you feel more supported right now?`,
        `It's okay to not be okay sometimes. It sounds like ${sadnessContext} is really difficult. Many people in Sierra Leone experience similar feelings. Can you tell me more about what's been contributing to how you're feeling?`
      ])
      break
      
    case "anger":
      response = getRandomElement([
        "Feeling angry is normal, and it's okay to experience these emotions. In Sierra Leone, we often find that talking through our frustrations with trusted family or community members helps. What's been making you feel angry?",
        "Anger can be a difficult emotion to manage. It's important to acknowledge your feelings. Can you help me understand what's triggering this anger?",
        "I understand you're feeling frustrated. That's completely valid. Sometimes identifying what's causing the anger is the first step. What's been on your mind?",
        "I hear that you're feeling angry. That's a valid emotion, and it's okay to feel this way. In our communities, we often find that expressing these feelings in a safe space helps. What's been making you feel this way?",
        "Anger can be really intense. It's important to acknowledge these feelings. Can you help me understand what specific situation or person is triggering this anger?",
        "Feeling angry is completely normal. In Salone, we often talk through our frustrations with people we trust. What's been causing you to feel this way?",
        "I understand you're experiencing anger. That's a valid emotion. Sometimes understanding what's behind the anger can help. What's been on your mind?",
        "Anger can feel overwhelming, but it's okay to feel this way. In our communities, we support each other through difficult emotions. What's been triggering these feelings?",
        "I hear that you're feeling angry. That takes courage to share. Can you tell me more about what's been making you feel this way?",
        "Feeling frustrated or angry is normal, especially when things feel unfair. In Sierra Leone, we often find strength in talking it through. What's been weighing on you?"
      ])
      break
      
    case "loneliness":
      response = getRandomElement([
        "I hear that you're feeling lonely. That's a difficult feeling. In Sierra Leone, we find strength in our communities. Is there someone in your family or community you can reach out to?",
        "Feeling alone can be really tough. Remember, you're not truly alone - there are people who care about you. Can you tell me more about what's making you feel this way?",
        "Loneliness is a difficult emotion. In our communities, we believe in the power of connection. What would help you feel more connected right now?",
        "I'm sorry you're feeling lonely. That's a valid feeling. In Salone, we often find comfort in our families and communities. Is there someone you'd like to reach out to?",
        "Feeling isolated can be really challenging. You're taking a good step by reaching out. Can you help me understand what's contributing to these feelings of loneliness?",
        "I hear that you're feeling alone. That's difficult. In Sierra Leone, we believe in community support. What would help you feel more connected?",
        "Loneliness is tough, but you're not alone in feeling this way. Many people in our communities experience this. What's been making you feel isolated?",
        "I understand you're feeling lonely. That's a valid emotion. In our communities, we find strength in reaching out to each other. What would help you right now?",
        "Feeling alone can be overwhelming. Remember, there are people who care about you. Can you tell me more about what's been making you feel this way?",
        "I hear you're experiencing loneliness. That takes courage to share. In Sierra Leone, we believe in the power of community. What would make you feel more connected?"
      ])
      break
      
    case "relationship_issue":
      const relationshipPerson = messageDetails.mentionedPeople.filter(p => 
        ["partner", "boyfriend", "girlfriend", "spouse", "husband", "wife"].includes(p)
      )[0] || "your relationship"
      
      response = reflectiveOpening + getRandomElement([
        `Relationship issues${relationshipPerson !== "your relationship" ? ` with ${relationshipPerson}` : ""} can be really challenging. In Sierra Leone, we often seek guidance from trusted family members or community elders. Can you tell me more about what's been happening?`,
        `It sounds like there are difficulties${relationshipPerson !== "your relationship" ? ` with ${relationshipPerson}` : " in your relationship"}. That's tough. In our communities, we often find that talking through these issues helps. What specifically has been happening?`,
        `Relationship problems${relationshipPerson !== "your relationship" ? ` involving ${relationshipPerson}` : ""} can feel overwhelming. It's okay to feel this way. Can you help me understand what specific issues you're dealing with?`,
        `I understand that relationship challenges${relationshipPerson !== "your relationship" ? ` with ${relationshipPerson}` : ""} can be really difficult. In Salone, we often find strength in our support networks. What would help you navigate this situation?`,
        `It sounds like ${relationshipPerson !== "your relationship" ? `${relationshipPerson} and your relationship` : "your relationship"} has been going through some challenges. Thank you for sharing. Can you tell me more about what's been on your mind?`,
        `Relationship difficulties${relationshipPerson !== "your relationship" ? ` with ${relationshipPerson}` : ""} can be really stressful. In our communities, we believe in supporting each other through difficult times. What's been the most challenging aspect?`
      ])
      break
      
    case "work_stress":
      const workContext = messageDetails.mentionedSituations.filter(s => ["work", "job", "school", "exam", "assignment"].includes(s))[0] || "work or school"
      const workPeople = messageDetails.mentionedPeople.length > 0 ? ` with ${messageDetails.mentionedPeople[0]}` : ""
      
      response = reflectiveOpening + getRandomElement([
        `${workContext.charAt(0).toUpperCase() + workContext.slice(1)} stress can be really overwhelming, especially when it involves situations${workPeople}. In Sierra Leone, many people face similar pressures. Can you tell me more about what specifically is causing this stress?`,
        `It sounds like ${workContext}${workPeople} is really challenging right now. In our communities, we often find support from family and friends. What specific aspects of this situation are most difficult for you?`,
        `Work and academic stress can feel heavy, especially when dealing with ${workContext}${workPeople}. It's okay to feel overwhelmed. Can you help me understand what's been making this particularly stressful?`,
        `I understand that dealing with ${workContext}${workPeople} can be really tough. That's a common challenge in Sierra Leone. What would help you manage this situation better?`,
        `It sounds like ${workContext}${workPeople} is weighing on you. Thank you for sharing. Can you tell me more about what specific challenges you're facing?`,
        `Work and academic stress${workPeople ? `, especially ${workPeople}` : ""} can be overwhelming. In our communities, we often find strength in talking through our challenges. What's been the most difficult part?`
      ])
      break
      
    case "financial_stress":
      response = getRandomElement([
        "Financial stress can be really overwhelming. In Sierra Leone, many people face similar challenges. Can you tell me more about what's causing this worry?",
        "I hear you're experiencing financial difficulties. That's tough. In our communities, we often find support and practical advice from family and community members. What specific challenges are you facing?",
        "Money worries can feel heavy. It's okay to feel stressed about this. Can you help me understand what's been making you feel this way?",
        "I understand you're dealing with financial stress. That's a common challenge in Sierra Leone. What would help you feel more supported?",
        "Financial concerns can be really difficult. Thank you for sharing. Can you tell me more about what's been on your mind?",
        "I hear that you're feeling stressed about money. That's valid. In our communities, we often find strength in talking through our challenges together. What's been weighing on you?",
        "Financial stress can be overwhelming. It's okay to feel this way. Can you help me understand what specific concerns you have?",
        "I understand you're experiencing financial pressure. That's difficult. In Sierra Leone, we believe in supporting each other. What would help you right now?",
        "Money worries can feel isolating. Remember, you're not alone in facing these challenges. Can you tell me more about what's been going on?",
        "I hear you're facing financial stress. That takes courage to talk about. In our communities, we support each other. What's been on your mind?"
      ])
      break
      
    case "health_concern":
      response = getRandomElement([
        "Health concerns can be really worrying. In Sierra Leone, we have healthcare resources available. Have you been able to speak with a healthcare provider?",
        "I hear you're concerned about your health. That's understandable. In our communities, we often seek support from family and healthcare professionals. What specific concerns do you have?",
        "Health worries can feel overwhelming. It's important to address these concerns. Can you tell me more about what's been happening?",
        "I understand you're dealing with health issues. That's difficult. In Sierra Leone, we have hospitals and clinics that can help. What would help you feel more supported?",
        "Health concerns are important to address. Thank you for sharing. Can you tell me more about what's been on your mind?",
        "I hear that you're worried about your health. That's valid. In our communities, we often find support from healthcare providers and family. What specific concerns do you have?",
        "Health issues can be stressful. It's okay to feel worried. Can you help me understand what's been happening?",
        "I understand you're experiencing health concerns. That's difficult. In Sierra Leone, we have resources available. What would help you right now?",
        "Health worries can feel isolating. Remember, there are healthcare professionals who can help. Can you tell me more about what's been going on?",
        "I hear you're facing health concerns. That takes courage to talk about. In our communities, we support each other. What's been on your mind?"
      ])
      break
      
    case "trauma":
      response = reflectiveOpening + getRandomElement([
        "Trauma can affect people in many ways - it's completely normal to feel overwhelmed, have difficulty sleeping, or experience flashbacks. In Sierra Leone, many people have experienced trauma, and healing often involves support from family, community, and sometimes professional help. Can you tell me more about how this trauma has been affecting you?",
        "I hear that you've experienced trauma. That's incredibly difficult, and I want you to know that your feelings are valid. Healing from trauma takes time, and in our communities, we often find strength in support from family and community. What's been most challenging for you?",
        "Trauma can affect different people in different ways - there's no 'right' way to feel. In Salone, we understand that trauma recovery is a journey. What would help you feel safer or more supported right now?",
        "Thank you for sharing that with me. Trauma can cause a range of responses, and all of them are valid. In Sierra Leone, we often find healing through community support and sometimes professional help. Can you help me understand what you're experiencing?",
        "I hear you've been through trauma. That takes incredible courage to talk about. In our communities, we believe in supporting each other through difficult experiences. What's been helping or not helping?",
        "Trauma affects everyone differently - some people feel on edge, others feel numb, and some have flashbacks. In Sierra Leone, healing often comes through family support, community connection, and sometimes professional help. What are you experiencing?"
      ])
      break
      
    case "addiction":
      response = reflectiveOpening + getRandomElement([
        "Addiction involves depending on substances or behaviors in ways that harm your life. Recovery is possible, and in Sierra Leone, many people find strength through family support, community programs, and sometimes professional treatment. Can you tell me more about what you're struggling with?",
        "I hear you're dealing with addiction. That's really difficult, and I want you to know that recovery is possible. In our communities, many people find strength through family support and community programs. What would help you most right now?",
        "Addiction can feel overwhelming, but you're not alone in this struggle. In Salone, recovery often involves the support of family and community. Can you help me understand what you're experiencing?",
        "Thank you for being open about this. Addiction affects many people, and recovery is a journey. In Sierra Leone, family support is crucial, and sometimes professional treatment can help. What's been challenging for you?",
        "I hear you're struggling with addiction. That takes courage to talk about. Recovery is possible, and in our communities, we believe in supporting each other through this journey. What would help you feel more supported?",
        "Addiction can be really difficult to deal with, but many people in Sierra Leone have found their way to recovery through family support and community help. Can you tell me more about what you're going through?"
      ])
      break
      
    case "grief":
      response = reflectiveOpening + getRandomElement([
        "I'm so sorry for your loss. Grief is one of the most difficult emotions to navigate. In Sierra Leone, we often find comfort in our communities and families during times of loss. How are you coping?",
        "I hear that you're grieving. That's incredibly difficult. In our communities, we believe in supporting each other through loss. Can you tell me more about how you're feeling?",
        "Grief can feel overwhelming. It's okay to feel this way. In Salone, we often find strength in our communities and spiritual practices. What would help you right now?",
        "I'm sorry you're going through this loss. Grief is a natural response. In Sierra Leone, we often find comfort in talking with family and community members. How long has it been?",
        "I hear you're experiencing grief. That's a difficult journey. In our communities, we support each other through these times. Can you tell me more about what's been helping or not helping?",
        "Grief can feel isolating, but you're not alone. In Sierra Leone, we believe in the power of community support during difficult times. What would help you feel more supported?"
      ])
      break
      
    case "fear":
      response = getRandomElement([
        "Fear can be really overwhelming. In Sierra Leone, we often find strength in our communities and families. Can you tell me more about what you're afraid of?",
        "I hear you're feeling afraid. That's a valid emotion. In our communities, we often find support from people we trust. What's been causing this fear?",
        "Fear can feel paralyzing. It's okay to feel this way. Can you help me understand what specific fears are weighing on you?",
        "I understand you're experiencing fear. That's difficult. In Salone, we often find comfort in talking through our fears with trusted people. What would help you?",
        "Fear is a natural response. Thank you for sharing. Can you tell me more about what's been making you feel afraid?",
        "I hear that you're feeling fearful. That's valid. In our communities, we support each other through difficult emotions. What's been on your mind?",
        "Fear can be overwhelming. It's okay to feel this way. Can you help me understand what specific situations or thoughts are causing this?",
        "I understand you're dealing with fear. That's tough. In Sierra Leone, we believe in supporting each other. What would help you feel safer?",
        "Fear can feel isolating. Remember, you're not alone. Can you tell me more about what's been going on?",
        "I hear you're experiencing fear. That takes courage to talk about. In our communities, we support each other. What's been weighing on you?"
      ])
      break
      
    case "guilt_shame":
      response = getRandomElement([
        "Guilt and shame can be really difficult emotions to carry. In Sierra Leone, we often find healing through forgiveness and community support. Can you tell me more about what's making you feel this way?",
        "I hear you're feeling guilty or ashamed. That's tough. In our communities, we believe in the power of understanding and forgiveness. What's been on your mind?",
        "Guilt and shame can feel heavy. It's okay to feel this way. Can you help me understand what's been causing these feelings?",
        "I understand you're experiencing guilt or shame. That's difficult. In Salone, we often find strength in talking through these feelings. What would help you?",
        "These feelings are valid. Thank you for sharing. Can you tell me more about what's been making you feel this way?",
        "I hear that you're feeling guilty or ashamed. That's a difficult emotion. In our communities, we support each other through these feelings. What's been weighing on you?",
        "Guilt and shame can be overwhelming. It's okay to feel this way. Can you help me understand what specific situation is causing this?",
        "I understand you're dealing with these feelings. That's tough. In Sierra Leone, we believe in supporting each other. What would help you feel better?",
        "These feelings can feel isolating. Remember, you're not alone. Can you tell me more about what's been going on?",
        "I hear you're experiencing guilt or shame. That takes courage to talk about. In our communities, we support each other. What's been on your mind?"
      ])
      break
      
    case "gratitude":
      response = getRandomElement([
        "I'm so glad I could help. You're very welcome. Remember, I'm here whenever you need to talk.",
        "You're welcome! I'm here to support you. Feel free to reach out anytime you need someone to talk to.",
        "Thank you for saying that. I'm glad I could be here for you. Remember, you're not alone.",
        "You're very welcome. It means a lot that you reached out. I'm here whenever you need support.",
        "I'm happy I could help. Thank you for trusting me. Remember, I'm always here to listen.",
        "You're welcome! I'm glad you're feeling better. Don't hesitate to reach out if you need anything.",
        "Thank you for those kind words. I'm here to support you. Take care of yourself.",
        "You're very welcome. I'm glad I could be of help. Remember, you're important and your feelings matter.",
        "I'm so happy I could help. You're welcome. Feel free to come back anytime you need to talk.",
        "Thank you! I'm here for you. Remember, you're not alone in this journey."
      ])
      break
      
    case "exploration":
      // Use conversation context to ask more specific questions
      if (hasMentionedBefore("work") || hasMentionedBefore("school")) {
        response = getRandomElement([
          "I'd like to understand better. Can you tell me more about what's happening at work/school that's making you feel this way?",
          "Thank you for sharing. What specific aspects of your work/school situation are most challenging?",
          "I'm here to listen. How long have you been dealing with these work/school pressures?",
          "Can you help me understand what specific situations at work/school led to these feelings?",
          "What do you think might help you manage the stress from work/school better?"
        ])
      } else if (hasMentionedBefore("relationship")) {
        response = getRandomElement([
          "I'd like to understand better. Can you tell me more about what's happening in your relationship?",
          "Thank you for sharing. What specific aspects of your relationship are most concerning?",
          "I'm here to listen. How long have you been experiencing these relationship challenges?",
          "Can you help me understand what led to these relationship difficulties?",
          "What do you think might help improve the situation in your relationship?"
        ])
      } else if (hasMentionedBefore("family")) {
        response = getRandomElement([
          "I'd like to understand better. Can you tell me more about what's happening with your family?",
          "Thank you for sharing. What specific family situations are most challenging?",
          "I'm here to listen. How long have you been dealing with these family issues?",
          "Can you help me understand what led to these family challenges?",
          "What do you think might help improve the situation with your family?"
        ])
      } else {
        response = getRandomElement([
          "I'd like to understand better. Can you tell me more about what's making you feel this way?",
          "Thank you for sharing. What do you think might help you feel better right now?",
          "I'm here to listen. How long have you been feeling like this?",
          "Can you help me understand what led to these feelings?",
          "What do you think might be contributing to how you're feeling?",
          "I want to understand your situation better. Can you share more details?",
          "Thank you for opening up. What specific aspects of this are most difficult for you?",
          "I'm listening. Can you help me understand the root of these feelings?",
          "What would help you feel more supported right now?",
          "Can you tell me more about what's been happening that led to these feelings?"
        ])
      }
      break
      
    case "acknowledgment":
      // Build response that reflects what they actually said
      const sentences = userMessage.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5)
      const mainPoint = sentences[0] || userMessage
      const shortenedPoint = mainPoint.length > 60 ? mainPoint.substring(0, 60) + "..." : mainPoint
      
      response = reflectiveOpening + getRandomElement([
        `Thank you for sharing that with me. It takes courage to open up, and I appreciate you reaching out. Can you tell me more about ${shortenedPoint.toLowerCase()}?`,
        `I understand this is difficult for you. You're not alone, and I'm here to support you. How has ${shortenedPoint.toLowerCase()} been affecting you?`,
        `Your experiences matter, and I'm listening. It sounds like ${shortenedPoint.toLowerCase()} is important to you. Can you help me understand more about how you're feeling?`,
        `I appreciate you sharing this with me. In Sierra Leone, we believe in the strength of community support. You're taking an important step by talking about ${shortenedPoint.toLowerCase()}. What would help you feel more supported?`,
        `Thank you for trusting me with this. I hear what you're saying about ${shortenedPoint.toLowerCase()}. Can you tell me more about what's been on your mind?`
      ])
      break
      
    default:
      // For any unrecognized intent, use reflective listening to acknowledge what they said
      const defaultSentences = userMessage.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5)
      const defaultMainPoint = defaultSentences[0] || userMessage
      const defaultShortened = defaultMainPoint.length > 70 ? defaultMainPoint.substring(0, 70) + "..." : defaultMainPoint
      
      response = reflectiveOpening + getRandomElement([
        `Thank you for sharing that with me. It takes courage to open up. Can you help me understand more about ${defaultShortened.toLowerCase()}?`,
        `I hear what you're saying about ${defaultShortened.toLowerCase()}. Your feelings are valid, and I'm here to support you. What's been on your mind?`,
        `I understand that ${defaultShortened.toLowerCase()} is important to you. In Sierra Leone, we believe in the strength of community support. Can you tell me more about how this has been affecting you?`,
        `Thank you for trusting me with this. I appreciate you sharing. It sounds like ${defaultShortened.toLowerCase()} is something that matters to you. What would help you feel more supported?`,
        `I hear you. It sounds like ${defaultShortened.toLowerCase()} has been on your mind. You're not alone, and I'm here to listen. Can you tell me more?`
      ])
  }

  // Handle short messages and Krio phrases
  if (userMessage.length < 15 && intent !== "greeting") {
    const lower = userMessage.toLowerCase()
    
    // Handle Krio phrases
    if (lower.includes("na so") || lower === "na so" || lower === "na so?") {
      response = "Na so! I hear you. Can you tell me more about what's on your mind? I'm here to support you."
    } else if (lower.includes("kushe") || lower === "kushe" || lower === "kushe?") {
      response = "Kushe! How you dey? I'm here to listen. Wetin dey worry you?"
    } else if (lower.includes("what do you advise") || lower.includes("what should i do") || lower.includes("what can i do")) {
      // Handle advice requests based on recent topic
      if (intent === "trauma") {
        response = "After trauma, it helps to: 1) Talk to someone you trust - family or community member, 2) Practice grounding when you feel overwhelmed, 3) Consider connecting with trauma support groups, 4) Be patient with yourself - healing takes time. What feels most helpful right now?"
      } else if (intent === "addiction") {
        response = "For addiction recovery: 1) Reach out to family - their support is crucial, 2) Contact NACOB at 079-797979 for free counseling, 3) Avoid situations that trigger use, 4) Connect with faith-based recovery groups. Recovery is possible. What's your first step?"
      } else {
        response = "I'd advise: 1) Talk to someone you trust, 2) Consider local support resources, 3) Take things one day at a time, 4) Be kind to yourself. What specific challenge are you facing right now?"
      }
    } else {
      response = reflectiveOpening + "I'm listening. Can you tell me more about what you're experiencing? I'm here to support you."
    }
  } else if (userMessage.length > 150 && !response.includes(reflectiveOpening)) {
    response = "Thank you for sharing so much with me. I can tell this is important to you. " + response
  }
  
  // Remove duplicate "I'm listening" phrases
  response = response.replace(/I'm listening\.\s*I'm listening\./g, "I'm listening.")

  // Add context-aware suggestions with Sierra Leone relevance
  let suggestions: string[] = []
  
  if (intent === "anxiety" || lowerMessage.includes("anxious") || lowerMessage.includes("worried") || lowerMessage.includes("nervous")) {
    suggestions.push("Try the 4-7-8 breathing technique: breathe in for 4 counts, hold for 7, exhale for 8")
    suggestions.push("Take a moment to ground yourself - notice 5 things you can see, 4 you can touch, 3 you can hear")
    suggestions.push("Consider talking to a trusted family member or community elder in your area")
    suggestions.push("In Freetown, many people find comfort in walking along the beach or in community spaces")
  }
  
  if (intent === "sadness" || lowerMessage.includes("sad") || lowerMessage.includes("depressed") || lowerMessage.includes("down")) {
    suggestions.push("Be kind to yourself - remember you're doing your best, and that's enough")
    suggestions.push("Consider connecting with your community or family - in Salone, we find strength together")
    suggestions.push("Try doing something small you enjoy - even a short walk or listening to music")
    suggestions.push("Reach out to a trusted friend or family member - you don't have to go through this alone")
  }
  
  if (intent === "anger" || lowerMessage.includes("angry") || lowerMessage.includes("frustrated")) {
    suggestions.push("It's okay to feel angry - your emotions are valid and important")
    suggestions.push("Try to identify what's specifically triggering this feeling - understanding helps")
    suggestions.push("Consider talking it through with someone you trust - in our communities, we support each other")
    suggestions.push("Take a moment to step away if possible - sometimes a brief pause helps")
  }
  
  if (intent === "loneliness" || lowerMessage.includes("lonely") || lowerMessage.includes("alone") || lowerMessage.includes("isolated")) {
    suggestions.push("Reach out to family or community members - in Sierra Leone, we value connection")
    suggestions.push("Consider joining community activities, church groups, or local organizations")
    suggestions.push("Remember that your community is here to support you - you're not truly alone")
    suggestions.push("Even a phone call to someone you trust can help bridge the distance")
  }
  
  if (intent === "work_stress" || lowerMessage.includes("work") || lowerMessage.includes("job") || lowerMessage.includes("school")) {
    suggestions.push("Break down tasks into smaller, manageable steps - one thing at a time")
    suggestions.push("Consider talking to a supervisor, teacher, or trusted colleague about your concerns")
    suggestions.push("Take regular breaks - even 5 minutes can help reset your mind")
    suggestions.push("Prioritize self-care - in Salone, we know that rest is important for productivity")
  }
  
  if (intent === "financial_stress" || lowerMessage.includes("money") || lowerMessage.includes("financial") || lowerMessage.includes("bills")) {
    suggestions.push("Consider talking to family or community members for practical advice and support")
    suggestions.push("Look into local community resources or organizations that might offer assistance")
    suggestions.push("Break down financial concerns into smaller, manageable steps")
    suggestions.push("Remember that many people in Sierra Leone face similar challenges - you're not alone")
  }
  
  if (intent === "relationship_issue" || lowerMessage.includes("partner") || lowerMessage.includes("relationship")) {
    suggestions.push("Consider talking to a trusted family member or community elder for guidance")
    suggestions.push("Take time to reflect on what you need and want in the relationship")
    suggestions.push("Open, honest communication is often the first step toward resolution")
    suggestions.push("In our communities, we often seek wisdom from respected elders about relationships")
  }
  
  if (intent === "grief" || lowerMessage.includes("death") || lowerMessage.includes("loss")) {
    suggestions.push("Allow yourself to grieve - there's no timeline for healing")
    suggestions.push("Connect with family and community - in Sierra Leone, we grieve together")
    suggestions.push("Consider talking to a spiritual leader or community elder for support")
    suggestions.push("Take care of your basic needs - eating, sleeping, and resting are important")
  }
  
  if (intent === "health_concern" || lowerMessage.includes("sick") || lowerMessage.includes("health")) {
    suggestions.push("If possible, consult with a healthcare provider at a local clinic or hospital")
    suggestions.push("In Freetown, Connaught Hospital and other facilities can provide support")
    suggestions.push("Talk to family members about your concerns - they may have helpful insights")
    suggestions.push("Keep track of symptoms to share with healthcare providers")
  }

  // Add topic-specific guidance if relevant topic is mentioned or matches user's selected topic
  if (relevantTopic && topicGuidance[relevantTopic]) {
    const guidance = topicGuidance[relevantTopic]
    
    // Add topic information to response if they mentioned it or it's their selected topic
    if (mentionedTopic || (userTopic === relevantTopic && messageDetails.intensity === "high")) {
      response += `\n\nI'd like to share some information about ${relevantTopic} that might be helpful: ${guidance.info}`
      
      // Add topic-specific coping strategies to suggestions
      const topicStrategies = guidance.copingStrategies.slice(0, 2) // Limit to 2 to avoid overwhelming
      suggestions = [...suggestions, ...topicStrategies]
    }
    
    // Always add topic-specific resources if it's the user's selected topic
    if (userTopic === relevantTopic && suggestions.length < 5) {
      const topicResources = guidance.resources.slice(0, 2)
      suggestions = [...suggestions, ...topicResources]
    }
  }

  return {
    content: response,
    suggestions: suggestions.length > 0 ? suggestions.slice(0, 5) : undefined, // Limit to 5 suggestions
  }
}

// OpenAI API Integration (calls secure API route)
// Note: Function name kept for compatibility, but now uses OpenAI
export async function generateAIResponseWithOpenAI(
  userMessage: string,
  conversationHistory: string[] = []
): Promise<AIResponse> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        conversationHistory: conversationHistory,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorCode = errorData.code || ""
      
      // Handle rate limit - fall back to local AI gracefully
      if (response.status === 429 || errorCode === "RATE_LIMIT") {
        console.warn("OpenAI rate limit exceeded, using fallback AI")
        throw new Error("RATE_LIMIT")
      }
      
      // If API key is missing or invalid, silently fall back to local AI
      if (
        response.status === 500 && 
        (errorData.error?.includes("API key") || errorCode === "API_KEY_MISSING")
      ) {
        console.warn("OpenAI API key not configured, using fallback AI")
        throw new Error("API_KEY_MISSING")
      }
      
      if (response.status === 401 || errorCode === "INVALID_API_KEY") {
        console.warn("OpenAI API key invalid, using fallback AI")
        throw new Error("API_KEY_MISSING")
      }
      
      // Handle service unavailable - fall back gracefully
      if (response.status >= 500 || errorCode === "SERVICE_UNAVAILABLE" || errorCode === "NETWORK_ERROR") {
        console.warn("OpenAI service unavailable, using fallback AI")
        throw new Error("SERVICE_UNAVAILABLE")
      }
      
      // Log other errors but still fall back
      console.error("OpenAI API error:", {
        status: response.status,
        code: errorCode,
        error: errorData.error || errorData.message
      })
      throw new Error(`API error: ${response.status} - ${errorData.error || errorData.message || "Unknown error"}`)
    }

    const data = await response.json()

    if (data.error) {
      const errorCode = data.code || ""
      
      // Handle rate limit error in response
      if (data.error.includes("Rate limit") || errorCode === "RATE_LIMIT") {
        console.warn("OpenAI rate limit exceeded, using fallback AI")
        throw new Error("RATE_LIMIT")
      }
      
      // If it's an API key error, fall back silently
      if (data.error.includes("API key") || data.error.includes("not configured") || errorCode === "API_KEY_MISSING") {
        console.warn("OpenAI API key not configured, using fallback AI")
        throw new Error("API_KEY_MISSING")
      }
      throw new Error(data.error)
    }

    if (!data.content || typeof data.content !== "string") {
      throw new Error("No content in response")
    }

      // Successfully got response from OpenAI
      return {
        content: data.content,
      }
  } catch (error) {
    // Silently fall back for rate limits, missing API keys, and service issues
    if (error instanceof Error && (
      error.message === "API_KEY_MISSING" || 
      error.message === "RATE_LIMIT" ||
      error.message === "SERVICE_UNAVAILABLE"
    )) {
      // Silent fallback - no console error
    } else if (error instanceof Error) {
      console.error("Error calling OpenAI API:", error.message)
    }
    // Always fallback to local AI if OpenAI fails
    return generateLocalAIResponse(userMessage, conversationHistory)
  }
}

