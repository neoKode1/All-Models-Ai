/**
 * Sora 2 Content Filter
 * Filters and validates content for Sora 2 video generation
 */

export interface ContentFilterResult {
  passed: boolean;
  reason?: string;
  suggestions?: string[];
}

/**
 * List of restricted keywords
 */
const RESTRICTED_KEYWORDS = [
  'violence',
  'blood',
  'gore',
  'weapon',
  'nude',
  'naked',
  'sexual',
  // Add more as needed
];

/**
 * Check if prompt contains restricted content
 */
export const filterPrompt = (prompt: string): ContentFilterResult => {
  const lowerPrompt = prompt.toLowerCase();

  // Check for restricted keywords
  for (const keyword of RESTRICTED_KEYWORDS) {
    if (lowerPrompt.includes(keyword)) {
      return {
        passed: false,
        reason: `Content contains restricted keyword: "${keyword}"`,
        suggestions: [
          'Please revise your prompt to remove prohibited content',
          'Review content guidelines for acceptable prompts',
        ],
      };
    }
  }

  // Check prompt length
  if (prompt.length < 5) {
    return {
      passed: false,
      reason: 'Prompt is too short',
      suggestions: ['Provide a more detailed description (at least 5 characters)'],
    };
  }

  if (prompt.length > 1000) {
    return {
      passed: false,
      reason: 'Prompt is too long',
      suggestions: ['Reduce prompt to under 1000 characters'],
    };
  }

  return {
    passed: true,
  };
};

/**
 * Check if image content is appropriate
 */
export const filterImageContent = async (
  imageUrl: string
): Promise<ContentFilterResult> => {
  // Basic check - in production, you'd use an AI content moderation service
  try {
    // Placeholder for image content checking
    // In production, integrate with services like:
    // - AWS Rekognition
    // - Google Cloud Vision API
    // - Azure Content Moderator
    
    return {
      passed: true,
    };
  } catch (error) {
    console.error('Content filter error:', error);
    return {
      passed: false,
      reason: 'Unable to verify content safety',
      suggestions: ['Please try again or use a different image'],
    };
  }
};

/**
 * Validate video generation parameters
 */
export const validateVideoParams = (params: {
  prompt?: string;
  image_url?: string;
  duration?: number;
  aspect_ratio?: string;
}): ContentFilterResult => {
  // Check prompt if provided
  if (params.prompt) {
    const promptCheck = filterPrompt(params.prompt);
    if (!promptCheck.passed) {
      return promptCheck;
    }
  }

  // Validate duration
  if (params.duration) {
    if (params.duration < 2 || params.duration > 10) {
      return {
        passed: false,
        reason: 'Invalid duration',
        suggestions: ['Duration must be between 2 and 10 seconds'],
      };
    }
  }

  // Validate aspect ratio
  const validAspectRatios = ['16:9', '9:16', '1:1', '4:3', '3:4'];
  if (params.aspect_ratio && !validAspectRatios.includes(params.aspect_ratio)) {
    return {
      passed: false,
      reason: 'Invalid aspect ratio',
      suggestions: [`Supported ratios: ${validAspectRatios.join(', ')}`],
    };
  }

  return {
    passed: true,
  };
};

/**
 * Main content filter function
 */
export const checkContent = async (
  type: 'prompt' | 'image' | 'video_params',
  content: string | object
): Promise<ContentFilterResult> => {
  switch (type) {
    case 'prompt':
      return filterPrompt(content as string);
    case 'image':
      return filterImageContent(content as string);
    case 'video_params':
      return validateVideoParams(content as any);
    default:
      return {
        passed: true,
      };
  }
};

/**
 * Validate image for Sora 2
 */
export const validateImageForSora2 = async (
  imageUrl: string
): Promise<ContentFilterResult> => {
  return filterImageContent(imageUrl);
};

/**
 * Get Sora 2 content guidance
 */
export const getSora2ContentGuidance = (): string[] => {
  return [
    'Keep prompts clear and descriptive',
    'Avoid violent or explicit content',
    'Focus on visual descriptions',
    'Specify camera movements if desired',
    'Keep prompts under 500 characters for best results',
  ];
};

/**
 * Filter Sora 2 content (alias for filterPrompt)
 */
export const filterSora2Content = filterPrompt;

/**
 * Generate safe Sora 2 prompt alternatives
 */
export const generateSafeSora2Prompt = (prompt: string): string[] => {
  // Return safer alternatives to the prompt
  return [
    prompt.replace(/\b(violent|gore|blood)\b/gi, 'dramatic'),
    prompt.replace(/\b(nude|naked|sexual)\b/gi, 'person'),
    `A ${prompt}`,
  ];
};

