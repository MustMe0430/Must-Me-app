import { z } from 'zod'

// Zod schemas for review data validation
export const MustMeReviewSchema = z.object({
  id: z.string(),
  itemCode: z.string(),
  userId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  purchaseSource: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isPublic: z.boolean(),
  likes: z.number().int().min(0).default(0),
  helpful: z.number().int().min(0).default(0),
})

export const ReviewStatsSchema = z.object({
  itemCode: z.string(),
  averageRating: z.number().min(0).max(5),
  totalReviews: z.number().int().min(0),
  ratingDistribution: z.object({
    1: z.number().int().min(0),
    2: z.number().int().min(0),
    3: z.number().int().min(0),
    4: z.number().int().min(0),
    5: z.number().int().min(0),
  }),
})

export const CreateReviewSchema = z.object({
  itemCode: z.string(),
  userId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  purchaseSource: z.string().optional(),
  isPublic: z.boolean().default(true),
})

// TypeScript types
export type MustMeReview = z.infer<typeof MustMeReviewSchema>
export type ReviewStats = z.infer<typeof ReviewStatsSchema>
export type CreateReviewRequest = z.infer<typeof CreateReviewSchema>

export interface ReviewListResponse {
  reviews: MustMeReview[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Mock data for development
const generateMockReview = (itemCode: string, overrides?: Partial<MustMeReview>): MustMeReview => {
  const ratings = [1, 2, 3, 4, 5]
  const rating = ratings[Math.floor(Math.random() * ratings.length)]
  
  const titles = [
    'Great product!',
    'Works as expected',
    'Could be better',
    'Amazing quality',
    'Not what I expected',
    'Perfect for my needs',
    'Good value for money',
    'Outstanding service',
    'Delivery was quick',
    'Highly recommended'
  ]

  const contents = [
    'This product exceeded my expectations. The quality is outstanding and it arrived quickly.',
    'Good value for the price. Works exactly as described in the listing.',
    'The product is okay but I was expecting better quality for this price point.',
    'Excellent quality and fast shipping. Would definitely buy again from this seller.',
    'Product arrived damaged but customer service was helpful in resolving the issue.',
    'Perfect size and color as shown in the photos. Very satisfied with this purchase.',
    'Great product but the packaging could be improved. Overall happy with the purchase.',
    'Outstanding quality and attention to detail. This seller clearly cares about their products.',
    'Fast delivery and product matches description perfectly. Highly recommend this item.',
    'Good product overall. Minor issues but nothing that affects functionality significantly.'
  ]

  const tags = [
    ['quality', 'durable'],
    ['fast-shipping', 'excellent-service'],
    ['good-value', 'recommended'],
    ['premium', 'luxury'],
    ['practical', 'everyday-use'],
    ['eco-friendly', 'sustainable'],
    ['compact', 'space-saving'],
    ['user-friendly', 'easy-setup'],
    ['stylish', 'modern'],
    ['reliable', 'long-lasting']
  ]

  const locations = ['Tokyo', 'Osaka', 'Yokohama', 'Kyoto', 'Sapporo', 'Fukuoka', 'Kobe', 'Nagoya']
  const sources = ['Rakuten', 'Amazon', 'Physical Store', 'Other Online Store']

  const now = new Date()
  const createdAt = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Within last 90 days

  return {
    id: `review_${Math.random().toString(36).substr(2, 9)}`,
    itemCode,
    userId: `user_${Math.random().toString(36).substr(2, 9)}`,
    rating,
    title: titles[Math.floor(Math.random() * titles.length)],
    content: contents[Math.floor(Math.random() * contents.length)],
    images: Math.random() > 0.7 ? [
      `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`,
      `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`
    ] : undefined,
    tags: Math.random() > 0.5 ? tags[Math.floor(Math.random() * tags.length)] : undefined,
    location: Math.random() > 0.6 ? locations[Math.floor(Math.random() * locations.length)] : undefined,
    purchaseSource: Math.random() > 0.4 ? sources[Math.floor(Math.random() * sources.length)] : undefined,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
    isPublic: Math.random() > 0.1, // 90% public
    likes: Math.floor(Math.random() * 50),
    helpful: Math.floor(Math.random() * 30),
    ...overrides,
  }
}

// Mock data storage
const mockReviewsStorage = new Map<string, MustMeReview[]>()
const mockStatsCache = new Map<string, ReviewStats>()

// Initialize mock data for some item codes
const initializeMockData = () => {
  const sampleItemCodes = [
    'item123',
    'item456',
    'item789',
    'electronics_001',
    'fashion_002',
    'home_003'
  ]

  sampleItemCodes.forEach(itemCode => {
    const reviewCount = Math.floor(Math.random() * 50) + 5 // 5-54 reviews
    const reviews = Array.from({ length: reviewCount }, () => generateMockReview(itemCode))
    mockReviewsStorage.set(itemCode, reviews)
  })
}

// Error classes
export class ReviewAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ReviewAPIError'
  }
}

