"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { fetchReviewStats, type ReviewStats } from "@/lib/api/mustme-reviews"

interface ProductCardProps {
  itemCode?: string // Rakuten itemCode for linking reviews
  image: string
  name: string
  price: number
  currency?: string
  rating?: number // Fallback rating if MustMe reviews not available
  reviewCount?: number // Fallback review count if MustMe reviews not available
  className?: string
  onClick?: () => void
}

export default function ProductCard({
  itemCode,
  image,
  name,
  price,
  currency = "¥",
  rating: fallbackRating = 0,
  reviewCount: fallbackReviewCount = 0,
  className = "",
  onClick
}: ProductCardProps) {
  const [mustMeStats, setMustMeStats] = useState<ReviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch MustMe review stats when component mounts
  useEffect(() => {
    if (itemCode) {
      setIsLoading(true)
      fetchReviewStats(itemCode)
        .then(stats => {
          setMustMeStats(stats)
          setError(null)
        })
        .catch(err => {
          setError(err.message)
          setMustMeStats(null)
        })
        .finally(() => setIsLoading(false))
    }
  }, [itemCode])

  // Determine which rating and review count to display
  const displayRating = mustMeStats?.averageRating || fallbackRating
  const displayReviewCount = mustMeStats?.totalReviews || fallbackReviewCount
  const hasMustMeReviews = mustMeStats && mustMeStats.totalReviews > 0

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? "fill-primary text-primary"
            : "fill-muted text-muted"
        }`}
      />
    ))
  }

  const renderReviewInfo = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
        </div>
      )
    }

    if (error && !hasMustMeReviews) {
      return (
        <div className="text-sm text-muted-foreground">
          レビューはまだありません
          <button 
            onClick={(e) => {
              e.stopPropagation()
              if (onClick) onClick()
            }}
            className="block text-xs text-primary hover:underline mt-1"
          >
            最初のレビュワーになる
          </button>
        </div>
      )
    }

    if (!hasMustMeReviews && displayReviewCount === 0) {
      return (
        <div className="text-sm text-muted-foreground">
          レビューはまだありません
          <button 
            onClick={(e) => {
              e.stopPropagation()
              if (onClick) onClick()
            }}
            className="block text-xs text-primary hover:underline mt-1"
          >
            最初のレビュワーになる
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {renderStars(Math.round(displayRating))}
        </div>
        <span className="text-sm font-medium text-foreground">
          {displayRating.toFixed(1)} / 5
        </span>
        <span className="text-sm text-muted-foreground">
          ({displayReviewCount.toLocaleString()}件)
        </span>
        {hasMustMeReviews && (
          <div className="ml-1">
            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase font-medium">
              MustMe
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      className={`bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden group cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Product Name - moved above rating */}
        <h3 className="font-semibold text-base text-foreground line-clamp-2 leading-tight">
          {name}
        </h3>

        {/* MustMe Rating and Review Count */}
        {renderReviewInfo()}

        {/* Price */}
        <div className="pt-1">
          <span className="text-xl font-bold text-primary">
            {currency}{price.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}