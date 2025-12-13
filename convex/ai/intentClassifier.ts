// Intent Classification System for Sierra Leone Mental Health Context

export class IntentClassifier {
  private intents = {
    emergency: [
      "suicide", "kill myself", "end my life", "want to die",
      "harm myself", "self harm", "overdose", "bleeding",
      "no reason to live", "want to disappear", "end it all",
      "feel like dying", "not worth living", "hurt myself"
    ],
    greeting: [
      "hello", "hi", "hey", "good morning", "good afternoon",
      "good evening", "na so", "kushe", "how de", "how you dey",
      "wetin de happen", "how body"
    ],
    crisis: [
      "panic attack", "can't breathe", "crying nonstop", "lost control",
      "can't function", "paralyzed", "can't stop shaking",
      "can't cope", "breaking down", "falling apart"
    ],
    trauma: [
      "war memories", "flashbacks", "nightmares", "ptsd",
      "rape", "assault", "abuse", "violent memories",
      "ebola", "flood", "mudslide", "disaster",
      "war", "rebels", "fighting", "1990s", "conflict",
      "trauma", "traumatic", "triggered", "victim",
      "accident", "crash", "injured", "hospitalized"
    ],
    anxiety: [
      "worried", "anxious", "panic", "stress", "overthinking",
      "nervous", "scared", "fear", "heart racing", "can't sleep",
      "overwhelmed", "stressed", "tense", "restless"
    ],
    depression: [
      "sad", "depressed", "empty", "hopeless", "no energy",
      "can't get up", "tired all the time", "no motivation",
      "worthless", "guilty", "suicidal thoughts",
      "down", "numb", "tears", "crying"
    ],
    addiction: [
      "drugs", "alcohol", "gambling", "addicted", "withdrawal",
      "craving", "relapse", "kush", "marijuana", "cocaine",
      "drinking", "smoking", "using", "substance"
    ],
    grief: [
      "lost", "death", "died", "grieving", "mourning",
      "funeral", "passed away", "bereaved", "miss them",
      "grief", "loss", "mourning"
    ],
    relationships: [
      "boyfriend", "girlfriend", "husband", "wife", "partner",
      "breakup", "divorce", "cheating", "family conflict",
      "parents", "children", "friends", "lonely", "betrayal",
      "relationship", "spouse", "partner"
    ],
    practical: [
      "job", "money", "school", "exams", "work",
      "housing", "food", "unemployment", "poverty",
      "financial", "bills", "debt", "salary", "income"
    ],
    spiritual: [
      "god", "prayer", "sin", "faith", "religious",
      "allah", "church", "mosque", "curse", "witchcraft",
      "juju", "spiritual", "religious"
    ],
    health: [
      "sick", "ill", "pain", "health", "doctor",
      "hospital", "symptoms", "medical"
    ]
  }

  classify(message: string): {
    primaryIntent: string
    confidence: number
    secondaryIntents: string[]
  } {
    const messageLower = message.toLowerCase()
    const scores: Record<string, number> = {}
    
    // Calculate intent scores
    for (const [intent, keywords] of Object.entries(this.intents)) {
      let score = 0
      for (const keyword of keywords) {
        if (messageLower.includes(keyword)) {
          score += 1
          // Extra weight for emergency keywords
          if (intent === "emergency") score += 10
          if (intent === "crisis") score += 5
        }
      }
      if (score > 0) scores[intent] = score
    }
    
    // Sort by score
    const sortedIntents = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
    
    return {
      primaryIntent: sortedIntents[0]?.[0] || "general",
      confidence: sortedIntents[0]?.[1] || 0,
      secondaryIntents: sortedIntents.slice(1, 3).map(([intent]) => intent)
    }
  }
}

