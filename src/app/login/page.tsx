"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, resetPassword, user, loading, error, clearError } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Get return URL from query params
  const returnUrl = searchParams?.get('returnUrl') || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading && !success) {
      router.push(returnUrl);
    }
  }, [user, loading, router, returnUrl, success]);

  // Clear error when component unmounts or form changes
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await signIn(email, password);
      setSuccess(true);
      setTimeout(() => {
        router.push(returnUrl);
      }, 1000);
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    clearError();

    try {
      await signInWithGoogle();
      setSuccess(true);
      setTimeout(() => {
        router.push(returnUrl);
      }, 1000);
    } catch (err) {
      // Error handled by AuthContext
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await resetPassword(email);
      setResetEmailSent(true);
      setShowForgotPassword(false);
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-orange-100">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-orange-900">ログイン成功</h2>
            <p className="text-center text-gray-600">
              おかえりなさい！<br />
              ホームページにリダイレクトしています...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ホームに戻る
        </Link>

        {/* Main Login Card */}
        <Card className="shadow-lg border-orange-100">
          <CardHeader className="space-y-4 pb-6">
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold text-orange-900">MustMe</CardTitle>
              <CardDescription className="text-lg text-gray-600 font-medium">
                信じるレビューに、会いにいこう。
              </CardDescription>
            </div>
            {!showForgotPassword && (
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-gray-900">おかえりなさい</h1>
                <p className="text-gray-600 mt-1">アカウントにログインしてください</p>
              </div>
            )}
            {showForgotPassword && (
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-gray-900">パスワードリセット</h1>
                <p className="text-gray-600 mt-1">メールアドレスを入力してください</p>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* Reset Email Sent */}
            {resetEmailSent && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  パスワードリセットメールを送信しました。メールをご確認ください。
                </AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            {!showForgotPassword ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    メールアドレス
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@mustme.jp"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    パスワード
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="パスワードを入力"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-12 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                  >
                    パスワードを忘れた方
                  </button>
                </div>

                {/* Login Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium text-base transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading || loading}
                >
                  {isLoading || loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ログイン中...
                    </>
                  ) : (
                    'ログイン'
                  )}
                </Button>
              </form>
            ) : (
              /* Forgot Password Form */
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-gray-700 font-medium">
                    メールアドレス
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="example@mustme.jp"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        送信中...
                      </>
                    ) : (
                      'リセットメールを送信'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full h-12 border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    ログインに戻る
                  </Button>
                </div>
              </form>
            )}

            {/* Divider and Google Login */}
            {!showForgotPassword && (
              <>
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
                    または
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full h-12 border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading || loading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Googleでログイン
                </Button>
              </>
            )}

            {/* Sign Up Link */}
            {!showForgotPassword && (
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-gray-600">
                  アカウントをお持ちでない方は{' '}
                  <Link 
                    href="/signup" 
                    className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
                  >
                    新規登録
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trust Message */}
        <div className="text-center text-sm text-gray-500 px-4">
          <p>
            MustMeは信頼できるレビュープラットフォームとして、
            <br />
            お客様の個人情報を安全に保護しています。
          </p>
        </div>
      </div>
    </div>
  );
}