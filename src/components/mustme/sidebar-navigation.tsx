"use client"

import { Home, Search, Plus, TrendingUp, User, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface NavigationItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
}

interface SidebarNavigationProps {
  activeItem?: string
  userInitial?: string
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    icon: Home,
    label: 'ホーム',
    href: '/'
  },
  {
    id: 'search',
    icon: Search,
    label: '検索',
    href: '/search'
  },
  {
    id: 'post',
    icon: Plus,
    label: 'レビューを書く',
    href: '/write-review'
  },
  {
    id: 'ranking',
    icon: TrendingUp,
    label: 'ランキング',
    href: '/ranking'
  },
  {
    id: 'profile',
    icon: User,
    label: 'プロフィール',
    href: '/profile'
  }
]

export default function SidebarNavigation({
  activeItem = 'home',
  userInitial = 'M'
}: SidebarNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [activeItem])

  // Handle navigation click without nesting anchor tags
  const handleNavigation = (href: string, closeMenu = false) => {
    router.push(href)
    if (closeMenu) {
      setIsMobileMenuOpen(false)
    }
  }

  // Handle profile navigation
  const handleProfileClick = () => {
    router.push('/profile')
    setIsMobileMenuOpen(false)
  }

  // Desktop Navigation
  const DesktopNav = () => (
    <nav className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-[280px] bg-white border-r border-border flex flex-col z-30 hidden md:flex">
      {/* Header Section */}
      <div className="px-6 py-8">
        <button
          onClick={() => handleNavigation('/')}
          className="block text-left w-full touch-manipulation"
        >
          <h1 className="text-2xl font-bold text-primary">
            MustMe
          </h1>
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group touch-manipulation tap-target ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm">
                    {item.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Bottom Section - User Avatar with direct profile navigation */}
      <div className="px-6 py-6 border-t border-border">
        <button
          onClick={handleProfileClick}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 touch-manipulation tap-target ${
            activeItem === 'profile'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-primary hover:text-primary-foreground'
          }`}
        >
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {userInitial}
            </span>
          </div>
          <span className="font-medium text-sm">
            プロフィール
          </span>
        </button>
      </div>
    </nav>
  )

  // Mobile Bottom Navigation
  const MobileBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:hidden z-40 safe-bottom">
      <div className="flex items-center justify-around px-2 py-3">
        {navigationItems.slice(0, 4).map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={`flex flex-col items-center min-w-0 flex-1 px-2 py-1 rounded-lg transition-all duration-200 touch-manipulation tap-target mobile-button-active no-select ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-xs font-medium truncate">
                {item.label}
              </span>
            </button>
          )
        })}
        
        {/* Profile icon with direct navigation */}
        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center min-w-0 flex-1 px-2 py-1 rounded-lg transition-all duration-200 touch-manipulation tap-target mobile-button-active no-select ${
            activeItem === 'profile'
              ? 'text-primary'
              : 'text-muted-foreground'
          }`}
        >
          <div className="w-6 h-6 mb-1 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">
              {userInitial}
            </span>
          </div>
          <span className="text-xs font-medium">
            プロフィール
          </span>
        </button>
      </div>
    </nav>
  )

  // Mobile Menu Modal
  const MobileMenu = () => (
    <>
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden touch-manipulation"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Menu Panel */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl transform transition-transform duration-300 z-50 md:hidden safe-bottom ${
        isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="p-6">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">メニュー</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-muted-foreground hover:text-foreground touch-manipulation tap-target"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="space-y-4">
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted w-full touch-manipulation tap-target"
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {userInitial}
                </span>
              </div>
              <div className="text-left">
                <div className="font-medium">プロフィールを表示</div>
                <div className="text-sm text-muted-foreground">あなたのプロフィール情報</div>
              </div>
            </button>

            <button
              onClick={() => handleNavigation('/write-review', true)}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted w-full touch-manipulation tap-target"
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium">レビューを書く</div>
                <div className="text-sm text-muted-foreground">新しい商品レビューを投稿</div>
              </div>
            </button>

            <button
              onClick={() => handleNavigation('/', true)}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted w-full touch-manipulation tap-target"
            >
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <Home className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium">ホームに戻る</div>
                <div className="text-sm text-muted-foreground">メインフィードを表示</div>
              </div>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium text-sm mb-3">あなたの活動</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-semibold text-lg">12</div>
                <div className="text-xs text-muted-foreground">レビュー</div>
              </div>
              <div>
                <div className="font-semibold text-lg">89</div>
                <div className="text-xs text-muted-foreground">いいね</div>
              </div>
              <div>
                <div className="font-semibold text-lg">34</div>
                <div className="text-xs text-muted-foreground">フォロワー</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <DesktopNav />
      <MobileBottomNav />
      <MobileMenu />
    </>
  )
}