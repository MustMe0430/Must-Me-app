"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Star } from "lucide-react";

interface Review {
  id: string;
  productName: string;
  reviewText: string;
  rating?: number;
  images?: string[]; // Firebase Storage URLs
  imageUrl?: string; // Legacy single image support
  tags?: string[];
  createdAt: Timestamp;
  userName?: string;
}

const ReviewSkeleton = () => (
  <Card className="w-full">
    <CardHeader className="pb-3">
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
      </div>
    </CardContent>
  </Card>
);

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "text-orange-500 fill-orange-500"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
    </div>
  );
};

const formatDate = (timestamp: Timestamp): string => {
  try {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    return "Unknown date";
  }
};

export const ReviewList = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const reviewsCollection = collection(db, "reviews");
      const reviewsQuery = query(
        reviewsCollection,
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(reviewsQuery);

      const reviewsData: Review[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviewsData.push({
          id: doc.id,
          productName: data.productName || "Unknown Product",
          reviewText: data.reviewText || data.ReviewText || data.content || "",
          rating: data.rating,
          images: data.images || [],
          imageUrl: data.imageUrl || "",
          tags: data.tags || [],
          createdAt: data.createdAt,
          userName: data.userName || data.username,
        });
      });

      setReviews(reviewsData);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleRefresh = () => {
    fetchReviews(true);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Customer Reviews
          </h2>
          <Button variant="outline" disabled>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <ReviewSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Customer Reviews
          </h2>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center p-6">
            <AlertCircle className="w-8 h-8 text-red-500 mr-4" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Customer Reviews
          </h2>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 max-w-sm">
              Be the first to share your experience with our products. Your
              feedback helps other customers make informed decisions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Customer Reviews
          </h2>
          <p className="text-gray-600 mt-1">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <Card
            key={review.id}
            className="w-full transition-all duration-200 hover:shadow-lg hover:shadow-orange-100 border-gray-200 hover:border-orange-200"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {review.productName}
                  </h3>
                  {review.userName && (
                    <p className="text-sm text-gray-600">by {review.userName}</p>
                  )}
                </div>
                {review.rating && (
                  <div className="ml-4 flex-shrink-0">
                    <StarRating rating={review.rating} />
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Review Text */}
              <div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {review.reviewText}
                </p>
              </div>

              {/* Tags */}
              {review.tags && review.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {review.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-orange-50 text-orange-700 border-orange-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Images */}
              {((review.images && review.images.length > 0) || review.imageUrl) && (
                <div className="w-full">
                  {/* Get all available images */}
                  {(() => {
                    const allImages = [];
                    
                    // Add images from images array
                    if (review.images && review.images.length > 0) {
                      allImages.push(...review.images.filter(img => img && img.trim()));
                    }
                    
                    // Add legacy imageUrl if it exists and isn't already in images array
                    if (review.imageUrl && !allImages.includes(review.imageUrl)) {
                      allImages.push(review.imageUrl);
                    }

                    if (allImages.length === 0) return null;

                    return (
                      <div className={`grid gap-3 ${
                        allImages.length === 1 ? 'grid-cols-1' :
                        allImages.length === 2 ? 'grid-cols-2' :
                        allImages.length === 3 ? 'grid-cols-3' :
                        'grid-cols-2 md:grid-cols-3'
                      }`}>
                        {allImages.map((imageUrl, index) => (
                          <div 
                            key={index} 
                            className="relative overflow-hidden rounded-lg bg-gray-100"
                          >
                            <img
                              src={imageUrl}
                              alt={`Review image ${index + 1}`}
                              className="w-full h-32 md:h-40 object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                              onClick={() => {
                                // Optional: Add lightbox/modal functionality here
                                window.open(imageUrl, '_blank');
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                <time className="font-medium">
                  {formatDate(review.createdAt)}
                </time>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};