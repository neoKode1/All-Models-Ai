import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 [Veo3.1 Reference-to-Video API] Request received');
    
    // Check if FAL_KEY is available
    if (!process.env.FAL_KEY) {
      console.error('❌ [Veo3.1 Reference-to-Video API] FAL_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'FAL_KEY environment variable is not configured' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    console.log('📝 [Veo3.1 Reference-to-Video API] Request body:', body);

    const {
      model,
      prompt,
      image_urls,
      aspect_ratio = "16:9",
      duration = "8s",
      resolution = "720p",
      generate_audio = true,
    } = body;

    if (!prompt) {
      console.log('❌ [Veo3.1 Reference-to-Video API] Missing prompt');
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
      console.log('❌ [Veo3.1 Reference-to-Video API] Missing or invalid image_urls');
      return NextResponse.json(
        { error: 'image_urls array is required with at least one image' },
        { status: 400 }
      );
    }

    // Prepare the input for Veo 3.1 Reference-to-Video
    const input: any = {
      prompt: prompt.trim(),
      image_urls: image_urls,
      duration,
      resolution,
      generate_audio,
    };

    console.log('🚀 [Veo3.1 Reference-to-Video API] Calling fal.ai with input:', input);
    console.log('🔑 [Veo3.1 Reference-to-Video API] FAL_KEY available:', !!process.env.FAL_KEY);
    console.log('🎬 [Veo3.1 Reference-to-Video API] Model requested:', model);
    console.log('🖼️ [Veo3.1 Reference-to-Video API] Number of reference images:', image_urls.length);

    // Call the Veo 3.1 Reference-to-Video API
    const result = await fal.subscribe("fal-ai/veo3.1/reference-to-video", {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        console.log('📊 [Veo3.1 Reference-to-Video API] Queue update:', update.status);
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log: any) => log.message).forEach(console.log);
        }
      },
    }).catch((error: any) => {
      console.error('❌ [Veo3.1 Reference-to-Video API] FAL subscribe error:', error);
      console.error('❌ [Veo3.1 Reference-to-Video API] Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      throw error;
    });

    console.log('✅ [Veo3.1 Reference-to-Video API] Generation completed');
    console.log('📦 [Veo3.1 Reference-to-Video API] Result:', result.data);

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: result.requestId,
      model: 'Google Veo 3.1 Reference-to-Video',
      parameters: input,
    });

  } catch (error: any) {
    console.error('❌ [Veo3.1 Reference-to-Video API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate video from reference images',
        details: error.message || 'Unknown error occurred',
        model: 'Google Veo 3.1 Reference-to-Video'
      },
      { status: 500 }
    );
  }
}
