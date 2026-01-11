"use client"

import React, { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Camera,
  Zap,
  Tag,
  Layers,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"

interface Product {
  id: number
  cameraName: string
  description: string
  price: number
  discountPercentage: number | null
  discountAmount: number | null
  discountedPrice: number
  categoryName: string
  subCategoryName: string
  shutterCount: number
  cameraCondition: string
  images: string[]
}

type ProductDetailsProps = {
  cameraId: string
}

export default function ProductDetails({ cameraId }: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string>("")

  useEffect(() => {
    if (!cameraId) return

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/public/camera/${cameraId}`)
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error("Failed to load product")
        setProduct(json.data)
        setSelectedImage(json.data.images?.[0])
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [cameraId])

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="h-14 w-14 rounded-full animate-spin border-4 border-red-600 border-t-transparent" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 text-red-600 bg-gray-50">
        Failed to load product
      </div>
    )
  }

  const finalPrice = product.discountedPrice ?? product.price

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-14">
          {/* IMAGE SECTION */}
          <div className="space-y-5">
            <div className="relative aspect-square rounded-3xl bg-white shadow-2xl p-6">
              <img
                src={selectedImage}
                alt={product.cameraName}
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>

            <div className="grid grid-cols-5 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === img
                      ? "border-red-600 scale-105 shadow-lg"
                      : "border-gray-200 hover:border-red-400"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="space-y-8">
            {/* CATEGORY */}
            <div className="flex gap-3">
              <Badge variant="outline" className="text-red-600 border-red-600">{product.categoryName}</Badge>
              <Badge variant="outline">{product.subCategoryName}</Badge>
              <Badge className="bg-red-600 text-white">{product.cameraCondition}</Badge>
            </div>

            {/* TITLE */}
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
              {product.cameraName}
            </h1>

            {/* PRICE */}
            <div className="bg-white rounded-2xl p-8 shadow-lg space-y-4">
              <div className="flex items-end gap-4">
                <span className="text-4xl font-bold text-red-600">
                  NPR {finalPrice.toLocaleString()}
                </span>
                {product.discountedPrice && (
                  <span className="line-through text-gray-400 text-xl">
                    NPR {product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex gap-3 flex-wrap">
                {product.discountPercentage && (
                  <Badge className="bg-red-600 text-white">
                    <Zap className="w-4 h-4 mr-1" />
                    {product.discountPercentage}% OFF
                  </Badge>
                )}
                {product.discountAmount && (
                  <Badge variant="outline">
                    <Tag className="w-4 h-4 mr-1" />
                    Save NPR {product.discountAmount.toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>

            {/* TRUST INFO */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Trust icon={<ShieldCheck />} text="Verified Product" />
              <Trust icon={<Truck />} text="Fast Delivery" />
              <Trust icon={<RotateCcw />} text="Easy Return" />
            </div>

            {/* SHUTTER */}
            <div className="bg-white rounded-2xl p-6 shadow-md flex items-center gap-4">
              <div className="bg-red-600 p-4 rounded-xl">
                <Camera className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase">Shutter Count</p>
                <p className="text-2xl font-bold text-red-600">
                  {product.shutterCount.toLocaleString()} clicks
                </p>
              </div>
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-red-600" />
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FLOATING CHAT */}
      <Link href="/chat">
        <Button className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 rounded-full p-4 shadow-xl">
          <MessageCircle />
        </Button>
      </Link>
    </div>
  )
}

function Trust({ icon, text }: { icon: React.ReactElement; text: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
      <div className="text-red-600">{icon}</div>
      <span className="font-medium text-gray-700">{text}</span>
    </div>
  )
}
