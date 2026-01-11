"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-16 md:pt-20 overflow-hidden"
    >
      {/* Background Image */}
      <img
        src="/professional-camera-photography-studio-setup-with-.jpg"
        alt="Professional Camera"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* LEFT SIDE GRADIENT (THIS IS THE MAGIC) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16">
        <div className="max-w-2xl">

          {/* Badge */}
          <div className="inline-block mb-8">
            <div className="px-6 py-2 rounded-full border border-red-600/40 bg-red-600/10 backdrop-blur-sm">
              <span className="text-red-500 font-medium text-sm md:text-base">
                Premium Camera Equipment
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Capture Every{" "}
            <span className="block text-red-600">Perfect Moment</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
            Discover our curated collection of professional cameras and accessories.
            Where innovation meets artistry.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-base md:text-lg shadow-xl group"
              >
                Shop Cameras
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <a href="#why-choose-us">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-base md:text-lg"
              >
                Learn More
              </Button>
            </a>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
