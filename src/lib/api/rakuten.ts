import { z } from 'zod';

/**
 * Environment configuration for Rakuten API
 */
export const RAKUTEN_CONFIG = {
  APPLICATION_ID: process.env.RAKUTEN_APPLICATION_ID || '',
  API_BASE_URL: 'https://app.rakuten.co.jp/services/api',
  RATE_LIMIT_DELAY: 1000, // 1 second between requests
  MAX_RETRIES: 3,
  CACHE_TTL: 300000, // 5 minutes
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Rakuten API product response schema
 */
export const RakutenProductSchema = z.object({
  Item: z.object({
    itemCode: z.string(),
    itemName: z.string(),
    itemCaption: z.string().optional(),
    itemPrice: z.number(),
    itemUrl: z.string(),
    affiliateUrl: z.string().optional(),
    imageFlag: z.number(),
    smallImageUrls: z.array(z.object({
      imageUrl: z.string(),
    })).optional(),
    mediumImageUrls: z.array(z.object({
      imageUrl: z.string(),
    })).optional(),
    largeImageUrls: z.array(z.object({
      imageUrl: z.string(),
    })).optional(),
    shopCode: z.string(),
    shopName: z.string(),
    shopUrl: z.string(),
    genreId: z.string(),
    reviewCount: z.number().optional(),
    reviewAverage: z.number().optional(),
    taxFlag: z.number().optional(),
    postageFlag: z.number().optional(),
    creditCardFlag: z.number().optional(),
    availability: z.number().optional(),
    pointRate: z.number().optional(),
    pointRateStartTime: z.string().optional(),
    pointRateEndTime: z.string().optional(),
  }),
});

/**
 * Rakuten API search response schema
 */
export const RakutenSearchResponseSchema = z.object({
  Items: z.array(RakutenProductSchema),
  count: z.number(),
  page: z.number(),
  first: z.number(),
  last: z.number(),
  hits: z.number(),
  carrier: z.number(),
  pageCount: z.number(),
});

/**
 * Rakuten API error response schema
 */
export const RakutenErrorResponseSchema = z.object({
  error: z.string(),
  error_description: z.string(),
});

/**
 * TypeScript types derived from schemas
 */
export type RakutenProduct = z.infer<typeof RakutenProductSchema>;
export type RakutenSearchResponse = z.infer<typeof RakutenSearchResponseSchema>;
export type RakutenErrorResponse = z.infer<typeof RakutenErrorResponseSchema>;

/**
 * Our app's product interface
 */
export interface AppProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: {
    small: string[];
    medium: string[];
    large: string[];
  };
  shop: {
    id: string;
    name: string;
    url: string;
  };
  category: string;
  rating?: number;
  reviewCount?: number;
  url: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited' | 'unknown';
  features: {
    freeShipping: boolean;
    creditCardAccepted: boolean;
    pointsEarnable: boolean;
  };
  metadata: {
    source: 'rakuten';
    originalId: string;
    lastUpdated: Date;
  };
}

/**
 * Search parameters interface
 */
export interface ProductSearchParams {
  keyword?: string;
  categoryId?: string;
  genreId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sort?: 'standard' | 'affiliateRate' | 'itemPrice' | 'updateTimestamp' | 'reviewCount' | 'reviewAverage';
  sortOrder?: 'desc' | 'asc';
  shopCode?: string;
  availability?: boolean;
  creditCard?: boolean;
  shipOverseas?: boolean;
}

/**
 * Cache interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-memory cache implementation
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number = RAKUTEN_CONFIG.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Rate limiter implementation
 */
class RateLimiter {
  private lastRequest = 0;

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < RAKUTEN_CONFIG.RATE_LIMIT_DELAY) {
      const waitTime = RAKUTEN_CONFIG.RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequest = Date.now();
  }
}

/**
 * Global instances
 */
const cache = new MemoryCache();
const rateLimiter = new RateLimiter();

/**
 * Custom error classes
 */
export class RakutenAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'RakutenAPIError';
  }
}

export class RakutenRateLimitError extends RakutenAPIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RakutenRateLimitError';
  }
}

/**
 * Validates environment configuration
 * @throws {RakutenAPIError} When required configuration is missing
 */
