"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Product {
  id: number
  cameraName: string
  description: string
  price: number
  discountPercentage: number | null
  discountAmount: number | null
  discountedPrice: number | null
  categoryName: string
  images: string[]
}

export default function DiscountedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/public/camera")
        const responseData = await res.json()

        if (!responseData.success) {
          console.error('Failed to fetch products:', responseData.message)
          setProducts([])
          setLoading(false)
          return
        }

        const data = responseData.data

        if (!Array.isArray(data)) {
          console.error('Expected array of products, got:', data)
          setProducts([])
          setLoading(false)
          return
        }

        const discountedOnly = data
          .filter((p) => p.discountPercentage && p.discountPercentage > 0)
          .sort((a, b) => b.id - a.id)
          .slice(0, 3)

        setProducts(discountedOnly)
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Auto rotate products
  useEffect(() => {
    if (products.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
      setImageIndex(0)
    }, 5000)

    return () => clearInterval(interval)
  }, [products.length])

  if (!loading && products.length === 0) return null

  const currentProduct = products[currentIndex]
  const images =
    currentProduct?.images?.length > 0
      ? currentProduct.images
      : ["/placeholder.svg"]

  const finalPrice =
    currentProduct?.discountedPrice ?? currentProduct?.price ?? 0

  const nextProduct = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
    setImageIndex(0)
  }

  const prevProduct = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
    setImageIndex(0)
  }

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Swipe handlers (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current

    if (distance > 50) nextImage()
    if (distance < -50) prevImage()

    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            📸 Latest Cameras
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Discover our newest camera additions - Stay ahead with the latest technology!
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="h-80 bg-gray-200 animate-pulse rounded-lg" />
          ) : currentProduct ? (
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-red-200 relative">
              {/* Main product image - takes full space */}
              <div
                className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center bg-gray-50"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={images[imageIndex]}
                  alt={currentProduct.cameraName}
                  className="
                    w-full h-full object-contain
                    transition-transform duration-500
                    md:hover:scale-105
                  "
                />

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 shadow-lg p-4 rounded-full hover:scale-110 transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 shadow-lg p-4 rounded-full hover:scale-110 transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>

                    {/* Image dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImageIndex(i)}
                          className={`w-4 h-4 rounded-full transition-all ${
                            i === imageIndex
                              ? "bg-red-600 scale-125"
                              : "bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Content overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6">
                <div className="text-white">
                  <Badge className="mb-2 bg-red-600 text-white">
                    {currentProduct.categoryName}
                  </Badge>

                  <h3 className="text-2xl md:text-3xl font-bold mb-2">
                    {currentProduct.cameraName}
                  </h3>

                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl md:text-4xl font-bold text-red-400">
                      NPR {Math.floor(finalPrice)}
                    </span>
                    <Badge className="bg-red-600 text-white font-bold animate-pulse">
                      -{currentProduct.discountPercentage}%
                    </Badge>
                  </div>

                    <div className="flex items-center justify-between">
                      <Button className="bg-red-600 hover:bg-red-700 text-white text-lg py-3 px-8 font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                        Shop Now – Save NPR {Math.floor(currentProduct.price - finalPrice)}
                      </Button>

                      {/* Product Navigation */}
                      {products.length > 1 && (
                        <div className="flex items-center gap-3 ml-4">
                          <div className="flex gap-2">
                            <button
                              onClick={prevProduct}
                              className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={nextProduct}
                              className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>
                          <span className="text-white/80 text-sm">
                            {currentIndex + 1} of {products.length}
                          </span>
                        </div>
                      )}
                    </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
