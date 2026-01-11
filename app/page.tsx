import Navbar from "@/components/navbar"
import AnnouncementBar from "@/components/announcement-bar"
import Hero from "@/components/hero"
import DiscountedProducts from "@/components/discounted-products"
import WhyChooseUs from "@/components/why-choose-us"
import ProductShowcase from "@/components/product-showcase"
import ChatSection from "@/components/chat-section"
import ContactUs from "@/components/contact-us"
import Footer from "@/components/footer"
import AboutUs from "@/components/about-us"

export default function Home() {
  return (
    <main className="min-h-screen" id="home">
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <DiscountedProducts />
      <ProductShowcase />
      <WhyChooseUs />
      <AboutUs />
      <ChatSection />
      <ContactUs />
      <Footer />
    </main>
  )
}

