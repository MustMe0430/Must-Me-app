"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  requireEmailVerification?: boolean;
  showSpinner?: boolean;
  allowedRoles?: string[];
}

export const AuthGuard = ({
  children,
  fallback,
  redirectTo = "/login",
  requireAuth = true,
  requireEmailVerification = false,
  showSpinner = true,
  allowedRoles = [],
}: AuthGuardProps) => {
  const { user, loading, error } = useAuth();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  // Set current path only once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      setIsInitializing(false);
    }
  }, [loading]);

  useEffect(() => {
    // Only proceed if we have the path and auth state is ready
    if (!loading && !isInitializing && !hasRedirected && currentPath) {
      if (requireAuth && !user) {
        // Store the current route as return URL for after login
        const returnUrl = encodeURIComponent(currentPath);
        setHasRedirected(true);
        router.push(`${redirectTo}?returnUrl=${returnUrl}`);
        return;
      }

      // Check email verification if required
      if (requireEmailVerification && user && !user.emailVerified) {
        setHasRedirected(true);
        router.push(`/verify-email?returnUrl=${encodeURIComponent(currentPath)}`);
        return;
      }

      // Check role-based access if roles are specified
      if (user && allowedRoles.length > 0) {
        // For now, we'll assume all users have basic access
        // In a real app, you might store roles in Firestore
        const userRole = "user"; // This could come from user document in Firestore
        if (!allowedRoles.includes(userRole)) {
          setHasRedirected(true);
          router.push("/unauthorized");
          return;
        }
      }
    }
  }, [user, loading, isInitializing, requireAuth, requireEmailVerification, allowedRoles, router, redirectTo, hasRedirected, currentPath]);

  // Show loading state while auth is being checked
  if (loading || isInitializing) {
    if (!showSpinner) return null;

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <Card className="w-full max-w-md p-8 text-center space-y-6 border-orange-100">
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-600" />
            <div className="space-y-2">
              <div className="h-4 bg-orange-100 rounded animate-pulse" />
              <div className="h-4 bg-orange-100 rounded animate-pulse w-3/4 mx-auto" />
              <div className="h-4 bg-orange-100 rounded animate-pulse w-1/2 mx-auto" />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            認証情報を確認しています...
          </p>
        </Card>
      </div>
    );
  }

  // Handle auth errors
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <Card className="w-full max-w-md p-8 text-center space-y-6 border-red-200">
          <div className="text-red-600">
            <h2 className="text-lg font-semibold">認証エラー</h2>
            <p className="text-sm mt-2">
              {error || "認証中にエラーが発生しました"}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
          >
            再試行
          </button>
        </Card>
      </div>
    );
  }

  // Check if user is authenticated when auth is required
  if (requireAuth && !user) {
    // This should not happen due to redirect above, but added as fallback
    return null;
  }

  // Check email verification
  if (requireEmailVerification && user && !user.emailVerified) {
    return null; // Will redirect to verification page
  }

  // Check role-based access
  if (user && allowedRoles.length > 0) {
    const userRole = "user"; // This could come from user document in Firestore
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
          <Card className="w-full max-w-md p-8 text-center space-y-6 border-red-200">
            <div className="text-red-600">
              <h2 className="text-lg font-semibold">アクセス拒否</h2>
              <p className="text-sm mt-2">
                このページにアクセスする権限がありません。
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
            >
              戻る
            </button>
          </Card>
        </div>
      );
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
};

// Higher-order component variant for easier usage
export const withAuthGuard = (
  WrappedComponent: React.ComponentType<any>,
  guardOptions?: Omit<AuthGuardProps, "children">
) => {
  return function AuthGuardedComponent(props: any) {
    return (
      <AuthGuard {...guardOptions}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
};

// Hook for programmatic auth checking
export const useAuthGuard = (options: {
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
} = {}) => {
  const { user, loading, error } = useAuth();
  const router = useRouter();
  const {
    requireAuth = true,
    allowedRoles = [],
    redirectTo = "/login",
  } = options;

  const checkAuth = () => {
    if (loading) return { isAuthorized: false, isLoading: true };

    if (requireAuth && !user) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;
        const returnUrl = encodeURIComponent(currentPath);
        router.push(`${redirectTo}?returnUrl=${returnUrl}`);
      }
      return { isAuthorized: false, isLoading: false };
    }

    if (user && allowedRoles.length > 0) {
      const userRole = "user"; // This could come from user document in Firestore
      if (!allowedRoles.includes(userRole)) {
        return { isAuthorized: false, isLoading: false, error: "権限不足です" };
      }
    }

    return { isAuthorized: true, isLoading: false };
  };

  return {
    ...checkAuth(),
    user,
    error,
  };
};

export default AuthGuard;