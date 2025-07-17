import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProductDetail } from '@/components/mustme/product-detail'
import { 
  Home, 
  ChevronRight, 
  Share2, 
  Heart, 
  ShoppingCart,
  Shield,
  Truck,
  RotateCcw,
  AlertCircle,
  Star,
  ExternalLink,
  ImageOff,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface RakutenProduct {
  itemCode: string
  itemName: string
  itemCaption: string
  itemPrice: number
  itemUrl: string
  mediumImageUrls: Array<{ imageUrl: string }>
  smallImageUrls: Array<{ imageUrl: string }>
  shopName: string
  shopCode: string
  shopUrl: string
  genreId: string
  tagIds?: number[]
  availability: 1 | 0
  taxFlag: 1 | 0
  postageFlag: 1 | 0
  creditCardFlag: 1 | 0
  shopOfTheYearFlag: 1 | 0
  affiliateRate: number
  startTime?: string
  endTime?: string
  reviewCount?: number
  reviewAverage?: number
  pointRate?: number
  pointRateStartTime?: string
  pointRateEndTime?: string
  shipOverseasFlag?: 1 | 0
  shipOverseasArea?: string
  asurakuFlag?: 1 | 0
  asurakuClosingTime?: string
  asurakuArea?: string
  sensitiveFlag?: 1 | 0
}

interface RakutenApiResponse {
  Items: Array<{
    Item: RakutenProduct
  }>
  count: number
  page: number
  first: number
  last: number
  hits: number
  carrier: number
  pageCount: number
}

interface PageProps {
  params: Promise<{ itemCode: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function fetchProductData(itemCode: string): Promise<RakutenProduct | null> {
  try {
    const baseUrl = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706'
    const searchParams = new URLSearchParams({
      format: 'json',
      keyword: itemCode,
      applicationId: process.env.RAKUTEN_APPLICATION_ID || '',
      affiliateId: process.env.RAKUTEN_AFFILIATE_ID || '',
      hits: '1',
      page: '1'
    })

    const response = await fetch(`${baseUrl}?${searchParams.toString()}`, {
      headers: {
        'User-Agent': 'MustMe/1.0',
      },
      next: { revalidate: 3600 } // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`)
    }

    const data: RakutenApiResponse = await response.json()
    
    if (!data.Items || data.Items.length === 0) {
      return null
    }

    return data.Items[0].Item
  } catch (error) {
    console.error('Error fetching product data:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const product = await fetchProductData(resolvedParams.itemCode)
  
  if (!product) {
    return {
      title: 'Product Not Found - MustMe',
      description: 'The requested product could not be found.'
    }
  }

  const cleanTitle = product.itemName.replace(/<[^>]*>/g, '').slice(0, 60)
  const cleanDescription = product.itemCaption.replace(/<[^>]*>/g, '').slice(0, 160)
  
  return {
    title: `${cleanTitle} - MustMe Reviews & Analysis`,
    description: `${cleanDescription} Find honest reviews, detailed analysis, and smart shopping insights on MustMe.`,
    keywords: `${cleanTitle}, product reviews, shopping, ${product.shopName}`,
    openGraph: {
      title: `${cleanTitle} - MustMe`,
      description: cleanDescription,
      images: product.mediumImageUrls.length > 0 ? [
        {
          url: product.mediumImageUrls[0].imageUrl,
          width: 400,
          height: 400,
          alt: cleanTitle,
        }
      ] : [],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cleanTitle} - MustMe`,
      description: cleanDescription,
      images: product.mediumImageUrls.length > 0 ? [product.mediumImageUrls[0].imageUrl] : [],
    }
  }
}

function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Not Found</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find the product you're looking for. It may have been removed or the link might be incorrect.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/search'}
                  className="inline-flex items-center"
                >
                  Search Products
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductImageGallery({ product }: { product: RakutenProduct }) {
  const images = product.mediumImageUrls || []
  
  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <ImageOff className="w-12 h-12 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square relative overflow-hidden rounded-lg border">
        <Image
          src={images[0].imageUrl}
          alt={product.itemName}
          fill
          className="object-contain"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(1, 5).map((image, index) => (
            <div key={index} className="aspect-square relative overflow-hidden rounded border">
              <Image
                src={image.imageUrl}
                alt={`${product.itemName} - Image ${index + 2}`}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductInfo({ product }: { product: RakutenProduct }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(price)
  }

  const cleanName = product.itemName.replace(/<[^>]*>/g, '')
  const cleanCaption = product.itemCaption.replace(/<[^>]*>/g, '')

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Product Title and Basic Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
              {cleanName}
            </h1>
            <p className="text-gray-600 leading-relaxed">
              {cleanCaption}
            </p>
          </div>

          {/* Price and Availability */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-orange-600">
                {formatPrice(product.itemPrice)}
              </span>
              {product.taxFlag === 1 && (
                <Badge variant="secondary">Tax Included</Badge>
              )}
              {product.postageFlag === 0 && (
                <Badge variant="outline">Free Shipping</Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {product.availability === 1 ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
              
              {product.pointRate && (
                <Badge variant="secondary">
                  {product.pointRate}% Points
                </Badge>
              )}
            </div>
          </div>

          {/* Reviews Summary */}
          {product.reviewCount && product.reviewAverage && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{product.reviewAverage}</span>
              </div>
              <span className="text-gray-600">
                ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full tap-target touch-manipulation" 
              onClick={() => window.open(product.itemUrl, '_blank', 'noopener,noreferrer')}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Buy on Rakuten
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" className="tap-target touch-manipulation">
                <Heart className="w-5 h-5 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="lg" className="tap-target touch-manipulation">
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Shop Information */}
          <Separator />
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Sold by</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{product.shopName}</p>
                <div className="flex items-center gap-4 mt-1">
                  {product.shopOfTheYearFlag === 1 && (
                    <Badge variant="secondary">Shop of the Year</Badge>
                  )}
                  {product.creditCardFlag === 1 && (
                    <span className="text-sm text-gray-600">Credit Cards</span>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="tap-target touch-manipulation"
                onClick={() => window.open(product.shopUrl, '_blank', 'noopener,noreferrer')}
              >
                Visit Shop
                <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Service Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Secure Payment</p>
                <p className="text-sm text-blue-700">Protected transactions</p>
              </div>
            </div>
            
            {product.postageFlag === 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Truck className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Free Shipping</p>
                  <p className="text-sm text-green-700">No additional costs</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <RotateCcw className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">Return Policy</p>
                <p className="text-sm text-orange-700">Shop terms apply</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Breadcrumb({ product }: { product: RakutenProduct }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <button 
        onClick={() => window.location.href = '/'}
        className="hover:text-orange-600 transition-colors tap-target touch-manipulation"
      >
        <Home className="w-4 h-4" />
      </button>
      <ChevronRight className="w-4 h-4" />
      <button 
        onClick={() => window.location.href = '/search'}
        className="hover:text-orange-600 transition-colors tap-target touch-manipulation"
      >
        Products
      </button>
      <ChevronRight className="w-4 h-4" />
      <span className="text-gray-900 font-medium truncate">
        {product.itemName.replace(/<[^>]*>/g, '').slice(0, 50)}...
      </span>
    </nav>
  )
}

function ProductHeader({ product }: { product: RakutenProduct }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <Breadcrumb product={product} />
      
      {/* + Write a Review Button */}
      <Button 
        className="bg-orange-500 hover:bg-orange-600 text-white tap-target touch-manipulation"
        size="sm"
        onClick={() => window.location.href = `/write-review?itemCode=${encodeURIComponent(product.itemCode)}`}
      >
        <Plus className="w-4 h-4 mr-2" />
        Write a Review
      </Button>
    </div>
  )
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const product = await fetchProductData(resolvedParams.itemCode)
  
  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-6">
        <ProductHeader product={product} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <ProductImageGallery product={product} />
          </div>
          
          {/* Product Information */}
          <div>
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <ProductDetail 
            product={{
              id: resolvedParams.itemCode,
              itemCode: resolvedParams.itemCode,
              name: product.itemName.replace(/<[^>]*>/g, ''),
              brand: product.shopName, 
              price: product.itemPrice,
              originalPrice: undefined,
              image: product.mediumImageUrls[0]?.imageUrl || '',
              images: product.mediumImageUrls.map(img => img.imageUrl) || [],
              description: product.itemCaption.replace(/<[^>]*>/g, ''),
              category: "商品",
              averageRating: product.reviewAverage || 0,
              totalReviews: product.reviewCount || 0,
              tags: [],
              specifications: {
                "商品コード": product.itemCode,
                "ショップ": product.shopName
              }
            }}
            onWriteReview={() => {
              // Navigate to write review page with itemCode
              window.location.href = `/write-review?itemCode=${encodeURIComponent(product.itemCode)}`;
            }}
            onAddToCart={() => {
              // Open Rakuten product page
              window.open(product.itemUrl, '_blank');
            }}
          />
        </div>

        {/* Additional Product Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Product Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Item Code</h3>
                    <p className="text-gray-600 font-mono text-sm">{product.itemCode}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Genre ID</h3>
                    <p className="text-gray-600">{product.genreId}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Affiliate Rate</h3>
                    <p className="text-gray-600">{product.affiliateRate}%</p>
                  </div>
                  {product.asurakuFlag === 1 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Asuraku Delivery</h3>
                      <p className="text-gray-600">Available</p>
                    </div>
                  )}
                </div>
                
                {product.shipOverseasFlag === 1 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">International Shipping</h3>
                    <p className="text-gray-600">
                      Available to: {product.shipOverseasArea || 'Select regions'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Purchase Options</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Credit Card</span>
                  <span className="text-green-600">
                    {product.creditCardFlag === 1 ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Free Shipping</span>
                  <span className="text-green-600">
                    {product.postageFlag === 0 ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tax Included</span>
                  <span className="text-green-600">
                    {product.taxFlag === 1 ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Points</span>
                  <span className="text-orange-600">
                    {product.pointRate ? `${product.pointRate}%` : 'Standard'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}