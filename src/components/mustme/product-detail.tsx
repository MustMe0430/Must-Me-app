"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Star, 
  MoreHorizontal, 
  Plus,
  Send,
  ChevronLeft,
  ShoppingCart,
  BarChart3,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { 
  fetchReviewStats, 
  fetchReviewList, 
  updateReviewLikes,
  updateReviewHelpful,
  type MustMeReview, 
  type ReviewStats 
} from '@/lib/api/mustme-reviews';

// TypeScript interfaces
interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isVerified?: boolean;
}

interface Product {
  id: string;
  itemCode?: string; // Rakuten itemCode for linking reviews
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  description: string;
  category: string;
  averageRating: number;
  totalReviews: number;
  tags: string[];
  specifications: Record<string, string>;
}

interface ProductDetailProps {
  product?: Product;
  isLoading?: boolean;
  onLike?: (reviewId: string) => void;
  onBookmark?: (reviewId: string) => void;
  onComment?: (reviewId: string, comment: string) => void;
  onWriteReview?: () => void;
  onShare?: (reviewId: string) => void;
  onAddToCart?: () => void;
}

// Mock data
const mockProduct: Product = {
  id: "1",
  itemCode: "item123", // Add itemCode for linking to MustMe reviews
  name: "プレミアム ワイヤレス ヘッドフォン",
  brand: "SoundMax",
  price: 48000,
  originalPrice: 64000,
  image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
  images: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&h=800&fit=crop"
  ],
  description: "アクティブノイズキャンセリングと30時間のバッテリー寿命を特徴とする最新のワイヤレスヘッドフォンで、プレミアムな音質をお楽しみください。",
  category: "電子機器",
  averageRating: 4.6,
  totalReviews: 1247,
  tags: ["ワイヤレス", "ノイズキャンセル", "プレミアム", "快適"],
  specifications: {
    "バッテリー寿命": "30時間",
    "接続": "Bluetooth 5.0",
    "重量": "250g",
    "保証": "2年"
  }
};

