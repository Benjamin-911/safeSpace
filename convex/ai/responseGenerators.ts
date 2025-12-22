// Response Generators for Sierra Leone Cultural Context

export class SierraLeoneResponseGenerator {
  private traumaResponses = [
    {
      trigger: ["sexual", "assault", "abuse", "violence"],
      response: "I'm deeply sorry this happened to you. What you experienced was not your fault. RAIC in Freetown offers confidential support and can help. You can reach them at 0800-33333. Your healing matters, and you deserve support."
    },
    {
      trigger: ["flashback", "nightmare", "ptsd"],
      response: "Flashbacks and nightmares can make you feel like you're reliving difficult experiences. Grounding techniques can help - focus on 5 things you can see, 4 you can touch, 3 you can hear. You're safe in this moment, even if it doesn't feel like it."
    },
    {
      trigger: ["accident", "crash", "injured", "hospitalized"],
      response: "Accidents can be really traumatic, especially if you were injured. It's normal to feel shaken up, scared, or keep replaying what happened. Have you been able to talk to family or friends about what happened? Sometimes sharing the experience helps process it."
    },
    {
      trigger: ["trauma", "traumatic", "past", "memories"],
      response: "Difficult experiences from the past can affect us deeply. Healing takes time, and it's different for everyone. Have you considered talking to a counselor or someone you trust? You don't have to carry this alone."
    }
  ]

  private anxietyResponses = [
    {
      trigger: ["money", "job", "unemployed", "poverty"],
      response: "The stress of making ends meet in Freetown is real. Have you explored skills training programs at the YWCA or other NGOs? The Ministry of Social Welfare also has temporary assistance programs. You're not alone in this struggle."
    },
    {
      trigger: ["school", "exams", "education", "university"],
      response: "Academic pressure can feel overwhelming. Many students at Fourah Bay College face similar stress. What study methods have worked for you before? Sometimes breaking study time into smaller chunks helps manage the anxiety."
    },
    {
      trigger: ["family", "parents", "pressure", "expectations"],
      response: "Family expectations can feel heavy, especially as the first to go to school. How can you balance their hopes with your own wellbeing? Remember, your mental health matters just as much as your success."
    }
  ]

  private spiritualResponses = [
    {
      trigger: ["god", "allah", "prayer", "faith"],
      response: "Your spiritual beliefs are an important part of healing. Many find strength in prayer at the Central Mosque or St. George's Cathedral. How does your faith support you? There's no conflict between seeking help and having faith."
    },
    {
      trigger: ["curse", "witchcraft", "juju", "spiritual"],
      response: "Spiritual concerns are taken seriously in our culture. Traditional healers and religious leaders can offer guidance alongside counseling. Some people find healing by addressing both spiritual and psychological needs. What feels right for you?"
    }
  ]

  private addictionResponses = [
    {
      trigger: ["kush", "marijuana", "cocaine", "drug"],
      response: "Addiction often starts as a way to cope with pain. NACOB (National Drug Control Board) has free counseling. Recovery is possible, one day at a time. Have you thought about reaching out to them? They're at 079-797979."
    },
    {
      trigger: ["alcohol", "drinking", "drunk"],
      response: "Using alcohol to cope is common, but it can make things worse. Many find support through faith-based recovery groups or NACOB. You don't have to do this alone. What's making you want to drink less?"
    }
  ]

  generateResponse(intent: string, message: string, facts?: string[]): string {
    const messageLower = message.toLowerCase()

    let baseResponse: string
    switch (intent) {
      case "greeting":
        baseResponse = this.getGreetingResponse(messageLower)
        break
      case "emergency":
        baseResponse = this.getEmergencyResponse()
        break
      case "crisis":
        baseResponse = this.getCrisisResponse()
        break
      case "trauma":
        baseResponse = this.getTraumaResponse(messageLower)
        break
      case "anxiety":
        baseResponse = this.getAnxietyResponse(messageLower)
        break
      case "depression":
        baseResponse = this.getDepressionResponse()
        break
      case "addiction":
        baseResponse = this.getAddictionResponse(messageLower)
        break
      case "grief":
        baseResponse = this.getGriefResponse()
        break
      case "spiritual":
        baseResponse = this.getSpiritualResponse(messageLower)
        break
      case "relationships":
        baseResponse = this.getRelationshipResponse()
        break
      case "practical":
        baseResponse = this.getPracticalResponse()
        break
      case "health":
        baseResponse = this.getHealthResponse()
        break
      default:
        baseResponse = this.getGeneralResponse(intent)
        break
    }

    // Integrate facts naturally into the response
    if (facts && facts.length > 0) {
      return this.synthesizeFacts(baseResponse, facts, intent)
    }

    return baseResponse
  }

