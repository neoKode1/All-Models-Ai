import { NextRequest } from "next/server";
import { createGenerationHandler, commonValidations } from "@/lib/api-handlers";
import { getVoiceId, createVoiceSettings } from "@/lib/voice-mappings";

// Validation function for ElevenLabs TTS
function validateElevenLabsInput(input: any) {
  // Validate text
  if (!input.text || input.text.trim().length === 0) {
    return { isValid: false, error: 'Text is required' };
  }
  if (input.text.length > 5000) {
    return { isValid: false, error: 'Text is too long (max 5000 characters)' };
  }

  // Validate voice
  if (!input.voice) {
    return { isValid: false, error: 'Voice is required' };
  }

  return { isValid: true };
}

// Transform input for ElevenLabs API
function transformElevenLabsInput(input: any) {
  const { text, voice, stability, similarity_boost, style, speed, timestamps, previous_text, next_text, language_code } = input;
  
  // Get voice ID with fallback
  const voiceId = getVoiceId('elevenlabs', voice);
  console.log('🎤 [ElevenLabs TTS] Voice mapping:', { voice, voiceId });

  // Create voice settings
  const voice_settings = createVoiceSettings({
    stability,
    similarityBoost: similarity_boost,
    style,
    useSpeakerBoost: true
  });

  // Build transformed input
  const transformedInput: any = {
    text: text.trim(),
    voice_id: voiceId,
    model_id: "eleven_turbo_v2",
    voice_settings
  };

  // Add optional parameters only if provided
  if (timestamps !== undefined) transformedInput.timestamps = timestamps;
  if (previous_text) transformedInput.previous_text = previous_text;
  if (next_text) transformedInput.next_text = next_text;
  if (language_code) transformedInput.language_code = language_code;

  return transformedInput;
}

// Create the handler using our shared pattern
export const POST = createGenerationHandler(async (body: any) => {
  // Validate input
  const validation = validateElevenLabsInput(body);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Transform input for API
  const transformedInput = transformElevenLabsInput(body);

  // This is a placeholder - actual implementation would call the ElevenLabs API
  console.log('🎤 [ElevenLabs TTS] Would generate speech with:', transformedInput);
  
  return {
    success: true,
    message: 'ElevenLabs TTS generation initiated',
    voiceId: transformedInput.voice_id,
  };
});
