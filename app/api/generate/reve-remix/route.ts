import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

// Configure FAL client with API key
fal.config({
  credentials: process.env.FAL_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      image_urls,
      aspect_ratio,
      output_format = 'jpeg',
      sync_mode = false,
    } = body;

    console.log('🎨 [Reve Remix API] Request received:', {
      prompt: prompt?.substring(0, 100) + '...',
      image_urls_count: image_urls?.length || 0,
      aspect_ratio,
      output_format,
      sync_mode,
    });

    // Validate required parameters
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!image_urls || !Array.isArray(image_urls)) {
      return NextResponse.json(
        { error: 'image_urls array is required' },
        { status: 400 }
      );
    }

    if (image_urls.length < 1 || image_urls.length > 4) {
      return NextResponse.json(
        { error: 'Must provide between 1 and 4 reference images' },
        { status: 400 }
      );
    }

    // Prepare input parameters
    const input: Record<string, any> = {
      prompt: prompt.trim(),
      image_urls: image_urls,
      output_format,
      sync_mode,
    };

    // Add aspect_ratio if provided
    if (aspect_ratio) {
      const validAspectRatios = ['16:9', '9:16', '3:2', '2:3', '4:3', '3:4', '1:1'];
      if (validAspectRatios.includes(aspect_ratio)) {
        input.aspect_ratio = aspect_ratio;
      } else {
        console.warn(`⚠️ [Reve Remix API] Invalid aspect ratio: ${aspect_ratio}, will use model default`);
      }
    }

    console.log('📋 [Reve Remix API] Calling FAL API with parameters:', input);

    // Call FAL API using the subscribe method for proper queue handling
    const result = await fal.subscribe("fal-ai/reve/remix", {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    });

    console.log('✅ [Reve Remix API] Generation completed successfully');
    console.log('📊 [Reve Remix API] Result data:', result.data);
    console.log('🆔 [Reve Remix API] Request ID:', result.requestId);

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: result.requestId,
    });

  } catch (error: any) {
    console.error('❌ [Reve Remix API] Error:', error);
    
    // Handle specific FAL API errors
    if (error.message?.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication failed. Please check your FAL API key.' },
        { status: 401 }
      );
    }
    
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error.message?.includes('file size') || error.message?.includes('1.5 MB')) {
      return NextResponse.json(
        { error: 'One or more images exceed 1.5 MB size limit. Please compress your images.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to remix images',
        success: false 
      },
      { status: 500 }
    );
  }
}

