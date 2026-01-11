"use client"

import { X } from "lucide-react"
import { useState } from "react"

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-red-600 text-white py-3 px-4 relative">
      <div className="container mx-auto flex items-center justify-center text-center">
        <p className="text-sm md:text-base font-medium">
          🎉 Welcome to Camera Shop - Premium Camera Equipment for Professional Photography
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 hover:bg-red-700 rounded-full p-1 transition-colors"
          aria-label="Close announcement"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}