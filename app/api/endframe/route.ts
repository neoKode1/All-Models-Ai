import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@/lib/fal.server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startFrame, endFrame, duration = 4 } = body;

    console.log('🎬 [EndFrame API] Starting EndFrame generation');
    console.log('📊 [EndFrame API] Request body:', { 
      hasStartFrame: !!startFrame, 
      hasEndFrame: !!endFrame, 
      duration 
    });

    if (!startFrame || !endFrame) {
      console.error('❌ [EndFrame API] Missing required fields:', { startFrame: !!startFrame, endFrame: !!endFrame });
      return NextResponse.json(
        { error: 'Both startFrame and endFrame are required' },
        { status: 400 }
      );
    }

    // Validate that the frames are valid image URLs or data URLs
    const isValidImageUrl = (url: string) => {
      return url.startsWith('data:image/') || url.startsWith('http') || url.startsWith('https');
    };

    if (!isValidImageUrl(startFrame) || !isValidImageUrl(endFrame)) {
      console.error('❌ [EndFrame API] Invalid image format:', { 
        startFrameFormat: startFrame.substring(0, 20), 
        endFrameFormat: endFrame.substring(0, 20) 
      });
      return NextResponse.json(
        { error: 'Both startFrame and endFrame must be valid image URLs or data URLs' },
        { status: 400 }
      );
    }

    // Use Veo 3.1 first-last-frame-to-video for proper EndFrame generation
    // This model is specifically designed for start/end frame transitions
    const result = await fal.subscribe('fal-ai/veo3.1/first-last-frame-to-video', {
      input: {
        prompt: body.prompt || 'Create a smooth transition between the start and end frames, maintaining visual consistency and natural motion',
        first_frame_url: startFrame,
        last_frame_url: endFrame,
        duration: duration.toString() + 's', // Veo 3.1 expects duration with 's' suffix
        resolution: "720p"
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        console.log('📊 [EndFrame API] Queue update:', update.status);
        if (update.logs) {
          update.logs.forEach((log: any) => {
            console.log(`   📝 ${log.message}`);
          });
        }
      },
    });

    console.log('✅ [EndFrame API] Generation completed');
    console.log('📦 [EndFrame API] Result:', result.data);

    return NextResponse.json({
      success: true,
      videoUrl: result.data.video?.url,
      taskId: result.requestId,
      model: 'fal-ai/veo3.1/first-last-frame-to-video'
    });

  } catch (error: any) {
    console.error('❌ [EndFrame API] Error:', error);
    
    // Log more details for validation errors
    if (error.status === 422) {
      console.error('❌ [EndFrame API] Validation Error Details:', error.body);
    }
    
    return NextResponse.json(
      { 
        error: 'EndFrame generation failed', 
        details: error.message,
        validationError: error.status === 422 ? error.body : undefined,
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }

    console.log('🔍 [EndFrame API] Checking status for task:', taskId);

    // For now, return a simple status check
    // In a real implementation, you'd check the actual task status
    return NextResponse.json({
      success: true,
      status: 'completed',
      message: 'Task status check not fully implemented'
    });

  } catch (error: any) {
    console.error('❌ [EndFrame API] Status check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Status check failed', 
        details: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}
