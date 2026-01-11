"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartData {
  categoryName: string
  cameraCount: number
}

interface CategoryPieChartProps {
  data: ChartData[]
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null)

  // Vibrant admin-friendly color palette
  const colors = [
    '#4f46e5', // indigo
    '#f59e0b', // amber
    '#10b981', // emerald
    '#ec4899', // pink
    '#3b82f6', // blue
    '#f97316', // orange
    '#8b5cf6', // violet
    '#22d3ee', // cyan
  ]

  const total = data.reduce((sum, item) => sum + item.cameraCount, 0)

  const slices = data.map((item, index) => {
    const percentage = (item.cameraCount / total) * 100
    return {
      ...item,
      percentage,
      color: colors[index % colors.length],
      index
    }
  })

  // Calculate SVG paths
  let cumulativeAngle = 0
  const slicePaths = slices.map((slice) => {
    const startAngle = cumulativeAngle
    const endAngle = cumulativeAngle + (slice.percentage / 100) * 360
    cumulativeAngle = endAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = 125 + 100 * Math.cos(startRad)
    const y1 = 125 + 100 * Math.sin(startRad)
    const x2 = 125 + 100 * Math.cos(endRad)
    const y2 = 125 + 100 * Math.sin(endRad)

    const largeArc = slice.percentage > 50 ? 1 : 0

    const pathData = [
      `M 125 125`,
      `L ${x1} ${y1}`,
      `A 100 100 0 ${largeArc} 1 ${x2} ${y2}`,
      `Z`
    ].join(' ')

    return { ...slice, pathData, midAngle: (startAngle + endAngle) / 2 }
  })

  return (
    <Card className="border-2 hover:border-indigo-500 transition-colors shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">Camera Distribution by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          
          {/* Pie Chart */}
          <div className="relative">
            <svg width="300" height="300" viewBox="0 0 250 250" className="drop-shadow-xl">
              {slicePaths.map((slice, index) => (
                <path
                  key={index}
                  d={slice.pathData}
                  fill={slice.color}
                  stroke="white"
                  strokeWidth="2"
                  className={`cursor-pointer transition-all duration-300 transform ${
                    hoveredSlice === index ? 'scale-105 opacity-90' : 'scale-100 opacity-100'
                  }`}
                  onMouseEnter={() => setHoveredSlice(index)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              ))}
            </svg>

            {/* Center total */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center transition-transform duration-300 hover:scale-105">
                <div className="text-2xl font-bold text-gray-800">{total}</div>
                <div className="text-sm text-gray-500">Total Cameras</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {slices.map((slice, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 ${
                  hoveredSlice === index ? 'scale-105 shadow-md' : ''
                }`}
                onMouseEnter={() => setHoveredSlice(index)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: slice.color }} />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm">{slice.categoryName}</div>
                  <div className="text-xs text-gray-500">{slice.cameraCount} cameras</div>
                </div>
                <div className="text-sm font-bold text-gray-700">{slice.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredSlice !== null && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border shadow-md transition-all duration-200">
            <div className="font-semibold text-gray-800">{slices[hoveredSlice].categoryName}</div>
            <div className="text-sm text-gray-600">
              {slices[hoveredSlice].cameraCount} cameras ({slices[hoveredSlice].percentage.toFixed(1)}%)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
