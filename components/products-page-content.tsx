"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera, ChevronLeft, ChevronRight } from "lucide-react"
import ProductFilters from "@/components/product-filters"

interface Product {
  id: number
  cameraName: string
  description: string
  price: number
  discountPercentage: number | null
  discountAmount: number | null
  discountedPrice: number | null
  categoryName: string
  subCategoryName: string
  shutterCount: number | null
  cameraCondition: string
  images: string[]
}

interface Category {
  id: number
  name: string
}

interface SubCategory {
  id: number
  name: string
  categoryName: string
}

function ProductCard({ product }: { product: Product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const finalPrice = product.discountedPrice ?? product.price;
  const originalPrice = product.price;
  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"];

  // Auto-play functionality
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Touch handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && images.length > 1) {
      prevImage();
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group relative overflow-hidden bg-card border border-border shadow-lg card-hover rounded-xl transition-all duration-300 hover:border-primary/50">
        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt={product.cameraName}
              className="w-full h-64 object-cover image-zoom bg-gradient-to-br from-gray-100 to-gray-200 transition-transform duration-300"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />

            {/* Navigation arrows - only show if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    prevImage();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    nextImage();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Image indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      goToImage(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? 'bg-white'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {product.discountPercentage && product.discountPercentage > 0 && (
              <div className="absolute top-3 left-3 bg-red-gradient text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg animate-pulse">
                {product.discountPercentage}% OFF
              </div>
            )}
            {/* View Product button */}
            <div className="absolute inset-0 flex items-center justify-center fade-in">
              <Button className="bg-red-gradient hover:bg-red-to-black text-white font-semibold px-6 py-3 rounded-full shadow-lg hover-glow ripple transform scale-90 group-hover:scale-100 transition-transform duration-300">
                View Product
              </Button>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-bold text-lg text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {product.cameraName}
            </h3>
            <p className="text-muted-foreground text-sm mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {product.shutterCount ? `${product.shutterCount.toLocaleString()} clicks` : product.cameraCondition}
            </p>
            <div className="flex items-center gap-2 transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
              <span className="text-2xl font-bold text-primary">
                NPR {Math.floor(finalPrice).toLocaleString()}
              </span>
              {product.discountedPrice && (
                <span className="text-muted-foreground line-through text-sm">
                  NPR {Math.floor(originalPrice).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


export default function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSubCategory, setSelectedSubCategory] = useState("all")
  const [selectedCondition, setSelectedCondition] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const fetchProducts = async (condition: string = "all") => {
    try {
      setLoading(true)
      const res = await fetch('/api/public/camera')
      if (!res.ok) {
        console.error(`Failed to fetch products: ${res.status}`)
        setProducts([])
        return
      }
      const data = await res.json()
      if (data.success) {
        let allProducts = data.data || []
        if (condition === "NEW") {
          allProducts = allProducts.filter((p: Product) => p.cameraCondition === "NEW")
        } else if (condition === "USED") {
          allProducts = allProducts.filter((p: Product) => p.cameraCondition === "USED")
        }
        setProducts(allProducts)
      } else {
        setProducts([])
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/public/category')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch categories')
    }
  }

  const fetchSubCategories = async (categoryId?: number) => {
    try {
      const url = categoryId ? `/api/public/subcategory/category/${categoryId}` : '/api/public/subcategory'
      const res = await fetch(url)
      const data = await res.json()
      setSubCategories(data || [])
    } catch (err) {
      console.error('Failed to fetch subcategories')
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchSubCategories() // Fetch all subcategories initially
  }, [])

  useEffect(() => {
    fetchProducts(selectedCondition)
  }, [selectedCondition])

  useEffect(() => {
    if (selectedCategory === "all") {
      fetchSubCategories()
    } else {
      const category = categories.find(c => c.name === selectedCategory)
      if (category) {
        fetchSubCategories(category.id)
      }
    }
    setSelectedSubCategory("all")
  }, [selectedCategory, categories])
  
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.cameraName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.categoryName === selectedCategory
      const matchesSubCategory = selectedSubCategory === "all" || product.subCategoryName === selectedSubCategory
      return matchesSearch && matchesCategory && matchesSubCategory
    })
  }, [products, searchQuery, selectedCategory, selectedSubCategory])


  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedSubCategory("all")
    setSelectedCondition("all")
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">All Products</h1>
          <p className="text-muted-foreground text-lg">Find the perfect camera for your needs from our premium collection.</p>
        </div>

        <ProductFilters
          categories={categories}
          subCategories={subCategories}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSubCategory={selectedSubCategory}
          setSelectedSubCategory={setSelectedSubCategory}
          selectedCondition={selectedCondition}
          setSelectedCondition={setSelectedCondition}
          showMobileFilters={showMobileFilters}
          setShowMobileFilters={setShowMobileFilters}
          clearFilters={clearFilters}
        />

        {/* Products Grid */}
        <section>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-shimmer bg-muted rounded-lg w-full max-w-sm h-64"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Camera size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
