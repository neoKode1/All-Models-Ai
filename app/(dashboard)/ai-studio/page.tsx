"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { SimpleChatInterface } from "@/components/simple-chat-interface";
import { GalleryView } from "@/components/gallery-view";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/ui/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Download, Edit, Trash2, Video } from "lucide-react";
import { downloadVideoWithFrame } from "@/lib/video-thumbnail";
import { useToast } from "@/hooks/use-toast";
import { ImageSelector, type ImageSelection } from "@/components/image-selector";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

// Static loading component
const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      <p className="text-muted-foreground">Loading AI Studio...</p>
    </div>
  </div>
);

function AIStudioContent() {
  const [mounted, setMounted] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [isGalleryCollapsed, setIsGalleryCollapsed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEditImage = (imageUrl: string) => {
    // Call the injectImage function that's exposed on the window object
    if ((window as any).injectImageToChat) {
      (window as any).injectImageToChat(imageUrl);
    }
  };

  const handleAnimateImage = (imageUrl: string) => {
    // Inject the image and set a flag to force video generation
    if ((window as any).injectImageToChat) {
      (window as any).injectImageToChat(imageUrl);
      // Set a flag to force video generation
      if ((window as any).setForceVideoGeneration) {
        (window as any).setForceVideoGeneration(true);
      }
      // Add a small delay to ensure the image is injected first
      setTimeout(() => {
        if ((window as any).setChatInput) {
          // Only set a default prompt if the user hasn't already entered one
          const currentInput = (window as any).getChatInput ? (window as any).getChatInput() : '';
          if (!currentInput || currentInput.trim() === '') {
            (window as any).setChatInput("Animate this character with smooth motion");
          }
        }
      }, 200);
    }
  };

  const handleImageSelection = (selection: ImageSelection) => {
    console.log('🎯 [AI Studio] Image selection completed:', selection);
    
    // Inject the cropped image into the chat interface
    if (typeof window !== 'undefined' && (window as any).injectImageToChat) {
      (window as any).injectImageToChat(selection.croppedDataUrl);
      
      // Set an intelligent prompt for AI analysis
      const analysisPrompt = "Analyze this image selection and recreate it perfectly. Focus on the visual elements, style, and composition of this specific portion.";
      if (typeof window !== 'undefined' && (window as any).setChatInput) {
        (window as any).setChatInput(analysisPrompt);
      }
      
      // Show toast notification
      toast({
        title: "Image Selection Ready",
        description: "The selected area has been injected into the chat for AI analysis. Press Generate to recreate it.",
        duration: 4000,
      });
    }
  };

  // Handle download with frame extraction for videos (matching gallery functionality)
  const handleDownload = async (url: string, title: string, type: 'image' | 'video') => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      if (type === 'video') {
        console.log('📥 [AI Studio] Starting video download with frame extraction');
        await downloadVideoWithFrame(url, title);
        
        toast({
          title: "Download Complete!",
          description: `Downloaded video and last frame for "${title}"`,
        });
      } else if (type === 'image') {
        // Simple image download
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${title || 'image'}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        toast({
          title: "Download Complete!",
          description: `Downloaded image "${title}"`,
        });
      }
    } catch (error) {
      console.error('❌ [AI Studio] Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const scrollToBottom = () => {
    if (contentAreaRef.current) {
      // Use multiple requestAnimationFrame calls to ensure DOM is fully updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (contentAreaRef.current) {
            // Scroll to the very bottom with a small buffer
            const scrollHeight = contentAreaRef.current.scrollHeight;
            const clientHeight = contentAreaRef.current.clientHeight;
            const maxScrollTop = scrollHeight - clientHeight;
            
            console.log('📜 [AI Studio] Scrolling to bottom:', {
              scrollHeight,
              clientHeight,
              maxScrollTop,
              currentScrollTop: contentAreaRef.current.scrollTop
            });
            
            contentAreaRef.current.scrollTo({
              top: maxScrollTop + 50, // Add 50px buffer to ensure we see everything
              behavior: 'smooth'
            });
            
            // Fallback: ensure we're at the bottom after a short delay
            setTimeout(() => {
              if (contentAreaRef.current) {
                const currentScrollTop = contentAreaRef.current.scrollTop;
                const newScrollHeight = contentAreaRef.current.scrollHeight;
                const newMaxScrollTop = newScrollHeight - contentAreaRef.current.clientHeight;
                
                // If we're not at the bottom, scroll again
                if (currentScrollTop < newMaxScrollTop - 100) {
                  console.log('📜 [AI Studio] Fallback scroll needed:', {
                    currentScrollTop,
                    newMaxScrollTop,
                    difference: newMaxScrollTop - currentScrollTop
                  });
                  
                  contentAreaRef.current.scrollTo({
                    top: newMaxScrollTop + 50,
                    behavior: 'smooth'
                  });
                }
              }
            }, 200);
          }
        });
      });
    }
  };

  const handleGenerate = async (generationData: any): Promise<any> => {
    try {
      console.log('🚀 [AI Studio] ===== GENERATION START =====');
      console.log('🚀 [AI Studio] Generation data received:', generationData);
      
      // Validate that generationData is not empty or null
      if (!generationData || typeof generationData !== 'object' || Object.keys(generationData).length === 0) {
        console.error('❌ [AI Studio] Empty or invalid generation data received:', generationData);
        throw new Error('Generation data is missing or empty. This may be due to an error in the AI planning process. Please try with a different prompt or image.');
      }
      
      // Validate generation data before sending
      if (!generationData.model && !generationData.endpointId) {
        throw new Error('Missing model or endpointId in generation data');
      }
      
      if (!generationData.prompt && !generationData.image_url) {
        throw new Error('Missing prompt or image_url in generation data');
      }
      
      // Use the unified generation API for all FAL models
      const apiEndpoint = '/api/generate';
      
      // Clean up the generation data to ensure it has the required fields
      const cleanGenerationData = {
        model: generationData.model || generationData.endpointId,
        prompt: generationData.prompt,
        image_url: generationData.image_url,
        image_urls: generationData.image_urls,
        aspect_ratio: generationData.aspect_ratio,
        duration: generationData.duration,
        resolution: generationData.resolution,
        ...generationData // Include any other parameters
      };
      
      console.log('🔧 [AI Studio] Calling unified API:', {
        url: apiEndpoint,
        method: 'POST',
        data: cleanGenerationData
      });
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanGenerationData)
      });
      
      if (!response.ok) {
        let errorMessage = `API call failed with status ${response.status}`;
        let errorType = 'unknown';
        try {
          // Check if response is actually JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('❌ [AI Studio] Non-JSON error response (likely HTML):', textResponse.substring(0, 200));
            throw new Error(`API returned non-JSON response (status ${response.status}). This usually indicates a server error.`);
          }
          const errorData = await response.json();
          console.error('❌ [AI Studio] API error response:', errorData);
          
          // Check for content policy violations
          if (errorData.result?.error === 'Unprocessable Entity' || response.status === 422) {
            // Look for content policy violation details
            if (JSON.stringify(errorData).includes('content_policy_violation')) {
              errorType = 'content_policy';
              errorMessage = 'Content policy violation: The image or prompt contains material that cannot be processed. Please try with different content.';
            } else {
              errorType = 'validation';
              errorMessage = 'Content validation failed: Please check your image and prompt parameters.';
            }
          } else {
            errorMessage = errorData.error || errorData.message || errorData.result?.error || errorMessage;
          }
        } catch (parseError) {
          console.error('❌ [AI Studio] Failed to parse error response:', parseError);
        }
        
        console.error('❌ [AI Studio] Throwing error:', { errorType, errorMessage, status: response.status });
        const error = new Error(errorMessage);
        (error as any).type = errorType;
        (error as any).status = response.status;
        throw error;
      }
      
      // Check if response is actually JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ [AI Studio] Non-JSON success response (likely HTML):', textResponse.substring(0, 200));
        throw new Error('API returned non-JSON response. This usually indicates a server configuration error.');
      }
      
      const result = await response.json();
      console.log('📦 [AI Studio] API response:', result);
      
      // Create content object for both display and storage
      const contentToStore = {
        ...result,
        // Flatten the API response structure for easier display
        images: result.data?.images || result.images || [],
        videos: result.data?.videos || result.data?.video ? [result.data.video] : result.videos || [],
        timestamp: new Date().toISOString(),
        prompt: generationData.prompt,
        model: cleanGenerationData.model
      };
      
      // Add to generated content for display in center panel
      setGeneratedContent(prev => [...prev, contentToStore]);
      
      // Scroll to bottom to show the new content (wait for DOM update)
      setTimeout(() => {
        scrollToBottom();
      }, 500);
      
      // Store in localStorage for gallery using contentStorage
      if (typeof window !== 'undefined') {
        const { contentStorage } = await import('@/lib/content-storage');
        const newContent = {
          id: `generated-${Date.now()}`,
          type: (contentToStore.images?.length > 0 ? 'image' : 'video') as 'image' | 'video',
          url: contentToStore.images?.[0]?.url || contentToStore.videos?.[0]?.url,
          title: contentToStore.prompt?.substring(0, 50) + '...' || 'Generated Content',
          prompt: contentToStore.prompt,
          timestamp: new Date(),
          metadata: {
            format: contentToStore.model,
          }
        };
        
        contentStorage.addContent(newContent);
        
        // Trigger a custom event to notify GalleryView to refresh
        window.dispatchEvent(new CustomEvent('contentUpdated'));
      }
      
      console.log('✅ [AI Studio] Generation completed successfully');
      
      // Return the result so it can be displayed in the chat
      return result;

    } catch (error) {
      console.error('❌ [AI Studio] Generation error:', error);
      console.error('❌ [AI Studio] Generation data that caused error:', generationData);
      throw error;
    }
  };

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen flex bg-white dark:bg-black">
      {/* Left Column - Chat Interface */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <SimpleChatInterface 
          onContentGenerated={handleGenerate}
          onGenerationStarted={() => console.log('Generation started')}
          onGenerationComplete={() => console.log('Generation complete')}
          onImageInjected={() => console.log('Image injection ready')}
        />
      </div>
        
      {/* Center Column - Dynamic Content Display */}
      <div className="flex-1 flex flex-col">
        <div ref={contentAreaRef} className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {generatedContent.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No content yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">Start a conversation to generate content</p>
                </div>
              </div>
            ) : (
              generatedContent.map((content, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {content.prompt}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(content.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {content.images && content.images.length > 0 ? (
                    <div className="space-y-4">
                      {content.images.map((image: any, imgIndex: number) => (
                        <div key={imgIndex} className="relative group">
                          <ImageSelector
                            imageUrl={image.url}
                            onSelectionComplete={handleImageSelection}
                            className="w-full"
                          >
                            <img 
                              src={image.url} 
                              alt={content.prompt}
                              className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-lg"
                            />
                          </ImageSelector>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                            <div className="flex space-x-2 pointer-events-auto">
                              <button
                                onClick={() => handleEditImage(image.url)}
                                className="h-8 px-3 bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center space-x-1 transition-all duration-200"
                                disabled={isDownloading}
                              >
                                <Edit className="w-4 h-4" />
                                <span className="text-sm">Edit</span>
                              </button>
                              <button
                                onClick={() => handleAnimateImage(image.url)}
                                className="h-8 px-3 bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center space-x-1 transition-all duration-200"
                                disabled={isDownloading}
                              >
                                <Video className="w-4 h-4" />
                                <span className="text-sm">Generate video</span>
                              </button>
                              <button
                                onClick={() => handleDownload(image.url, `image-${Date.now()}`, 'image')}
                                className="h-8 px-3 bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center space-x-1 transition-all duration-200"
                                disabled={isDownloading}
                              >
                                <Download className="w-4 h-4" />
                                <span className="text-sm">
                                  {isDownloading ? 'Downloading...' : 'Download'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : content.videos && content.videos.length > 0 ? (
                    <div className="space-y-4">
                      {content.videos.map((video: any, vidIndex: number) => (
                        <div key={vidIndex} className="relative group">
                          <video 
                            src={video.url} 
                            controls
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-lg"
                            preload="metadata"
                            playsInline
                          />
                          <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                            Video
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                            <div className="flex space-x-2 pointer-events-auto">
                              <button
                                onClick={() => handleEditImage(video.url)}
                                className="h-8 px-3 bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center space-x-1 transition-all duration-200"
                                disabled={isDownloading}
                              >
                                <Edit className="w-4 h-4" />
                                <span className="text-sm">Edit</span>
                              </button>
                              <button
                                onClick={() => handleDownload(video.url, `video-${Date.now()}`, 'video')}
                                className="h-8 px-3 bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center space-x-1 transition-all duration-200"
                                disabled={isDownloading}
                              >
                                <Download className="w-4 h-4" />
                                <span className="text-sm">
                                  {isDownloading ? 'Downloading...' : 'Download + Frame'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-sm">No media content generated</div>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Model: {content.model}</span>
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
                        Share
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Gallery */}
      <div className={`relative border-l border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out ${
        isGalleryCollapsed ? 'w-12' : 'w-64'
      }`}>
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsGalleryCollapsed(!isGalleryCollapsed)}
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-l-lg px-2 py-4 shadow-sm hover:shadow-md transition-shadow"
          title={isGalleryCollapsed ? 'Expand Gallery' : 'Collapse Gallery'}
        >
          <svg 
            className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
              isGalleryCollapsed ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {!isGalleryCollapsed && (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">Gallery</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <GalleryView 
                className="h-full"
                useLocalStorage={true}
                onItemClick={(item) => {
                  console.log('Gallery item clicked for editing:', item);
                  if (item.type === 'image') {
                    handleEditImage(item.url);
                  }
                }}
                onAnimate={(item) => {
                  console.log('Animate item:', item);
                  if (item.type === 'image') {
                    handleAnimateImage(item.url);
                  }
                }}
              />
            </div>
          </>
        )}
        
        {/* Gallery Tab when collapsed */}
        {isGalleryCollapsed && (
          <div className="flex-1 flex items-center justify-center">
            <div className="transform -rotate-90 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Gallery
            </div>
          </div>
        )}
      </div>

      <Toaster />
    </div>
  );
}

export default function AIStudioPage() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<LoadingSpinner />}>
            <AIStudioContent />
          </Suspense>
        </QueryClientProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
