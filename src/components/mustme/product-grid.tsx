"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/mustme/product-card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Search, ShoppingBag } from "lucide-react";
import { searchProducts, getTrendingProducts, type AppProduct } from "@/lib/api/rakuten";

interface ProductGridProps {
  searchKeyword?: string;
  category?: string;
  limit?: number;
  showPagination?: boolean;
  title?: string;
  className?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export const ProductGrid = ({
  searchKeyword,
  category,
  limit = 20,
  showPagination = true,
  title = "おすすめ商品一覧",
  className = "",
}: ProductGridProps) => {
  const router = useRouter();
  
  const [products, setProducts] = useState<AppProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
  });

  const fetchProducts = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      if (searchKeyword) {
        response = await searchProducts({
          keyword: searchKeyword,
          page,
          pageSize: limit,
          sort: 'standard',
          ...(category && { genreId: category }),
        });
      } else if (category) {
        response = await searchProducts({
          genreId: category,
          page,
          pageSize: limit,
          sort: 'standard',
        });
      } else {
        // For trending products without search/category
        const trendingProducts = await getTrendingProducts(limit);
        setProducts(trendingProducts);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: trendingProducts.length,
          itemsPerPage: trendingProducts.length,
        });
        return;
      }

      setProducts(response.products);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('商品の取得に失敗しました。しばらく時間をおいて再度お試しください。');
      
      // Set mock products for development/fallback
      const mockProducts: AppProduct[] = [
        {
          id: 'mock_1',
          name: 'サンプル商品 1',
          description: 'これは開発用のモック商品です',
          price: 29800,
          currency: 'JPY',
          images: {
            small: ['https://via.placeholder.com/150x150?text=Product+1'],
            medium: ['https://via.placeholder.com/300x300?text=Product+1'],
            large: ['https://via.placeholder.com/600x600?text=Product+1'],
          },
          shop: {
            id: 'mock_shop',
            name: 'モックショップ',
            url: 'https://example.com',
          },
          category: 'electronics',
          rating: 4.5,
          reviewCount: 128,
          url: 'https://example.com/product/1',
          availability: 'in_stock',
          features: {
            freeShipping: true,
            creditCardAccepted: true,
            pointsEarnable: true,
          },
          metadata: {
            source: 'rakuten',
            originalId: 'mock_1',
            lastUpdated: new Date(),
          },
        },
        {
          id: 'mock_2',
          name: 'サンプル商品 2',
          description: 'これは開発用のモック商品です',
          price: 15800,
          currency: 'JPY',
          images: {
            small: ['https://via.placeholder.com/150x150?text=Product+2'],
            medium: ['https://via.placeholder.com/300x300?text=Product+2'],
            large: ['https://via.placeholder.com/600x600?text=Product+2'],
          },
          shop: {
            id: 'mock_shop2',
            name: 'モックショップ2',
            url: 'https://example.com',
          },
          category: 'fashion',
          rating: 4.2,
          reviewCount: 95,
          url: 'https://example.com/product/2',
          availability: 'in_stock',
          features: {
            freeShipping: false,
            creditCardAccepted: true,
            pointsEarnable: true,
          },
          metadata: {
            source: 'rakuten',
            originalId: 'mock_2',
            lastUpdated: new Date(),
          },
        },
      ];
      
      setProducts(mockProducts);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: mockProducts.length,
        itemsPerPage: mockProducts.length,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    fetchProducts(pagination.currentPage);
  };

  const handleProductClick = (product: AppProduct) => {
    router.push(`/products/${encodeURIComponent(product.metadata.originalId)}`);
  };

  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage);
  };

  useEffect(() => {
    fetchProducts(1);
  }, [searchKeyword, category, limit]);

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        商品が見つかりませんでした
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {searchKeyword
          ? `"${searchKeyword}" に該当する商品が見つかりませんでした。別のキーワードでお試しください。`
          : "現在表示できる商品がありません。しばらく時間をおいて再度お試しください。"
        }
      </p>
      <Button
        onClick={() => router.push('/search')}
        variant="outline"
        className="border-orange-200 text-orange-600 hover:bg-orange-50"
      >
        <Search className="w-4 h-4 mr-2" />
        商品を検索する
      </Button>
    </div>
  );

  const ErrorState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        エラーが発生しました
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">{error}</p>
      <Button onClick={handleRetry} className="bg-orange-600 hover:bg-orange-700">
        <RefreshCw className="w-4 h-4 mr-2" />
        再試行
      </Button>
    </div>
  );

  const PaginationControls = () => {
    if (!showPagination || pagination.totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, pagination.currentPage - delta);
        i <= Math.min(pagination.totalPages - 1, pagination.currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (pagination.currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (pagination.currentPage + delta < pagination.totalPages - 1) {
        rangeWithDots.push('...', pagination.totalPages);
      } else if (pagination.totalPages > 1) {
        rangeWithDots.push(pagination.totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {pagination.totalItems}件中 {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}件を表示
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            前へ
          </Button>

          {getVisiblePages().map((page, index) => (
            <Button
              key={index}
              variant={page === pagination.currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={typeof page !== 'number'}
              className={
                page === pagination.currentPage
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            次へ
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            {searchKeyword && (
              <p className="text-gray-600">
                "{searchKeyword}" の検索結果 ({pagination.totalItems}件)
              </p>
            )}
            {!searchKeyword && !isLoading && !error && (
              <p className="text-gray-600">
                {pagination.totalItems}件の商品
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: limit }, (_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : error && products.length === 0 ? (
          <ErrorState />
        ) : products.length === 0 ? (
          <EmptyState />
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="transform transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <ProductCard
                itemCode={product.metadata.originalId}
                image={product.images.medium[0] || product.images.small[0] || 'https://via.placeholder.com/300x300'}
                name={product.name}
                price={product.price}
                currency={product.currency === 'JPY' ? '¥' : product.currency}
                rating={product.rating}
                reviewCount={product.reviewCount}
                onClick={() => handleProductClick(product)}
              />
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && <PaginationControls />}
    </div>
  );
};