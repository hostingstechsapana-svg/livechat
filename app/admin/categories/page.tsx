"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import AdminLayout from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Plus, Search } from "lucide-react"

interface Category {
  id: number
  name: string
}

export default function ManageCategories() {
   const [categories, setCategories] = useState<Category[]>([])
   const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
   const [searchQuery, setSearchQuery] = useState("")
   const [isAdding, setIsAdding] = useState(false)
   const [editingId, setEditingId] = useState<number | null>(null)
   const [categoryName, setCategoryName] = useState("")
   const [loading, setLoading] = useState(true)
   const [saving, setSaving] = useState(false)
   const [showDeleteDialog, setShowDeleteDialog] = useState(false)
   const [deletingId, setDeletingId] = useState<number | null>(null)

   const fetchCategories = async () => {
     try {
       setLoading(true)
       const res = await fetch('/api/admin/categories')
       const data = await res.json()
       if (data.success) {
         setCategories(data.data || [])
       } else {
         toast.error(data.message || 'Failed to fetch categories', { style: { background: 'white', color: 'red' } })
       }
     } catch (err) {
       toast.error('Network error', { style: { background: 'white', color: 'red' } })
     } finally {
       setLoading(false)
     }
   }

   useEffect(() => {
     fetchCategories()
   }, [])

   // Update filtered categories when categories or search query changes
   useEffect(() => {
     const filtered = categories.filter((category) =>
       category.name.toLowerCase().includes(searchQuery.toLowerCase())
     )
     setFilteredCategories(filtered)
   }, [categories, searchQuery])

  const handleSave = async () => {
    if (!categoryName.trim()) return
    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Category saved successfully!', { style: { background: 'white', color: 'green' } })
        setCategoryName("")
        setIsAdding(false)
        setEditingId(null)
        await fetchCategories()
      } else {
        toast.error(data.message || 'Failed to save category', { style: { background: 'white', color: 'red' } })
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
       const res = await fetch(`/api/admin/categories/${deletingId}`, { method: 'DELETE' })
       const data = await res.json()
       if (data.success) {
         toast.success('Category deleted successfully!', { style: { background: 'white', color: 'green' } })
         await fetchCategories()
       } else {
         toast.error(data.message || 'Failed to delete category', { style: { background: 'white', color: 'red' } })
       }
     } catch (err) {
       toast.error('Network error', { style: { background: 'white', color: 'red' } })
     }
     setDeletingId(null)
   }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setCategoryName(category.name)
    setIsAdding(true)
  }

  return (
     <AdminLayout>
       {loading ? (
        <div className="text-center py-12">Loading categories...</div>
      ) : (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Manage Categories</h1>
            <p className="text-foreground">Add, edit, or remove product categories</p>
          </div>
          <Button
            onClick={() => {
              setIsAdding(!isAdding)
              setEditingId(null)
              setCategoryName("")
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus size={20} className="mr-2" />
            Add Category
          </Button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <Card className="border-2 border-red-600 max-w-2xl">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Category" : "Add New Category"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full"
                />
                <div className="flex gap-3 flex-wrap">
                  <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-none">
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false)
                      setEditingId(null)
                      setCategoryName("")
                    }}
                    className="flex-1 sm:flex-none bg-card border-input text-card-foreground hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-4 font-semibold">ID</th>
                    <th className="text-left p-4 font-semibold">Category Name</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">{category.id}</td>
                      <td className="p-4 font-medium">{category.name}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(category)} className="text-primary hover:bg-primary/10">
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 bg-transparent"
                            onClick={() => handleDelete(category.id)}
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

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-foreground mb-4">No categories found matching your search.</p>
            <Button
              onClick={() => setSearchQuery("")}
              variant="outline"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Clear Search
            </Button>
          </div>
        )}
        </div>
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-black">Confirm Delete</h3>
            <p className="mb-4 text-black">Are you sure you want to delete this category? This action cannot be undone.</p>
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
