"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, MessageCircle, Shield } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const menuItems = [
    { name: "Home", href: "/#home" },
    { name: "Products", href: "/products" },
    { name: "Why Choose Us", href: "/#why-choose-us" },
    { name: "About Us", href: "/#about" },
    { name: "Chat", href: "/chat" },
    { name: "Contact", href: "/#contact" },
  ]

  const isActive = (href: string, name: string) => {
    if (pathname === href) return true
    if (pathname === "/" && name === "Home") return true
    return false
  }

  return (
    <>
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-red-600 shadow-lg" : "bg-red-600"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2 group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xl md:text-2xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform duration-200">
              CameraKinneyHoinata
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => {
              const active = isActive(item.href, item.name)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative text-white hover:text-red-100 transition-colors duration-200 font-medium text-base group focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600 rounded-sm ${active ? 'font-semibold' : ''}`}
                >
                  {item.name === "Chat" && <MessageCircle className="w-4 h-4 inline mr-1" />}
                  {item.name}
                  <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-white transition-all duration-300 rounded-full ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              )
            })}
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="secondary"
              className="bg-white text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-105 font-semibold shadow-md rounded-lg px-6"
            >
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-4 animate-in slide-in-from-top duration-300">
            {menuItems.map((item) => {
              const active = isActive(item.href, item.name)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative block text-white hover:text-red-100 transition-all duration-200 font-medium py-2 pl-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600 rounded-sm ${active ? 'font-semibold' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name === "Chat" && <MessageCircle className="w-4 h-4 inline mr-1" />}
                  {item.name}
                  <span className={`absolute bottom-1 left-2 h-0.5 bg-white transition-all duration-300 rounded-full ${active ? 'w-8' : 'w-0 hover:w-8'}`} />
                </Link>
              )
            })}
            <Button onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false); }} variant="secondary" className="w-full bg-white text-red-600 hover:bg-red-50 font-semibold">
              Login
            </Button>
          </div>
        )}
      </div>
    </nav>
    {isModalOpen && (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Choose Login Method</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4">
            <Button onClick={() => { window.location.href = '/api/v1/auth/google'; setIsModalOpen(false); }} className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            <Button onClick={() => { router.push('/admin'); setIsModalOpen(false); }} variant="outline" className="w-full border border-gray-300 bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 mr-2" />
              Admin Login
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