export class ValidationError extends ReviewAPIError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class NotFoundError extends ReviewAPIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

// Cache management
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class Cache<T> {
  private storage = new Map<string, CacheEntry<T>>()

  set(key: string, data: T, ttlSeconds: number = 300): void {
    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    })
  }

  get(key: string): T | null {
    const entry = this.storage.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.storage.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }
}

// Cache instances
const reviewStatsCache = new Cache<ReviewStats>()
const reviewListCache = new Cache<ReviewListResponse>()

// Utility functions for review aggregation
export const calculateReviewStats = (reviews: MustMeReview[]): ReviewStats => {
  if (reviews.length === 0) {
    return {
      itemCode: '',
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = Number((totalRating / reviews.length).toFixed(2))

  const ratingDistribution = reviews.reduce((dist, review) => {
    dist[review.rating as keyof typeof dist]++
    return dist
  }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })

  return {
    itemCode: reviews[0]?.itemCode || '',
    averageRating,
    totalReviews: reviews.length,
    ratingDistribution,
  }
}

// Rakuten API Integration Configuration
/*
 * Rakuten API Credentials (for reference):
 * Application ID: 1044889417682867397
 * Affiliate ID: 4a22b45c.cf5901e7.4a22b45d.67061d95
 * 
 * Note: These reviews will be linked to Rakuten products using itemCode
 * which corresponds to Rakuten's product identifiers
 */

// API Functions
export const fetchReviewStats = async (itemCode: string): Promise<ReviewStats> => {
  try {
    // Check cache first
    const cacheKey = `stats_${itemCode}`
    const cached = reviewStatsCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // In a real implementation, this would be an API call
    // For now, we'll use mock data
    const reviews = mockReviewsStorage.get(itemCode) || []
    const stats = calculateReviewStats(reviews)

    // Cache the result
    reviewStatsCache.set(cacheKey, stats, 300) // Cache for 5 minutes

    return ReviewStatsSchema.parse(stats)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      throw new ValidationError(`Invalid review stats format: ${issues}`)
    }
    throw new ReviewAPIError(`Failed to fetch review statistics: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const fetchReviewList = async (
  itemCode: string,
  options: {
    page?: number
    pageSize?: number
    sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'
    filterRating?: number
  } = {}
): Promise<ReviewListResponse> => {
  try {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'newest',
      filterRating
    } = options

    // Check cache
    const cacheKey = `list_${itemCode}_${page}_${pageSize}_${sortBy}_${filterRating}`
    const cached = reviewListCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Get reviews from mock storage
    let reviews = mockReviewsStorage.get(itemCode) || []

    // Filter by rating if specified
    if (filterRating) {
      reviews = reviews.filter(review => review.rating === filterRating)
    }

    // Sort reviews
    const sortedReviews = [...reviews].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'rating_high':
          return b.rating - a.rating
        case 'rating_low':
          return a.rating - b.rating
        case 'helpful':
          return b.helpful - a.helpful
        default:
          return 0
      }
    })

    // Paginate
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedReviews = sortedReviews.slice(startIndex, endIndex)

    const result = {
      reviews: paginatedReviews,
      total: sortedReviews.length,
      page,
      pageSize,
      hasMore: endIndex < sortedReviews.length,
    }

    // Cache the result
    reviewListCache.set(cacheKey, result, 180) // Cache for 3 minutes

    return result
  } catch (error) {
    throw new ReviewAPIError(`Failed to fetch review list: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const createReview = async (reviewData: CreateReviewRequest): Promise<MustMeReview> => {
  try {
    // Validate input data
    const validatedData = CreateReviewSchema.parse(reviewData)

    // Create new review
    const now = new Date().toISOString()
    const newReview: MustMeReview = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...validatedData,
      createdAt: now,
      updatedAt: now,
      likes: 0,
      helpful: 0,
    }

    // Validate the complete review object
    const validatedReview = MustMeReviewSchema.parse(newReview)

    // Store in mock storage
    const existingReviews = mockReviewsStorage.get(validatedData.itemCode) || []
    existingReviews.push(validatedReview)
    mockReviewsStorage.set(validatedData.itemCode, existingReviews)

    // Clear related caches
    reviewStatsCache.delete(`stats_${validatedData.itemCode}`)
    // Clear all list caches for this item (in a real app, we'd be more selective)
    for (const key of Array.from(reviewListCache['storage'].keys())) {
      if (key.startsWith(`list_${validatedData.itemCode}`)) {
        reviewListCache.delete(key)
      }
    }

    return validatedReview
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      throw new ValidationError(`Invalid review data: ${issues}`)
    }
    throw new ReviewAPIError(`Failed to create review: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const updateReviewHelpful = async (reviewId: string): Promise<MustMeReview> => {
  try {
    // Find the review across all item codes
    let foundReview: MustMeReview | null = null
    let itemCode = ''

    for (const [code, reviews] of mockReviewsStorage) {
      const review = reviews.find(r => r.id === reviewId)
      if (review) {
        foundReview = review
        itemCode = code
        break
      }
    }

    if (!foundReview) {
      throw new NotFoundError(`Review with ID ${reviewId} not found`)
    }

    // Update helpful count
    foundReview.helpful += 1
    foundReview.updatedAt = new Date().toISOString()

    // Clear related caches
    reviewStatsCache.delete(`stats_${itemCode}`)
    // Clear list caches
    for (const key of Array.from(reviewListCache['storage'].keys())) {
      if (key.startsWith(`list_${itemCode}`)) {
        reviewListCache.delete(key)
      }
    }

    return foundReview
  } catch (error) {
    if (error instanceof ReviewAPIError) {
      throw error
    }
    throw new ReviewAPIError(`Failed to update review helpful count: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const updateReviewLikes = async (reviewId: string): Promise<MustMeReview> => {
  try {
    // Find the review across all item codes
    let foundReview: MustMeReview | null = null
    let itemCode = ''

    for (const [code, reviews] of mockReviewsStorage) {
      const review = reviews.find(r => r.id === reviewId)
      if (review) {
        foundReview = review
        itemCode = code
        break
      }
    }

    if (!foundReview) {
      throw new NotFoundError(`Review with ID ${reviewId} not found`)
    }

    // Update likes count
    foundReview.likes += 1
    foundReview.updatedAt = new Date().toISOString()

    // Clear related caches
    reviewStatsCache.delete(`stats_${itemCode}`)
    // Clear list caches
    for (const key of Array.from(reviewListCache['storage'].keys())) {
      if (key.startsWith(`list_${itemCode}`)) {
        reviewListCache.delete(key)
      }
    }

    return foundReview
  } catch (error) {
    if (error instanceof ReviewAPIError) {
      throw error
    }
    throw new ReviewAPIError(`Failed to update review likes: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Utility functions for cache management
export const clearReviewCache = (itemCode?: string): void => {
  if (itemCode) {
    reviewStatsCache.delete(`stats_${itemCode}`)
    // Clear related list caches
    for (const key of Array.from(reviewListCache['storage'].keys())) {
      if (key.startsWith(`list_${itemCode}`)) {
        reviewListCache.delete(key)
      }
    }
  } else {
    reviewStatsCache.clear()
    reviewListCache.clear()
  }
}

export const getReviewCacheStats = () => {
  return {
    statsCache: {
      size: reviewStatsCache['storage'].size,
      keys: Array.from(reviewStatsCache['storage'].keys()),
    },
    listCache: {
      size: reviewListCache['storage'].size,
      keys: Array.from(reviewListCache['storage'].keys()),
    },
  }
}

// Advanced aggregation functions
export const getReviewTrends = (reviews: MustMeReview[], days: number = 30): Array<{
  date: string
  averageRating: number
  reviewCount: number
}> => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const recentReviews = reviews.filter(review => 
    new Date(review.createdAt) >= cutoffDate
  )

  // Group by date
  const groupedByDate = recentReviews.reduce((acc, review) => {
    const date = review.createdAt.split('T')[0] // Get date part
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(review)
    return acc
  }, {} as Record<string, MustMeReview[]>)

  // Calculate trends
  return Object.entries(groupedByDate).map(([date, dateReviews]) => ({
    date,
    averageRating: dateReviews.reduce((sum, r) => sum + r.rating, 0) / dateReviews.length,
    reviewCount: dateReviews.length,
  })).sort((a, b) => a.date.localeCompare(b.date))
}

export const getTopReviewTags = (reviews: MustMeReview[], limit: number = 10): Array<{
  tag: string
  count: number
  averageRating: number
}> => {
  const tagStats = new Map<string, { count: number, totalRating: number }>()

  reviews.forEach(review => {
    if (review.tags) {
      review.tags.forEach(tag => {
        const current = tagStats.get(tag) || { count: 0, totalRating: 0 }
        tagStats.set(tag, {
          count: current.count + 1,
          totalRating: current.totalRating + review.rating,
        })
      })
    }
  })

  return Array.from(tagStats.entries())
    .map(([tag, stats]) => ({
      tag,
      count: stats.count,
      averageRating: Number((stats.totalRating / stats.count).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// Initialize mock data when module loads
initializeMockData()