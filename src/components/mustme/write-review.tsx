"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Star, 
  Upload, 
  X, 
  Search, 
  MapPin, 
  Eye, 
  Save, 
  Send,
  ImagePlus,
  Tag,
  Plus,
  AlertCircle,
  ArrowLeft,
  ChevronUp
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { 
  firestore, 
  storage,
  auth,
  collection, 
  addDoc, 
  doc,
  getDoc,
  ref,
  uploadBytes,
  getDownloadURL,
  serverTimestamp
} from "@/lib/firebase";
import { useIdGenerator } from "@/lib/utils/safe-id";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  itemCode: string;
  name: string;
  brand: string;
  image: string;
  category: string;
  price: number;
  currency: string;
}

interface ReviewImage {
  id: string;
  file: File;
  url: string;
}

interface WriteReviewProps {
  selectedProduct?: Product | string;
  onReviewSubmitted?: (review: any) => void;
}

const mockProducts: Product[] = [
  {
    id: "1",
    itemCode: "item123",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1512499617640-c2f999ca6a8e?w=400&h=400&fit=crop&crop=center",
    category: "電子機器",
    price: 189800,
    currency: "¥"
  },
  {
    id: "2",
    itemCode: "item456",
    name: "Nike Air Max 90",
    brand: "Nike",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center",
    category: "シューズ",
    price: 15400,
    currency: "¥"
  },
  {
    id: "3",
    itemCode: "item789",
    name: "MacBook Pro 16インチ",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=center",
    category: "電子機器",
    price: 348800,
    currency: "¥"
  }
];

const suggestedTags = [
  "高品質", "配送迅速", "コスパ良い", "優秀なサービス", 
  "使いやすい", "耐久性", "スタイリッシュ", "快適"
];

const purchaseSources = [
  "Rakuten", "Amazon", "ヨドバシカメラ", "ビックカメラ", "Apple Store", 
  "公式サイト", "実店舗", "その他"
];