export function validateRakutenConfig(): void {
  if (!RAKUTEN_CONFIG.APPLICATION_ID) {
    throw new RakutenAPIError(
      'Rakuten Application ID is required. Please set RAKUTEN_APPLICATION_ID environment variable.',
      'MISSING_CONFIG'
    );
  }
}

/**
 * Generates cache key for requests
 * @param endpoint - API endpoint
 * @param params - Request parameters
 * @returns Cache key string
 */
function generateCacheKey(endpoint: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = params[key];
      return sorted;
    }, {} as Record<string, any>);
  
  return `rakuten:${endpoint}:${JSON.stringify(sortedParams)}`;
}

/**
 * Makes HTTP request with retry logic and rate limiting
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Response data
 */
async function makeRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= RAKUTEN_CONFIG.MAX_RETRIES; attempt++) {
    try {
      await rateLimiter.waitIfNeeded();

      console.log(`[RakutenAPI] Attempt ${attempt}/${RAKUTEN_CONFIG.MAX_RETRIES}: ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ProductReviewApp/1.0',
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new RakutenRateLimitError();
        }

        const errorData = await response.text();
        throw new RakutenAPIError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status,
          errorData
        );
      }

      const data = await response.json();
      console.log(`[RakutenAPI] Success on attempt ${attempt}`);
      
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (error instanceof RakutenRateLimitError) {
        console.warn(`[RakutenAPI] Rate limit hit on attempt ${attempt}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        continue;
      }

      if (attempt === RAKUTEN_CONFIG.MAX_RETRIES) {
        console.error(`[RakutenAPI] All ${RAKUTEN_CONFIG.MAX_RETRIES} attempts failed:`, error);
        break;
      }

      console.warn(`[RakutenAPI] Attempt ${attempt} failed, retrying:`, error);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new RakutenAPIError(
    `Failed after ${RAKUTEN_CONFIG.MAX_RETRIES} attempts: ${lastError?.message}`,
    'MAX_RETRIES_EXCEEDED',
    undefined,
    lastError
  );
}

/**
 * Builds Rakuten API URL with parameters
 * @param endpoint - API endpoint
 * @param params - Query parameters
 * @returns Complete API URL
 */
function buildApiUrl(endpoint: string, params: Record<string, any>): string {
  const url = new URL(`${RAKUTEN_CONFIG.API_BASE_URL}/${endpoint}`);
  
  // Add application ID
  url.searchParams.set('applicationId', RAKUTEN_CONFIG.APPLICATION_ID);
  url.searchParams.set('format', 'json');

  // Add other parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

/**
 * Maps Rakuten genre IDs to our app categories
 * @param genreId - Rakuten genre ID
 * @returns App category string
 */
export function mapRakutenGenreToCategory(genreId: string): string {
  const genreMap: Record<string, string> = {
    // Electronics
    '559887': 'electronics',
    '215832': 'electronics',
    '559954': 'electronics',
    
    // Fashion
    '100371': 'fashion',
    '101240': 'fashion',
    '101438': 'fashion',
    
    // Home & Kitchen
    '100804': 'home',
    '558885': 'home',
    '558944': 'home',
    
    // Sports & Outdoors
    '101070': 'sports',
    '101164': 'sports',
    '101438': 'sports',
    
    // Beauty & Health
    '566603': 'beauty',
    '101351': 'beauty',
    '566590': 'beauty',
    
    // Books & Media
    '001001': 'books',
    '001': 'books',
    '005': 'books',
    
    // Food & Drinks
    '100227': 'food',
    '100316': 'food',
    '558929': 'food',
    
    // Toys & Games
    '101164': 'toys',
    '200162': 'toys',
    '101070': 'toys',
  };

  return genreMap[genreId] || 'other';
}

/**
 * Processes and optimizes image URLs
 * @param imageUrls - Array of image URL objects
 * @returns Array of processed image URLs
 */
function processImageUrls(imageUrls?: Array<{ imageUrl: string }>): string[] {
  if (!imageUrls || imageUrls.length === 0) return [];

  return imageUrls
    .map(img => img.imageUrl)
    .filter(url => url && url.trim() !== '')
    .map(url => {
      // Convert to HTTPS if needed
      if (url.startsWith('http://')) {
        url = url.replace('http://', 'https://');
      }
      
      // Add image optimization parameters if supported
      if (url.includes('image.rakuten.co.jp')) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('_ex', '400x400');
        return urlObj.toString();
      }
      
      return url;
    });
}

/**
 * Formats price with currency
 * @param price - Price number
 * @param currency - Currency code
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Transforms Rakuten product data to our app format
 * @param rakutenProduct - Rakuten API product data
 * @returns Transformed product data
 */
export function transformRakutenProduct(rakutenProduct: RakutenProduct): AppProduct {
  const item = rakutenProduct.Item;
  
  return {
    id: `rakuten_${item.itemCode}`,
    name: item.itemName,
    description: item.itemCaption || '',
    price: item.itemPrice,
    currency: 'JPY',
    images: {
      small: processImageUrls(item.smallImageUrls),
      medium: processImageUrls(item.mediumImageUrls),
      large: processImageUrls(item.largeImageUrls),
    },
    shop: {
      id: item.shopCode,
      name: item.shopName,
      url: item.shopUrl,
    },
    category: mapRakutenGenreToCategory(item.genreId),
    rating: item.reviewAverage,
    reviewCount: item.reviewCount,
    url: item.affiliateUrl || item.itemUrl,
    availability: item.availability === 1 ? 'in_stock' : 
                   item.availability === 0 ? 'out_of_stock' : 'unknown',
    features: {
      freeShipping: item.postageFlag === 1,
      creditCardAccepted: item.creditCardFlag === 1,
      pointsEarnable: (item.pointRate || 0) > 0,
    },
    metadata: {
      source: 'rakuten',
      originalId: item.itemCode,
      lastUpdated: new Date(),
    },
  };
}

/**
 * Searches products using Rakuten Ichiba Item Search API
 * @param params - Search parameters
 * @returns Search results with pagination info
 */
export async function searchProducts(
  params: ProductSearchParams = {}
): Promise<{
  products: AppProduct[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}> {
  validateRakutenConfig();

  const searchParams = {
    keyword: params.keyword,
    genreId: params.genreId,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    page: params.page || 1,
    hits: Math.min(params.pageSize || RAKUTEN_CONFIG.DEFAULT_PAGE_SIZE, RAKUTEN_CONFIG.MAX_PAGE_SIZE),
    sort: params.sort || 'standard',
    sortType: params.sortOrder || 'desc',
    shopCode: params.shopCode,
    availability: params.availability ? 1 : undefined,
    creditCard: params.creditCard ? 1 : undefined,
    shipOverseas: params.shipOverseas ? 1 : undefined,
  };

  const cacheKey = generateCacheKey('IchibaItem/Search/20220601', searchParams);
  const cached = cache.get<{ products: AppProduct[]; pagination: any }>(cacheKey);
  
  if (cached) {
    console.log(`[RakutenAPI] Cache hit for search: ${params.keyword}`);
    return cached;
  }

  try {
    const url = buildApiUrl('IchibaItem/Search/20220601', searchParams);
    const response = await makeRequest<RakutenSearchResponse>(url);
    
    // Validate response
    const validatedResponse = RakutenSearchResponseSchema.parse(response);
    
    const products = validatedResponse.Items.map(transformRakutenProduct);
    
    const result = {
      products,
      pagination: {
        currentPage: validatedResponse.page,
        totalPages: validatedResponse.pageCount,
        totalItems: validatedResponse.count,
        itemsPerPage: validatedResponse.hits,
      },
    };

    cache.set(cacheKey, result);
    
    console.log(`[RakutenAPI] Search completed: ${products.length} products found`);
    return result;
    
  } catch (error) {
    console.error('[RakutenAPI] Search failed:', error);
    
    // Return mock data as fallback
    if (process.env.NODE_ENV !== 'production') {
      return getMockSearchResults(params);
    }
    
    throw error;
  }
}

/**
 * Fetches detailed product information
 * @param itemCode - Rakuten item code
 * @returns Detailed product information
 */
export async function getProductDetails(itemCode: string): Promise<AppProduct | null> {
  validateRakutenConfig();

  const cacheKey = generateCacheKey('IchibaItem/20220601', { itemCode });
  const cached = cache.get<AppProduct>(cacheKey);
  
  if (cached) {
    console.log(`[RakutenAPI] Cache hit for product: ${itemCode}`);
    return cached;
  }

  try {
    const url = buildApiUrl('IchibaItem/20220601', { itemCode });
    const response = await makeRequest<{ Items: RakutenProduct[] }>(url);
    
    if (!response.Items || response.Items.length === 0) {
      return null;
    }

    const product = transformRakutenProduct(response.Items[0]);
    cache.set(cacheKey, product);
    
    console.log(`[RakutenAPI] Product details fetched: ${itemCode}`);
    return product;
    
  } catch (error) {
    console.error(`[RakutenAPI] Failed to fetch product ${itemCode}:`, error);
    
    // Return mock data as fallback
    if (process.env.NODE_ENV !== 'production') {
      return getMockProduct(itemCode);
    }
    
    return null;
  }
}

/**
 * Fetches products by category
 * @param genreId - Rakuten genre ID
 * @param page - Page number
 * @param pageSize - Items per page
 * @returns Category products
 */
export async function getProductsByCategory(
  genreId: string,
  page: number = 1,
  pageSize: number = RAKUTEN_CONFIG.DEFAULT_PAGE_SIZE
): Promise<{
  products: AppProduct[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}> {
  return searchProducts({
    genreId,
    page,
    pageSize,
    sort: 'reviewCount',
    sortOrder: 'desc',
  });
}

/**
 * Gets trending/popular products
 * @param limit - Number of products to return
 * @returns Popular products
 */
export async function getTrendingProducts(limit: number = 20): Promise<AppProduct[]> {
  const result = await searchProducts({
    pageSize: limit,
    sort: 'reviewCount',
    sortOrder: 'desc',
  });
  
  return result.products;
}

/**
 * Mock data for development and fallback
 */
function getMockSearchResults(params: ProductSearchParams): {
  products: AppProduct[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
} {
  const mockProducts: AppProduct[] = [
    {
      id: 'mock_1',
      name: `Sample Product - ${params.keyword || 'Electronics'}`,
      description: 'This is a mock product for development purposes',
      price: 29800,
      currency: 'JPY',
      images: {
        small: ['https://via.placeholder.com/150x150'],
        medium: ['https://via.placeholder.com/300x300'],
        large: ['https://via.placeholder.com/600x600'],
      },
      shop: {
        id: 'mock_shop',
        name: 'Mock Shop',
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
  ];

  return {
    products: mockProducts,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: mockProducts.length,
      itemsPerPage: mockProducts.length,
    },
  };
}

function getMockProduct(itemCode: string): AppProduct {
  return {
    id: `mock_${itemCode}`,
    name: `Mock Product ${itemCode}`,
    description: 'This is a mock product for development purposes',
    price: 15800,
    currency: 'JPY',
    images: {
      small: ['https://via.placeholder.com/150x150'],
      medium: ['https://via.placeholder.com/300x300'],
      large: ['https://via.placeholder.com/600x600'],
    },
    shop: {
      id: 'mock_shop',
      name: 'Mock Shop',
      url: 'https://example.com',
    },
    category: 'electronics',
    rating: 4.2,
    reviewCount: 95,
    url: `https://example.com/product/${itemCode}`,
    availability: 'in_stock',
    features: {
      freeShipping: true,
      creditCardAccepted: true,
      pointsEarnable: false,
    },
    metadata: {
      source: 'rakuten',
      originalId: itemCode,
      lastUpdated: new Date(),
    },
  };
}

/**
 * Clears the cache
 */
export function clearCache(): void {
  cache.clear();
  console.log('[RakutenAPI] Cache cleared');
}

/**
 * Gets cache statistics
 * @returns Cache statistics
 */
export function getCacheStats(): { size: number } {
  return {
    size: (cache as any).cache.size,
  };
}

/**
 * Health check for Rakuten API
 * @returns API health status
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: Date;
}> {
  try {
    validateRakutenConfig();
    
    // Try a simple search to test connectivity
    await searchProducts({ keyword: 'test', pageSize: 1 });
    
    return {
      status: 'healthy',
      message: 'Rakuten API is responding normally',
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
}