const StarRating: React.FC<{ rating: number; size?: "sm" | "md" | "lg" }> = ({ rating, size = "sm" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

const MustMeReviewCard: React.FC<{
  review: MustMeReview;
  onLike: (reviewId: string) => void;
  onHelpful: (reviewId: string) => void;
  onShare: (reviewId: string) => void;
}> = ({ review, onLike, onHelpful, onShare }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");

  const handleSubmitComment = () => {
    if (comment.trim()) {
      // Handle comment submission
      console.log(`Comment submitted:`, comment);
      setComment("");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}年${month}月${day}日`;
  };

  // Mock comments for demonstration
  const mockComments = [
    {
      id: `${review.id}-comment-1`,
      user: {
        name: "山田太郎",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yamada"
      },
      content: "とても詳しいレビューで参考になりました！",
      timestamp: "2024-01-15T10:30:00Z",
      likes: 3
    },
    {
      id: `${review.id}-comment-2`,
      user: {
        name: "鈴木花子",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki"
      },
      content: "私も同じ商品を使っていますが、同感です。",
      timestamp: "2024-01-15T11:45:00Z",
      likes: 1
    }
  ];

  return (
    <Card className="border-0 shadow-none bg-white">
      <CardContent className="p-0">
        <div className="p-4 space-y-4">
          {/* User info at the top */}
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userId}`} />
              <AvatarFallback>{review.userId[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-900">ユーザー{review.userId.slice(-4)}</span>
              </div>
              <div className="font-medium text-base text-gray-600">
                {formatTimeAgo(review.createdAt)}
              </div>
            </div>
            {!review.isPublic && (
              <Badge variant="outline">非公開</Badge>
            )}
          </div>

          {/* Product name */}
          <h3 className="text-lg font-bold text-gray-900">プレミアム ワイヤレス ヘッドフォン</h3>

          {/* Star rating with score */}
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size="md" />
            <span className="font-semibold text-base text-gray-900">{review.rating}/5</span>
          </div>

          {/* Review content */}
          <div className="space-y-3">
            {review.title && (
              <h4 className="font-semibold text-gray-900">{review.title}</h4>
            )}
            <p className="text-gray-700 leading-relaxed">{review.content}</p>
          </div>

          {/* Review images */}
          {review.images && review.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 max-w-sm">
              {review.images.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={imageUrl}
                    alt="レビュー画像"
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Location and purchase source */}
          {(review.location || review.purchaseSource) && (
            <div className="text-sm text-gray-600 space-y-1">
              {review.location && (
                <div>📍 {review.location}</div>
              )}
              {review.purchaseSource && (
                <div>🛍️ {review.purchaseSource}で購入</div>
              )}
            </div>
          )}

          {/* Tags */}
          {review.tags && review.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {review.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-1">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(review.id)}
                className="p-2 hover:bg-gray-100 text-gray-700"
              >
                <Heart className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className={`p-2 hover:bg-gray-100 ${showComments ? 'text-blue-500' : 'text-gray-700'}`}
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare(review.id)}
                className="p-2 hover:bg-gray-100 text-gray-700"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onHelpful(review.id)}
                className="text-xs font-medium text-gray-600 hover:bg-gray-100 px-2 py-1"
              >
                参考になった ({review.helpful})
              </Button>
            </div>
          </div>

          <div className="mt-2">
            <button className="text-sm font-medium text-gray-900">
              {review.likes} いいね
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {/* Existing Comments */}
              <div className="space-y-4 mb-4">
                {mockComments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                      <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900">{comment.user.name}</span>
                          <span className="text-xs text-gray-500">{formatTimeAgo(comment.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="text-xs text-gray-500 hover:text-orange-500">
                          いいね ({comment.likes})
                        </button>
                        <button className="text-xs text-gray-500 hover:text-blue-500">
                          返信
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face" />
                  <AvatarFallback>Y</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="コメントを追加..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[60px] resize-none"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      onClick={handleSubmitComment}
                      disabled={!comment.trim()}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      投稿
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product = mockProduct,
  isLoading = false,
  onLike = () => {},
  onBookmark = () => {},
  onComment = () => {},
  onWriteReview = () => {},
  onShare = () => {},
  onAddToCart = () => {}
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  
  // MustMe review state
  const [mustMeReviews, setMustMeReviews] = useState<MustMeReview[]>([]);
  const [mustMeStats, setMustMeStats] = useState<ReviewStats | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch MustMe reviews
  useEffect(() => {
    if (product.itemCode) {
      setReviewsLoading(true);
      
      Promise.all([
        fetchReviewStats(product.itemCode),
        fetchReviewList(product.itemCode, { 
          page: currentPage, 
          pageSize: showAllReviews ? 50 : 3,
          filterRating: filterRating || undefined 
        })
      ])
      .then(([stats, reviewList]) => {
        setMustMeStats(stats);
        setMustMeReviews(reviewList.reviews);
        setReviewsError(null);
      })
      .catch(err => {
        setReviewsError(err.message);
        // Keep existing reviews on error
      })
      .finally(() => setReviewsLoading(false));
    }
  }, [product.itemCode, showAllReviews, filterRating, currentPage]);

  const handleLike = async (reviewId: string) => {
    try {
      const updatedReview = await updateReviewLikes(reviewId);
      setMustMeReviews(prev => 
        prev.map(review => review.id === reviewId ? updatedReview : review)
      );
    } catch (error) {
      console.error('Failed to update likes:', error);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      const updatedReview = await updateReviewHelpful(reviewId);
      setMustMeReviews(prev => 
        prev.map(review => review.id === reviewId ? updatedReview : review)
      );
    } catch (error) {
      console.error('Failed to update helpful:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="max-w-md mx-auto bg-white">
          <div className="aspect-square bg-gray-200"></div>
          <div className="p-4 space-y-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Use MustMe stats if available, otherwise fall back to product stats
  const displayRating = mustMeStats?.averageRating || product.averageRating;
  const displayReviewCount = mustMeStats?.totalReviews || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-lg truncate">{product.name}</h1>
          <Button variant="ghost" size="sm">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Product Images */}
        <div className="relative aspect-square bg-gray-100">
          <Image
            src={product.images[activeImageIndex]}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.originalPrice && (
            <Badge className="absolute top-4 left-4 bg-red-500 text-white">
              -{discountPercentage}%
            </Badge>
          )}
          
          {/* Image indicators */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 bg-white">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="font-bold text-xl text-gray-900 mb-1">{product.name}</h2>
              <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1">
                  <StarRating rating={displayRating} size="md" />
                  <span className="font-medium text-lg">{displayRating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500 text-sm">
                  ({displayReviewCount} MustMeレビュー)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-primary">¥{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">¥{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
            </div>
            
            <Button variant="ghost" size="sm">
              <Bookmark className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed mb-4">{product.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={onAddToCart} className="flex-1 bg-primary hover:bg-orange-600">
              <ShoppingCart className="w-4 h-4 mr-2" />
              カートに追加
            </Button>
            <Button variant="outline" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              比較
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white border-t p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{displayReviewCount}</div>
              <div className="text-sm text-gray-600">MustMeレビュー</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{displayRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">平均評価</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mustMeStats ? Math.round((mustMeStats.ratingDistribution[4] + mustMeStats.ratingDistribution[5]) / Math.max(mustMeStats.totalReviews, 1) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">推奨</div>
            </div>
          </div>
        </div>

        {/* MustMe Reviews Section */}
        <div className="bg-white border-t">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">MustMeレビュー ({displayReviewCount})</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="flex gap-2 mb-4">
              <Button
                size="sm"
                variant={filterRating === null ? "default" : "outline"}
                onClick={() => setFilterRating(null)}
                className="text-xs"
              >
                すべて
              </Button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Button
                  key={rating}
                  size="sm"
                  variant={filterRating === rating ? "default" : "outline"}
                  onClick={() => setFilterRating(rating)}
                  className="text-xs"
                >
                  {rating}★
                </Button>
              ))}
            </div>
          </div>

          {/* Review List */}
          {reviewsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">レビューを読み込み中...</p>
            </div>
          ) : reviewsError && mustMeReviews.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-4">レビューはまだありません</p>
              <Button
                onClick={onWriteReview}
                variant="outline"
                className="text-primary border-primary hover:bg-primary hover:text-white"
              >
                最初のレビュワーになる
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {mustMeReviews.map((review) => (
                <MustMeReviewCard
                  key={review.id}
                  review={review}
                  onLike={handleLike}
                  onHelpful={handleHelpful}
                  onShare={onShare}
                />
              ))}
            </div>
          )}

          {mustMeReviews.length > 0 && !showAllReviews && displayReviewCount > 3 && (
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAllReviews(true)}
              >
                すべての {displayReviewCount} レビューを表示
              </Button>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={onWriteReview}
            className="w-14 h-14 rounded-full bg-primary hover:bg-orange-600 shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;