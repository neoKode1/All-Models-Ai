/**
 * Voice Mappings for TTS Services
 * Maps voice IDs and names for different TTS providers
 */

export interface VoiceMapping {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  provider: string;
}

/**
 * ElevenLabs Voice Mappings
 */
export const ELEVENLABS_VOICES: VoiceMapping[] = [
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    language: 'en-US',
    gender: 'female',
    provider: 'elevenlabs',
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    language: 'en-US',
    gender: 'female',
    provider: 'elevenlabs',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    language: 'en-US',
    gender: 'female',
    provider: 'elevenlabs',
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    language: 'en-US',
    gender: 'male',
    provider: 'elevenlabs',
  },
  {
    id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    language: 'en-US',
    gender: 'female',
    provider: 'elevenlabs',
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    language: 'en-US',
    gender: 'male',
    provider: 'elevenlabs',
  },
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    language: 'en-US',
    gender: 'male',
    provider: 'elevenlabs',
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    language: 'en-US',
    gender: 'male',
    provider: 'elevenlabs',
  },
  {
    id: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Sam',
    language: 'en-US',
    gender: 'male',
    provider: 'elevenlabs',
  },
];

/**
 * MiniMax Voice Mappings
 */
export const MINIMAX_VOICES: VoiceMapping[] = [
  {
    id: 'male-qn-qingse',
    name: 'Male Calm',
    language: 'zh-CN',
    gender: 'male',
    provider: 'minimax',
  },
  {
    id: 'male-qn-jingying',
    name: 'Male Energetic',
    language: 'zh-CN',
    gender: 'male',
    provider: 'minimax',
  },
  {
    id: 'female-shaonv',
    name: 'Young Female',
    language: 'zh-CN',
    gender: 'female',
    provider: 'minimax',
  },
  {
    id: 'female-yujie',
    name: 'Mature Female',
    language: 'zh-CN',
    gender: 'female',
    provider: 'minimax',
  },
  {
    id: 'presenter_male',
    name: 'Male Presenter',
    language: 'zh-CN',
    gender: 'male',
    provider: 'minimax',
  },
  {
    id: 'presenter_female',
    name: 'Female Presenter',
    language: 'zh-CN',
    gender: 'female',
    provider: 'minimax',
  },
];

/**
 * Get voice by ID
 */
export const getVoiceById = (
  voiceId: string,
  provider: string
): VoiceMapping | undefined => {
  const allVoices = [...ELEVENLABS_VOICES, ...MINIMAX_VOICES];
  return allVoices.find(
    (voice) => voice.id === voiceId && voice.provider === provider
  );
};

/**
 * Get all voices for a provider
 */
export const getVoicesByProvider = (provider: string): VoiceMapping[] => {
  const allVoices = [...ELEVENLABS_VOICES, ...MINIMAX_VOICES];
  return allVoices.filter((voice) => voice.provider === provider);
};

/**
 * Get default voice for a provider
 */
export const getDefaultVoice = (provider: string): VoiceMapping | undefined => {
  const voices = getVoicesByProvider(provider);
  return voices[0];
};

/**
 * Get voice ID by name or return default
 */
export const getVoiceId = (
  provider: string,
  voiceName?: string
): string => {
  if (!voiceName) {
    const defaultVoice = getDefaultVoice(provider);
    return defaultVoice?.id || '';
  }

  const voice = getVoicesByProvider(provider).find(
    (v) => v.name.toLowerCase() === voiceName.toLowerCase()
  );

  return voice?.id || getDefaultVoice(provider)?.id || '';
};

/**
 * Create voice settings for TTS
 */
export const createVoiceSettings = (options: {
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}) => {
  return {
    stability: options.stability ?? 0.5,
    similarity_boost: options.similarityBoost ?? 0.75,
    style: options.style ?? 0,
    use_speaker_boost: options.useSpeakerBoost ?? true,
  };
};

