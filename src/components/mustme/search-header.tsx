"use client"

import { useState } from "react"
import { Search, ChevronDown, Grid3X3, List, User, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface SearchHeaderProps {
  onSearch?: (query: string) => void
  onCategoryChange?: (category: string) => void
  onSortChange?: (sort: string) => void
  onViewChange?: (view: "grid" | "list") => void
}

export default function SearchHeader({
  onSearch,
  onCategoryChange,
  onSortChange,
  onViewChange,
}: SearchHeaderProps) {
  const { user, loading } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("すべて")
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid")

  const categories = [
    "すべて",
    "美容・コスメ",
    "ガジェット・家電",
    "ファッション・グルメ・その他",
    "ゲーム・生活",
    "スポーツ・アウトドア",
  ]

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    onCategoryChange?.(category)
  }

  const handleViewToggle = (view: "grid" | "list") => {
    setCurrentView(view)
    onViewChange?.(view)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 w-full bg-background border-b border-border">
      <div className="px-4 md:px-6 py-4 space-y-4">
        {/* Top row with logo and auth */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-primary">
              MustMe
            </h1>
          </Link>
          
          {/* Auth Section - Mobile Responsive */}
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            ) : user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  ログイン
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="商品名で検索..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 text-base bg-muted/30 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Category Tags and Controls Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Category Tags */}
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <Button
              variant="ghost"
              className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => onSortChange?.("popular")}
            >
              <span className="text-sm font-medium">人気順</span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewToggle("grid")}
                className={`
                  p-2 rounded-md transition-colors
                  ${
                    currentView === "grid"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }
                `}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewToggle("list")}
                className={`
                  p-2 rounded-md transition-colors
                  ${
                    currentView === "list"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }
                `}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}