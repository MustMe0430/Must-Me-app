"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark,
  MoreHorizontal,
  Star,
  ThumbsUp,
  Eye,
  Calendar,
  MapPin,
  ShoppingBag
} from 'lucide-react';

interface Comment {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  userId: string;
}

interface Post {
  id: string;
  user: {
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
  };
  userId: string;
  content: {
    text: string;
    images?: string[];
    rating?: number;
    product?: {
      name: string;
      brand: string;
      category: string;
      price?: number;
    };
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  userStats?: {
    hasLiked: boolean;
    hasBookmarked: boolean;
  };
  timestamp: string;  
  location?: string;
  tags?: string[];
  comments: Comment[];
}

export const InstagramFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize with mock data - in real app, this would fetch from Firestore
    const mockPosts: Post[] = [
      {
        id: '1',
        userId: 'user1',
        user: {
          name: '田中美咲',
          username: 'misaki_reviews',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face',
          verified: true
        },
        content: {
          text: 'このワイヤレスイヤホン、本当に最高です！🎧✨ 音質もバッテリー持ちも期待以上でした。特に通勤時の使用では、ノイズキャンセリング機能が素晴らしく、音楽に集中できます。デザインもシンプルで気に入っています。',
          images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop'],
          rating: 5,
          product: {
            name: 'AirPods Pro 2nd Generation',
            brand: 'Apple',
            category: 'オーディオ',
            price: 39800
          }
        },
        engagement: {
          likes: 234,
          comments: 45, 
          shares: 12,
          views: 1205
        },
        userStats: {
          hasLiked: false,
          hasBookmarked: false
        },
        timestamp: '2024-01-15T10:30:00Z',
        location: '東京都渋谷区',
        tags: ['#AirPods', '#Apple', '#ワイヤレスイヤホン', '#レビュー'],
        comments: [
          {
            id: 'c1',
            userId: 'user2',
            user: {
              name: '佐藤健太',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
            },
            text: '私も同じの使ってます！本当に音質いいですよね〜',
            timestamp: '2024-01-15T11:15:00Z',
            likes: 12
          },
          {
            id: 'c2',
            userId: 'user3',
            user: {
              name: '山田花子',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
            },
            text: 'バッテリーどのくらい持ちますか？',
            timestamp: '2024-01-15T12:00:00Z',
            likes: 8
          }
        ]
      },
      {
        id: '2',
        userId: 'user4',
        user: {
          name: '鈴木大輔',
          username: 'daisuke_gadgets',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        content: {
          text: 'MacBook Air M2を1ヶ月使ってみた感想です💻 軽さと性能のバランスが絶妙で、持ち運びが楽になりました。バッテリーも一日中持つので、外出先での作業が快適です。学生や軽作業メインの方には特におすすめ！',
          images: [
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop'
          ],
          rating: 4,
          product: {
            name: 'MacBook Air M2',
            brand: 'Apple',
            category: 'ノートPC',
            price: 164800
          }
        },
        engagement: {
          likes: 567,
          comments: 89,
          shares: 34,
          views: 2341
        },
        userStats: {
          hasLiked: true,
          hasBookmarked: true
        },
        timestamp: '2024-01-14T15:45:00Z',
        tags: ['#MacBook', '#M2', '#Apple', '#ノートPC'],
        comments: [
          {
            id: 'c3',
            userId: 'user5',
            user: {
              name: '高橋優子',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
            },
            text: 'M1とM2で体感的な差はありますか？',
            timestamp: '2024-01-14T16:20:00Z',
            likes: 23
          }
        ]
      },
      {
        id: '3',
        userId: 'user6',
        user: {
          name: '中村さくら',
          username: 'sakura_beauty',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
          verified: true
        },
        content: {
          text: 'この美容液、使い始めて2週間ですが肌の調子が本当に良くなりました✨ 特に夜使うと翌朝の肌がもちもちになります。価格は少し高めですが、効果を考えると納得の品質です。敏感肌の方にもおすすめ！',
          images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop'],
          rating: 5,
          product: {
            name: 'エスティローダー アドバンス ナイトリペア',
            brand: 'エスティローダー',
            category: 'スキンケア',
            price: 11000
          }
        },
        engagement: {
          likes: 423,
          comments: 67,
          shares: 18,
          views: 1876
        },
        userStats: {
          hasLiked: false,
          hasBookmarked: true
        },
        timestamp: '2024-01-13T20:15:00Z',
        tags: ['#美容液', '#スキンケア', '#エスティローダー'],
        comments: []
      }
    ];

    setPosts(mockPosts);
    setLoading(false);
  }, []);

  const handleLike = async (postId: string) => {
    if (!user) return;

    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const hasLiked = post.userStats?.hasLiked || false;
          return {
            ...post,
            engagement: {
              ...post.engagement,
              likes: hasLiked ? post.engagement.likes - 1 : post.engagement.likes + 1
            },
            userStats: {
              ...post.userStats,
              hasLiked: !hasLiked,
              hasBookmarked: post.userStats?.hasBookmarked || false
            }
          };
        }
        return post;
      })
    );
  };

  const handleBookmark = async (postId: string) => {
    if (!user) return;

    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const hasBookmarked = post.userStats?.hasBookmarked || false;
          return {
            ...post,
            userStats: {
              ...post.userStats,
              hasLiked: post.userStats?.hasLiked || false,
              hasBookmarked: !hasBookmarked
            }
          };
        }
        return post;
      })
    );
  };

  const handleComment = async (postId: string) => {
    if (!user || !commentTexts[postId]?.trim()) return;

    const newComment: Comment = {
      id: `${Date.now()}`,
      userId: user.uid,
      user: {
        name: user.displayName || 'ユーザー',
        avatar: user.photoURL || undefined
      },
      text: commentTexts[postId].trim(),
      timestamp: new Date().toISOString(),
      likes: 0
    };

    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
            engagement: {
              ...post.engagement,
              comments: post.engagement.comments + 1
            }
          };
        }
        return post;
      })
    );

    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '今';
    if (diffInHours < 24) return `${diffInHours}時間前`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}日前`;
    
    return time.toLocaleDateString('ja-JP');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-48 bg-gray-200 rounded mt-4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {posts.map((post) => (
        <Card key={post.id} className="border-0 shadow-md">
          {/* Post Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.user.avatar} alt={post.user.name} />
                  <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                    {post.user.verified && (
                      <Badge variant="secondary" className="text-xs">認証済み</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>@{post.user.username}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(post.timestamp)}</span>
                    {post.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{post.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          {post.content.product && (
            <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4 text-orange-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{post.content.product.name}</h4>
                    <p className="text-sm text-gray-600">{post.content.product.brand} • {post.content.product.category}</p>
                  </div>
                </div>
                {post.content.rating && (
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`w-4 h-4 ${
                          i < post.content.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm font-medium ml-1">{post.content.rating}</span>
                  </div>
                )}
              </div>
              {post.content.product.price && (
                <p className="text-sm text-orange-600 mt-1">
                  ¥{post.content.product.price.toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Post Content */}
          <div className="p-4">
            <p className="text-gray-900 mb-4 leading-relaxed">{post.content.text}</p>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Images */}
            {post.content.images && post.content.images.length > 0 && (
              <div className={`grid gap-2 mb-4 ${
                post.content.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}>
                {post.content.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.engagement.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{post.engagement.likes} いいね</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{post.engagement.comments} コメント</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatTimeAgo(post.timestamp)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-2 ${
                    post.userStats?.hasLiked ? 'text-red-500' : 'text-gray-600'
                  }`}
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      post.userStats?.hasLiked ? 'fill-current' : ''
                    }`} 
                  />
                  <span>{post.engagement.likes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center space-x-2 text-gray-600"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.engagement.comments}</span>
                </Button>

                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBookmark(post.id)}
                className={`${
                  post.userStats?.hasBookmarked ? 'text-orange-500' : 'text-gray-600'
                }`}
              >
                <Bookmark 
                  className={`w-5 h-5 ${
                    post.userStats?.hasBookmarked ? 'fill-current' : ''
                  }`} 
                />
              </Button>
            </div>

            {/* Comments Section */}
            {showComments[post.id] && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {post.comments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{comment.user.name}</span>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900">{comment.text}</p>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <Button variant="ghost" size="sm" className="text-xs text-gray-500 h-6 px-1">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs text-gray-500 h-6 px-1">
                              返信
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                {user && (
                  <div className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'ユーザー'} />
                      <AvatarFallback>{(user.displayName || 'U').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex space-x-2">
                      <Input
                        placeholder="コメントを追加..."
                        value={commentTexts[post.id] || ''}
                        onChange={(e) => 
                          setCommentTexts(prev => ({ 
                            ...prev, 
                            [post.id]: e.target.value 
                          }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleComment(post.id);
                          }
                        }}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleComment(post.id)}
                        disabled={!commentTexts[post.id]?.trim()}
                        className="px-3"
                      >
                        投稿
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};