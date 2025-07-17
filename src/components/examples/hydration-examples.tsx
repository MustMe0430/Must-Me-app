"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, User, Hash, Calendar } from 'lucide-react';

/**
 * HydrationSafetyGuide Component
 * 
 * This comprehensive component demonstrates hydration-unsafe patterns and their safe alternatives.
 * Hydration mismatches occur when the server-rendered HTML differs from the client-rendered content.
 * 
 * Common causes:
 * - Date/time operations that differ between server and client
 * - Random number generation
 * - Browser-only APIs (localStorage, window, etc.)
 * - Conditional rendering based on client-only state
 * 
 * Safe patterns:
 * - Use useEffect for client-only content
 * - Implement proper loading states
 * - Ensure server and initial client render are identical
 * - Use suppressHydrationWarning sparingly and correctly
 */

// TypeScript interfaces for proper typing
interface UserData {
  id: string;
  name: string;
  email: string;
  lastLogin: Date;
  preferences: {
    theme: 'light' | 'dark';
    timezone: string;
  };
}

interface TimestampProps {
  date: Date;
  format?: 'relative' | 'absolute' | 'full';
}

interface RandomContentProps {
  seedValue?: number;
  itemCount?: number;
}

interface ClientFeatureProps {
  fallbackMessage?: string;
  enableFeature?: boolean;
}

// Safe utility functions that work consistently across server/client
const formatTimestamp = (date: Date, format: 'relative' | 'absolute' | 'full' = 'relative'): string => {
  switch (format) {
    case 'absolute':
      return date.toLocaleDateString();
    case 'full':
      return date.toLocaleString();
    case 'relative':
    default:
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      return 'Just now';
  }
};

// Generate deterministic "random" content using a seed
const generateSeededContent = (seed: number, count: number): string[] => {
  const items = ['Feature A', 'Feature B', 'Feature C', 'Feature D', 'Feature E', 'Feature F'];
  const result: string[] = [];
  let currentSeed = seed;
  
  for (let i = 0; i < count; i++) {
    // Simple linear congruential generator for deterministic "randomness"
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const index = Math.floor((currentSeed / 233280) * items.length);
    result.push(items[index]);
  }
  
  return result;
};

/**
 * ❌ PROBLEMATIC: Current Time Display
 * This pattern causes hydration mismatches because Date.now() returns different values on server vs client
 */
const ProblematicCurrentTime: React.FC = () => {
  // ❌ DON'T DO THIS - will cause hydration mismatch
  // const currentTime = new Date().toLocaleTimeString();
  
  // ❌ Also problematic - still creates server/client difference
  // const [currentTime] = useState(new Date().toLocaleTimeString());
  
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle size={20} />
          ❌ Problematic Pattern
        </CardTitle>
        <CardDescription>This would cause hydration mismatch (commented out)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-red-600">
          <p>// ❌ const currentTime = new Date().toLocaleTimeString();</p>
          <p>// ❌ const [time] = useState(Date.now());</p>
          <p className="font-medium">Problem: Server time !== Client time</p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * ✅ SAFE: Current Time Display
 * Use useEffect to update time only on client-side after hydration
 */
const SafeCurrentTime: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('Loading...');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date().toLocaleTimeString());
    
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isClient) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Clock size={20} />
            ✅ Safe Pattern - Loading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-6 bg-blue-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Clock size={20} />
          ✅ Safe Current Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-mono" suppressHydrationWarning>{currentTime}</div>
        <p className="text-sm text-green-600 mt-2">
          Uses useEffect to ensure consistent server/client rendering
        </p>
      </CardContent>
    </Card>
  );
};

/**
 * ❌ PROBLEMATIC: User Timestamps
 * Formatting dates without considering server/client differences
 */
