// Audio Transcription Utilities
// Uses OpenAI Whisper API for accurate transcription

/**
 * Note: Web Speech API is for real-time recognition, not audio files
 * For audio files, we use OpenAI Whisper API which is more accurate
 */

/**
 * Transcribe audio using OpenAI Whisper API (more accurate, requires API key)
 */
export async function transcribeAudioWhisper(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'en') // Optional: specify language for better accuracy

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.text || data.transcript || ''
  } catch (error) {
    console.error('Whisper transcription error:', error)
    throw error
  }
}

/**
 * Main transcription function - uses OpenAI Whisper API
 * Falls back gracefully if API key not available
 */
export async function transcribeAudio(audioBlob: Blob, preferWhisper: boolean = true): Promise<string> {
  try {
    // Try OpenAI Whisper first (more accurate)
    return await transcribeAudioWhisper(audioBlob)
  } catch (error) {
    console.warn('Whisper transcription failed:', error)
    // If Whisper fails, we can't transcribe - return empty string
    // The AI will handle it gracefully with a generic voice message prompt
    throw new Error('Audio transcription not available. Please type your message or ensure OpenAI API key is configured.')
  }
}

