/**
 * Film Director Data
 * Style presets and director-inspired prompts for AI generation
 */

export interface DirectorStyle {
  id: string;
  name: string;
  description: string;
  promptModifier: string;
  category: 'classic' | 'modern' | 'experimental' | 'genre';
}

export const DIRECTOR_STYLES: DirectorStyle[] = [
  {
    id: 'kubrick',
    name: 'Stanley Kubrick',
    description: 'Symmetrical compositions, one-point perspective, deliberate pacing',
    promptModifier: 'cinematic, symmetrical composition, wide-angle lens, dramatic lighting, meticulous framing',
    category: 'classic',
  },
  {
    id: 'wes-anderson',
    name: 'Wes Anderson',
    description: 'Pastel colors, centered framing, whimsical details',
    promptModifier: 'centered composition, pastel color palette, symmetrical, whimsical, detailed miniature aesthetic',
    category: 'modern',
  },
  {
    id: 'nolan',
    name: 'Christopher Nolan',
    description: 'Epic scale, practical effects, IMAX cinematography',
    promptModifier: 'epic scale, dramatic lighting, high contrast, practical effects, cinematic grandeur',
    category: 'modern',
  },
  {
    id: 'tarantino',
    name: 'Quentin Tarantino',
    description: 'Bold colors, trunk shots, retro aesthetic',
    promptModifier: 'bold saturated colors, vintage film grain, dynamic angles, retro aesthetic',
    category: 'modern',
  },
  {
    id: 'villeneuve',
    name: 'Denis Villeneuve',
    description: 'Atmospheric, minimalist, wide landscapes',
    promptModifier: 'atmospheric, minimalist composition, wide landscape, moody lighting, desaturated tones',
    category: 'modern',
  },
  {
    id: 'fincher',
    name: 'David Fincher',
    description: 'Dark, precise, cold color grading',
    promptModifier: 'dark moody atmosphere, precise composition, cold color grading, sharp focus',
    category: 'modern',
  },
  {
    id: 'spielberg',
    name: 'Steven Spielberg',
    description: 'Warm lighting, emotional depth, classic framing',
    promptModifier: 'warm golden lighting, emotional depth, classic Hollywood framing, lens flare',
    category: 'classic',
  },
  {
    id: 'lynch',
    name: 'David Lynch',
    description: 'Surreal, dreamlike, unsettling atmosphere',
    promptModifier: 'surreal dreamlike quality, unsettling atmosphere, high contrast shadows, mysterious',
    category: 'experimental',
  },
  {
    id: 'ridley-scott',
    name: 'Ridley Scott',
    description: 'Atmospheric smoke, dramatic backlighting, epic scope',
    promptModifier: 'atmospheric smoke and fog, dramatic backlighting, epic cinematic scope, rich textures',
    category: 'genre',
  },
  {
    id: 'malick',
    name: 'Terrence Malick',
    description: 'Natural light, golden hour, philosophical depth',
    promptModifier: 'natural golden hour lighting, ethereal atmosphere, shallow depth of field, contemplative',
    category: 'experimental',
  },
];

/**
 * Cinematography styles
 */
export interface CinematographyStyle {
  id: string;
  name: string;
  description: string;
  promptModifier: string;
}

export const CINEMATOGRAPHY_STYLES: CinematographyStyle[] = [
  {
    id: 'noir',
    name: 'Film Noir',
    description: 'High contrast black and white, dramatic shadows',
    promptModifier: 'film noir style, high contrast black and white, dramatic shadows, venetian blind lighting',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon lights, rain-soaked streets, dystopian',
    promptModifier: 'cyberpunk aesthetic, neon lights, rain-soaked streets, futuristic dystopian, high tech',
  },
  {
    id: 'western',
    name: 'Classic Western',
    description: 'Dusty landscapes, warm sunset tones',
    promptModifier: 'classic western style, dusty desert landscape, warm sunset tones, wide open spaces',
  },
  {
    id: 'horror',
    name: 'Horror',
    description: 'Low-key lighting, unsettling compositions',
    promptModifier: 'horror cinematography, low-key lighting, unsettling composition, dark shadows, eerie atmosphere',
  },
  {
    id: 'documentary',
    name: 'Documentary',
    description: 'Natural lighting, handheld realism',
    promptModifier: 'documentary style, natural lighting, realistic, handheld camera feel, authentic',
  },
];

/**
 * Get director style by ID
 */
export const getDirectorStyle = (id: string): DirectorStyle | undefined => {
  return DIRECTOR_STYLES.find((style) => style.id === id);
};

/**
 * Get cinematography style by ID
 */
export const getCinematographyStyle = (id: string): CinematographyStyle | undefined => {
  return CINEMATOGRAPHY_STYLES.find((style) => style.id === id);
};

/**
 * Apply style to prompt
 */
export const applyStyleToPrompt = (
  prompt: string,
  styleId: string,
  type: 'director' | 'cinematography' = 'director'
): string => {
  const style = type === 'director' 
    ? getDirectorStyle(styleId) 
    : getCinematographyStyle(styleId);

  if (!style) {
    return prompt;
  }

  return `${prompt}, ${style.promptModifier}`;
};

/**
 * Analyze prompt for director style suggestions
 */
export const analyzePromptForDirectorStyle = (prompt: string): {
  suggestedStyle?: DirectorStyle;
  confidence: number;
  reasoning: string;
} => {
  const lowerPrompt = prompt.toLowerCase();

  // Check for style keywords
  if (lowerPrompt.includes('symmetrical') || lowerPrompt.includes('centered')) {
    return {
      suggestedStyle: getDirectorStyle('wes-anderson'),
      confidence: 0.8,
      reasoning: 'Prompt suggests symmetrical composition',
    };
  }

  if (lowerPrompt.includes('dark') || lowerPrompt.includes('moody')) {
    return {
      suggestedStyle: getDirectorStyle('fincher'),
      confidence: 0.7,
      reasoning: 'Prompt suggests dark, moody atmosphere',
    };
  }

  if (lowerPrompt.includes('epic') || lowerPrompt.includes('grand')) {
    return {
      suggestedStyle: getDirectorStyle('nolan'),
      confidence: 0.7,
      reasoning: 'Prompt suggests epic scale',
    };
  }

  return {
    confidence: 0,
    reasoning: 'No specific style detected',
  };
};

