"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Heart, MessageCircle, Send, Star, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StorySegment {
  id: string;
  productImage: string;
  productName: string;
  reviewText: string;
  rating: number;
  timestamp: string;
}

interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  segments: StorySegment[];
}

interface StoryViewerProps {
  stories: Story[];
  currentStoryIndex: number;
  onClose: () => void;
  onStoryComplete: () => void;
}

export const StoryViewer = ({ stories, currentStoryIndex, onClose, onStoryComplete }: StoryViewerProps) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStory = stories[currentStoryIndex];
  const currentSegment = currentStory?.segments[currentSegmentIndex];
  const totalSegments = currentStory?.segments.length || 0;

  const STORY_DURATION = 5000; // 5 seconds per segment
  const PROGRESS_INTERVAL = 50; // Update progress every 50ms

  // Auto-advance timer
  const startTimer = useCallback(() => {
    if (!isPlaying || isHolding) return;

    timerRef.current = setTimeout(() => {
      if (currentSegmentIndex < totalSegments - 1) {
        setCurrentSegmentIndex(prev => prev + 1);
        setProgress(0);
      } else {
        // Move to next story or complete
        if (currentStoryIndex < stories.length - 1) {
          // Move to next story
          setCurrentSegmentIndex(0);
          setProgress(0);
          onStoryComplete();
        } else {
          // All stories completed
          onStoryComplete();
        }
      }
    }, STORY_DURATION);
  }, [currentSegmentIndex, totalSegments, currentStoryIndex, stories.length, isPlaying, isHolding, onStoryComplete]);

  // Progress bar animation
  const startProgressAnimation = useCallback(() => {
    if (!isPlaying || isHolding) return;

    const progressIncrement = (PROGRESS_INTERVAL / STORY_DURATION) * 100;

    progressRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + progressIncrement;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, PROGRESS_INTERVAL);
  }, [isPlaying, isHolding]);

  // Clear timers
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    clearTimers();
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(prev => prev - 1);
    }
    setProgress(0);
  }, [currentSegmentIndex, clearTimers]);

  const goToNext = useCallback(() => {
    clearTimers();
    if (currentSegmentIndex < totalSegments - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
    } else if (currentStoryIndex < stories.length - 1) {
      onStoryComplete();
    } else {
      onClose();
    }
    setProgress(0);
  }, [currentSegmentIndex, totalSegments, currentStoryIndex, stories.length, clearTimers, onStoryComplete, onClose]);

  // Hold to pause
  const handleMouseDown = useCallback(() => {
    holdTimerRef.current = setTimeout(() => {
      setIsHolding(true);
      clearTimers();
    }, 200);
  }, [clearTimers]);

  const handleMouseUp = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (isHolding) {
      setIsHolding(false);
    }
  }, [isHolding]);

  // Touch events for mobile
  const handleTouchStart = handleMouseDown;
  const handleTouchEnd = handleMouseUp;

  // Tap zones for navigation
  const handleTapLeft = useCallback(() => {
    if (!isHolding) {
      goToPrevious();
    }
  }, [isHolding, goToPrevious]);

  const handleTapRight = useCallback(() => {
    if (!isHolding) {
      goToNext();
    }
  }, [isHolding, goToNext]);

  // Swipe up for product details
  const handleSwipeUp = useCallback(() => {
    setShowProductDetails(true);
  }, []);

  // Handle reply
  const handleSendReply = useCallback(() => {
    if (replyText.trim()) {
      // Handle reply submission here
      console.log('Reply sent:', replyText);
      setReplyText('');
    }
  }, [replyText]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToPrevious, goToNext]);

  // Start timers when component mounts or state changes
  useEffect(() => {
    clearTimers();
    if (currentStory && isPlaying && !isHolding) {
      startTimer();
      startProgressAnimation();
    }

    return clearTimers;
  }, [currentStory, currentSegmentIndex, isPlaying, isHolding, startTimer, startProgressAnimation, clearTimers]);

  // Reset progress when segment changes
  useEffect(() => {
    setProgress(0);
  }, [currentSegmentIndex]);

  if (!currentStory || !currentSegment) {
    return null;
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-orange-500 text-orange-500' : 'text-gray-500'
        }`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Progress bars */}
      <div className="flex gap-1 p-2">
        {Array.from({ length: totalSegments }, (_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden"
          >
            <div
              className={`h-full bg-white transition-all duration-100 ease-linear ${
                index < currentSegmentIndex
                  ? 'w-full'
                  : index === currentSegmentIndex
                  ? `w-[${progress}%]`
                  : 'w-0'
              }`}
              style={{
                width: index < currentSegmentIndex ? '100%' : index === currentSegmentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={currentStory.userAvatar} alt={currentStory.username} />
            <AvatarFallback className="bg-orange-500 text-white text-sm">
              {currentStory.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{currentStory.username}</p>
            <p className="text-gray-300 text-xs">{currentSegment.timestamp}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 p-2"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Story content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Tap zones for navigation */}
        <div
          className="absolute left-0 top-0 w-1/3 h-full z-20 cursor-pointer"
          onClick={handleTapLeft}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
        <div
          className="absolute right-0 top-0 w-1/3 h-full z-20 cursor-pointer"
          onClick={handleTapRight}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* Main content area for swipe up */}
        <div
          className="absolute center-0 top-0 w-1/3 h-full z-10 cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ left: '33.33%' }}
        />

        {/* Product image */}
        <div className="h-3/5 flex items-center justify-center p-4">
          <img
            src={currentSegment.productImage}
            alt={currentSegment.productName}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>

        {/* Review content */}
        <div className="h-2/5 p-6 text-white flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <h3 className="font-bold text-lg mb-2">{currentSegment.productName}</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                {renderStars(currentSegment.rating)}
              </div>
              <span className="text-sm text-gray-300">
                {currentSegment.rating}/5
              </span>
            </div>
            <p className="text-base leading-relaxed">{currentSegment.reviewText}</p>
            
            {/* Swipe up indicator */}
            <div className="flex items-center justify-center mt-6 text-gray-400">
              <ArrowUp className="w-4 h-4 animate-bounce" />
              <span className="text-xs ml-2">Swipe up for details</span>
            </div>
          </div>
        </div>

        {/* Pause indicator */}
        {isHolding && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
            <div className="bg-white/20 px-4 py-2 rounded-full">
              <span className="text-white text-sm">Paused</span>
            </div>
          </div>
        )}
      </div>

      {/* Reply section */}
      <div className="p-4 bg-black border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Send a message..."
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 pr-10"
              onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
            />
            {replyText && (
              <Button
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600"
                onClick={handleSendReply}
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
          >
            <Heart className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Product details modal (when swiped up) */}
      {showProductDetails && (
        <div className="absolute inset-0 bg-black/90 flex items-end z-40">
          <div className="w-full bg-gray-900 rounded-t-2xl p-6 text-white max-h-3/4 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{currentSegment.productName}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProductDetails(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                {renderStars(currentSegment.rating)}
              </div>
              <span className="text-sm text-gray-300">
                {currentSegment.rating}/5 stars
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              {currentSegment.reviewText}
            </p>
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              View Product
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};