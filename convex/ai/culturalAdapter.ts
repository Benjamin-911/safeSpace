// Sierra Leone Cultural Adapter

export class SierraLeoneCulturalAdapter {
  private culturalMarkers = {
    // Common Sierra Leonean phrases and concepts
    proverbs: [
      "After rain comes sunshine.",
      "Small small, day clean.",
      "One day one day, monkey go go market.",
      "Trouble no dey last forever.",
      "Patience go catch monkey.",
      "One hand no fit clap.",
      "Time go tell.",
      "Everything go be alright."
    ],
    
    greetings: [
      "My brother/sister,",
      "My dear,",
      "Abi o,",
      "Na true,",
      "Listen,",
      "You see,",
    ],
    
    affirmations: [
      "You strong pass you think.",
      "God na you dey you side.",
      "We Sierra Leone people get resilience for blood.",
      "Your ancestors dey look you.",
      "You no dey alone for this.",
      "You get people wey dey care about you.",
    ],
    
    localResources: {
      freetown: [
        "Kissy Psychiatric Hospital",
        "RAIC (Rainbo Initiative) - 0800-33333",
        "Mental Health Coalition SL",
        "St. John of God Hospital",
        "Ministry of Health and Sanitation",
        "Connaught Hospital"
      ],
      provinces: [
        "Makeni Government Hospital",
        "Bo Government Hospital",
        "Kenema Government Hospital",
        "Port Loko Government Hospital",
        "Kambia District Hospital"
      ]
    },
    
    emergencyResources: {
      national: "116 - Emergency Services",
      mentalHealth: "919 - Mental Health Helpline",
      suicide: "Text 'HELP' to 8787",
      hospitals: "Kissy Psychiatric Hospital (24/7)"
    }
  }

  adaptResponse(baseResponse: string, userLocation?: string, isEmergency = false): string {
    // For emergencies, don't add cultural touches - be direct
    if (isEmergency) {
      return baseResponse
    }

    // Add cultural greeting 40% of the time
    if (Math.random() < 0.4) {
      const greeting = this.culturalMarkers.greetings[
        Math.floor(Math.random() * this.culturalMarkers.greetings.length)
      ]
      baseResponse = `${greeting} ${baseResponse}`
    }

    // Add proverb 25% of the time (but not for emergencies or crises)
    if (Math.random() < 0.25) {
      const proverb = this.culturalMarkers.proverbs[
        Math.floor(Math.random() * this.culturalMarkers.proverbs.length)
      ]
      baseResponse = `${baseResponse} Remember, ${proverb.toLowerCase()}`
    }

    // Add affirmation 30% of the time
    if (Math.random() < 0.3) {
      const affirmation = this.culturalMarkers.affirmations[
        Math.floor(Math.random() * this.culturalMarkers.affirmations.length)
      ]
      baseResponse = `${baseResponse} ${affirmation}`
    }

    // Add local resources if location mentioned (40% of the time)
    if (userLocation && Math.random() < 0.4) {
      const locationLower = userLocation.toLowerCase()
      let resources: string[] = []
      
      if (locationLower.includes("freetown") || locationLower.includes("fritong")) {
        resources = this.culturalMarkers.localResources.freetown
      } else {
        resources = this.culturalMarkers.localResources.provinces
      }
      
      if (resources.length > 0) {
        const resource = resources[Math.floor(Math.random() * Math.min(2, resources.length))]
        baseResponse += ` Local support available at ${resource}.`
      }
    }

    return baseResponse
  }

  getEmergencyResources(): Record<string, string> {
    return this.culturalMarkers.emergencyResources
  }

  getLocalResources(location: string): string[] {
    const locationLower = location.toLowerCase()
    if (locationLower.includes("freetown") || locationLower.includes("fritong")) {
      return this.culturalMarkers.localResources.freetown
    }
    return this.culturalMarkers.localResources.provinces
  }
}

