"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, AlertTriangle, RefreshCw } from 'lucide-react';

export interface ProtectionConfig {
  requireAuth?: boolean;
  requiredRoles?: string[];
  requireEmailVerification?: boolean;
  allowedPermissions?: string[];
  redirectTo?: string;
  redirectOnFail?: string;
  customCheck?: (user: any) => boolean | Promise<boolean>;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  protection?: ProtectionConfig;
  loadingComponent?: ReactNode;
  fallbackComponent?: ReactNode;
  onAccessDenied?: (reason: string, user?: any) => void;
  debug?: boolean;
}

interface DebugInfo {
  path: string;
  timestamp: string;
  protection: ProtectionConfig;
  user: any;
  checkResults: Record<string, boolean>;
  finalDecision: 'allowed' | 'denied' | 'loading';
  redirectTarget?: string;
}

const defaultProtection: ProtectionConfig = {
  requireAuth: true,
  redirectTo: '/login',
  redirectOnFail: '/unauthorized'
};

const DefaultLoadingComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Card className="w-full max-w-md">
      <CardContent className="py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <Lock className="h-4 w-4 absolute -top-1 -right-1 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Verifying Access</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we check your permissions...
            </p>
          </div>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-primary h-1 rounded-full animate-pulse w-1/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const DefaultFallbackComponent = ({ 
  reason, 
  onRetry, 
  redirectTarget 
}: { 
  reason: string; 
  onRetry: () => void;
  redirectTarget?: string;
}) => {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="py-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <Lock className="h-6 w-6 absolute -bottom-1 -right-1 text-muted-foreground bg-background rounded-full p-1" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
              <p className="text-muted-foreground">
                {reason || 'You do not have permission to access this page.'}
              </p>
            </div>

            <Alert className="w-full">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This page requires additional permissions or authentication.
                Please contact your administrator if you believe this is an error.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={onRetry}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              
              {redirectTarget && (
                <Button 
                  onClick={() => router.push(redirectTarget)}
                  className="flex-1"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DebugPanel = ({ debugInfo }: { debugInfo: DebugInfo }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 shadow-lg border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm flex items-center">
              <Lock className="h-4 w-4 mr-2 text-primary" />
              Route Protection Debug
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-medium ${
                debugInfo.finalDecision === 'allowed' 
                  ? 'text-green-600' 
                  : debugInfo.finalDecision === 'denied'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}>
                {debugInfo.finalDecision.toUpperCase()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Path:</span>
              <span className="font-mono">{debugInfo.path}</span>
            </div>
            
            {isExpanded && (
              <>
                <hr className="my-2" />
                <div className="space-y-1">
                  <div className="text-muted-foreground font-medium">Protection Config:</div>
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(debugInfo.protection, null, 2)}
                  </pre>
                  
                  <div className="text-muted-foreground font-medium">Check Results:</div>
                  {Object.entries(debugInfo.checkResults).map(([check, result]) => (
                    <div key={check} className="flex justify-between">
                      <span>{check}:</span>
                      <span className={result ? 'text-green-600' : 'text-red-600'}>
                        {result ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                  
                  {debugInfo.user && (
                    <>
                      <div className="text-muted-foreground font-medium">User Info:</div>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify({
                          id: debugInfo.user.id,
                          email: debugInfo.user.email,
                          roles: debugInfo.user.roles,
                          permissions: debugInfo.user.permissions
                        }, null, 2)}
                      </pre>
                    </>
                  )}
                  
                  <div className="text-muted-foreground text-xs">
                    {debugInfo.timestamp}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  protection = defaultProtection,
  loadingComponent,
  fallbackComponent,
  onAccessDenied,
  debug = false
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [retryKey, setRetryKey] = useState(0);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  
  const mergedProtection = { ...defaultProtection, ...protection };
  
  const updateDebugInfo = (
    user: any,
    checkResults: Record<string, boolean>,
    finalDecision: 'allowed' | 'denied' | 'loading',
    redirectTarget?: string
  ) => {
    if (debug) {
      setDebugInfo({
        path: pathname,
        timestamp: new Date().toISOString(),
        protection: mergedProtection,
        user,
        checkResults,
        finalDecision,
        redirectTarget
      });
    }
  };

  const handleAuthCheck = async (user: any, isLoading: boolean): Promise<{
    allowed: boolean;
    reason?: string;
    redirectTo?: string;
  }> => {
    const checkResults: Record<string, boolean> = {};
    
    // Loading state
    if (isLoading) {
      updateDebugInfo(user, checkResults, 'loading');
      return { allowed: false };
    }

    // Authentication check
    if (mergedProtection.requireAuth) {
      checkResults['Authentication Required'] = !!user;
      if (!user) {
        const redirectTarget = mergedProtection.redirectTo || '/login';
        updateDebugInfo(user, checkResults, 'denied', redirectTarget);
        
        if (onAccessDenied) {
          onAccessDenied('Authentication required', user);
        }
        
        // Auto redirect to login
        setTimeout(() => {
          router.push(`${redirectTarget}?redirect=${encodeURIComponent(pathname)}`);
        }, 100);
        
        return { 
          allowed: false, 
          reason: 'Authentication required. You will be redirected to the login page.',
          redirectTo: redirectTarget
        };
      }
    }

    // Email verification check
    if (mergedProtection.requireEmailVerification && user) {
      checkResults['Email Verification'] = !!user.emailVerified;
      if (!user.emailVerified) {
        updateDebugInfo(user, checkResults, 'denied');
        
        if (onAccessDenied) {
          onAccessDenied('Email verification required', user);
        }
        
        return { 
          allowed: false, 
          reason: 'Please verify your email address to access this page.' 
        };
      }
    }

    // Role-based check
    if (mergedProtection.requiredRoles && mergedProtection.requiredRoles.length > 0) {
      const userRoles = user?.roles || [];
      const hasRequiredRole = mergedProtection.requiredRoles.some(role => 
        userRoles.includes(role)
      );
      
      checkResults['Role Check'] = hasRequiredRole;
      if (!hasRequiredRole) {
        const redirectTarget = mergedProtection.redirectOnFail;
        updateDebugInfo(user, checkResults, 'denied', redirectTarget);
        
        if (onAccessDenied) {
          onAccessDenied(`Required roles: ${mergedProtection.requiredRoles.join(', ')}`, user);
        }
        
        return { 
          allowed: false, 
          reason: `Access restricted to users with roles: ${mergedProtection.requiredRoles.join(', ')}`,
          redirectTo: redirectTarget
        };
      }
    }

    // Permission-based check
    if (mergedProtection.allowedPermissions && mergedProtection.allowedPermissions.length > 0) {
      const userPermissions = user?.permissions || [];
      const hasRequiredPermission = mergedProtection.allowedPermissions.some(permission =>
        userPermissions.includes(permission)
      );
      
      checkResults['Permission Check'] = hasRequiredPermission;
      if (!hasRequiredPermission) {
        const redirectTarget = mergedProtection.redirectOnFail;
        updateDebugInfo(user, checkResults, 'denied', redirectTarget);
        
        if (onAccessDenied) {
          onAccessDenied(`Required permissions: ${mergedProtection.allowedPermissions.join(', ')}`, user);
        }
        
        return { 
          allowed: false, 
          reason: `Access restricted to users with permissions: ${mergedProtection.allowedPermissions.join(', ')}`,
          redirectTo: redirectTarget
        };
      }
    }

    // Custom check
    if (mergedProtection.customCheck) {
      const customResult = await mergedProtection.customCheck(user);
      checkResults['Custom Check'] = customResult;
      
      if (!customResult) {
        const redirectTarget = mergedProtection.redirectOnFail;
        updateDebugInfo(user, checkResults, 'denied', redirectTarget);
        
        if (onAccessDenied) {
          onAccessDenied('Custom access check failed', user);
        }
        
        return { 
          allowed: false, 
          reason: 'Access denied by custom validation rules.',
          redirectTo: redirectTarget
        };
      }
    }

    // All checks passed
    updateDebugInfo(user, checkResults, 'allowed');
    return { allowed: true };
  };

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  return (
    <>
      <AuthGuard
        key={retryKey}
        requireAuth={mergedProtection.requireAuth}
        requiredRoles={mergedProtection.requiredRoles}
        fallback={(user, isLoading, reason) => {
          if (isLoading && !loadingComponent) {
            return <DefaultLoadingComponent />;
          }
          
          if (isLoading && loadingComponent) {
            return <>{loadingComponent}</>;
          }
          
          const checkResult = handleAuthCheck(user, isLoading);
          
          if (fallbackComponent) {
            return <>{fallbackComponent}</>;
          }
          
          return (
            <DefaultFallbackComponent
              reason={reason || 'Access denied'}
              onRetry={handleRetry}
              redirectTarget={mergedProtection.redirectTo}
            />
          );
        }}
        customCheck={async (user, isLoading) => {
          const result = await handleAuthCheck(user, isLoading);
          return result.allowed;
        }}
      >
        {children}
      </AuthGuard>
      
      {debug && debugInfo && <DebugPanel debugInfo={debugInfo} />}
    </>
  );
};

// Convenience wrapper for common protection patterns
export const withProtection = (
  protection: ProtectionConfig,
  options?: Omit<ProtectedRouteProps, 'children' | 'protection'>
) => {
  return function ProtectedWrapper({ children }: { children: ReactNode }) {
    return (
      <ProtectedRoute protection={protection} {...options}>
        {children}
      </ProtectedRoute>
    );
  };
};

// Pre-configured protection components for common scenarios
export const LoginRequired = withProtection({
  requireAuth: true,
  redirectTo: '/login'
});

export const AdminOnly = withProtection({
  requireAuth: true,
  requiredRoles: ['admin'],
  redirectTo: '/login',
  redirectOnFail: '/unauthorized'
});

export const VerifiedUsersOnly = withProtection({
  requireAuth: true,
  requireEmailVerification: true,
  redirectTo: '/login'
});

export const ModeratorOrAdmin = withProtection({
  requireAuth: true,
  requiredRoles: ['admin', 'moderator'],
  redirectTo: '/login',
  redirectOnFail: '/unauthorized'
});

export default ProtectedRoute;