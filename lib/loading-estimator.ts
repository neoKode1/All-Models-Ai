/**
 * Loading Estimator
 * Provides estimated time remaining for AI model generation tasks
 */

export type ModelType = 'image' | 'video' | 'audio' | 'chat';

// Average generation times in seconds
const AVERAGE_TIMES: Record<ModelType, number> = {
  image: 8,
  video: 45,
  audio: 12,
  chat: 3,
};

// Progress stages with typical completion percentages
const PROGRESS_STAGES = [
  { percent: 10, label: 'Initializing...' },
  { percent: 25, label: 'Processing...' },
  { percent: 50, label: 'Generating...' },
  { percent: 75, label: 'Finalizing...' },
  { percent: 90, label: 'Almost done...' },
  { percent: 100, label: 'Complete!' },
];

export interface LoadingEstimate {
  percentComplete: number;
  estimatedTimeRemaining: number; // in seconds
  stage: string;
  elapsedTime: number;
}

export class LoadingEstimator {
  private modelType: ModelType;
  private startTime: number;
  private expectedDuration: number;

  constructor(modelType: ModelType) {
    this.modelType = modelType;
    this.startTime = Date.now();
    this.expectedDuration = AVERAGE_TIMES[modelType] * 1000; // Convert to milliseconds
  }

  getEstimate(): LoadingEstimate {
    const now = Date.now();
    const elapsedTime = (now - this.startTime) / 1000; // in seconds
    const percentComplete = Math.min(
      (elapsedTime / (this.expectedDuration / 1000)) * 100,
      99
    );

    const estimatedTimeRemaining = Math.max(
      0,
      this.expectedDuration / 1000 - elapsedTime
    );

    // Find the appropriate stage
    const stage =
      PROGRESS_STAGES.find((s) => percentComplete <= s.percent)?.label ||
      'Processing...';

    return {
      percentComplete: Math.round(percentComplete),
      estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
      stage,
      elapsedTime: Math.round(elapsedTime),
    };
  }

  /**
   * Update the estimate based on actual progress from the API
   */
  updateWithProgress(actualPercent: number): LoadingEstimate {
    const elapsedTime = (Date.now() - this.startTime) / 1000;

    // Recalculate expected duration based on actual progress
    if (actualPercent > 0 && actualPercent < 100) {
      this.expectedDuration = (elapsedTime / actualPercent) * 100 * 1000;
    }

    const estimatedTimeRemaining = Math.max(
      0,
      ((100 - actualPercent) / 100) * (this.expectedDuration / 1000)
    );

    const stage =
      PROGRESS_STAGES.find((s) => actualPercent <= s.percent)?.label ||
      'Processing...';

    return {
      percentComplete: Math.round(actualPercent),
      estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
      stage,
      elapsedTime: Math.round(elapsedTime),
    };
  }

  /**
   * Get current progress percentage
   */
  getProgress(): number {
    return this.getEstimate().percentComplete;
  }

  /**
   * Get current status message
   */
  getStatusMessage(): string {
    return this.getEstimate().stage;
  }

  /**
   * Get estimated time remaining in seconds
   */
  getEstimatedTimeRemaining(): number {
    return this.getEstimate().estimatedTimeRemaining;
  }

  /**
   * Check if generation is stuck (taking too long)
   */
  isStuck(): boolean {
    const estimate = this.getEstimate();
    return estimate.elapsedTime > this.expectedDuration / 1000 * 2; // More than 2x expected time
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      category: this.modelType,
      estimatedDuration: this.expectedDuration / 1000,
    };
  }

  /**
   * Get a formatted time string (e.g., "2m 30s" or "45s")
   */
  static formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
}

/**
 * Create a loading estimator for a specific model type
 */
export const createLoadingEstimator = (modelType: ModelType): LoadingEstimator => {
  return new LoadingEstimator(modelType);
};

