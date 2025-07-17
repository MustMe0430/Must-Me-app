"use client";

import React from 'react';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BottomNavigationProps {
  activeItem: string;
  onNavigate: (item: string) => void;
  userAvatar?: string;
}

export const BottomNavigation = ({ activeItem, onNavigate, userAvatar }: BottomNavigationProps) => {
  const router = useRouter();

  const navigationItems = [
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
      icon: PlusSquare,
      label: '投稿',
      href: '/write-review'
    },
    {
      id: 'activity',
      icon: Heart,
      label: 'アクティビティ',
      href: '/activity'
    },
    {
      id: 'profile',
      icon: User,
      label: 'プロフィール',
      href: '/profile'
    }
  ];

  const handleNavigation = (item: any) => {
    console.log(`=== BOTTOM NAV CLICK ===`);
    console.log(`Bottom navigation clicked: ${item.id}`);
    console.log(`Is profile click: ${item.id === 'profile'}`);
    console.log(`Current active item: ${activeItem}`);
    console.log(`About to navigate to: ${item.href}`);
    
    // Navigate to the appropriate page
    if (item.href) {
      router.push(item.href);
    }
    
    // Also call the original onNavigate callback
    onNavigate(item.id);
    
    console.log(`Navigation completed successfully`);
    console.log(`=== END BOTTOM NAV CLICK ===`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16 px-4">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className="flex flex-col items-center justify-center tap-target touch-manipulation no-select transition-colors duration-200 mobile-button-active"
              aria-label={item.label}
              type="button"
            >
              {item.id === 'profile' && userAvatar ? (
                <div className="relative">
                  <img
                    src={userAvatar}
                    alt="プロフィール"
                    className={`w-6 h-6 rounded-full object-cover transition-all duration-200 ${
                      isActive 
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : 'opacity-70'
                    }`}
                  />
                </div>
              ) : (
                <IconComponent
                  size={24}
                  className={`transition-colors duration-200 ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-gray-400'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              )}
              
              <span 
                className={`sr-only ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};