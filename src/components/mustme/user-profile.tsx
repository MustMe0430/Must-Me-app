"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Star, 
  Camera, 
  Settings,
  MapPin,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Activity,
  Edit3,
  Clock,
  Save,
  X,
  Upload,
  User,
  Check
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  location: string;
  joinedDate: string;
  verified: boolean;
  stats: {
    followers: number;
    following: number;
    reviews: number;
    helpfulVotes: number;
    totalLikes: number;
  };
}

interface ReviewType {
  id: string;
  productName: string;
  productImage: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  bookmarks: number;
  createdAt: string;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface Bookmark {
  id: string;
  type: 'product' | 'review';
  name: string;
  image: string;
  rating?: number;
  createdAt: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'target' | 'trending-up' | 'award';
  earned: boolean;
  progress?: number;
  maxProgress?: number;
  earnedDate?: string;
}

interface ActivityItem {
  id: string;
  type: 'review' | 'like' | 'follow' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  avatar?: string;
}

interface UserProfileProps {
  user: User;
  reviews: ReviewType[];
  bookmarks: Bookmark[];
  achievements: Achievement[];
  activity: ActivityItem[];
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onEditProfile?: (userData: Partial<User>) => void;
  onLikeReview?: (reviewId: string) => void;
  onBookmarkReview?: (reviewId: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  reviews,
  bookmarks,
  achievements,
  activity,
  isOwnProfile,
  isFollowing = false,
  onFollow,
  onUnfollow,
  onEditProfile,
  onLikeReview,
  onBookmarkReview
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('reviews');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state - initialized with current user data
  const [formData, setFormData] = useState({
    displayName: user.displayName,
    bio: user.bio,
    location: user.location
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form data when user prop changes
  useEffect(() => {
    setFormData({
      displayName: user.displayName,
      bio: user.bio,
      location: user.location
    });
  }, [user.displayName, user.bio, user.location]);

  // Handle form field changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle avatar file selection
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('画像ファイルを選択してください');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ファイルサイズは5MB以下にしてください');
      return;
    }

    setAvatarFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Prepare data to save
      const updatedData: Partial<User> = {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location
      };

      // Include avatar if changed
      if (avatarPreview) {
        updatedData.avatar = avatarPreview;
      }

      console.log('Saving profile data:', updatedData);

      // Call the parent callback to update the data
      if (onEditProfile) {
        onEditProfile(updatedData);
      }

      // Reset form state after successful save
      setAvatarFile(null);
      setAvatarPreview('');

      // Show success message
      toast.success('プロフィールが更新されました！', {
        description: '変更が正常に保存されました。'
      });

      // Close modal
      setIsEditOpen(false);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('保存に失敗しました', {
        description: '再度お試しください。'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    // Reset form to current user values
    setFormData({
      displayName: user.displayName,
      bio: user.bio,
      location: user.location
    });
    setAvatarFile(null);
    setAvatarPreview('');
    setIsEditOpen(false);
  };

  // Check if form has changes
  const hasChanges = () => {
    return (
      formData.displayName !== user.displayName ||
      formData.bio !== user.bio ||
      formData.location !== user.location ||
      avatarPreview !== ''
    );
  };

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get achievement icon
  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'trophy': return Trophy;
      case 'star': return Star;
      case 'target': return Target;
      case 'trending-up': return TrendingUp;
      case 'award': return Award;
      default: return Trophy;
    }
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const unearnedAchievements = achievements.filter(a => !a.earned);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={user.avatar} alt={user.displayName} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 text-white">
                    {user.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 shadow-lg"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
                    {user.verified && (
                      <Badge variant="secondary" className="bg-primary text-white">
                        認証済み
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-auto">
                  {isOwnProfile ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => setIsEditOpen(true)}
                      >
                        <Edit3 className="w-4 h-4" />
                        プロフィール編集
                      </Button>
                      <Button variant="outline" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant={isFollowing ? "outline" : "default"}
                        onClick={isFollowing ? onUnfollow : onFollow}
                        className={isFollowing ? "" : "bg-primary hover:bg-primary/90"}
                      >
                        {isFollowing ? "フォロー中" : "フォロー"}
                      </Button>
                      <Button variant="outline">メッセージ</Button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio and Details */}
              <div className="space-y-2 mb-4">
                {user.bio && (
                  <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    参加日 {new Date(user.joinedDate).toLocaleDateString('ja-JP', { 
                      year: 'numeric',
                      month: 'long'
                    })}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(user.stats.followers)}</div>
                  <div className="text-sm text-muted-foreground">フォロワー</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(user.stats.following)}</div>
                  <div className="text-sm text-muted-foreground">フォロー中</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{formatNumber(user.stats.reviews)}</div>
                  <div className="text-sm text-muted-foreground">レビュー</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{formatNumber(user.stats.helpfulVotes)}</div>
                  <div className="text-sm text-muted-foreground">参考になった</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{formatNumber(user.stats.totalLikes)}</div>
                  <div className="text-sm text-muted-foreground">いいね</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Dialog open={isEditOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              プロフィール編集
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-gray-200">
                  <AvatarImage 
                    src={avatarPreview || user.avatar} 
                    alt="プロフィール画像" 
                  />
                  <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-primary/80 text-white">
                    {formData.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-600">写真をクリックして変更</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表示名 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="表示名を入力"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自己紹介
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="あなたについて教えてください..."
                  rows={4}
                  className="w-full resize-none"
                  maxLength={160}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {formData.bio.length}/160文字
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所在地
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="あなたの所在地"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={handleSave}
                disabled={isSaving || !hasChanges() || !formData.displayName.trim()}
                className="flex-1"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    保存中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    変更を保存
                  </div>
                )}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                キャンセル
              </Button>
            </div>

            {/* Status Messages */}
            {hasChanges() && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                未保存の変更があります
              </div>
            )}
            
            {!formData.displayName.trim() && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                表示名は必須です
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reviews" className="gap-2">
            <Star className="w-4 h-4" />
            レビュー
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="gap-2">
            <Bookmark className="w-4 h-4" />
            ブックマーク
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="w-4 h-4" />
            アクティビティ
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Trophy className="w-4 h-4" />
            実績
          </TabsTrigger>
        </TabsList>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          {reviews.length === 0 ? (
            <Card className="p-12 text-center">
              <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">まだレビューがありません</h3>
              <p className="text-muted-foreground">
                {isOwnProfile ? "商品レビューを投稿してみましょう！" : "このユーザーはまだレビューを投稿していません。"}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <Card key={review.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-100">
                    <img 
                      src={review.images[0] || review.productImage} 
                      alt={review.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <img 
                        src={review.productImage} 
                        alt={review.productName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{review.productName}</h3>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mb-2">{review.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{review.content}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => onLikeReview?.(review.id)}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Heart className={`w-4 h-4 ${review.isLiked ? 'fill-primary text-primary' : ''}`} />
                          {review.likes}
                        </button>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {review.comments}
                        </div>
                        <button 
                          onClick={() => onBookmarkReview?.(review.id)}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Bookmark className={`w-4 h-4 ${review.isBookmarked ? 'fill-primary text-primary' : ''}`} />
                          {review.bookmarks}
                        </button>
                      </div>
                      <span>{new Date(review.createdAt).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Bookmarks Tab */}
        <TabsContent value="bookmarks" className="space-y-4">
          {bookmarks.length === 0 ? (
            <Card className="p-12 text-center">
              <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">まだブックマークがありません</h3>
              <p className="text-muted-foreground">
                {isOwnProfile ? "気になる商品やレビューをブックマークしてみましょう！" : "このユーザーはまだブックマークを保存していません。"}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Bookmarks content would go here */}
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          {activity.length === 0 ? (
            <Card className="p-12 text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">まだアクティビティがありません</h3>
              <p className="text-muted-foreground">
                {isOwnProfile ? "レビューやフォローなどの活動をしてみましょう！" : "このユーザーの最近の活動はまだありません。"}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Activity content would go here */}
            </div>
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {achievements.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">まだ実績がありません</h3>
              <p className="text-muted-foreground">
                {isOwnProfile ? "レビューを投稿して実績を獲得しましょう！" : "このユーザーはまだ実績を獲得していません。"}
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {earnedAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    獲得済み実績
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Earned achievements would go here */}
                  </div>
                </div>
              )}
              
              {unearnedAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    未獲得実績
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Unearned achievements would go here */}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Mock data for demonstration
export const mockUserProfileData = {
  user: {
    id: '1',
    username: 'tech_reviewer_jp',
    displayName: '田中太郎',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    bio: '🎮 ゲーム愛好家 | 📱 テックレビュアー | ☕ コーヒー好き。正直なレビューで、より良い購買決定をお手伝いします！',
    location: '東京, 日本',
    joinedDate: '2023-01-15',
    verified: true,
    stats: {
      followers: 2547,
      following: 189,
      reviews: 156,
      helpfulVotes: 1243,
      totalLikes: 3891
    }
  },
  reviews: [
    {
      id: '1',
      productName: 'Sony WH-1000XM5',
      productImage: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
      rating: 5,
      title: '最高のノイズキャンセリングヘッドフォン！',
      content: 'ノイズキャンセリングが圧倒的で、音質もクリスタルクリア。バッテリーも一日中もちます。',
      images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop'],
      likes: 42,
      comments: 8,
      bookmarks: 15,
      createdAt: '2024-01-15',
      isLiked: false,
      isBookmarked: true
    },
    {
      id: '2',
      productName: 'MacBook Pro M3',
      productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
      rating: 4,
      title: '高性能だが高価',
      content: '動画編集や開発作業には最高の性能。M3チップは超高速ですが、価格は高めです。',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop'],
      likes: 38,
      comments: 12,
      bookmarks: 22,
      createdAt: '2024-01-10',
      isLiked: true,
      isBookmarked: false
    }
  ],
  bookmarks: [],
  achievements: [],
  activity: []
};