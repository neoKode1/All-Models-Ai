import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get dimensions for a given aspect ratio
 */
export const getAspectRatioDimensions = (aspectRatio: string, maxWidth: number = 1024): { width: number; height: number } => {
  const ratios: Record<string, [number, number]> = {
    '16:9': [16, 9],
    '9:16': [9, 16],
    '1:1': [1, 1],
    '4:3': [4, 3],
    '3:4': [3, 4],
    '21:9': [21, 9],
  };

  const ratio = ratios[aspectRatio] || [16, 9];
  const width = maxWidth;
  const height = Math.round((width * ratio[1]) / ratio[0]);

  return { width, height };
};

/**
 * Check if aspect ratio is supported
 */
export const isAspectRatioSupported = (aspectRatio: string, supportedRatios: string[]): boolean => {
  return supportedRatios.includes(aspectRatio);
};