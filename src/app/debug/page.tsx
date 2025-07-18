"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Download, 
  Wifi, 
  Database, 
  Shield, 
  Globe, 
  Settings,
  Bug,
  Monitor,
  HardDrive,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

interface DebugResult {
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
  timestamp: Date;
}

interface DebugResults {
  [key: string]: DebugResult;
}

export default function DebugPage() {
  const [debugResults, setDebugResults] = useState<DebugResults>({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('testpassword123');
  const [showPassword, setShowPassword] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  useEffect(() => {
    if (realTimeUpdates) {
      runAllTests();
      const interval = setInterval(runAllTests, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [realTimeUpdates]);

  const updateResult = (key: string, result: DebugResult) => {
    setDebugResults(prev => ({
      ...prev,
      [key]: result
    }));
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    
    // Run all debug tests
    await Promise.all([
      testFirebaseConfig(),
      testEmulatorStatus(),
      testNetworkConnectivity(),
      testBrowserCompatibility(),
      testLocalStorage(),
      testEnvironmentVariables()
    ]);
    
    setIsRunningTests(false);
  };

  const testFirebaseConfig = async () => {
    try {
      updateResult('firebaseConfig', {
        status: 'pending',
        message: 'Checking Firebase configuration...',
        timestamp: new Date()
      });

      // Check if Firebase is properly configured
      const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ Set' : '✗ Missing',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing',
      };

      const hasAllConfig = Object.values(config).every(value => value.includes('✓'));

      updateResult('firebaseConfig', {
        status: hasAllConfig ? 'success' : 'error',
        message: hasAllConfig ? 'Firebase configuration is complete' : 'Firebase configuration is incomplete',
        details: config,
        timestamp: new Date()
      });
    } catch (error) {
      updateResult('firebaseConfig', {
        status: 'error',
        message: 'Failed to check Firebase configuration',
        details: error,
        timestamp: new Date()
      });
    }
  };

  const testEmulatorStatus = async () => {
    try {
      updateResult('emulatorStatus', {
        status: 'pending',
        message: 'Checking emulator status...',
        timestamp: new Date()
      });

      const emulatorChecks = {
        auth: false,
        firestore: false,
        functions: false
      };

      // Check auth emulator
      try {
        await fetch('http://localhost:9099');
        emulatorChecks.auth = true;
      } catch (e) {
        // Auth emulator not running
      }

      // Check firestore emulator
      try {
        await fetch('http://localhost:8080');
        emulatorChecks.firestore = true;
      } catch (e) {
        // Firestore emulator not running
      }

      // Check functions emulator
      try {
        await fetch('http://localhost:5001');
        emulatorChecks.functions = true;
      } catch (e) {
        // Functions emulator not running
      }

      const runningEmulators = Object.entries(emulatorChecks).filter(([_, running]) => running);
      const isDevelopment = process.env.NODE_ENV === 'development';

      updateResult('emulatorStatus', {
        status: isDevelopment && runningEmulators.length > 0 ? 'success' : 'warning',
        message: `${runningEmulators.length} emulator(s) running`,
        details: emulatorChecks,
        timestamp: new Date()
      });
    } catch (error) {
      updateResult('emulatorStatus', {
        status: 'error',
        message: 'Failed to check emulator status',
        details: error,
        timestamp: new Date()
      });
    }
  };

  const testNetworkConnectivity = async () => {
    try {
      updateResult('networkConnectivity', {
        status: 'pending',
        message: 'Testing network connectivity...',
        timestamp: new Date()
      });

      const tests = await Promise.allSettled([
        fetch('https://firebase.googleapis.com/'),
        fetch('https://www.gstatic.com/'),
        fetch('https://apis.google.com/')
      ]);

      const successful = tests.filter(result => result.status === 'fulfilled').length;
      const total = tests.length;

      updateResult('networkConnectivity', {
        status: successful === total ? 'success' : successful > 0 ? 'warning' : 'error',
        message: `${successful}/${total} connectivity tests passed`,
        details: tests,
        timestamp: new Date()
      });
    } catch (error) {
      updateResult('networkConnectivity', {
        status: 'error',
        message: 'Network connectivity test failed',
        details: error,
        timestamp: new Date()
      });
    }
  };

  const testBrowserCompatibility = async () => {
    try {
      updateResult('browserCompatibility', {
        status: 'pending',
        message: 'Checking browser compatibility...',
        timestamp: new Date()
      });

      const compatibility = {
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        localStorage: typeof Storage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        indexedDB: typeof indexedDB !== 'undefined',
        webCrypto: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        geolocation: 'geolocation' in navigator
      };

      const criticalFeatures = ['cookiesEnabled', 'localStorage', 'indexedDB', 'webCrypto'];
      const hasCriticalFeatures = criticalFeatures.every(feature => compatibility[feature as keyof typeof compatibility]);

      updateResult('browserCompatibility', {
        status: hasCriticalFeatures ? 'success' : 'error',
        message: hasCriticalFeatures ? 'Browser is compatible' : 'Browser missing critical features',
        details: compatibility,
        timestamp: new Date()
      });
    } catch (error) {
      updateResult('browserCompatibility', {
        status: 'error',
        message: 'Browser compatibility check failed',
        details: error,
        timestamp: new Date()
      });
    }
  };

  const testLocalStorage = async () => {
    try {
      updateResult('localStorage', {
        status: 'pending',
        message: 'Testing local storage...',
        timestamp: new Date()
      });

      const testKey = 'mustme_debug_test';
      const testValue = 'test_value_' + Date.now();

      // Test localStorage
      localStorage.setItem(testKey, testValue);
      const retrievedValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      const isWorking = retrievedValue === testValue;

      updateResult('localStorage', {
        status: isWorking ? 'success' : 'error',
        message: isWorking ? 'Local storage is working' : 'Local storage is not working',
        details: { testValue, retrievedValue, isWorking },
        timestamp: new Date()
      });
    } catch (error) {
      updateResult('localStorage', {
        status: 'error',
        message: 'Local storage test failed',
        details: error,
        timestamp: new Date()
      });
    }
  };

  const testEnvironmentVariables = async () => {
    try {
      updateResult('environmentVariables', {
        status: 'pending',
        message: 'Checking environment variables...',
        timestamp: new Date()
      });

      const envVars = {
        NODE_ENV: process.env.NODE_ENV || 'undefined',
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set (hidden)' : 'Not set',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set',
        NEXT_PUBLIC_USE_FIREBASE_EMULATOR: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR || 'Not set'
      };

      const requiredVars = ['NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
      const hasRequiredVars = requiredVars.every(varName => 
        envVars[varName as keyof typeof envVars] && envVars[varName as keyof typeof envVars] !== 'Not set'
      );

      updateResult('environmentVariables', {
        status: hasRequiredVars ? 'success' : 'error',
        message: hasRequiredVars ? 'All required environment variables are set' : 'Missing required environment variables',
        details: envVars,
        timestamp: new Date()
      });
    } catch (error) {
      updateResult('environmentVariables', {
        status: 'error',
        message: 'Environment variables check failed',
        details: error,
        timestamp: new Date()
      });
    }
  };

  const testEmailPasswordAuth = async () => {
    try {
      updateResult('emailPasswordAuth', {
        status: 'pending',
        message: 'Testing email/password authentication...',
        timestamp: new Date()
      });

      // This would integrate with your actual Firebase auth
      // For now, we'll simulate the test
      await new Promise(resolve => setTimeout(resolve, 2000));

      updateResult('emailPasswordAuth', {
        status: 'warning',
        message: 'Email/password auth test requires actual implementation',
        details: { email: testEmail, password: '***' },
        timestamp: new Date()
      });
    } catch (error) {
      updateResult('emailPasswordAuth', {
        status: 'error',
        message: 'Email/password authentication test failed',
        details: error,
        timestamp: new Date()
      });
    }
  };

  const testGoogleAuth = async () => {
    try {
      updateResult('googleAuth', {
        status: 'pending',
        message: 'Testing Google authentication...',
        timestamp: new Date()
      });

      // This would integrate with your actual Firebase auth
      // For now, we'll simulate the test
      await new Promise(resolve => setTimeout(resolve, 2000));

      updateResult('googleAuth', {
        status: 'warning',
        message: 'Google auth test requires actual implementation',
        details: {},
        timestamp: new Date()
      });
    } catch (error) {
      updateResult('googleAuth', {
        status: 'error',
        message: 'Google authentication test failed',
        details: error,
        timestamp: new Date()
      });
    }
  };

  const clearAuthData = async () => {
    try {
      localStorage.removeItem('mustme_auth');
      sessionStorage.removeItem('mustme_auth');
      
      // Clear Firebase auth if available
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('firebase:')) {
            localStorage.removeItem(key);
          }
        });
      }

      updateResult('clearAuthData', {
        status: 'success',
        message: 'Authentication data cleared',
        timestamp: new Date()
      });
    } catch (error) {
      updateResult('clearAuthData', {
        status: 'error',
        message: 'Failed to clear authentication data',
        details: error,
        timestamp: new Date()
      });
    }
  };

  const exportDebugReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      environment: process.env.NODE_ENV,
      results: debugResults
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mustme-debug-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'error':
        return <X className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">MustMe Firebase Debug Center</h1>
        <p className="text-gray-600">Comprehensive diagnostics for Firebase authentication system</p>
      </div>

      {/* Control Panel */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={runAllTests} 
              disabled={isRunningTests}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
            <Button onClick={exportDebugReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={clearAuthData} variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Clear Auth Data
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="realTimeUpdates"
              checked={realTimeUpdates}
              onChange={(e) => setRealTimeUpdates(e.target.checked)}
              className="w-4 h-4 text-orange-500"
            />
            <Label htmlFor="realTimeUpdates" className="text-sm">
              Real-time updates (every 30s)
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Firebase Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Firebase Configuration
              {debugResults.firebaseConfig && getStatusIcon(debugResults.firebaseConfig.status)}
                 <CardContent>
            {debugResults.firebaseConfig ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(debugResults.firebaseConfig.status)}
                </div>
                <p className="text-sm text-gray-600">
                  {debugResults.firebaseConfig.message}
                </p>
                {debugResults.firebaseConfig.details && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="grid grid-cols-1 gap-1 text-sm">
...
<p className="text-sm text-gray-600">
  {debugResults.firebaseConfig.message}
</p>
{debugResults.firebaseConfig.details && (
  <div className="bg-gray-50 p-3 rounded-md">
    <div className="grid grid-cols-1 gap-1 text-sm">
      {Object.entries(debugResults.firebaseConfig.details).map(([key, value]) => (
        <div key={key} className="flex justify-between">
          <span className="font-medium">{key}:</span>
          <span className={String(value).includes('✓') ? 'text-green-600' : 'text-red-600'}>
            {String(value)}
          </span>
        </div>
      ))}
    </div>
  </div>
)}
...
                <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Run tests to check configuration</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emulator Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Emulator Status
              {debugResults.emulatorStatus && getStatusIcon(debugResults.emulatorStatus.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debugResults.emulatorStatus ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(debugResults.emulatorStatus.status)}
                </div>
                <p className="text-sm text-gray-600">{debugResults.emulatorStatus.message}</p>
                {debugResults.emulatorStatus.details && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="grid grid-cols-1 gap-1 text-sm">
                      {Object.entries(debugResults.emulatorStatus.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span className={value ? 'text-green-600' : 'text-gray-500'}>
                            {value ? '✓ Running' : '○ Stopped'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Run tests to check emulator status</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Network Connectivity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Network Connectivity
              {debugResults.networkConnectivity && getStatusIcon(debugResults.networkConnectivity.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debugResults.networkConnectivity ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(debugResults.networkConnectivity.status)}
                </div>
                <p className="text-sm text-gray-600">{debugResults.networkConnectivity.message}</p>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Wifi className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Run tests to check connectivity</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Browser Compatibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Browser Compatibility
              {debugResults.browserCompatibility && getStatusIcon(debugResults.browserCompatibility.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debugResults.browserCompatibility ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(debugResults.browserCompatibility.status)}
                </div>
                <p className="text-sm text-gray-600">{debugResults.browserCompatibility.message}</p>
                {debugResults.browserCompatibility.details && (
                  <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      {Object.entries(debugResults.browserCompatibility.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span className={typeof value === 'boolean' ? (value ? 'text-green-600' : 'text-red-600') : 'text-gray-600'}>
                            {typeof value === 'boolean' ? (value ? '✓' : '✗') : value.toString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Run tests to check compatibility</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Local Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Local Storage
              {debugResults.localStorage && getStatusIcon(debugResults.localStorage.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debugResults.localStorage ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(debugResults.localStorage.status)}
                </div>
                <p className="text-sm text-gray-600">{debugResults.localStorage.message}</p>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Run tests to check local storage</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Environment Variables
              {debugResults.environmentVariables && getStatusIcon(debugResults.environmentVariables.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debugResults.environmentVariables ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(debugResults.environmentVariables.status)}
                </div>
                <p className="text-sm text-gray-600">{debugResults.environmentVariables.message}</p>
                {debugResults.environmentVariables.details && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="grid grid-cols-1 gap-1 text-sm">
                      {Object.entries(debugResults.environmentVariables.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span className={value.toString().includes('Set') ? 'text-green-600' : 'text-red-600'}>
                            {value.toString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Bug className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Run tests to check environment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Authentication Testing */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Authentication Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email/Password Test */}
            <div className="space-y-4">
              <h3 className="font-medium">Email/Password Authentication</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="testEmail">Test Email</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="testPassword">Test Password</Label>
                  <div className="relative">
                    <Input
                      id="testPassword"
                      type={showPassword ? "text" : "password"}
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                      placeholder="Enter test password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={testEmailPasswordAuth}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  Test Email/Password Auth
                </Button>
                {debugResults.emailPasswordAuth && (
                  <div className="flex items-center gap-2 text-sm">
                    {getStatusIcon(debugResults.emailPasswordAuth.status)}
                    <span>{debugResults.emailPasswordAuth.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Google Auth Test */}
            <div className="space-y-4">
              <h3 className="font-medium">Google Authentication</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Test Google authentication flow
                </p>
                <Button 
                  onClick={testGoogleAuth}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  Test Google Auth
                </Button>
                {debugResults.googleAuth && (
                  <div className="flex items-center gap-2 text-sm">
                    {getStatusIcon(debugResults.googleAuth.status)}
                    <span>{debugResults.googleAuth.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(debugResults.emailPasswordAuth || debugResults.googleAuth) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Authentication Test Results</h4>
                {debugResults.emailPasswordAuth && (
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      Email/Password: {debugResults.emailPasswordAuth.message}
                    </AlertDescription>
                  </Alert>
                )}
                {debugResults.googleAuth && (
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      Google Auth: {debugResults.googleAuth.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Browser</h4>
              <div className="space-y-1 text-gray-600">
                <div>User Agent: {navigator.userAgent}</div>
                <div>Language: {navigator.language}</div>
                <div>Platform: {navigator.platform}</div>
                <div>Cookies: {navigator.cookieEnabled ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Application</h4>
              <div className="space-y-1 text-gray-600">
                <div>Environment: {process.env.NODE_ENV}</div>
                <div>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
                <div>Protocol: {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</div>
                <div>Host: {typeof window !== 'undefined' ? window.location.host : 'N/A'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}