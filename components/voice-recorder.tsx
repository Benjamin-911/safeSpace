"use client"

import React, { useState, useRef, useEffect } from "react"
import { Mic, Square, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void
  onCancel: () => void
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
}

export function VoiceRecorder({ onSend, onCancel, isRecording, setIsRecording }: VoiceRecorderProps) {
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)
    } catch {
      console.error("Could not start recording")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob)
      setAudioBlob(null)
      setDuration(0)
    }
  }

  const handleCancel = () => {
    setAudioBlob(null)
    setDuration(0)
    setIsRecording(false)
    onCancel()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (audioBlob) {
    return (
      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-secondary rounded-full">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={handleCancel} 
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-full touch-manipulation"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="h-8 flex-1 bg-primary/20 rounded-full flex items-center px-2 sm:px-3">
            <span className="text-xs sm:text-sm text-muted-foreground truncate">{formatTime(duration)}</span>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleSend}
          size="icon"
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-primary hover:bg-primary/90 touch-manipulation"
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    )
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-destructive/10 rounded-full">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={handleCancel} 
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-full touch-manipulation"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className={cn("h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-destructive animate-pulse flex-shrink-0")} />
          <span className="text-xs sm:text-sm font-medium">{formatTime(duration)}</span>
        </div>
        <Button
          type="button"
          onClick={stopRecording}
          size="icon"
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground touch-manipulation"
        >
          <Square className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      type="button"
      onClick={startRecording}
      size="icon"
      className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg touch-manipulation"
    >
      <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
    </Button>
  )
}
