"use client"

import React from 'react'
import { SearchHeader } from './search-header'
import { TrendingSearches } from './trending-searches'
import { ProductGrid } from './product-grid'

interface MainContentLayoutProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onSearchSubmit?: (query: string) => void
  products?: any[]
  isLoading?: boolean
  onProductClick?: (productId: string) => void
  onFilterApply?: (filters: any) => void
  className?: string
}

export default function MainContentLayout({
  searchQuery = "",
  onSearchChange,
  onSearchSubmit,
  products = [],
  isLoading = false,
  onProductClick,
  onFilterApply,
  className = ""
}: MainContentLayoutProps) {
  return (
    <div className={`min-h-full bg-background ${className}`}>
      <div className="flex flex-col h-full">
        {/* Search Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="px-6 py-4">
            <SearchHeader 
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onSearchSubmit={onSearchSubmit}
              onFilterApply={onFilterApply}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-6 space-y-8">
          {/* Trending Searches Section */}
          <div className="space-y-4">
            <TrendingSearches 
              onTrendingClick={(trend) => {
                if (onSearchChange) {
                  onSearchChange(trend)
                }
                if (onSearchSubmit) {
                  onSearchSubmit(trend)
                }
              }}
            />
          </div>

          {/* Product Grid Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                {searchQuery ? `Results for "${searchQuery}"` : 'Discover Products'}
              </h2>
              {products.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {products.length} product{products.length !== 1 ? 's' : ''} found
                </span>
              )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <ProductGrid 
                products={products}
                isLoading={isLoading}
                onProductClick={onProductClick}
              />
            </div>

            {/* Empty State */}
            {!isLoading && products.length === 0 && searchQuery && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <svg 
                    className="w-8 h-8 text-muted-foreground" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground max-w-md">
                  We couldn't find any products matching "{searchQuery}". Try adjusting your search terms or browse our trending items.
                </p>
              </div>
            )}

            {/* Default State */}
            {!isLoading && products.length === 0 && !searchQuery && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg 
                    className="w-8 h-8 text-primary" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Start discovering products
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Use the search bar above or click on trending searches to find products you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}