// Response Generators for Sierra Leone Cultural Context

export class SierraLeoneResponseGenerator {
  private traumaResponses = [
    {
      trigger: ["war", "rebels", "fighting", "1990s", "conflict"],
      response: "The war years left deep scars on many Sierra Leoneans. Your pain is valid. What helps you feel safe when memories come? Many find comfort connecting with other war-affected individuals through the Mental Health Coalition."
    },
    {
      trigger: ["ebola", "epidemic", "virus", "quarantine", "2014"],
      response: "Ebola took so much from our communities. The fear and loss still echo. Are there support groups in your area you can connect with? The trauma from that time is still being processed by many."
    },
    {
      trigger: ["rape", "sexual", "assault", "abuse"],
      response: "I'm deeply sorry this happened to you. Sexual violence carries heavy shame, but the shame belongs to the perpetrator, not you. RAIC in Freetown offers confidential support. You can reach them at 0800-33333. Your healing matters."
    },
    {
      trigger: ["flashback", "nightmare", "ptsd"],
      response: "Flashbacks and nightmares can make you feel like you're reliving the trauma. Grounding techniques help - focus on 5 things you can see, 4 you can touch, 3 you can hear. You're safe now, even if it doesn't feel like it."
    },
    {
      trigger: ["accident", "crash", "injured", "hospitalized"],
      response: "Accidents can be really traumatic, especially if you were injured. It's normal to feel shaken up, scared, or keep replaying what happened. Have you been able to talk to family or friends about what happened? Sometimes sharing the experience helps process it."
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

    if (facts && facts.length > 0) {
      const factsText = facts.join("\n")
      return `${baseResponse}\n\nRelated Information:\n${factsText}`
    }

    return baseResponse
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
    return "I hear you, and I want you to know that your feelings are valid. In Sierra Leone, we believe in community support and caring for each other. Can you tell me more about what's been on your mind? Sometimes talking it through helps, even if we don't have all the answers."
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

