import Navbar from "@/components/navbar"
import ProductsPageContent from "@/components/products-page-content"
import Footer from "@/components/footer"

export default function ProductsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <ProductsPageContent />
      <Footer />
    </main>
  )
}
