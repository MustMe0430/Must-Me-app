"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Search, Star, TrendingUp, Trophy, Medal, Award, Crown, Filter, AlertCircle } from "lucide-react";
import { 
  firestore, 
  collection, 
  query, 
  getDocs, 
  where,
  orderBy,
  limit,
  type QuerySnapshot, 
  type DocumentData 
} from "@/lib/firebase";

interface ProductRanking {
  id: string;
  name: string;
  reviewCount: number;
  rank: number;
  category?: string;
}

interface UserRanking {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  reviewCount: number;
  helpfulVotes: number;
  followers: number;
  rank: number;
  avgRating: number;
  specialBadge?: string;
}

const categories = ["すべて", "電子機器", "ゲーム", "ファッション", "家庭", "美容", "スポーツ", "自動車"];
const timePeriods = ["今日", "今週", "今月", "全期間"];

export const Rankings = () => {
  const [activeTab, setActiveTab] = useState("most-reviewed");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [selectedPeriod, setSelectedPeriod] = useState("全期間");
  const [productRankings, setProductRankings] = useState<ProductRanking[]>([]);
  const [userRankings, setUserRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Firestoreからランキングデータを取得
  const fetchProductRankings = async () => {
    setLoading(true);
    setError("");

    try {
      const reviewsRef = collection(firestore, "reviews");
      const q = query(
        reviewsRef,
        where("isPublic", "==", true)
      );
      
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      
      // 商品名ごとにレビュー数を集計
      const productCounts = new Map<string, number>();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const productName = data.productName;
        
        if (productName) {
          const currentCount = productCounts.get(productName) || 0;
          productCounts.set(productName, currentCount + 1);
        }
      });

      // レビュー数でソートし、ランキング形式に変換
      const rankingsArray: ProductRanking[] = [];
      let rank = 1;
      
      Array.from(productCounts.entries())
        .sort((a, b) => b[1] - a[1])  // レビュー数の降順でソート
        .forEach(([productName, reviewCount]) => {
          rankingsArray.push({
            id: `product-${rank}`,
            name: productName,
            reviewCount,
            rank,
            category: "その他" // カテゴリは後で拡張可能
          });
          rank++;
        });

      setProductRankings(rankingsArray);
      
    } catch (err) {
      console.error("ランキング取得エラー:", err);
      setError("ランキングデータの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // ユーザーランキングを取得（モック）
  const fetchUserRankings = async () => {
    // 実際の実装では、usersコレクションとreviewsコレクションを
    // 組み合わせてユーザーごとの統計を計算
    const mockUserRankings: UserRanking[] = [
      {
        id: "1",
        username: "@techreviewpro",
        displayName: "田中 太郎",
        avatar: "/api/placeholder/60/60",
        reviewCount: 247,
        helpfulVotes: 1234,
        followers: 567,
        rank: 1,
        avgRating: 4.2,
        specialBadge: "エキスパート レビュアー"
      },
      {
        id: "2",
        username: "@gadgetguru",
        displayName: "佐藤 花子",
        avatar: "/api/placeholder/60/60",
        reviewCount: 123,
        helpfulVotes: 890,
        followers: 432,
        rank: 2,
        avgRating: 4.0,
        specialBadge: "認証済み購入者"
      }
    ];
    
    setUserRankings(mockUserRankings);
  };

  useEffect(() => {
    if (activeTab === "most-reviewed") {
      fetchProductRankings();
    } else if (activeTab === "top-reviewers") {
      fetchUserRankings();
    }
  }, [activeTab]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600";
      default:
        return "bg-muted";
    }
  };

  const ProductCard = ({ product }: { product: ProductRanking }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full ${getRankBadgeColor(product.rank)} flex items-center justify-center text-white font-bold text-sm z-10`}>
              {product.rank}
            </div>
            <div className="w-20 h-20 bg-gray-100 rounded-lg border flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              {getRankIcon(product.rank)}
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {product.reviewCount} レビュー
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">#{product.rank}</span>
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">人気</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const UserCard = ({ user }: { user: UserRanking }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full ${getRankBadgeColor(user.rank)} flex items-center justify-center text-white font-bold text-sm z-10`}>
              {user.rank}
            </div>
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              {getRankIcon(user.rank)}
              {user.specialBadge && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {user.specialBadge}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg">{user.displayName}</h3>
            <p className="text-sm text-muted-foreground">{user.username}</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-primary">{user.reviewCount.toLocaleString()}</div>
                <div className="text-muted-foreground">レビュー</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{user.helpfulVotes.toLocaleString()}</div>
                <div className="text-muted-foreground">参考になった</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">{user.followers.toLocaleString()}</div>
                <div className="text-muted-foreground">フォロワー</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>平均評価</span>
                <span className="font-medium">{user.avgRating}/5.0</span>
              </div>
              <Progress value={user.avgRating * 20} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const filteredProductRankings = productRankings.filter(product =>
    searchTerm === "" || product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Trophy className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">ランキング</h1>
            <p className="text-muted-foreground">人気商品とトップレビュアーを発見</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ランキングを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              カテゴリ
            </Button>
            <Button variant="outline" size="sm">
              期間
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="most-reviewed" className="flex items-center space-x-2">
            <span>最多レビュー</span>
          </TabsTrigger>
          <TabsTrigger value="highest-rated" className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>最高評価</span>
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>トレンド</span>
          </TabsTrigger>
          <TabsTrigger value="top-reviewers" className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>トップレビュアー</span>
          </TabsTrigger>
        </TabsList>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {timePeriods.map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </Button>
          ))}
        </div>

        {loading && (
          <Card className="p-8 text-center">
            <div className="animate-pulse">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">ランキングを読み込み中...</p>
            </div>
          </Card>
        )}

        {error && (
          <Card className="p-8 text-center border-red-200 bg-red-50">
            <div className="flex items-center justify-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        <TabsContent value="most-reviewed">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">最多レビュー商品</h2>
              <Badge variant="secondary">{filteredProductRankings.length} 商品</Badge>
            </div>
            {filteredProductRankings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {filteredProductRankings.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : !loading && !error && (
              <Card className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">ランキングデータなし</h3>
                <p className="text-muted-foreground">
                  まだレビューデータが不足しています。レビューを投稿してランキングを作りましょう！
                </p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="highest-rated">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">最高評価商品</h2>
              <Badge variant="secondary">データ準備中</Badge>
            </div>
            <Card className="p-12 text-center">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">準備中</h3>
              <p className="text-muted-foreground">
                評価ランキング機能は準備中です。
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">トレンド商品</h2>
              <Badge variant="secondary">データ準備中</Badge>
            </div>
            <Card className="p-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">準備中</h3>
              <p className="text-muted-foreground">
                トレンドランキング機能は準備中です。
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="top-reviewers">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">トップレビュアー</h2>
              <Badge variant="secondary">{userRankings.length} レビュアー</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {userRankings.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {searchTerm && filteredProductRankings.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <Search className="w-16 h-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-xl font-semibold">結果が見つかりません</h3>
              <p className="text-muted-foreground">検索条件やフィルターを調整してください</p>
            </div>
            <Button onClick={() => setSearchTerm("")}>検索をクリア</Button>
          </div>
        </Card>
      )}
    </div>
  );
};