"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';
import { WelcomeDashboard } from '@/components/ui/welcome-dashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, SkipForward } from 'lucide-react';

interface HomeWrapperProps {
  children: React.ReactNode;
}

export const HomeWrapper = ({ children }: HomeWrapperProps) => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

  // Mock data for welcome dashboard
  const mockUser = user ? {
    name: user.displayName || user.username || "ユーザー",
    avatar: user.photoURL,
    isNewUser: false, // This would come from user document in Firestore
    stats: {
      reviews: 12,
      likes: 89,
      followers: 34,
      views: 2567
    },
    level: 3,
    experience: 750,
    maxExperience: 1000
  } : null;

  const mockTopReviewer = {
    name: "田中さん",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
    reviewCount: 47,
    badge: "共感マスター"
  };

  const mockRecommendedItems = [
    {
      id: "1",
      name: "ワイヤレスイヤホン Pro",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop",
      category: "オーディオ",
      rating: 4.8,
      reviewCount: 156
    },
    {
      id: "2", 
      name: "スマートウォッチ Series 8",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop",
      category: "ウェアラブル",
      rating: 4.6,
      reviewCount: 234
    },
    {
      id: "3",
      name: "プロテインシェイカー",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
      category: "フィットネス",
      rating: 4.9,
      reviewCount: 89
    },
    {
      id: "4",
      name: "ノートパソコンスタンド",
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop",
      category: "オフィス用品",
      rating: 4.7,
      reviewCount: 67
    }
  ];

  // Navigation handlers
  const handleWriteReview = () => {
    window.location.href = '/write-review';
  };

  const handleExploreProducts = () => {
    window.location.href = '/search';
  };

  const handleFindFriends = () => {
    // Navigate to friends/users page
    console.log('Find friends clicked');
  };

  const handleViewProfile = () => {
    window.location.href = '/profile';
  };

  const handleSkipWelcome = () => {
    setShowWelcome(false);
  };

  const handleBackToDashboard = () => {
    setShowWelcome(true);
  };

  // Show welcome dashboard for new or returning users
  if (showWelcome && mockUser) {
    return (
      <AuthGuard requireAuth={true}>
        <WelcomeDashboard
          user={mockUser}
          topReviewer={mockTopReviewer}
          recommendedItems={mockRecommendedItems}
          onWriteReview={handleWriteReview}
          onExploreProducts={handleExploreProducts}
          onFindFriends={handleFindFriends}
          onViewProfile={handleViewProfile}
        />
        
        {/* Skip Welcome Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleSkipWelcome}
            variant="ghost"
            size="sm"
            className="bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            フィードに進む
          </Button>
        </div>
      </AuthGuard>
    );
  }

  // Main content with back to dashboard button
  return (
    <AuthGuard requireAuth={true}>
      <div className="relative">
        {children}
        
        {/* Back to Welcome Button */}
        <div className="fixed bottom-6 left-6 z-50 ml-[280px]">
          <Button
            onClick={handleBackToDashboard}
            variant="ghost"
            size="sm"
            className="bg-orange-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-orange-700 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ダッシュボードに戻る
          </Button>
        </div>
      </div>
    </AuthGuard>
  );
};