"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import AdminLayout from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Category {
  id: number
  
  name: string
}

interface SubCategory {
  id: number
  name: string
  categoryName: string
  categoryId?: number
}

interface Camera {
  id: number
  cameraName: string
  serialNumber: string | null
  description: string
  price: number
  discountPercentage: number | null
  discountAmount: number | null
  discountedPrice: number | null
  categoryName: string
  subCategoryName: string
  deleted: boolean
  createdAt: string
  images: string[]
  shutterCount: number | null
  condition: 'NEW' | 'USED'
}

export default function ManageCameras() {
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null);
  const [cameras, setCameras] = useState<Camera[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [subCategories, setSubCategories] = useState<SubCategory[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [formData, setFormData] = useState({
      cameraName: "",
      categoryId: "",
      subCategoryId: "",
      price: "",
      discountPercentage: "",
      serialNumber: "",
      description: "",
      shutterCount: "",
      images: null as FileList | null,
      condition: "",
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: number]: number }>({})
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [existingImages, setExistingImages] = useState<string[]>([])
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  const fetchCameras = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/cameras')
      const data = await res.json()
      if (data.success) {
        const camerasData: Camera[] = data.data || []
        setCameras(camerasData.filter(camera => !camera.deleted))
      } else {
        toast.error(data.message || 'Failed to fetch cameras', { style: { background: 'white', color: 'red' } })
      }
    } catch (err) {
      toast.error('Network error', { style: { background: 'white', color: 'red' } })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (err) {
      // ignore
    }
  }

  const fetchSubCategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubCategories([])
      return
    }
    try {
      // Fetch all subcategories and filter by category name
      const res = await fetch('/api/admin/subcategories')
      const data = await res.json()
      if (data.success) {
        const category = categories.find(c => c.id === parseInt(categoryId))
        if (category) {
          const filtered = (data.data || []).filter((sub: SubCategory) => sub.categoryName === category.name)
          setSubCategories(filtered)
        } else {
          setSubCategories([])
        }
      }
    } catch (err) {
      setSubCategories([])
    }
  }

  useEffect(() => {
    fetchCameras()
    fetchCategories()
  }, [])


  const filteredCameras = useMemo(() => {
    return cameras.filter((camera) => {
      const query = searchQuery.toLowerCase()
      return (
        camera.cameraName.toLowerCase().includes(query) ||
        camera.categoryName.toLowerCase().includes(query) ||
        (camera.serialNumber?.toLowerCase().includes(query) ?? false)
      )
    })
  }, [cameras, searchQuery])

  const handleSave = async () => {
    if (!formData.categoryId) {
      toast.error('Please select a category', { style: { background: 'white', color: 'red' } })
      return
    }
    if (!formData.subCategoryId) {
      toast.error('Please select a subcategory', { style: { background: 'white', color: 'red' } })
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price', { style: { background: 'white', color: 'red' } })
      return
    }
    setSaving(true)
    try {
      const formDataToSend = new FormData()
      if (editingId) {
        // For update, send data as JSON blob
        const cameraData = {
          cameraName: formData.cameraName,
          description: formData.description,
          serialNumber: formData.serialNumber,
          price: parseFloat(formData.price),
          discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
          shutterCount: formData.shutterCount ? parseInt(formData.shutterCount) : null,
          cameraCondition: formData.condition || "NEW",
        }
        formDataToSend.append('data', new Blob([JSON.stringify(cameraData)], { type: 'application/json' }))
        formDataToSend.append('categoryId', formData.categoryId)
        formDataToSend.append('subCategoryId', formData.subCategoryId)
      } else {
        // For create, send individual fields
        formDataToSend.append('cameraName', formData.cameraName)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('serialNumber', formData.serialNumber)
        formDataToSend.append('price', formData.price)
        if (formData.discountPercentage) {
          formDataToSend.append('discountPercentage', formData.discountPercentage)
        }
        formDataToSend.append('categoryId', formData.categoryId)
        formDataToSend.append('subCategoryId', formData.subCategoryId)
        if (formData.shutterCount) {
          formDataToSend.append('shutterCount', formData.shutterCount)
        }
        formDataToSend.append('cameraCondition', formData.condition || "NEW")
      }
      selectedFiles.forEach(file => {
        formDataToSend.append('images', file)
      })
      if (imagesToDelete.length > 0) {
        formDataToSend.append('deleteImages', JSON.stringify(imagesToDelete))
      }

      console.log('Sending camera data:', {
        cameraName: formData.cameraName,
        description: formData.description,
        serialNumber: formData.serialNumber,
        price: formData.price,
        discountPercentage: formData.discountPercentage,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        shutterCount: formData.shutterCount,
        cameraCondition: formData.condition || "NEW",
        imagesCount: selectedFiles.length
      })

      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/cameras/${editingId}` : '/api/admin/cameras'

      const res = await fetch(url, {
        method,
        body: formDataToSend,
      })

      console.log('Camera save response status:', res.status)
      const data = await res.json()
      console.log('Camera save response data:', data)
      if (data.success) {
        setFormData({
          cameraName: "",
          categoryId: "",
          subCategoryId: "",
          price: "",
          discountPercentage: "",
          serialNumber: "",
          description: "",
          shutterCount: "",
          images: null,
          condition: "NEW",
        })
        toast.success('Camera saved successfully!', { style: { background: 'white', color: 'green' } })
        setIsFormOpen(false)
        setEditingId(null)
        setExistingImages([])
        setImagesToDelete([])
        await fetchCameras()
      } else {
        toast.error(data.message || 'Failed to save camera', { style: { background: 'white', color: 'red' } })
      }
    } catch (err) {
      toast.error('Network error', { style: { background: 'white', color: 'red' } })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: number) => {
    setDeletingId(id)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    setShowDeleteDialog(false)
    try {
      const res = await fetch(`/api/admin/cameras/delete/${deletingId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message || 'Camera deleted successfully!', { style: { background: 'white', color: 'green' } })
        await fetchCameras()
      } else {
        toast.error(data.message || 'Failed to delete camera', { style: { background: 'white', color: 'red' } })
      }
    } catch (err) {
      toast.error('Network error', { style: { background: 'white', color: 'red' } })
    }
    setDeletingId(null)
  }

  const nextImage = (cameraId: number, images: string[]) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [cameraId]: (prev[cameraId] || 0) + 1 >= images.length ? 0 : (prev[cameraId] || 0) + 1
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setSelectedFiles(prev => [...prev, ...Array.from(files)])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    const img = existingImages[index];
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    setImagesToDelete(prev => [...prev, img]);
  }

  const prevImage = (cameraId: number, images: string[]) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [cameraId]: (prev[cameraId] || 0) - 1 < 0 ? images.length - 1 : (prev[cameraId] || 0) - 1
    }))
  }

  const startEditing = async (camera: Camera) => {
    // 1. Open form and set editing ID
    setIsFormOpen(true);
    setEditingId(camera.id);
    
    // 2. Find category ID
    const categoryId = categories.find(c => c.name === camera.categoryName)?.id.toString() || "";

    // 3. Reset form data
    setFormData({
      cameraName: camera.cameraName,
      categoryId: categoryId,
      subCategoryId: "", // Important: reset while fetching
      price: camera.price.toString(),
      discountPercentage: camera.discountPercentage?.toString() || "",
      serialNumber: camera.serialNumber || "",
      description: camera.description,
      shutterCount: camera.shutterCount?.toString() || "",
      condition: camera.condition || "",
      images: null,
    });
    setSelectedFiles([]); // Also clear any selected files from a previous operation
    setExistingImages(camera.images); // Set existing images for display
    setImagesToDelete([]); // Clear delete list

    // 4. Scroll form into view
    // Use a timeout to ensure the form is rendered before scrolling
    setTimeout(() => {
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);


    // 5. Fetch subcategories and set the correct one
    if (categoryId) {
      try {
        const res = await fetch('/api/admin/subcategories');
        const data = await res.json();

        if (data.success) {
          const allSubCategories: SubCategory[] = data.data || [];
          const category = categories.find(c => c.id === parseInt(categoryId));
          
          if (category) {
            const filteredSubs = allSubCategories.filter(sub => sub.categoryName === category.name);
            setSubCategories(filteredSubs); // Populate the dropdown

            const subCategoryToSet = filteredSubs.find(s => s.name === camera.subCategoryName);
            if (subCategoryToSet) {
              setFormData(prev => ({...prev, subCategoryId: subCategoryToSet.id.toString()}));
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch or set subcategory", err);
        setSubCategories([]); // Clear dropdown on error
      }
    } else {
      setSubCategories([]); // No category, no subcategories
    }
  };

  return (
    <AdminLayout>
      {loading ? (
        <div className="text-center py-12">Loading cameras...</div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Manage Cameras</h1>
              <p className="text-foreground">Add, edit, or remove camera products</p>
            </div>
            <Button
              onClick={() => {
                setIsFormOpen(!isFormOpen)
                setEditingId(null)
                setFormData({
                  cameraName: "",
                  categoryId: "",
                  subCategoryId: "",
                  price: "",
                  discountPercentage: "",
                  serialNumber: "",
                  description: "",
                  shutterCount: "",
                  images: null,
                  condition: "",
                })
                setSelectedFiles([])
                setExistingImages([])
                setImagesToDelete([])
                setSubCategories([])
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus size={20} className="mr-2" />
              Add Camera
            </Button>
          </div>

          {/* Search Bar */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search cameras by name, category, or serial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>

          {/* Add/Edit Form */}
          {isFormOpen && (
            <Card className="border-2 border-red-600" ref={formRef}>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Camera" : "Add New Camera"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Camera Name</label>
                    <Input
                      value={formData.cameraName}
                      onChange={(e) => setFormData({ ...formData, cameraName: e.target.value })}
                      placeholder="Enter camera name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, categoryId: value, subCategoryId: "" })
                        fetchSubCategories(value)
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subcategory</label>
                    <Select
                      value={formData.subCategoryId}
                      onValueChange={(value) => setFormData({ ...formData, subCategoryId: value })}
                      disabled={!formData.categoryId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Subcategory" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black">
                        {subCategories.map((subCat) => (
                          <SelectItem key={subCat.id} value={subCat.id.toString()}>{subCat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Condition</label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData({ ...formData, condition: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Condition" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black">
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="USED">Used</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Discount (%)</label>
                    <Input
                      type="number"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Serial Number</label>
                    <Input
                      value={formData.serialNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          serialNumber: e.target.value,
                        })
                      }
                      placeholder="CAM-XXX-XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Shutter Count</label>
                    <Input
                      type="number"
                      value={formData.shutterCount}
                      onChange={(e) => setFormData({ ...formData, shutterCount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter camera description"
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-card-foreground">Images</label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
                        >
                          Choose Images
                        </label>
                        <span className="text-sm text-muted-foreground">
                          {selectedFiles.length} file(s) selected
                        </span>
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {file.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {editingId && existingImages.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Existing Images</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {existingImages.map((img, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={img}
                                  alt={`Existing ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeExistingImage(index)}
                                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
                    {saving ? 'Saving...' : 'Save Camera'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsFormOpen(false)
                      setEditingId(null)
                      setExistingImages([])
                      setImagesToDelete([])
                      setSubCategories([])
                    }}
                    className="bg-card border-input text-card-foreground hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cameras Grid */}
          {filteredCameras.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-foreground mb-4">
                {cameras.length === 0 ? "No cameras available. Add your first camera to get started." : "No cameras found matching your search."}
              </p>
              {cameras.length > 0 && (
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8">
              {filteredCameras.map((camera) => (
                <Card key={camera.id} className="group relative overflow-hidden bg-card border border-border shadow-lg card-hover rounded-xl transition-all duration-300 hover:border-primary/50">
                  <div className="relative overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                      <img
                        src={camera.images[currentImageIndexes[camera.id] || 0] || "/placeholder.svg"}
                        alt={camera.cameraName}
                        className="w-full h-full object-cover image-zoom bg-gradient-to-br from-gray-100 to-gray-200 transition-transform duration-300"
                      />
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-red-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {camera.images.length > 1 && (
                        <>
                          <button
                            onClick={() => prevImage(camera.id, camera.images)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => nextImage(camera.id, camera.images)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <ChevronRight size={16} />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {camera.images.map((_, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                  index === (currentImageIndexes[camera.id] || 0) ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {camera.discountPercentage && camera.discountPercentage > 0 && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-red-600 text-white font-bold px-2 py-1">{camera.discountPercentage}% OFF</Badge>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-black/70 text-white">{camera.categoryName}</Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-white/90 text-black border-black/20">{camera.condition}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 relative">
                    <h3 className="font-bold text-lg text-red-600 mb-2 line-clamp-2">{camera.cameraName}</h3>
                    <p className="text-sm text-foreground mb-3 font-mono bg-muted px-2 py-1 rounded">{camera.serialNumber}</p>
                    <p className="text-sm text-foreground mb-2"><strong>Category:</strong> {camera.categoryName}</p>
                    <p className="text-sm text-black mb-3"><strong>Shutter Count:</strong> {camera.shutterCount ? camera.shutterCount.toLocaleString() : 'N/A'} clicks</p>
                    <p className="text-sm text-foreground mb-4 line-clamp-3">{camera.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-primary">NPR {Math.floor(camera.discountedPrice || camera.price)}</span>
                        {camera.discountedPrice && camera.discountedPrice < camera.price && (
                          <span className="text-lg text-muted-foreground line-through">NPR {Math.floor(camera.price)}</span>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Button
                        size="sm"
                        asChild
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <a href={`/products/${camera.id}`} target="_blank" rel="noopener noreferrer">
                          View Details
                        </a>
                      </Button>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(camera)}
                        className="flex-1 border-2 border-primary text-primary hover:bg-primary/10 hover:border-primary font-semibold"
                      >
                        <Pencil size={16} className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-2 border-destructive text-destructive hover:bg-destructive/10 hover:border-destructive font-semibold"
                        onClick={() => handleDelete(camera.id)}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-black">Confirm Delete</h3>
            <p className="mb-4 text-black">Are you sure you want to delete this camera? This action cannot be undone.</p>
            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>No</Button>
              <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Yes</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
