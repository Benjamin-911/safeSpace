"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Show splash for 2 seconds, then fade out
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        onComplete()
      }, 500) // Wait for fade animation
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center gradient-primary transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4 sm:gap-6 px-4">
        <div className="relative animate-float">
          <div className="absolute inset-0 animate-ping">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white/30 animate-pulse-glow"></div>
          </div>
          <div className="relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 shadow-2xl">
            <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-white animate-pulse drop-shadow-lg" fill="currentColor" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg tracking-tight">
            SafeSpace Salone
          </h1>
          <p className="text-base sm:text-lg text-white/90 font-medium">Your confidential mental health support</p>
        </div>
        <div className="mt-6 h-2 w-32 sm:w-40 overflow-hidden rounded-full bg-white/30 backdrop-blur-sm">
          <div className="h-full w-full animate-[loading_2s_ease-in-out] bg-white rounded-full shadow-lg"></div>
        </div>
      </div>
      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

