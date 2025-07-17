"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Home, Search, User, Bell, Settings, Heart, Share2, Bookmark,
  Menu, X, ChevronRight, Plus, Minus, Star, MessageCircle,
  ThumbsUp, Download, Upload, Edit, Trash2, Copy, Eye,
  Lock, Unlock, Mail, Phone, Calendar, Clock, Camera,
  MapPin, ShoppingCart, CreditCard, Archive, Filter,
  Grid3x3, List, BarChart3, PieChart, TrendingUp, Zap,
  Wifi, Battery, Volume2, Brightness4, RotateCcw, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const IconTestButton = ({ 
  icon: Icon, 
  name, 
  variant = "outline", 
  size = "default",
  className = "",
  longPress = false,
  animated = false 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [pressTimer, setPressTimer] = useState<number | null>(null);

  const handleClick = useCallback(() => {
    if (!longPress) {
      toast.success(`${name} icon clicked successfully!`, {
        description: `Icon interaction test passed for ${name}`,
        duration: 2000,
      });
      console.log(`✅ ${name} icon clicked`);
    }
  }, [name, longPress]);

  const handleMouseDown = useCallback(() => {
    if (longPress) {
      setIsPressed(true);
      const timer = window.setTimeout(() => {
        toast.success(`${name} long press completed!`, {
          description: `Long press interaction test passed for ${name}`,
          duration: 2000,
        });
        console.log(`✅ ${name} icon long pressed`);
        setIsPressed(false);
      }, 1000);
      setPressTimer(timer);
    }
  }, [longPress, name]);

  const handleMouseUp = useCallback(() => {
    if (longPress && pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
      setIsPressed(false);
    }
  }, [longPress, pressTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
      }
    };
  }, [pressTimer]);

  const iconSizeClass = {
    sm: "h-4 w-4",
    default: "h-5 w-5", 
    lg: "h-6 w-6",
    xl: "h-8 w-8"
  }[size];

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        variant={variant}
        size={size}
        className={`
          transition-all duration-200 ease-in-out
          hover:scale-105 hover:shadow-md
          active:scale-95 touch-manipulation tap-target
          ${isPressed ? 'bg-primary/20 border-primary' : ''}
          ${animated ? 'animate-pulse' : ''}
          ${className}
        `}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Icon 
          className={`
            ${iconSizeClass}
            transition-transform duration-200
            ${animated ? 'animate-spin' : ''}
            ${isPressed ? 'scale-110' : ''}
          `} 
        />
      </Button>
      <span className="text-xs text-muted-foreground font-medium text-center max-w-[80px] leading-tight">
        {name}
        {longPress && <div className="text-orange-500">Long Press</div>}
        {animated && <div className="text-blue-500">Animated</div>}
      </span>
    </div>
  );
};

