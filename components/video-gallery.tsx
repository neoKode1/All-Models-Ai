'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoItem {
  src: string;
  title: string;
}

export function VideoGallery() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const videos: VideoItem[] = [
    {
      src: '/video1.mp4',
      title: 'Creative Video 1'
    },
    {
      src: '/video2.mp4',
      title: 'Creative Video 2'
    },
    {
      src: '/video3.mp4',
      title: 'Creative Video 3'
    },
    {
      src: '/video4.mp4',
      title: 'Creative Video 4'
    },
    {
      src: '/video5.mp4',
      title: 'Creative Video 5'
    }
  ];

  // Auto-rotate videos every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [videos.length]);

  // Initial load - show first video immediately
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Reset loading state when video changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    
    // Auto-load after 1 second if still loading
    const timeout = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [currentVideoIndex]);

  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully:', videos[currentVideoIndex].src);
    setIsLoaded(true);
    setHasError(false);
    setIsPlaying(true);
  };

  const handleVideoError = (e: any) => {
    console.error('Video failed to load:', videos[currentVideoIndex].src, e);
    setHasError(true);
    setIsLoaded(false);
  };

  return (
    <div className="w-full rounded-lg shadow-lg overflow-hidden bg-gray-900 text-white relative">
      <div className="relative aspect-video bg-black">
        {videos.map((video, index) => (
          <video
            key={index}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              index === currentVideoIndex ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay={index === currentVideoIndex && isPlaying}
            muted={isMuted}
            loop
            playsInline
            preload="auto"
            onLoadedData={handleVideoLoad}
            onCanPlay={handleVideoLoad}
            onError={handleVideoError}
            onClick={handleVideoClick}
          >
            <source src={encodeURI(video.src)} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ))}
        
        {/* Video Controls Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-10 transition-all duration-300">
          <button
            onClick={handleVideoClick}
            className="p-4 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 backdrop-blur-sm"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Mute Toggle */}
        <button
          onClick={handleMuteToggle}
          className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-300"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-white" />
          ) : (
            <Volume2 className="h-5 w-5 text-white" />
          )}
        </button>

        {/* Video Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3">
            <h3 className="text-sm font-medium text-white">
              {videos[currentVideoIndex].title}
            </h3>
          </div>
        </div>

        {/* Video Indicators */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentVideoIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentVideoIndex
                  ? 'bg-white scale-125'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Loading State */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <p className="text-sm">Video failed to load</p>
            <p className="text-xs text-gray-400 mt-1">Check console for details</p>
          </div>
        </div>
      )}
    </div>
  );
}
