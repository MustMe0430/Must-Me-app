"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Star, 
  MessageCircle, 
  TrendingUp, 
  Award, 
  Users, 
  Eye, 
  Plus, 
  Search,
  ShoppingBag,
  Crown,
  Zap,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  Gift
} from 'lucide-react';

interface User {
  name: string;
  avatar?: string;
  isNewUser: boolean;
  stats: {
    reviews: number;
    likes: number;
    followers: number;
    views: number;
  };
  level: number;
  experience: number;
  maxExperience: number;
}

interface TopReviewer {
  name: string;
  avatar?: string;
  reviewCount: number;
  badge: string;
}

interface RecommendedItem {
  id: string;
  name: string;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
}

interface WelcomeDashboardProps {
  user: User;
  topReviewer: TopReviewer;
  recommendedItems: RecommendedItem[];
  onWriteReview: () => void;
  onExploreProducts: () => void;
  onFindFriends: () => void;
  onViewProfile: () => void;
}

export const WelcomeDashboard = ({
  user,
  topReviewer,
  recommendedItems,
  onWriteReview,
  onExploreProducts,
  onFindFriends,
  onViewProfile
}: WelcomeDashboardProps) => {
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(user.isNewUser);

  useEffect(() => {
    if (user.isNewUser) {
      const timer = setTimeout(() => {
        setShowBadgeAnimation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user.isNewUser]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const badgeVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const sparkleVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 p-4 md:p-6 lg:p-8">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Header */}
        <motion.div 
          variants={itemVariants}
          className="mb-8 relative overflow-hidden"
        >
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 border-none shadow-2xl">
            <CardContent className="p-8 relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between text-white">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-orange-200 text-orange-700 text-xl font-bold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <motion.h1 
                      className="text-3xl font-bold mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      おかえりなさい、{user.name}さん！
                    </motion.h1>
                    <motion.p 
                      className="text-orange-100 text-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      今日も素晴らしいレビューを書いてコミュニティを盛り上げましょう ✨
                    </motion.p>
                  </div>
                </div>

                {/* Level Badge */}
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Badge className="bg-white text-orange-600 px-4 py-2 text-sm font-bold">
                    <Crown className="w-4 h-4 mr-1" />
                    レベル {user.level}
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm text-orange-100 mb-1">経験値</div>
                    <Progress 
                      value={(user.experience / user.maxExperience) * 100} 
                      className="w-32 h-2 bg-orange-400"
                    />
                    <div className="text-xs text-orange-100 mt-1">
                      {user.experience} / {user.maxExperience}
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Badge Animation for New Users */}
        {showBadgeAnimation && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md mx-4"
            >
              <motion.div variants={sparkleVariants} animate="animate">
                <Sparkles className="w-16 h-16 mx-auto text-orange-500 mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                MustMeへようこそ！
              </h2>
              <p className="text-gray-600 mb-6">
                レビュアーバッジを獲得しました🎉
              </p>
              <Badge className="bg-orange-500 text-white px-6 py-3 text-lg">
                <BadgeCheck className="w-5 h-5 mr-2" />
                新人レビュアー
              </Badge>
              <Button 
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600"
                onClick={() => setShowBadgeAnimation(false)}
              >
                レビューを始める！
              </Button>
            </motion.div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Top Reviewer */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden shadow-lg border-orange-200">
                <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-50">
                  <CardTitle className="flex items-center text-orange-700">
                    <Crown className="w-6 h-6 mr-2 text-orange-500" />
                    今日の共感王
                  </CardTitle>
                  <CardDescription>最も多くのいいねを獲得したレビュアー</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <motion.div 
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-100"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Avatar className="w-12 h-12 border-2 border-orange-300">
                      <AvatarImage src={topReviewer.avatar} alt={topReviewer.name} />
                      <AvatarFallback className="bg-orange-200 text-orange-700">
                        {topReviewer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{topReviewer.name}</h3>
                      <p className="text-sm text-gray-600">
                        {topReviewer.reviewCount}件のレビューで共感を集めました
                      </p>
                    </div>
                    <Badge className="bg-orange-500 text-white">
                      <Zap className="w-4 h-4 mr-1" />
                      {topReviewer.badge}
                    </Badge>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recommended Items */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-700">
                    <Gift className="w-6 h-6 mr-2 text-orange-500" />
                    あなたにおすすめの愛用品
                  </CardTitle>
                  <CardDescription>あなたの興味に基づいた厳選アイテム</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-lg border border-orange-100 hover:shadow-md transition-all cursor-pointer"
                        whileHover={{ scale: 1.03 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <div className="flex space-x-3">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${
                                      i < item.rating ? 'text-orange-400 fill-current' : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">({item.reviewCount})</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Activity Stats */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-700">
                    <TrendingUp className="w-6 h-6 mr-2 text-orange-500" />
                    あなたの活動状況
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <motion.div 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-white rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">レビュー数</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">{user.stats.reviews}</span>
                  </motion.div>

                  <motion.div 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-white rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">いいね数</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">{user.stats.likes}</span>
                  </motion.div>

                  <motion.div 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-white rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">フォロワー</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">{user.stats.followers}</span>
                  </motion.div>

                  <motion.div 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-white rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Eye className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">閲覧数</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">{user.stats.views.toLocaleString()}</span>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-700">
                    <Zap className="w-6 h-6 mr-2 text-orange-500" />
                    クイックアクション
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md"
                      onClick={onWriteReview}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      新しいレビューを書く
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                      onClick={onExploreProducts}
                    >
                      <Search className="w-5 h-5 mr-2" />
                      商品を探す
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                      onClick={onFindFriends}
                    >
                      <Users className="w-5 h-5 mr-2" />
                      友達を探す
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                      onClick={onViewProfile}
                    >
                      <Award className="w-5 h-5 mr-2" />
                      プロフィールを見る
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div 
          variants={itemVariants}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-orange-100 to-orange-50 border-orange-200 shadow-lg overflow-hidden">
            <CardContent className="p-8 text-center relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full opacity-20 translate-x-16 -translate-y-16" />
              <div className="relative z-10">
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatType: "reverse" 
                  }}
                >
                  <ShoppingBag className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold text-orange-700 mb-2">
                  今日の愛用品をシェアしませんか？
                </h3>
                <p className="text-orange-600 mb-6">
                  あなたの体験が他の人の選択をサポートします
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg shadow-lg"
                    onClick={onWriteReview}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    今すぐレビューを書く
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};