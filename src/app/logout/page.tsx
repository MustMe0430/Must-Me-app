"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogOut, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LogoutPage() {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Auto logout after component mounts (if user confirmed or from direct URL)
    const performAutoLogout = async () => {
      if (user && !isLoggingOut && !logoutSuccess) {
        await handleLogout();
      }
    };

    // Small delay to show the page before logging out
    const timer = setTimeout(performAutoLogout, 1000);
    return () => clearTimeout(timer);
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await signOut();
      setLogoutSuccess(true);
      
      // Redirect to login after showing success message
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Logout error:', error);
      setLogoutError('ログアウト中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancel = () => {
    router.back(); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            <p className="text-gray-600">読み込み中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (logoutSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-green-200">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">ログアウト完了</h2>
            <p className="text-center text-gray-600">
              ありがとうございました！<br />
              またのご利用をお待ちしています。
            </p>
            <div className="text-sm text-gray-500">
              ログインページに移動しています...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ホームに戻る
        </Link>

        <Card className="shadow-lg border-orange-200">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <LogOut className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              ログアウト
            </CardTitle>
            <p className="text-gray-600">
              {user ? `${user.displayName || user.email}さん` : 'あなた'}のアカウントからログアウトしますか？
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {logoutError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{logoutError}</AlertDescription>
              </Alert>
            )}

            {/* Logout Status */}
            {isLoggingOut && (
              <Alert className="border-orange-200 bg-orange-50">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription className="text-orange-700">
                  ログアウト中です...
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 transition-all duration-200"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ログアウト中...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    ログアウトする
                  </>
                )}
              </Button>

              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isLoggingOut}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 transition-all duration-200"
              >
                キャンセル
              </Button>
            </div>

            {/* Info Message */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
              <p>
                ログアウト後も、いつでもMustMeに戻ってきてください。<br />
                あなたのレビューがコミュニティを支えています。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Actions */}
        <Card className="shadow-sm bg-gray-50">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">他のアカウントでログインしますか？</p>
              <Link
                href="/login"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
              >
                別のアカウントでログイン
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}