  private synthesizeFacts(baseResponse: string, facts: string[], intent: string): string {
    // Extract helpful contact info from facts
    const phoneNumbers: string[] = []
    const resources: string[] = []

    facts.forEach(fact => {
      // Extract phone numbers (common patterns: 0xxx-xxxxx, 919, 116, etc.)
      const phoneMatch = fact.match(/(\d{3,4}[-\s]?\d{3,6}|\b\d{3}\b)/g)
      if (phoneMatch) {
        phoneNumbers.push(...phoneMatch)
      }

      // Extract organization names
      const orgMatch = fact.match(/(RAIC|NACOB|Rainbo Initiative|Kissy|Mental Health Helpline|Central Mosque|St\. George's)/gi)
      if (orgMatch) {
        resources.push(...orgMatch)
      }
    })

    // Build a natural sentence weaving in the facts
    let enhancement = ""

    if (intent === "addiction" && resources.includes("NACOB")) {
      const nacobPhone = phoneNumbers.find(p => p.includes("079") || p.includes("797979"))
      if (nacobPhone) {
        enhancement = `\n\nThe National Drug Control Board (NACOB) offers free, confidential addiction counseling. You can reach them at ${nacobPhone}. They understand what you're going through and want to help.`
      }
    } else if (intent === "trauma" && resources.some(r => r.toLowerCase().includes("raic") || r.toLowerCase().includes("rainbo"))) {
      const raicPhone = phoneNumbers.find(p => p.includes("0800") || p.includes("33333"))
      if (raicPhone) {
        enhancement = `\n\nIf you've experienced trauma or violence, the Rainbo Initiative (RAIC) in Freetown provides confidential, compassionate support. You can call them anytime at ${raicPhone}. You're not alone.`
      }
    } else if (intent === "crisis" || intent === "anxiety") {
      const helpline = phoneNumbers.find(p => p === "919")
      if (helpline) {
        enhancement = `\n\nThe Mental Health Helpline (919) is available if you need immediate support. It's free, confidential, and staffed by people who care.`
      }
    } else if (intent === "spiritual" && resources.length > 0) {
      enhancement = `\n\nMany in Sierra Leone find strength through faith. Spiritual leaders at the Central Mosque or St. George's Cathedral can offer guidance and community support.`
    }

    // If we found relevant facts, add them naturally; otherwise keep the base response
    if (enhancement) {
      return baseResponse + enhancement
    }

    // Fallback: if we have facts but couldn't synthesize them naturally, mention them briefly
    if (facts.length > 0) {
      return `${baseResponse}\n\nThere are also resources available that can help. Would you like to know more about them?`
    }
  }

  private getEmergencyResponse(): string {
    return `🚨 URGENT: I hear you're in crisis. 

IMMEDIATE STEPS:
1. CALL 116 - National Emergency Services (available 24/7)
2. CALL 919 - Mental Health Helpline
3. Go to Kissy Psychiatric Hospital (24/7 emergency)
4. Text "HELP" to 8787 for suicide prevention

You are not alone. Help is available NOW. Your life has value, and there are people who want to support you. Please reach out immediately.`
  }

  private getCrisisResponse(): string {
    return "I hear you're in crisis right now. This feels overwhelming, but it will pass. Take slow, deep breaths. Focus on getting through the next few minutes. Would it help to talk to someone right now? You can call 919 or go to Kissy Hospital. I'm here to listen too."
  }

  private getGreetingResponse(message: string): string {
    // Handle Krio greetings
    if (message.includes("na so") || message.includes("kushe") ||
      message.includes("how de") || message.includes("how you dey")) {
      return "Na so! I dey fine, thank you. How you dey? I'm here to listen and support you. Wetin dey worry you today?"
    }

    // Regular greetings
    const greetings = [
      "Hello! I'm glad you reached out. I'm here to listen and support you. What's on your mind today?",
      "Hi there. Thank you for coming to your safe space. How are you feeling?",
      "Welcome. I'm here to help. What would you like to talk about?",
      "Hello! It takes courage to reach out. I'm here for you. How can I support you today?"
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  private getTraumaResponse(message: string): string {
    for (const { trigger, response } of this.traumaResponses) {
      if (trigger.some(t => message.includes(t))) {
        return response
      }
    }
    return "Trauma changes how we see the world. Have you connected with the Mental Health Coalition's trauma support groups? Many Sierra Leoneans carry trauma, and healing happens in community. You don't have to carry this alone."
  }

  private getAnxietyResponse(message: string): string {
    for (const { trigger, response } of this.anxietyResponses) {
      if (trigger.some(t => message.includes(t))) {
        return response
      }
    }
    return "Anxiety can feel overwhelming. Try the 4-7-8 breathing: breathe in for 4, hold for 7, exhale for 8. In Sierra Leone, many find comfort in connecting with family, community, or spiritual practices when anxious. What helps you feel grounded?"
  }

  private getDepressionResponse(): string {
    return "Depression is heavy, like carrying a weight that others can't see. Many Sierra Leoneans experience this, especially after loss or trauma. In our communities, we often find strength together. Have you talked to family or a trusted community member? Sometimes just being with others who understand helps."
  }

  private getAddictionResponse(message: string): string {
    for (const { trigger, response } of this.addictionResponses) {
      if (trigger.some(t => message.includes(t))) {
        return response
      }
    }
    return "Addiction often starts as a way to cope with pain. Recovery is possible, and in Sierra Leone, many people find strength through family support, community programs, and sometimes professional treatment. NACOB offers free counseling. You don't have to do this alone."
  }

  private getGriefResponse(): string {
    return "Grief is the price we pay for love. In Sierra Leone, we grieve as a community - family, neighbors, all come together. There's no timeline for healing. How long has it been? Have you been able to participate in funeral rites? Sometimes rituals help us process loss."
  }

  private getSpiritualResponse(message: string): string {
    for (const { trigger, response } of this.spiritualResponses) {
      if (trigger.some(t => message.includes(t))) {
        return response
      }
    }
    return "Spiritual concerns are valid and important in our culture. Many find that combining spiritual practices with counseling helps. Have you spoken with a religious leader or traditional healer? Sometimes addressing both spiritual and emotional needs brings healing."
  }

  private getRelationshipResponse(): string {
    return "Relationships can bring both joy and pain. In Sierra Leone, family and community are central to our identity, which makes relationship problems especially difficult. Have you talked to a trusted family member or community elder? Sometimes outside perspective helps."
  }

  private getPracticalResponse(): string {
    return "Practical problems - money, work, housing - can cause real stress. In Freetown, resources are limited, which makes these challenges harder. Have you checked with the Ministry of Social Welfare or local NGOs for assistance? Sometimes community knows about resources that can help."
  }

  private getHealthResponse(): string {
    return "Health concerns can be worrying, especially when healthcare access is challenging. In Sierra Leone, we have Connaught Hospital, Kissy Hospital, and provincial hospitals. Have you been able to see a healthcare provider? Sometimes talking to family about health concerns helps - they may know local healers or resources."
  }

  private getGeneralResponse(intent: string): string {
    const generalResponses = [
      "I hear you. Whatever you're going through, it's okay to talk about it. What's been weighing on your mind lately?",
      "Thank you for sharing that with me. I'm here to listen. Can you tell me a bit more about what you're experiencing?",
      "It sounds like you have something important to discuss. I'm here to support you. What would help you most right now?",
      "I appreciate you reaching out. Many people in Sierra Leone face challenges, and talking about them is a sign of strength. How can I best support you?"
    ]
    return generalResponses[Math.floor(Math.random() * generalResponses.length)]
  }

  // Handle advice requests
  getAdviceResponse(topic?: string): string {
    if (topic === "trauma") {
      return "After trauma, here's what I advise: 1) Talk to someone you trust - family or a community member who understands, 2) Practice grounding when you feel overwhelmed - notice 5 things you can see, 4 you can touch, 3 you can hear, 3) Consider connecting with trauma support groups through the Mental Health Coalition, 4) Be patient with yourself - healing takes time, 5) If memories are too overwhelming, consider professional help at Kissy Hospital or RAIC. What feels most helpful for you right now?"
    }

    if (topic === "addiction") {
      return "For addiction recovery, here's my advice: 1) Reach out to family - their support is crucial for recovery in Sierra Leone, 2) Contact NACOB at 079-797979 for free counseling and support, 3) Avoid situations and people that trigger substance use, 4) Connect with faith-based recovery groups or community programs if available, 5) Take it one day at a time - recovery is a journey. Remember, you don't have to do this alone. What's your first step?"
    }

    return "Here's what I advise: 1) Talk to someone you trust - family or community member, 2) Consider local support resources like community elders or health centers, 3) Take things one day at a time, 4) Be kind to yourself - you're doing the best you can, 5) Don't hesitate to seek professional help if needed. What specific challenge are you facing right now?"
  }
}

