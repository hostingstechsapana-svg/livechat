"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"

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
  images: string[]
}

export default function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [hoveredId, setHoveredId] = useState<number | null>(null)

  // 🔹 FETCH FROM API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/public/camera")
        if (!res.ok) throw new Error("Failed to fetch cameras")

        const responseData = await res.json()

        // Assuming backend returns { data: Product[] }
        const data: Product[] = responseData.data || responseData

        // 🔥 FEATURED = LATEST CAMERAS BY ID
        const latestCameras = data
          .sort((a, b) => b.id - a.id)
          .slice(0, 3) // Show latest 3 cameras

        setProducts(latestCameras)
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])


  return (
    <section id="products" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-black">Featured</span> <span className="text-red-600">Photos</span>
          </h2>
          <p className="text-black text-base md:text-lg max-w-2xl mx-auto font-bold">
            Discover our newest camera additions - Stay ahead with the latest technology
          </p>
        </div>


        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">Loading featured cameras...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No discounted cameras available right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 md:gap-6">
            {products.map((product) => {
              const finalPrice = product.discountedPrice ?? product.price

              return (
                <Link href={`/products/${product.id}`} key={product.id} className="block">
                  <Card
                    className="overflow-hidden border hover:border-red-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group h-full flex flex-col"
                    onMouseEnter={() => setHoveredId(product.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="relative overflow-hidden aspect-square bg-gray-100">
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.cameraName}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          hoveredId === product.id ? "scale-110" : "scale-100"
                        }`}
                      />
                      {product.discountPercentage && product.discountPercentage > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1">
                          {product.discountPercentage}% OFF
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-3 flex flex-col flex-grow">
                      <Badge variant="secondary" className="text-xs mb-2 self-start">
                        {product.categoryName}
                      </Badge>

                      <h3 className="text-base font-bold mb-2 line-clamp-2 flex-grow">
                        {product.cameraName}
                      </h3>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-red-600">
                          NPR {Math.floor(finalPrice)}
                        </span>
                        {product.discountedPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            NPR {Math.floor(product.price)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Camera className="w-4 h-4" />
                        <span>{product.shutterCount ? product.shutterCount.toLocaleString() : 'N/A'} clicks</span>
                      </div>

                      <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-xs mt-auto">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
