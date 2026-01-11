"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FolderOpen, Camera, MessageSquare, LogOut, Menu, X, Layers } from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: FolderOpen, label: "Manage Category", href: "/admin/categories" },
  { icon: Layers, label: "Manage Subcategory", href: "/admin/subcategories" },
  { icon: Camera, label: "Manage Camera", href: "/admin/cameras" },
  { icon: MessageSquare, label: "Chat", href: "/admin/chat" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-black text-white z-40 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold mb-8">Admin Panel</h1>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? "bg-red-600 text-white" : "hover:bg-gray-800 text-gray-300"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 mt-8 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">{children}</main>
      <Toaster position="top-right" />

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  )
}
