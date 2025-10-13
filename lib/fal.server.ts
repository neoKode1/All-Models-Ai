/**
 * Fal.ai Server Configuration
 * Server-side utilities for Fal.ai integration
 */

import { fal } from "@fal-ai/client";

// Server-side configuration with credentials
if (process.env.FAL_KEY) {
  fal.config({
    credentials: process.env.FAL_KEY,
  });
}

export { fal };

/**
 * Fal.ai Model Endpoints
 */
export const FAL_ENDPOINTS = {
  // Image Models
  FLUX_PRO: "fal-ai/flux-pro",
  FLUX_DEV: "fal-ai/flux/dev",
  FLUX_SCHNELL: "fal-ai/flux/schnell",
  STABLE_DIFFUSION_XL: "fal-ai/fast-sdxl",
  
  // Video Models
  LUMA_DREAM_MACHINE: "fal-ai/luma-dream-machine",
  KLING: "fal-ai/kling-video",
  MINIMAX: "fal-ai/minimax-video",
  
  // Audio Models
  AUDIO_CRAFT: "fal-ai/audio-craft",
  ELEVENLABS_TTS: "fal-ai/elevenlabs-text-to-speech",
  
  // Utility Models
  LIPSYNC: "fal-ai/lipsync",
  FACE_TO_STICKER: "fal-ai/face-to-sticker",
} as const;

/**
 * Subscribe to a model with server-side credentials
 */
export const subscribeToModel = async <T = any>(
  modelId: string,
  options: {
    input: Record<string, any>;
    webhookUrl?: string;
    pollInterval?: number;
    logs?: boolean;
    onQueueUpdate?: (update: any) => void;
  }
): Promise<T> => {
  try {
    const result = await fal.subscribe(modelId, {
      input: options.input,
      webhookUrl: options.webhookUrl,
      pollInterval: options.pollInterval || 5000,
      logs: options.logs !== false,
      onQueueUpdate: options.onQueueUpdate,
    });

    return result as T;
  } catch (error: any) {
    console.error(`Fal.ai error for ${modelId}:`, error);
    throw new Error(error?.message || 'Failed to generate content');
  }
};

/**
 * Run a model immediately (non-queued)
 */
export const runModel = async <T = any>(
  modelId: string,
  input: Record<string, any>
): Promise<T> => {
  try {
    const result = await fal.run(modelId, { input });
    return result as T;
  } catch (error: any) {
    console.error(`Fal.ai error for ${modelId}:`, error);
    throw new Error(error?.message || 'Failed to generate content');
  }
};

/**
 * Get status of a queued request
 */
export const getRequestStatus = async (requestId: string) => {
  try {
    const status = await fal.queue.status(requestId, { logs: true, requestId });
    return status;
  } catch (error: any) {
    console.error('Fal.ai status check error:', error);
    throw new Error(error?.message || 'Failed to check status');
  }
};

/**
 * Get result of a completed request
 */
export const getRequestResult = async <T = any>(requestId: string): Promise<T> => {
  try {
    const result = await fal.queue.result(requestId, { requestId });
    return result as T;
  } catch (error: any) {
    console.error('Fal.ai result retrieval error:', error);
    throw new Error(error?.message || 'Failed to get result');
  }
};

/**
 * Submit a request to the queue
 */
export const queueRequest = async (
  modelId: string,
  input: Record<string, any>,
  webhookUrl?: string
) => {
  try {
    const { request_id } = await fal.queue.submit(modelId, {
      input,
      webhookUrl,
    });
    return request_id;
  } catch (error: any) {
    console.error('Fal.ai queue submission error:', error);
    throw new Error(error?.message || 'Failed to queue request');
  }
};

