"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, FolderOpen, Clock, TrendingUp, Layers } from "lucide-react"
import CategoryPieChart from "@/components/admin/category-pie-chart"

interface DashboardCounts {
  totalCategories: number
  totalSubCategories: number
  totalCameras: number
  activeCameras: number
  categoriesCreatedThisMonth: number
  camerasUploadedThisMonth: number
  activeCamerasThisMonth: number
}

interface ChartData {
  categoryName: string
  cameraCount: number
}

export default function Dashboard() {
  const [counts, setCounts] = useState<DashboardCounts | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch main dashboard counts
        const countsRes = await fetch('/api/admin/dashboard')
        const countsData = await countsRes.json()
        if (countsData.success) {
          setCounts(countsData.data)
        } else {
          setError(countsData.message || 'Failed to fetch dashboard data')
        }

        // Fetch subcategory count
        const subCategoryRes = await fetch('/api/v1/camera-subcategories/count');
        const subCategoryCount = await subCategoryRes.json();
        setCounts(prevCounts => ({
            ...prevCounts,
            totalSubCategories: subCategoryCount,
            totalCategories: prevCounts?.totalCategories || 0,
            totalCameras: prevCounts?.totalCameras || 0,
            activeCameras: prevCounts?.activeCameras || 0,
            categoriesCreatedThisMonth: prevCounts?.categoriesCreatedThisMonth || 0,
            camerasUploadedThisMonth: prevCounts?.camerasUploadedThisMonth || 0,
            activeCamerasThisMonth: prevCounts?.activeCamerasThisMonth || 0,
        }));


        // Fetch chart data
        const chartRes = await fetch('/api/admin/dashboard?type=chart')
        const chartData = await chartRes.json()
        if (chartData.success) {
          setChartData(chartData.data || [])
        }

      } catch (err) {
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the admin panel overview</p>
        </div>

        {error && (
          <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-4 hover:border-red-600 transition-all duration-500 hover:shadow-2xl hover:shadow-red-200 hover:-translate-y-4 hover:scale-105 bg-gradient-to-br from-white via-red-50/50 to-red-100/30 p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold text-gray-800">Total Cameras</CardTitle>
              <div className="p-3 bg-red-100 rounded-full shadow-lg">
                <Camera className="text-red-600" size={32} />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-6xl font-black text-red-600 mb-2 animate-pulse">
                {loading ? (
                  <div className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : (
                  counts?.totalCameras || 0
                )}
              </div>
              <p className="text-sm text-gray-600 font-semibold mb-3">All products in inventory</p>
              <div className="w-full bg-red-200 rounded-full h-2 shadow-inner">
                <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full shadow-sm" style={{width: '100%'}}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 hover:border-green-600 transition-all duration-500 hover:shadow-2xl hover:shadow-green-200 hover:-translate-y-4 hover:scale-105 bg-gradient-to-br from-white via-green-50/50 to-green-100/30 p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold text-gray-800">Active Cameras</CardTitle>
              <div className="p-3 bg-green-100 rounded-full shadow-lg">
                <Camera className="text-green-600" size={32} />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-6xl font-black text-green-600 mb-2 animate-pulse">
                {loading ? (
                  <div className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : (
                  counts?.activeCameras || 0
                )}
              </div>
              <p className="text-sm text-gray-600 font-semibold mb-3">Currently active products</p>
              <div className="w-full bg-green-200 rounded-full h-2 shadow-inner">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full shadow-sm" style={{width: '85%'}}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 hover:border-blue-600 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-200 hover:-translate-y-4 hover:scale-105 bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold text-gray-800">Total Categories</CardTitle>
              <div className="p-3 bg-blue-100 rounded-full shadow-lg">
                <FolderOpen className="text-blue-600" size={32} />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-6xl font-black text-blue-600 mb-2 animate-pulse">
                {loading ? (
                  <div className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : (
                  counts?.totalCategories || 0
                )}
              </div>
              <p className="text-sm text-gray-600 font-semibold mb-3">Product categories</p>
              <div className="w-full bg-blue-200 rounded-full h-2 shadow-inner">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full shadow-sm" style={{width: '60%'}}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 hover:border-yellow-600 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-200 hover:-translate-y-4 hover:scale-105 bg-gradient-to-br from-white via-yellow-50/50 to-yellow-100/30 p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold text-gray-800">Total Subcategories</CardTitle>
              <div className="p-3 bg-yellow-100 rounded-full shadow-lg">
                <Layers className="text-yellow-600" size={32} />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-6xl font-black text-yellow-600 mb-2 animate-pulse">
                {loading ? (
                  <div className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : (
                  counts?.totalSubCategories || 0
                )}
              </div>
              <p className="text-sm text-gray-600 font-semibold mb-3">Product sub-types</p>
              <div className="w-full bg-yellow-200 rounded-full h-2 shadow-inner">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full shadow-sm" style={{width: '45%'}}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 hover:border-purple-600 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-200 hover:-translate-y-4 hover:scale-105 bg-gradient-to-br from-white via-purple-50/50 to-purple-100/30 p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold text-gray-800">Cameras This Month</CardTitle>
              <div className="p-3 bg-purple-100 rounded-full shadow-lg">
                <TrendingUp className="text-purple-600" size={32} />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-6xl font-black text-purple-600 mb-2 animate-pulse">
                {loading ? (
                  <div className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : (
                  counts?.camerasUploadedThisMonth || 0
                )}
              </div>
              <p className="text-sm text-gray-600 font-semibold mb-3">Uploaded this month</p>
              <div className="w-full bg-purple-200 rounded-full h-2 shadow-inner">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full shadow-sm" style={{width: '75%'}}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 hover:border-orange-600 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-200 hover:-translate-y-4 hover:scale-105 bg-gradient-to-br from-white via-orange-50/50 to-orange-100/30 p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold text-gray-800">Categories This Month</CardTitle>
              <div className="p-3 bg-orange-100 rounded-full shadow-lg">
                <FolderOpen className="text-orange-600" size={32} />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-6xl font-black text-orange-600 mb-2 animate-pulse">
                {loading ? (
                  <div className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : (
                  counts?.categoriesCreatedThisMonth || 0
                )}
              </div>
              <p className="text-sm text-gray-600 font-semibold mb-3">Created this month</p>
              <div className="w-full bg-orange-200 rounded-full h-2 shadow-inner">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full shadow-sm" style={{width: '40%'}}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 hover:border-teal-600 transition-all duration-500 hover:shadow-2xl hover:shadow-teal-200 hover:-translate-y-4 hover:scale-105 bg-gradient-to-br from-white via-teal-50/50 to-teal-100/30 p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold text-gray-800">Active This Month</CardTitle>
              <div className="p-3 bg-teal-100 rounded-full shadow-lg">
                <Clock className="text-teal-600" size={32} />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-6xl font-black text-teal-600 mb-2 animate-pulse">
                {loading ? (
                  <div className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : (
                  counts?.activeCamerasThisMonth || 0
                )}
              </div>
              <p className="text-sm text-gray-600 font-semibold mb-3">Active this month</p>
              <div className="w-full bg-teal-200 rounded-full h-2 shadow-inner">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full shadow-sm" style={{width: '90%'}}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Distribution Chart */}
        <CategoryPieChart data={chartData} />
      </div>
    </AdminLayout>
  )
}
