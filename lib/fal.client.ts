/**
 * Fal.ai Client Configuration
 * Client-side setup for Fal.ai integration
 */

import { fal } from "@fal-ai/client";

// Configure the client to use the proxy
fal.config({
  proxyUrl: "/api/fal/proxy",
});

export const falClient = fal;

/**
 * Subscribe to a Fal model with proper typing
 */
export const subscribeToModel = async <T = any>(
  modelId: string,
  options: {
    input: Record<string, any>;
    pollInterval?: number;
    logs?: boolean;
    onQueueUpdate?: (update: any) => void;
  }
): Promise<T> => {
  const result = await fal.subscribe(modelId, {
    input: options.input,
    pollInterval: options.pollInterval || 5000,
    logs: options.logs !== false,
    onQueueUpdate: options.onQueueUpdate,
  });

  return result as T;
};

/**
 * Run a Fal model (non-queued)
 */
export const runModel = async <T = any>(
  modelId: string,
  input: Record<string, any>
): Promise<T> => {
  const result = await fal.run(modelId, { input });
  return result as T;
};