export const WriteReview: React.FC<WriteReviewProps> = ({
  selectedProduct: initialProduct,
  onReviewSubmitted
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const generateId = useIdGenerator({ prefix: 'review-img' });

  // Hydration safety state
  const [isClient, setIsClient] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Form state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductResults, setShowProductResults] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ReviewImage[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [location, setLocation] = useState("");
  const [purchaseSource, setPurchaseSource] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize client-side state and initial product selection
  useEffect(() => {
    setIsClient(true);
    
    // Initialize product selection safely on client-side
    if (initialProduct) {
      if (typeof initialProduct === 'string') {
        const foundProduct = mockProducts.find(product => product.itemCode === initialProduct);
        if (foundProduct) {
          setSelectedProduct(foundProduct);
          setSearchQuery(foundProduct.name);
        }
      } else {
        setSelectedProduct(initialProduct);
        setSearchQuery(initialProduct.name);
      }
    }
  }, [initialProduct]);

  // Scroll tracking for "scroll to top" functionality
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient]);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  // Navigation function using Next.js router
  const handleBackToHome = useCallback(() => {
    router.push('/');
  }, [router]);

  // Test Firebase connection function
  const testFirebaseConnection = useCallback(async () => {
    if (!isClient) return;
    
    try {
      console.log("=== Firebase Connection Test ===");
      
      // Test authentication
      console.log("Auth current user:", auth.currentUser);
      console.log("Context user:", user);
      
      // Test Firestore connection
      const testCollection = collection(firestore, "reviews");
      console.log("✅ Firestore collection reference created:", testCollection);
      
      // Test if we can create a document reference (doesn't write anything)
      const testDocRef = doc(testCollection);
      console.log("✅ Test document reference created:", testDocRef.id);
      
      // Test Firebase Storage access
      if (user) {
        const testStorageRef = ref(storage, `reviews/${user.uid}/test-connection-image.jpg`);
        console.log("✅ Storage reference created:", testStorageRef.fullPath);
        console.log("📂 Storage path validation successful");
      }
      
      toast.success("Firebase接続テストが成功しました！", {
        description: "コンソールで詳細を確認してください。"
      });
      
    } catch (error) {
      console.error("❌ Firebase connection test failed:", error);
      toast.error("Firebase接続テストに失敗しました", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  }, [user, isClient]);

  // Test image upload function (for debugging)
  const testImageUpload = useCallback(async () => {
    if (!isClient || !user) {
      toast.error("ログインが必要です");
      return;
    }

    if (images.length === 0) {
      toast.error("テスト用の画像を選択してください");
      return;
    }

    try {
      console.log("=== Test Image Upload ===");
      const testImage = images[0];
      
      // Create test upload path
      const timestamp = Date.now();
      const fileName = `test_${timestamp}.jpg`;
      const storagePath = `reviews/${user.uid}/images/${fileName}`;
      
      console.log("🔄 テスト画像をアップロード中...");
      console.log("📂 パス:", storagePath);
      console.log("📁 ファイル:", testImage.file.name, testImage.file.size, testImage.file.type);
      
      // Upload to Firebase Storage
      const imageRef = ref(storage, storagePath);
      const uploadResult = await uploadBytes(imageRef, testImage.file);
      console.log("✅ アップロード完了:", uploadResult.ref.fullPath);
      
      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);
      console.log("🔗 ダウンロードURL:", downloadURL);
      
      // Test Firestore save
      const testReviewData = {
        testUpload: true,
        userId: user.uid,
        imageUrl: downloadURL,
        images: [downloadURL],
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(firestore, "reviews"), testReviewData);
      console.log("✅ Firestore保存完了:", docRef.id);
      
      toast.success("テストアップロード成功！", {
        description: `Storage: ${uploadResult.ref.fullPath}`
      });
      
    } catch (error) {
      console.error("❌ テストアップロード失敗:", error);
      toast.error("テストアップロードに失敗", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  }, [user, images, isClient]);

  // Safe debug logging with client-side check
  useEffect(() => {
    if (!isClient || !user) return;
    
    console.log("=== WriteReview Debug Information ===");
    console.log("User state:", user);
    console.log("User exists:", !!user);
    console.log("User details:", {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified
    });
    console.log("Firebase auth state:", !!auth.currentUser);
    console.log("Current URL:", window.location.href);
  }, [user, isClient]);

  // Memoize filtered products to prevent unnecessary recalculation
  const filteredProducts = React.useMemo(() => 
    mockProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const validateForm = useCallback((): boolean => {
    if (!user) {
      console.error("認証エラー: ユーザーがログインしていません");
      toast.error("ログインが必要です");
      return false;
    }

    console.log("認証状態:", { 
      uid: user.uid, 
      email: user.email, 
      displayName: user.displayName 
    });

    const newErrors: Record<string, string> = {};

    if (!selectedProduct) {
      console.error("バリデーションエラー: 商品が選択されていません");
      newErrors.product = "商品を選択してください";
    }
    if (rating === 0) {
      console.error("バリデーションエラー: 評価が選択されていません");
      newErrors.rating = "評価を入力してください";
    }
    if (title.trim().length < 5) {
      console.error("バリデーションエラー: タイトルが短すぎます", { titleLength: title.trim().length });
      newErrors.title = "タイトルは5文字以上で入力してください";
    }
    if (content.trim().length < 20) {
      console.error("バリデーションエラー: レビュー内容が短すぎます", { contentLength: content.trim().length });
      newErrors.content = "レビューは20文字以上で入力してください";
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    if (isValid) {
      console.log("バリデーション成功: すべての必須項目が入力されています");
    } else {
      console.error("バリデーション失敗:", newErrors);
    }
    
    return isValid;
  }, [selectedProduct, rating, title, content, user]);

  const handleImageUpload = useCallback((files: FileList) => {
    if (!isClient) return;
    
    const newImages: ReviewImage[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && images.length + newImages.length < 5) {
        const id = generateId();
        const url = URL.createObjectURL(file);
        newImages.push({ id, file, url });
      }
    });

    setImages(prev => [...prev, ...newImages]);
  }, [images.length, generateId, isClient]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  }, [handleImageUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImageUpload(e.target.files);
    }
  }, [handleImageUpload]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove && isClient) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== id);
    });
  }, [isClient]);

  const addTag = useCallback((tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 8) {
      setTags(prev => [...prev, tag]);
    }
  }, [tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const handleCustomTagAdd = useCallback(() => {
    if (customTag.trim()) {
      addTag(customTag.trim());
      setCustomTag("");
    }
  }, [customTag, addTag]);

  // 修正されたFirebase Storage画像アップロード関数
  const uploadImages = useCallback(async (imageFiles: ReviewImage[]): Promise<string[]> => {
    if (!user || imageFiles.length === 0) {
      console.log("画像アップロードをスキップ: ユーザーなしまたは画像なし");
      return [];
    }

    console.log(`📸 ${imageFiles.length}枚の画像をFirebase Storageにアップロード開始...`);
    setUploadingImages(true);

    const uploadPromises = imageFiles.map(async (img, index) => {
      try {
        // より具体的なパスとファイル名を作成
        const timestamp = Date.now();
        const fileExtension = img.file.name.split('.').pop() || 'jpg';
        const fileName = `${timestamp}_${index}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
        
        // Firebase Storage rules に準拠したパス構造 - reviews配下に配置
        const storagePath = `reviews/${user.uid}/images/${fileName}`;
        
        console.log(`🔄 画像 ${index + 1}/${imageFiles.length} をアップロード中...`);
        console.log(`📂 保存パス: ${storagePath}`);
        console.log(`📁 ファイル情報:`, {
          name: img.file.name,
          size: img.file.size,
          type: img.file.type
        });

        // Firebase Storageのrefを作成
        const imageRef = ref(storage, storagePath);
        
        // ファイルをアップロード
        const uploadResult = await uploadBytes(imageRef, img.file);
        console.log(`✅ 画像 ${index + 1} アップロード完了:`, uploadResult.ref.fullPath);
        
        // ダウンロードURLを取得
        const downloadURL = await getDownloadURL(imageRef);
        console.log(`🔗 画像 ${index + 1} ダウンロードURL取得:`, downloadURL);
        
        return downloadURL;
      } catch (error) {
        console.error(`❌ 画像 ${index + 1} アップロード失敗:`, error);
        console.error(`Error details:`, {
          message: error instanceof Error ? error.message : String(error),
          code: (error as any)?.code,
          serverResponse: (error as any)?.serverResponse
        });
        
        // Storage rules 関連のエラーの場合は詳細ログを出力
        if ((error as any)?.code === 'storage/unauthorized') {
          console.error("🔒 Storage rules によりアクセスが拒否されました。ユーザー認証とパス構造を確認してください。");
          console.error("Expected path format: reviews/{userId}/images/{imageId}");
          console.error("Current user UID:", user.uid);
          console.error("Attempted path:", `reviews/${user.uid}/images/${fileName}`);
        }
        
        throw new Error(`画像 ${index + 1} のアップロードに失敗: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      console.log("🎉 全ての画像のアップロードが完了しました:");
      uploadedUrls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
      
      setUploadingImages(false);
      return uploadedUrls;
    } catch (error) {
      console.error("❌ 画像アップロードの一部または全部が失敗しました:", error);
      setUploadingImages(false);
      throw error;
    }
  }, [user]);

  const handleSubmit = useCallback(async () => {
    console.log("=== Starting Review Submission ===");
    
    // Enhanced validation logging
    if (!user) {
      console.error("❌ 認証エラー: ユーザーがログインしていません");
      console.log("User state:", user);
      console.log("auth.currentUser:", auth.currentUser);
      toast.error("ログインが必要です。ページをリロードして再度ログインしてください。");
      return;
    }

    if (!validateForm()) {
      console.error("❌ バリデーションに失敗しました");
      return;
    }

    setIsSubmitting(true);
    console.log("✅ バリデーション成功、投稿処理を開始します");
    
    try {
      // Log current auth state
      console.log("Current auth user:", auth.currentUser);
      console.log("Context user:", user);
      
      // Test Firebase connection
      try {
        const testQuery = collection(firestore, "reviews");
        console.log("✅ Firebase接続テスト成功:", testQuery);
      } catch (dbError) {
        console.error("❌ Firebase接続エラー:", dbError);
        throw new Error("データベース接続に失敗しました");
      }

      // Firebase Storageに実際の画像をアップロード
      let uploadedImageUrls: string[] = [];
      
      if (images.length > 0) {
        try {
          console.log(`📸 ${images.length}枚の画像をアップロード中...`);
          uploadedImageUrls = await uploadImages(images);
          console.log("✅ 画像アップロード成功:", uploadedImageUrls);
          
          toast.success(`${uploadedImageUrls.length}枚の画像がアップロードされました`);
        } catch (imageError) {
          console.error("❌ 画像アップロードエラー:", imageError);
          toast.error("画像のアップロードに失敗しました", {
            description: "画像なしで投稿を続行します。"
          });
          // Continue without images if upload fails
          uploadedImageUrls = [];
        }
      }

      const reviewData = {
        productName: selectedProduct!.name,
        itemCode: selectedProduct!.itemCode,
        userId: user!.uid,
        userEmail: user!.email || "",
        userDisplayName: user!.displayName || "匿名ユーザー",
        rating,
        title: title.trim(),
        content: content.trim(),
        imageUrl: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : "", // 最初の画像をメインに
        images: uploadedImageUrls, // すべての画像URL（配列）
        imageCount: uploadedImageUrls.length, // 画像数を明示的に保存
        tags: tags.length > 0 ? tags : [],
        location: location.trim() || null,
        purchaseSource: purchaseSource || null,
        isPublic,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log("📝 送信するレビューデータ:", reviewData);
      console.log("📊 データサイズ:", JSON.stringify(reviewData).length, "文字");
      console.log("🖼️ 画像URL数:", uploadedImageUrls.length);
      console.log("🔗 画像URLs詳細:", uploadedImageUrls);

      // Try to submit the review
      console.log("📤 Firestoreにレビューを保存中...");
      const docRef = await addDoc(collection(firestore, "reviews"), reviewData);
      
      console.log("✅ レビューが保存されました！Document ID:", docRef.id);
      console.log("📋 保存されたドキュメント参照:", docRef);
      
      // 保存後の検証 - 実際に保存されたデータを確認
      try {
        const savedDoc = await getDoc(docRef);
        if (savedDoc.exists()) {
          const savedData = savedDoc.data();
          console.log("✅ 保存データ検証成功:", {
            id: savedDoc.id,
            imageUrl: savedData.imageUrl,
            images: savedData.images,
            imageCount: savedData.imageCount,
            hasImages: savedData.images && savedData.images.length > 0
          });
          
          if (savedData.images && savedData.images.length > 0) {
            console.log("🎉 画像URLがFirestoreに正常に保存されました！");
          } else {
            console.warn("⚠️ 画像はアップロードされましたが、Firestoreのimagesフィールドが空です");
          }
        } else {
          console.error("❌ 保存確認失敗: ドキュメントが見つかりません");
        }
      } catch (verificationError) {
        console.warn("⚠️ 保存データの検証に失敗:", verificationError);
      }
      
      onReviewSubmitted?.(reviewData);
      
      toast.success("レビューが投稿されました！", {
        description: uploadedImageUrls.length > 0 
          ? `${uploadedImageUrls.length}枚の画像と共に投稿されました` 
          : "レビューが正常に保存されました"
      });
      
      // Reset form
      setSelectedProduct(null);
      setSearchQuery("");
      setRating(0);
      setTitle("");
      setContent("");
      setImages([]);
      setTags([]);
      setLocation("");
      setPurchaseSource("");
      setIsPublic(true);
      setErrors({});

      console.log("🔄 フォームをリセットしました");

    } catch (error) {
      console.error("❌ レビュー送信に失敗しました:", error);
      console.log("Error details:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // More detailed error handling
      let errorMessage = "送信に失敗しました";
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for specific Firebase errors
        if (error.message.includes("permission-denied")) {
          errorMessage = "投稿権限がありません。ログアウトして再度ログインしてください。";
          console.log("🔒 権限エラーが発生しました。ユーザーを再認証する必要があります。");
        } else if (error.message.includes("network")) {
          errorMessage = "ネットワークエラーです。接続を確認してください。";
        } else if (error.message.includes("firebase") || error.message.includes("firestore")) {
          errorMessage = "Firebase接続エラーです。しばらくしてからもう一度お試しください。";
        } else if (error.message.includes("unauthenticated")) {
          errorMessage = "認証が失効しています。ログインし直してください。";
        }
      }
      
      setErrors({ submit: errorMessage });
      toast.error("レビューの投稿に失敗しました", {
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
      console.log("=== Review Submission Completed ===");
    }
  }, [validateForm, selectedProduct, rating, title, content, images, tags, location, purchaseSource, isPublic, user, onReviewSubmitted, uploadImages]);

  // Debug render information
  useEffect(() => {
    if (!isClient) return;
    
    if (user) {
      console.log("✅ ユーザーがログインしています - レビュー投稿可能");
    } else {
      console.log("❌ ユーザーがログインしていません - ログイン画面を表示");
    }
  }, [user, isClient]);

  // Safe render with loading state for hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const StarRating = ({ value, interactive = true }: { value: number; interactive?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`transition-colors duration-200 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center ${
            interactive ? 'hover:scale-110' : ''
          }`}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && setRating(star)}
        >
          <Star
            className={`w-8 h-8 ${
              star <= (interactive ? (hoverRating || rating) : value)
                ? 'fill-orange-500 text-orange-500'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 mobile-scroll-hidden">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header with Back to Home Button */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            onClick={handleBackToHome}
            variant="ghost"
            size="sm"
            className="touch-manipulation tap-target bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ホームに戻る
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MustMeレビューを書く</h1>
            <p className="text-gray-600">あなたの体験を他の人と共有してください</p>
          </div>
        </div>

        {/* Product Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>商品を選択</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="商品を検索..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowProductResults(true);
                    if (!e.target.value) {
                      setSelectedProduct(null);
                    }
                  }}
                  onFocus={() => setShowProductResults(true)}
                  className={`pl-10 touch-manipulation ${errors.product ? 'border-red-500' : ''}`}
                />
              </div>
              
              {showProductResults && searchQuery && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product);
                          setSearchQuery(product.name);
                          setShowProductResults(false);
                          setErrors(prev => ({ ...prev, product: "" }));
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left touch-manipulation tap-target"
                      >
                        <Avatar className="w-12 h-12 rounded-lg">
                          <AvatarImage src={product.image} alt={product.name} />
                          <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.brand} • {product.category}</p>
                          <p className="text-sm font-medium text-orange-600">
                            {product.currency}{product.price.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">
                      商品が見つかりません
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.product && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.product}
              </div>
            )}

            {selectedProduct && (
              <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 rounded-lg">
                    <AvatarImage src={selectedProduct.image} alt={selectedProduct.name} />
                    <AvatarFallback>{selectedProduct.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{selectedProduct.name}</p>
                    <p className="text-sm text-gray-600">{selectedProduct.brand}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>この商品を評価</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <StarRating value={rating} />
              <span className="text-lg font-medium">
                {rating > 0 ? `${rating}/5` : '評価を選択'}
              </span>
            </div>
            {errors.rating && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.rating}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>レビューを書く</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">レビュータイトル</Label>
              <Input
                id="title"
                placeholder="体験をまとめてください..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors(prev => ({ ...prev, title: "" }));
                }}
                className={`touch-manipulation ${errors.title ? 'border-red-500' : ''}`}
                maxLength={100}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.title && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </div>
                )}
                <span className="text-sm text-gray-500 ml-auto">
                  {title.length}/100
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="content">詳細レビュー</Label>
              <Textarea
                id="content"
                placeholder="この商品の体験について詳しく教えてください..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setErrors(prev => ({ ...prev, content: "" }));
                }}
                className={`min-h-[120px] touch-manipulation ${errors.content ? 'border-red-500' : ''}`}
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.content && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.content}
                  </div>
                )}
                <span className="text-sm text-gray-500 ml-auto">
                  {content.length}/2000
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus className="w-5 h-5" />
              写真を追加
              <span className="text-sm font-normal text-gray-500">(オプション、最大5枚)</span>
              {uploadingImages && (
                <Badge variant="outline" className="ml-2">
                  アップロード中...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt="レビュー画像"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation tap-target"
                      disabled={uploadingImages}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                      {Math.round(image.file.size / 1024)}KB
                    </div>
                  </div>
                ))}
              </div>
            )}

            {images.length < 5 && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer touch-manipulation"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  ここに画像をドラッグ＆ドロップするか、<span className="text-orange-600">ファイルを選択</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG、JPG（各最大10MB）
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={uploadingImages}
            />
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              タグを追加
              <span className="text-sm font-normal text-gray-500">(オプション、最大8個)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-2">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-600 touch-manipulation"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label>おすすめタグ</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestedTags
                    .filter(tag => !tags.includes(tag))
                    .slice(0, 6)
                    .map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        disabled={tags.length >= 8}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation tap-target"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </div>

              {tags.length < 8 && (
                <div>
                  <Label>カスタムタグ</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="カスタムタグを追加..."
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomTagAdd()}
                      maxLength={20}
                      className="touch-manipulation"
                    />
                    <Button
                      type="button"
                      onClick={handleCustomTagAdd}
                      disabled={!customTag.trim()}
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 touch-manipulation tap-target"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>追加詳細</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">あなたの所在地</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="location"
                  placeholder="都市、都道府県または国"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 touch-manipulation"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="purchaseSource">どこで購入しましたか？</Label>
              <Select value={purchaseSource} onValueChange={setPurchaseSource}>
                <SelectTrigger className="touch-manipulation">
                  <SelectValue placeholder="購入先を選択" />
                </SelectTrigger>
                <SelectContent>
                  {purchaseSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>プライバシー設定</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>公開レビュー</Label>
                <p className="text-sm text-gray-600">
                  他の人があなたのレビューを見ることができます
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="touch-manipulation"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || uploadingImages || !selectedProduct || rating === 0}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 touch-manipulation tap-target"
            size="lg"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "投稿中..." : uploadingImages ? "画像アップロード中..." : "MustMeレビューを投稿"}
          </Button>
          
          {/* Debug Information Panel - with hydration safety */}
          <Card className="bg-blue-50 border-blue-200" suppressHydrationWarning>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-800">投稿診断情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm" suppressHydrationWarning>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">認証状態:</span>
                  <Badge variant={user ? "default" : "destructive"} className="ml-2">
                    {user ? "✅ ログイン中" : "❌ ログインなし"}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">フォーム状態:</span>
                  <Badge variant={selectedProduct && rating > 0 && title.length >= 5 && content.length >= 20 ? "default" : "secondary"} className="ml-2">
                    {selectedProduct && rating > 0 && title.length >= 5 && content.length >= 20 ? "✅ 入力完了" : "⏳ 入力中"}
                  </Badge>
                </div>
              </div>
              
              <div className="text-xs text-blue-700 space-y-1">
                {user && (
                  <div>👤 ユーザー: {user.displayName || user.email || "名前なし"}</div>
                )}
                {selectedProduct && (
                  <div>📦 商品: {selectedProduct.name}</div>
                )}
                {rating > 0 && (
                  <div>⭐ 評価: {rating}/5</div>
                )}
                {title && (
                  <div>📝 タイトル: {title.length}/100文字</div>
                )}
                {content && (
                  <div>📄 レビュー: {content.length}/2000文字</div>
                )}
                {images.length > 0 && (
                  <div>📸 画像: {images.length}/5枚</div>
                )}
              </div>
              
              <div className="pt-2 border-t border-blue-200">
                <span className="font-medium text-blue-800">投稿可能条件:</span>
                <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                  <div className={user ? "text-green-600" : "text-red-600"}>
                    {user ? "✅" : "❌"} ログイン
                  </div>
                  <div className={selectedProduct ? "text-green-600" : "text-red-600"}>
                    {selectedProduct ? "✅" : "❌"} 商品選択
                  </div>
                  <div className={rating > 0 ? "text-green-600" : "text-red-600"}>
                    {rating > 0 ? "✅" : "❌"} 評価入力
                  </div>
                  <div className={title.length >= 5 ? "text-green-600" : "text-red-600"}>
                    {title.length >= 5 ? "✅" : "❌"} タイトル(5文字+)
                  </div>
                  <div className={content.length >= 20 ? "text-green-600" : "text-red-600"}>
                    {content.length >= 20 ? "✅" : "❌"} レビュー(20文字+)
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={testFirebaseConnection}
                    className="text-xs touch-manipulation"
                  >
                    🔍 Firebase接続テスト
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={testImageUpload}
                    disabled={!user || images.length === 0}
                    className="text-xs touch-manipulation"
                  >
                    📸 画像アップロードテスト
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        console.log("Current form state:", {
                          user: !!user,
                          selectedProduct,
                          rating,
                          title,
                          content,
                          images: images.length,
                          tags,
                          errors
                        });
                      }
                    }}
                    className="text-xs touch-manipulation"
                  >
                    📊 フォーム状態を出力
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {errors.submit && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              {errors.submit}
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top Button - Fixed Position for Mobile */}
      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-50 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg touch-manipulation tap-target"
          size="sm"
          aria-label="トップに戻る"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};