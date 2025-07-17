"use client";

import { useAuth } from "@/contexts/auth-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { InstagramFeed } from "@/components/mustme/instagram-feed";
import SidebarNavigation from "@/components/mustme/sidebar-navigation";
import SearchHeader from "@/components/mustme/search-header";
import TrendingSearches from "@/components/mustme/trending-searches";
import { FloatingDock } from "@/components/ui/floating-dock";
import { InteractiveIconsTest } from "@/components/test/interactive-icons-test";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Home, Search, PenTool, User, Heart, Bell, Settings, Star, TestTube, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [showIconTest, setShowIconTest] = useState(false);
  const router = useRouter();

  // Hydration safety check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Safe navigation handlers to prevent nested anchor tags
  const handleNavigation = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  // Test floating dock items with safe navigation
  const testDockItems = [
    {
      title: "ホーム",
      icon: <Home className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/",
    },
    {
      title: "検索",
      icon: <Search className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/search",
    },
    {
      title: "レビュー投稿",
      icon: <PenTool className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/write-review",
    },
    {
      title: "プロフィール",
      icon: <User className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/profile",
    },
    {
      title: "お気に入り",
      icon: <Heart className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#favorites",
    },
    {
      title: "通知",
      icon: <Bell className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#notifications",
    },
    {
      title: "ランキング",
      icon: <Star className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/ranking",
    },
    {
      title: "設定",
      icon: <Settings className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#settings",
    },
  ];

  const toggleIconTest = useCallback(() => {
    setShowIconTest(prev => !prev);
  }, []);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-16 bg-white border-b border-gray-200"></div>
          
          {/* Layout skeleton */}
          <div className="flex min-h-screen pt-16">
            {/* Sidebar skeleton - hidden on mobile */}
            <div className="hidden md:block w-[280px] bg-white border-r"></div>
            
            {/* Main content skeleton */}
            <main className="flex-1 md:ml-[280px] max-w-4xl">
              <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </main>
            
            {/* Right sidebar skeleton */}
            <aside className="w-80 hidden lg:block bg-gray-50">
              <div className="p-6 space-y-4">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // Show icon test page if requested
  if (showIconTest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SearchHeader />
        <div className="pt-16">
          <InteractiveIconsTest />
          {/* Close test button */}
          <div className="fixed top-20 right-4 z-50">
            <button
              onClick={toggleIconTest}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors touch-manipulation tap-target"
              title="テストを閉じる"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <SearchHeader />
      
      {/* Layout Container with proper spacing for sidebar and mobile bottom nav */}
      <div className="flex min-h-screen pt-16 pb-20 md:pb-0">
        {/* Sidebar Navigation Component */}
        <SidebarNavigation activeItem="home" />
        
        {/* Main Content with responsive margin */}
        <main className="flex-1 md:ml-[280px] max-w-4xl">
          <div className="max-w-2xl mx-auto p-4 md:p-0">
            <InstagramFeed />
          </div>
        </main>
        
        {/* Right Sidebar - Hidden on mobile and tablets */}
        <aside className="w-80 hidden xl:block">
          <div className="sticky top-20 p-6">
            <TrendingSearches />
            
            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">クイックアクション</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleNavigation('/write-review')}
                  className="block w-full bg-orange-600 text-white text-center py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors touch-manipulation tap-target"
                >
                  レビューを書く
                </button>
                <button
                  onClick={() => handleNavigation('/search')}
                  className="block w-full border border-gray-300 text-center py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation tap-target"
                >
                  商品を探す
                </button>
              </div>
            </div>

            {/* User Stats Placeholder */}
            <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">あなたの活動</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">レビュー数</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">いいね総数</span>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">フォロワー</span>
                  <span className="font-medium">34</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Test Floating Dock - Fixed position for easy testing */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <FloatingDock
          items={testDockItems}
          desktopClassName="bg-white/80 backdrop-blur-md border border-gray-200"
          mobileClassName="bg-white/80 backdrop-blur-md border border-gray-200"
        />
      </div>

      {/* Test Controls */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {/* Icon Test Button */}
        <button
          onClick={toggleIconTest}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg transition-colors text-sm font-medium flex items-center space-x-2 touch-manipulation tap-target"
          title="アイコンテストを開く"
        >
          <TestTube className="h-4 w-4" />
          <span>アイコンテスト</span>
        </button>

        {/* Status Indicator */}
        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          問題修正済み ✅
        </div>
      </div>
    </div>
  );
}