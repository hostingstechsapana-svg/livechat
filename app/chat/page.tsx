import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import UserChat from "@/components/chat/user-chat"

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-24 md:pt-32 pb-8 md:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
                <span className="text-foreground">Live</span> <span className="text-red-600">Chat</span> <span className="text-foreground">Support</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg text-pretty mb-4">
                Connect with our camera experts in real-time
              </p>
              <p className="text-muted-foreground text-sm md:text-base text-pretty max-w-2xl mx-auto">
                Get instant help with product recommendations, pricing information, technical support, and answers to all your camera-related questions. Our team is here to assist you 24/7!
              </p>
            </div>

            {/* Chat Interface */}
            <UserChat />

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
