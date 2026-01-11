"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import AdminLayout from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SubCategory {
  id: number;
  name: string;
  categoryName: string;
  categoryId: number;
}

interface Category {
  id: number
  name: string
}

export default function ManageSubCategories() {
   const [subCategories, setSubCategories] = useState<SubCategory[]>([])
   const [categories, setCategories] = useState<Category[]>([])
   const [searchQuery, setSearchQuery] = useState("")
   const [isAdding, setIsAdding] = useState(false)
   const [editingId, setEditingId] = useState<number | null>(null)
   const [subCategoryName, setSubCategoryName] = useState("")
   const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
   const [loading, setLoading] = useState(true)
   const [saving, setSaving] = useState(false)
   const [showDeleteDialog, setShowDeleteDialog] = useState(false)
   const [deletingId, setDeletingId] = useState<number | null>(null)

   const fetchSubCategories = async () => {
     try {
       setLoading(true)
       // Assuming an endpoint to get all subcategories with their category info
       const res = await fetch('/api/admin/subcategories')
       const data = await res.json()
       if (data.success) {
        setSubCategories(data.data || [])
       } else {
         toast.error(data.message || 'Failed to fetch subcategories', { style: { background: 'white', color: 'red' } })
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
      console.error('Failed to fetch categories')
    }
  }

   useEffect(() => {
     fetchSubCategories()
     fetchCategories()
   }, [])

   const filteredSubCategories = useMemo(() => {
    return subCategories.filter((sc) =>
      sc.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
   }, [subCategories, searchQuery])

  const handleSave = async () => {
    if (!subCategoryName.trim() || !selectedCategoryId) {
        toast.error("Subcategory name and parent category are required.", { style: { background: 'white', color: 'red' } })
        return
    }
    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/subcategories/${editingId}` : '/api/admin/subcategories'
      const body = JSON.stringify(editingId ? { id: editingId, name: subCategoryName, categoryId: parseInt(selectedCategoryId) } : { name: subCategoryName, categoryId: parseInt(selectedCategoryId) })

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Subcategory saved successfully!', { style: { background: 'white', color: 'green' } })
        setSubCategoryName("")
        setSelectedCategoryId("")
        setIsAdding(false)
        setEditingId(null)
        await fetchSubCategories()
      } else {
        toast.error(data.message || 'Failed to save subcategory', { style: { background: 'white', color: 'red' } })
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
       const res = await fetch(`/api/admin/subcategories/${deletingId}`, { method: 'DELETE' })
       const data = await res.json()
       if (data.success) {
         toast.success('Subcategory deleted successfully!', { style: { background: 'white', color: 'green' } })
         await fetchSubCategories()
       } else {
         toast.error(data.message || 'Failed to delete subcategory', { style: { background: 'white', color: 'red' } })
       }
     } catch (err) {
       toast.error('Network error', { style: { background: 'white', color: 'red' } })
     }
     setDeletingId(null)
   }

  const handleEdit = (subCategory: SubCategory) => {
    setEditingId(subCategory.id)
    setSubCategoryName(subCategory.name)
    setSelectedCategoryId(String(subCategory.categoryId))
    setIsAdding(true)
  }
  
  const resetForm = () => {
    setIsAdding(false)
    setEditingId(null)
    setSubCategoryName("")
    setSelectedCategoryId("")
  }

  return (
     <AdminLayout>
       {loading ? (
        <div className="text-center py-12">Loading subcategories...</div>
      ) : (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Manage Subcategories</h1>
            <p className="text-foreground">Add, edit, or remove product subcategories</p>
          </div>
          <Button
            onClick={() => {
              setIsAdding(!isAdding)
              setEditingId(null)
              setSubCategoryName("")
              setSelectedCategoryId("")
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus size={20} className="mr-2" />
            Add Subcategory
          </Button>
        </div>

        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search subcategories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        {isAdding && (
          <Card className="border-2 border-red-600 max-w-2xl">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Subcategory" : "Add New Subcategory"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Subcategory name"
                  value={subCategoryName}
                  onChange={(e) => setSubCategoryName(e.target.value)}
                  className="w-full"
                />
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select a parent category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex gap-3 flex-wrap">
                  <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-none">
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 sm:flex-none bg-card border-input text-card-foreground hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-4 font-semibold">ID</th>
                    <th className="text-left p-4 font-semibold">Subcategory Name</th>
                    <th className="text-left p-4 font-semibold">Parent Category</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubCategories.map((sc) => (
                    <tr key={sc.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">{sc.id}</td>
                      <td className="p-4 font-medium">{sc.name}</td>
                      <td className="p-4"><span className="font-bold text-black">{sc.categoryName}</span></td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(sc)} className="text-primary hover:bg-primary/10">
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 bg-transparent"
                            onClick={() => handleDelete(sc.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredSubCategories.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-lg text-foreground">No subcategories found.</p>
          </div>
        )}
        </div>
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-black">Confirm Delete</h3>
            <p className="mb-4 text-black">Are you sure you want to delete this subcategory? This action cannot be undone.</p>
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
