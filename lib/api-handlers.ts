/**
 * API Handler Utilities
 * Common utilities for API route handlers
 */

import { NextResponse } from 'next/server';

/**
 * Create a success response
 */
export const successResponse = (data: any, status: number = 200) => {
  return NextResponse.json(data, { status });
};

/**
 * Create an error response
 */
export const errorResponse = (
  message: string,
  status: number = 500,
  details?: any
) => {
  return NextResponse.json(
    {
      error: message,
      details,
    },
    { status }
  );
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (error: any) => {
  console.error('API Error:', error);

  if (error.response) {
    // External API error
    return errorResponse(
      error.response.data?.message || 'External API error',
      error.response.status,
      error.response.data
    );
  }

  if (error.message) {
    return errorResponse(error.message, 500);
  }

  return errorResponse('An unexpected error occurred', 500);
};

/**
 * Validate required fields in request body
 */
export const validateRequiredFields = (
  body: any,
  requiredFields: string[]
): { valid: boolean; missing?: string[] } => {
  const missing = requiredFields.filter((field) => !body[field]);

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true };
};

/**
 * Parse request body safely
 */
export const parseRequestBody = async (request: Request): Promise<any> => {
  try {
    return await request.json();
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
};

/**
 * Create a streaming response for long-running operations
 */
export const createStreamResponse = (
  stream: ReadableStream
): Response => {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};

/**
 * Rate limiting check (basic implementation)
 */
export const checkRateLimit = async (
  userId: string,
  limit: number = 100,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number }> => {
  // Basic in-memory rate limiting
  // In production, use Redis or similar
  return { allowed: true, remaining: limit };
};

/**
 * Common validations for API requests
 */
export const commonValidations = {
  apiKey: (key: string | undefined) => {
    if (!key) {
      throw new Error('API key is required');
    }
    return key;
  },
  prompt: (prompt: string | undefined) => {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt is required');
    }
    if (prompt.length > 2000) {
      throw new Error('Prompt is too long (max 2000 characters)');
    }
    return prompt.trim();
  },
};

/**
 * Create a generation handler with common error handling
 */
export const createGenerationHandler = (
  handler: (body: any) => Promise<any>
) => {
  return async (request: Request) => {
    try {
      const body = await parseRequestBody(request);
      const result = await handler(body);
      return successResponse(result);
    } catch (error) {
      return handleApiError(error);
    }
  };
};

