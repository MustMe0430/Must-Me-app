"use client"

import { TrendingUp, Clock } from "lucide-react"

const popularSearches = [
  "iPhone 15 Pro",
  "Nintendo Switch", 
  "AirPods Pro",
  "MacBook Air",
  "SK-II 化粧水",
  "デロンギ エスプレッソマシン",
  "ユニクロ ダウンジャケット",
  "バルミューダ トースター",
  "Apple Watch",
  "ダイソン ドライヤー"
]

const recentSearches = [
  "AirPods Pro",
  "iPhone 15 Pro", 
  "Nintendo Switch"
]

export default function TrendingSearches() {
  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      {/* Popular Searches Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">人気の検索</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {popularSearches.map((search, index) => (
            <button
              key={index}
              className="bg-muted text-muted-foreground px-4 py-2.5 rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200 text-left"
            >
              {search}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-base font-semibold text-foreground">最近の検索</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {recentSearches.map((search, index) => (
            <button
              key={index}
              className="bg-secondary text-secondary-foreground px-3 py-2 rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}