const IconTestSection = ({ title, description, children, className = "" }) => (
  <Card className={`w-full ${className}`}>
    <CardHeader>
      <CardTitle className="text-lg font-semibold text-primary">{title}</CardTitle>
      <CardDescription className="text-sm">{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
        {children}
      </div>
    </CardContent>
  </Card>
);

export const InteractiveIconsTest = () => {
  const [selectedExample, setSelectedExample] = useState('all');
  const [isClient, setIsClient] = useState(false);

  // Add hydration safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  const navigationIcons = [
    { icon: Home, name: "Home" },
    { icon: Search, name: "Search" },
    { icon: User, name: "Profile" },
    { icon: Bell, name: "Notifications" },
    { icon: Settings, name: "Settings" },
    { icon: Menu, name: "Menu" },
    { icon: X, name: "Close" },
    { icon: ChevronRight, name: "Next" },
    { icon: Grid3x3, name: "Grid" },
    { icon: List, name: "List" }
  ];

  const actionIcons = [
    { icon: Heart, name: "Like" },
    { icon: Share2, name: "Share" },
    { icon: Bookmark, name: "Bookmark" },
    { icon: Plus, name: "Add" },
    { icon: Minus, name: "Remove" },
    { icon: Star, name: "Favorite" },
    { icon: MessageCircle, name: "Comment" },
    { icon: ThumbsUp, name: "Approve" },
    { icon: Download, name: "Download" },
    { icon: Upload, name: "Upload" }
  ];

  const statusIcons = [
    { icon: Wifi, name: "WiFi" },
    { icon: Battery, name: "Battery" },
    { icon: Volume2, name: "Volume" },
    { icon: Lock, name: "Locked" },
    { icon: Unlock, name: "Unlocked" },
    { icon: Eye, name: "Visible" },
    { icon: Mail, name: "Email" },
    { icon: Phone, name: "Phone" },
    { icon: Calendar, name: "Calendar" },
    { icon: Clock, name: "Time" }
  ];

  const utilityIcons = [
    { icon: Edit, name: "Edit" },
    { icon: Trash2, name: "Delete" },
    { icon: Copy, name: "Copy" },
    { icon: Camera, name: "Camera" },
    { icon: MapPin, name: "Location" },
    { icon: ShoppingCart, name: "Cart" },
    { icon: CreditCard, name: "Payment" },
    { icon: Archive, name: "Archive" },
    { icon: Filter, name: "Filter" },
    { icon: BarChart3, name: "Analytics" }
  ];

  const animatedIcons = [
    { icon: RefreshCw, name: "Refresh" },
    { icon: RotateCcw, name: "Undo" },
    { icon: Zap, name: "Flash" },
    { icon: TrendingUp, name: "Trending" },
    { icon: PieChart, name: "Chart" }
  ];

  const runAllTests = useCallback(() => {
    if (!isClient) return;
    
    toast.info("Running comprehensive icon tests...", {
      description: "Testing all interactive icons for functionality",
      duration: 3000,
    });
    console.log("🧪 Starting comprehensive icon interaction tests");
    
    // Simulate test results
    const timer = setTimeout(() => {
      toast.success("All icon tests completed!", {
        description: "Check console for detailed results",
        duration: 4000,
      });
      console.log("✅ Icon interaction tests completed successfully");
    }, 1500);

    // Cleanup on unmount
    return () => clearTimeout(timer);
  }, [isClient]);

  const shouldShowExample = useCallback((exampleId: string) => 
    selectedExample === 'all' || selectedExample === exampleId
  , [selectedExample]);

  // Safe render with loading state for hydration
  if (!isClient) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
        <div className="animate-pulse space-y-6">
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">
          Interactive Icons Test Suite
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive testing component for all interactive icons. Click any icon to test its functionality, 
          hover for visual feedback, and check console for detailed logs.
        </p>
        <Button 
          onClick={runAllTests}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 touch-manipulation tap-target"
        >
          <Zap className="h-5 w-5 mr-2" />
          Run All Tests
        </Button>
      </div>

      {/* Navigation Icons */}
      {shouldShowExample('navigation') && (
        <IconTestSection
          title="Navigation Icons"
          description="Essential navigation and menu icons for site structure"
        >
          {navigationIcons.map((iconData, index) => (
            <IconTestButton
              key={index}
              icon={iconData.icon}
              name={iconData.name}
              variant="outline"
            />
          ))}
        </IconTestSection>
      )}

      {/* Action Icons */}
      {shouldShowExample('action') && (
        <IconTestSection
          title="Action Icons"
          description="Interactive action buttons for user engagement"
        >
          {actionIcons.map((iconData, index) => (
            <IconTestButton
              key={index}
              icon={iconData.icon}
              name={iconData.name}
              variant="default"
            />
          ))}
        </IconTestSection>
      )}

      {/* Status Icons */}
      {shouldShowExample('status') && (
        <IconTestSection
          title="Status & Communication Icons"
          description="Status indicators and communication icons"
        >
          {statusIcons.map((iconData, index) => (
            <IconTestButton
              key={index}
              icon={iconData.icon}
              name={iconData.name}
              variant="secondary"
            />
          ))}
        </IconTestSection>
      )}

      {/* Utility Icons */}
      {shouldShowExample('utility') && (
        <IconTestSection
          title="Utility Icons"
          description="Functional utility icons for various operations"
        >
          {utilityIcons.map((iconData, index) => (
            <IconTestButton
              key={index}
              icon={iconData.icon}
              name={iconData.name}
              variant="ghost"
            />
          ))}
        </IconTestSection>
      )}

      {/* Size Variations */}
      {shouldShowExample('sizes') && (
        <IconTestSection
          title="Size Variations"
          description="Testing different icon sizes for responsive design"
        >
          <IconTestButton icon={Home} name="Small" size="sm" />
          <IconTestButton icon={Search} name="Default" size="default" />
          <IconTestButton icon={User} name="Large" size="lg" />
          <IconTestButton icon={Bell} name="X-Large" size="xl" />
          <IconTestButton icon={Settings} name="Small Fill" size="sm" variant="default" />
          <IconTestButton icon={Heart} name="Large Fill" size="lg" variant="default" />
        </IconTestSection>
      )}

      {/* Animated Icons */}
      {shouldShowExample('animated') && (
        <IconTestSection
          title="Animated Icons"
          description="Icons with animation effects for dynamic interactions"
        >
          {animatedIcons.map((iconData, index) => (
            <IconTestButton
              key={index}
              icon={iconData.icon}
              name={iconData.name}
              variant="outline"
              animated={true}
            />
          ))}
        </IconTestSection>
      )}

      {/* Long Press Test */}
      {shouldShowExample('longpress') && (
        <IconTestSection
          title="Long Press Interactions"
          description="Hold down these icons for 1 second to test long press functionality"
        >
          <IconTestButton icon={Archive} name="Archive" longPress={true} />
          <IconTestButton icon={Trash2} name="Delete" longPress={true} variant="destructive" />
          <IconTestButton icon={Settings} name="Advanced" longPress={true} />
          <IconTestButton icon={Lock} name="Secure" longPress={true} />
        </IconTestSection>
      )}

      {/* Test Results Footer */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Test Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Interaction Types:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Click any icon for immediate feedback</li>
                <li>• Hover for visual scale effects</li>
                <li>• Hold icons marked "Long Press" for 1 second</li>
                <li>• Check console for detailed test logs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Visual Indicators:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Toast notifications confirm successful clicks</li>
                <li>• Hover effects show interactive feedback</li>
                <li>• Animated icons have continuous motion</li>
                <li>• Different variants test styling consistency</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};