const ProblematicUserTimestamp: React.FC<TimestampProps> = ({ date }) => {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle size={20} />
          ❌ Problematic Timestamp
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-red-600">
          <p>// ❌ const relativeTime = getRelativeTime(date);</p>
          <p>// ❌ Server timezone !== Client timezone</p>
          <p className="font-medium">Problem: Timezone/locale differences</p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * ✅ SAFE: User Timestamps
 * Safe timestamp formatting that works consistently
 */
const SafeUserTimestamp: React.FC<TimestampProps> = ({ date, format = 'relative' }) => {
  const [formattedTime, setFormattedTime] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setFormattedTime(formatTimestamp(date, format));
  }, [date, format]);

  // Show stable format during SSR/hydration
  const stableFormat = date.toISOString().split('T')[0]; // YYYY-MM-DD

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Calendar size={20} />
          ✅ Safe Timestamp
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <strong>SSR/Hydration safe:</strong> {stableFormat}
          </div>
          {isClient && (
            <div suppressHydrationWarning>
              <strong>Client enhanced:</strong> {formattedTime}
            </div>
          )}
          <p className="text-sm text-green-600">
            Shows stable date initially, then enhances with relative time
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * ❌ PROBLEMATIC: Random IDs/Content
 * Using Math.random() directly causes different values on server vs client
 */
