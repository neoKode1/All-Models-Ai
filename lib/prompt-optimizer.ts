/**
 * Prompt Optimizer
 * Optimizes prompts for different AI models
 */

export interface PromptOptimizationResult {
  optimizedPrompt: string;
  suggestions: string[];
  warnings: string[];
}

/**
 * Optimize prompt for image generation
 */
export const optimizeImagePrompt = (
  prompt: string,
  model: string
): PromptOptimizationResult => {
  const suggestions: string[] = [];
  const warnings: string[] = [];
  let optimizedPrompt = prompt.trim();

  // Check prompt length
  if (optimizedPrompt.length < 10) {
    warnings.push('Prompt is quite short. Consider adding more details.');
  }

  if (optimizedPrompt.length > 1000) {
    warnings.push('Prompt is very long. Some models may truncate it.');
    optimizedPrompt = optimizedPrompt.substring(0, 1000);
  }

  // Remove excessive punctuation
  optimizedPrompt = optimizedPrompt.replace(/\.{3,}/g, '...');
  optimizedPrompt = optimizedPrompt.replace(/!{2,}/g, '!');

  // Suggest quality enhancements if not present
  const qualityKeywords = ['detailed', 'high quality', '4k', '8k', 'hd'];
  const hasQualityKeyword = qualityKeywords.some((keyword) =>
    optimizedPrompt.toLowerCase().includes(keyword)
  );

  if (!hasQualityKeyword) {
    suggestions.push('Consider adding quality descriptors like "detailed" or "high quality"');
  }

  return {
    optimizedPrompt,
    suggestions,
    warnings,
  };
};

/**
 * Optimize prompt for video generation
 */
export const optimizeVideoPrompt = (
  prompt: string,
  model: string
): PromptOptimizationResult => {
  const suggestions: string[] = [];
  const warnings: string[] = [];
  let optimizedPrompt = prompt.trim();

  // Video-specific optimizations
  const motionKeywords = ['moving', 'flowing', 'animated', 'dynamic'];
  const hasMotionKeyword = motionKeywords.some((keyword) =>
    optimizedPrompt.toLowerCase().includes(keyword)
  );

  if (!hasMotionKeyword) {
    suggestions.push('Consider adding motion descriptors for better video results');
  }

  if (optimizedPrompt.length > 500) {
    warnings.push('Video prompts work best when concise. Consider shortening.');
  }

  return {
    optimizedPrompt,
    suggestions,
    warnings,
  };
};

/**
 * Optimize prompt for chat/text generation
 */
export const optimizeChatPrompt = (prompt: string): PromptOptimizationResult => {
  const suggestions: string[] = [];
  const warnings: string[] = [];
  let optimizedPrompt = prompt.trim();

  // Remove excessive newlines
  optimizedPrompt = optimizedPrompt.replace(/\n{3,}/g, '\n\n');

  if (optimizedPrompt.length < 5) {
    warnings.push('Prompt is very short. Provide more context for better results.');
  }

  return {
    optimizedPrompt,
    suggestions,
    warnings,
  };
};

/**
 * Main optimizer function
 */
export const optimizePrompt = (
  prompt: string,
  type: 'image' | 'video' | 'chat',
  model?: string
): PromptOptimizationResult => {
  switch (type) {
    case 'image':
      return optimizeImagePrompt(prompt, model || 'default');
    case 'video':
      return optimizeVideoPrompt(prompt, model || 'default');
    case 'chat':
      return optimizeChatPrompt(prompt);
    default:
      return {
        optimizedPrompt: prompt,
        suggestions: [],
        warnings: [],
      };
  }
};

/**
 * Format optimization result as a readable string
 */
export const formatOptimizationResult = (result: PromptOptimizationResult): string => {
  let output = `Optimized Prompt: ${result.optimizedPrompt}\n`;

  if (result.suggestions.length > 0) {
    output += '\nSuggestions:\n' + result.suggestions.map((s) => `- ${s}`).join('\n');
  }

  if (result.warnings.length > 0) {
    output += '\nWarnings:\n' + result.warnings.map((w) => `- ${w}`).join('\n');
  }

  return output;
};

/**
 * Check if a prompt is likely to be rejected
 */
export const isPromptLikelyRejected = (prompt: string): boolean => {
  const restrictedTerms = [
    'nude', 'naked', 'nsfw', 'explicit', 'sexual',
    'violence', 'blood', 'gore', 'weapon',
  ];

  const lowerPrompt = prompt.toLowerCase();
  return restrictedTerms.some((term) => lowerPrompt.includes(term));
};

