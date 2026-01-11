"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { useMemo } from "react"

interface Category {
  id: number
  name: string
}

interface SubCategory {
  id: number
  name: string
  categoryName: string
}

interface ProductFiltersProps {
  categories: Category[]
  subCategories: SubCategory[]
  searchQuery: string
  setSearchQuery: (value: string) => void
  selectedCategory: string
  setSelectedCategory: (value: string) => void
  selectedSubCategory: string
  setSelectedSubCategory: (value: string) => void
  selectedCondition: string
  setSelectedCondition: (value: string) => void
  showMobileFilters: boolean
  setShowMobileFilters: (value: boolean) => void
  clearFilters: () => void
}

export default function ProductFilters({
  categories,
  subCategories,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  selectedCondition,
  setSelectedCondition,
  showMobileFilters,
  setShowMobileFilters,
  clearFilters,
}: ProductFiltersProps) {
  const subCategoryOptions = useMemo(() => {
    return ["all", ...subCategories.map(sc => sc.name)]
  }, [subCategories])

  return (
    <>
      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search cameras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 rounded-full border-2 border-input focus:border-primary bg-card text-card-foreground shadow-lg"
          />
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex flex-wrap justify-center gap-4 mb-8">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 bg-card border-input text-card-foreground">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory} disabled={subCategoryOptions.length <= 1}>
          <SelectTrigger className="w-48 bg-card border-input text-card-foreground">
            <SelectValue placeholder="All Subcategories" />
          </SelectTrigger>
          <SelectContent>
            {subCategoryOptions.map((subcategory, index) => (
              <SelectItem key={index} value={subcategory}>
                {subcategory === 'all' ? 'All Subcategories' : subcategory}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCondition} onValueChange={setSelectedCondition}>
          <SelectTrigger className="w-48 bg-card border-input text-card-foreground">
            <SelectValue placeholder="All Conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            <SelectItem value="NEW">New Cameras</SelectItem>
            <SelectItem value="USED">Used Cameras</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={clearFilters}
          variant="outline"
          className="bg-card border-input text-card-foreground hover:bg-muted ripple"
        >
          <X size={16} className="mr-2" />
          Clear Filters
        </Button>
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden flex justify-center mb-8">
        <Button
          onClick={() => setShowMobileFilters(true)}
          variant="outline"
          className="bg-card border-input text-card-foreground hover:bg-muted ripple"
        >
          <SlidersHorizontal size={16} className="mr-2" />
          Filters
        </Button>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-xl p-6 transform transition-transform duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">Filters</h3>
              <Button
                onClick={() => setShowMobileFilters(false)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full bg-background border-input text-foreground">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Subcategory</label>
                <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory} disabled={subCategoryOptions.length <= 1}>
                  <SelectTrigger className="w-full bg-background border-input text-foreground">
                    <SelectValue placeholder="All Subcategories" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategoryOptions.map((subcategory, index) => (
                      <SelectItem key={index} value={subcategory}>
                        {subcategory === 'all' ? 'All Subcategories' : subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Condition</label>
                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger className="w-full bg-background border-input text-foreground">
                    <SelectValue placeholder="All Conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="NEW">New Cameras</SelectItem>
                    <SelectItem value="USED">Used Cameras</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => {
                  clearFilters();
                  setShowMobileFilters(false);
                }}
                className="w-full bg-red-gradient hover:bg-red-to-black text-white ripple"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}