const ProblematicRandomContent: React.FC<RandomContentProps> = () => {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle size={20} />
          ❌ Problematic Random Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-red-600">
          <p>// ❌ const randomId = Math.random().toString(36);</p>
          <p>// ❌ const shuffledItems = items.sort(() => Math.random() - 0.5);</p>
          <p className="font-medium">Problem: Non-deterministic randomness</p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * ✅ SAFE: Random IDs/Content
 * Use deterministic generation or client-only updates
 */
const SafeRandomContent: React.FC<RandomContentProps> = ({ 
  seedValue = 12345, 
  itemCount = 3 
}) => {
  const [randomItems, setRandomItems] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Deterministic content for SSR
  const seededItems = generateSeededContent(seedValue, itemCount);

  useEffect(() => {
    setIsClient(true);
    // Can use real randomness on client if needed
    const realRandomItems = ['Dynamic A', 'Dynamic B', 'Dynamic C']
      .sort(() => Math.random() - 0.5)
      .slice(0, itemCount);
    setRandomItems(realRandomItems);
  }, [itemCount]);

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Hash size={20} />
          ✅ Safe Random Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <strong>Seeded (SSR safe):</strong>
            <div className="flex gap-2 mt-1">
              {seededItems.map((item, index) => (
                <Badge key={index} variant="secondary">{item}</Badge>
              ))}
            </div>
          </div>
          
          {isClient && randomItems.length > 0 && (
            <div suppressHydrationWarning>
              <strong>Client random:</strong>
              <div className="flex gap-2 mt-1">
                {randomItems.map((item, index) => (
                  <Badge key={index} variant="default">{item}</Badge>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-sm text-green-600">
            Uses seeded randomness for SSR, real randomness for client enhancement
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * ❌ PROBLEMATIC: Browser-only Features
 * Accessing browser APIs during SSR causes errors
 */
const ProblematicBrowserFeature: React.FC<ClientFeatureProps> = () => {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle size={20} />
          ❌ Problematic Browser Feature
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-red-600">
          <p>// ❌ const theme = localStorage.getItem('theme');</p>
          <p>// ❌ const isOnline = navigator.onLine;</p>
          <p>// ❌ const width = window.innerWidth;</p>
          <p className="font-medium">Problem: Browser APIs not available during SSR</p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * ✅ SAFE: Browser-only Features
 * Proper handling of client-only APIs
 */
const SafeBrowserFeature: React.FC<ClientFeatureProps> = ({ 
  fallbackMessage = 'Loading feature...',
  enableFeature = true 
}) => {
  const [browserInfo, setBrowserInfo] = useState<{
    isOnline: boolean;
    theme: string;
    viewport: { width: number; height: number };
  } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (!enableFeature) return;

    setIsClient(true);
    
    const updateBrowserInfo = () => {
      if (typeof window === 'undefined') return;
      
      setBrowserInfo({
        isOnline: navigator.onLine,
        theme: localStorage.getItem('theme') || 'light',
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    };

    updateBrowserInfo();

    // Listen for changes
    const handleOnline = () => updateBrowserInfo();
    const handleOffline = () => updateBrowserInfo();
    const handleResize = () => updateBrowserInfo();
    const handleStorage = () => updateBrowserInfo();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('resize', handleResize);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', handleStorage);
    };
  }, [enableFeature]);

  if (!enableFeature) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <User size={20} />
            Feature Disabled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Browser feature is disabled</p>
        </CardContent>
      </Card>
    );
  }

  if (!isClient) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <User size={20} />
            ✅ Safe Browser Feature - Loading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{fallbackMessage}</p>
          <div className="animate-pulse h-20 bg-blue-200 rounded mt-2"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle size={20} />
          ✅ Safe Browser Feature
        </CardTitle>
      </CardHeader>
      <CardContent>
        {browserInfo && (
          <div className="space-y-2 text-sm" suppressHydrationWarning>
            <div>
              <strong>Connection:</strong> 
              <Badge variant={browserInfo.isOnline ? "default" : "destructive"} className="ml-2">
                {browserInfo.isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <div>
              <strong>Theme:</strong> 
              <Badge variant="secondary" className="ml-2">{browserInfo.theme}</Badge>
            </div>
            <div>
              <strong>Viewport:</strong> {browserInfo.viewport.width} × {browserInfo.viewport.height}
            </div>
          </div>
        )}
        <p className="text-sm text-green-600 mt-3">
          Safely accesses browser APIs only after hydration
        </p>
      </CardContent>
    </Card>
  );
};

/**
 * Real-world example: User Dashboard Component
 * Demonstrates how to combine multiple patterns safely
 */
const SafeUserDashboard: React.FC<{ userData: UserData }> = ({ userData }) => {
  const [dashboardState, setDashboardState] = useState({
    isClient: false,
    lastSeenFormatted: '',
    randomRecommendations: [] as string[],
    browserSupport: null as { notifications: boolean; geolocation: boolean } | null
  });

  useEffect(() => {
    setDashboardState(prev => ({
      ...prev,
      isClient: true,
      lastSeenFormatted: formatTimestamp(userData.lastLogin, 'relative'),
      randomRecommendations: generateSeededContent(
        userData.id.length * 1000, 
        3
      ),
      browserSupport: typeof window !== 'undefined' ? {
        notifications: 'Notification' in window,
        geolocation: 'geolocation' in navigator
      } : null
    }));
  }, [userData]);

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <User size={20} />
          ✅ Safe User Dashboard
        </CardTitle>
        <CardDescription>Real-world example combining multiple safe patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>User:</strong> {userData.name}
        </div>
        
        <div>
          <strong>Last Login:</strong> 
          {dashboardState.isClient ? (
            <span className="ml-2" suppressHydrationWarning>{dashboardState.lastSeenFormatted}</span>
          ) : (
            <span className="ml-2">{userData.lastLogin.toLocaleDateString()}</span>
          )}
        </div>

        <div>
          <strong>Recommendations:</strong>
          <div className="flex gap-2 mt-1">
            {(dashboardState.isClient ? dashboardState.randomRecommendations : ['Loading...']).map((item, index) => (
              <Badge key={index} variant="outline">{item}</Badge>
            ))}
          </div>
        </div>

        {dashboardState.isClient && dashboardState.browserSupport && (
          <div suppressHydrationWarning>
            <strong>Browser Features:</strong>
            <div className="flex gap-2 mt-1">
              <Badge variant={dashboardState.browserSupport.notifications ? "default" : "secondary"}>
                Notifications: {dashboardState.browserSupport.notifications ? 'Yes' : 'No'}
              </Badge>
              <Badge variant={dashboardState.browserSupport.geolocation ? "default" : "secondary"}>
                Location: {dashboardState.browserSupport.geolocation ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        )}

        <div className="text-sm text-green-600 bg-green-100 p-3 rounded">
          <strong>Safe Patterns Used:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Consistent server/client initial render</li>
            <li>useEffect for client-only enhancements</li>
            <li>Graceful fallbacks during hydration</li>
            <li>Deterministic content generation</li>
            <li>Progressive enhancement</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Main component showcasing all patterns
 */
export const HydrationSafetyGuide: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<string>('all');
  const [isClient, setIsClient] = useState(false);
  
  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Sample user data
  const sampleUser: UserData = {
    id: 'user_123',
    name: 'John Doe',
    email: 'john@example.com',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    preferences: {
      theme: 'light',
      timezone: 'America/New_York'
    }
  };

  const examples = [
    { id: 'all', label: 'All Examples' },
    { id: 'time', label: 'Time Handling' },
    { id: 'random', label: 'Random Content' },
    { id: 'browser', label: 'Browser APIs' },
    { id: 'dashboard', label: 'Real-world Example' }
  ];

  const shouldShowExample = (exampleId: string) => 
    selectedExample === 'all' || selectedExample === exampleId;

  // Loading state during hydration
  if (!isClient) {
    return (
      <div className="max-w-6xl mx-auto p-6">
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Next.js Hydration Safety Guide
        </h1>
        <p className="text-lg text-gray-600">
          Learn to identify and fix hydration mismatches with practical examples
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {examples.map((example) => (
            <Button
              key={example.id}
              variant={selectedExample === example.id ? "default" : "outline"}
              onClick={() => setSelectedExample(example.id)}
              size="sm"
            >
              {example.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Time Handling Examples */}
      {shouldShowExample('time') && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Time Handling Patterns</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <ProblematicCurrentTime />
            <SafeCurrentTime />
            <ProblematicUserTimestamp date={new Date()} />
            <SafeUserTimestamp date={sampleUser.lastLogin} format="relative" />
          </div>
        </section>
      )}

      {/* Random Content Examples */}
      {shouldShowExample('random') && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Random Content Patterns</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <ProblematicRandomContent />
              <SafeRandomContent seedValue={42} itemCount={3} />
            </div>
          </section>
        </>
      )}

      {/* Browser API Examples */}
      {shouldShowExample('browser') && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Browser API Patterns</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <ProblematicBrowserFeature />
              <SafeBrowserFeature 
                fallbackMessage="Checking browser capabilities..."
                enableFeature={true}
              />
            </div>
          </section>
        </>
      )}

      {/* Real-world Example */}
      {shouldShowExample('dashboard') && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Real-world Example</h2>
            <SafeUserDashboard userData={sampleUser} />
          </section>
        </>
      )}

      <Separator />

      {/* Best Practices Summary */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Best Practices Summary</h2>
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Key Principles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-700 mb-2">✅ DO:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Use useEffect for client-only logic</li>
                  <li>• Provide consistent server/client initial render</li>
                  <li>• Use loading states during hydration</li>
                  <li>• Implement progressive enhancement</li>
                  <li>• Use deterministic algorithms when possible</li>
                  <li>• Test with SSR disabled to catch issues</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-700 mb-2">❌ DON'T:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Access browser APIs during render</li>
                  <li>• Use Date.now() or Math.random() directly</li>
                  <li>• Assume client-side state during SSR</li>
                  <li>• Ignore hydration warnings</li>
                  <li>• Use suppressHydrationWarning carelessly</li>
                  <li>• Conditionally render based on client state</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Testing Strategy:</h4>
              <p className="text-sm">
                Always test your components with JavaScript disabled to ensure 
                server-rendered content is meaningful and accessible. Use React DevTools 
                to identify hydration mismatches early in development.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};