'use client';

import { WriteReview } from "@/components/mustme/write-review";
import SidebarNavigation from "@/components/mustme/sidebar-navigation";
import SearchHeader from "@/components/mustme/search-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WriteReviewPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back to Home Button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="tap-target touch-manipulation hover:bg-orange-50 hover:text-orange-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">レビュー投稿</h1>
          <div className="w-20" /> {/* Spacer for center alignment */}
        </div>
      </div>
      
      {/* Layout Container with proper spacing - increased top padding */}
      <div className="flex min-h-screen pt-20 pb-20 md:pb-0">
        {/* Sidebar Navigation Component */}
        <SidebarNavigation activeItem="post" />
        
        {/* Main Content with responsive margin */}
        <main className="flex-1 md:ml-[280px]">
          <WriteReview />
        </main>
      </div>
      
      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}

// Scroll to Top Component
function ScrollToTopButton() {
  const [showButton, setShowButton] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!showButton) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 h-12 w-12 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg tap-target touch-manipulation no-select"
      size="sm"
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  );
}

// Add React import and ArrowUp icon
import React from 'react';