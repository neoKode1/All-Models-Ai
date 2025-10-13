/**
 * Server-side Image Compression
 * Used in API routes to compress images before sending to AI models
 */

/**
 * Compress image on the server side
 * Since we're on the server, we'll use simple data URL handling
 */
export const compressImageServer = async (
  imageData: string | Buffer,
  maxSizeKB: number = 1024
): Promise<string> => {
  // If it's already a base64 string, return it
  if (typeof imageData === 'string') {
    return imageData;
  }

  // Convert Buffer to base64
  const base64 = imageData.toString('base64');
  const mimeType = 'image/jpeg'; // Default to JPEG
  return `data:${mimeType};base64,${base64}`;
};

/**
 * Get image dimensions from buffer or data URL
 */
export const getImageDimensions = async (
  imageData: string | Buffer
): Promise<{ width: number; height: number }> => {
  // For now, return default dimensions
  // In production, you'd use a library like 'sharp' to get actual dimensions
  return {
    width: 1024,
    height: 1024,
  };
};

/**
 * Convert image to JPEG format on server
 */
export const convertToJPEG = async (
  imageData: string | Buffer
): Promise<Buffer> => {
  if (Buffer.isBuffer(imageData)) {
    return imageData;
  }

  // Extract base64 data
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
};

/**
 * Resize image to fit within max dimensions
 */
export const resizeImage = async (
  imageData: string | Buffer,
  maxWidth: number,
  maxHeight: number
): Promise<string> => {
  // For now, just return the image as-is
  // In production, use 'sharp' library for actual resizing
  if (typeof imageData === 'string') {
    return imageData;
  }

  const base64 = imageData.toString('base64');
  return `data:image/jpeg;base64,${base64}`;
};

/**
 * Get optimal compression options based on model requirements
 */
export const getOptimalCompressionOptions = (modelId: string) => {
  return {
    maxSizeKB: 1024,
    quality: 0.8,
    maxWidth: 2048,
    maxHeight: 2048,
  };
};

/**
 * Compress image from URL
 */
export const compressImageFromUrl = async (
  url: string,
  maxSizeKB: number = 1024
): Promise<string> => {
  try {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    return compressImageServer(buffer, maxSizeKB);
  } catch (error) {
    console.error('Error compressing image from URL:', error);
    throw new Error('Failed to compress image from URL');
  }
};

/**
 * Convert buffer to data URI
 */
export const bufferToDataUri = (buffer: Buffer, mimeType: string = 'image/jpeg'): string => {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
};

/**
 * Compress base64 data URI
 */
export const compressBase64DataUri = async (
  dataUri: string,
  maxSizeKB: number = 1024
): Promise<string> => {
  return compressImageServer(dataUri, maxSizeKB);
};

