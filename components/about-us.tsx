export default function AboutUs() {
  return (
    <section id="about" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Text Content */}
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 text-balance">
              <span className="text-black">About</span> <span className="text-red-600">Us</span> <span className="text-red-600">Camera</span><span className="text-black">KinneyHoinata</span>
            </h2>
            <div className="space-y-4 text-muted-foreground text-base md:text-lg leading-relaxed">
              <p className="text-pretty">
                For over a decade, CameraKinneyHoinata has been the trusted name in professional photography equipment.
                We pride ourselves on delivering not just cameras, but complete imaging solutions that empower
                photographers to capture their vision with precision and artistry.
              </p>
              <p className="text-pretty">
                Our commitment to quality, innovation, and customer satisfaction has made us a leading choice for
                professionals and enthusiasts alike. Every product in our collection is carefully selected to meet the
                highest standards of performance and reliability, ensuring you get the best value for your investment.
              </p>
              <p className="text-pretty">
                From cutting-edge mirrorless systems to classic DSLRs, from compact travel cameras to professional
                cinema equipment, we offer a comprehensive range that caters to every photography need. Trust
                CameraKinneyHoinata to be your partner in capturing life's most precious moments.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="p-4 bg-white rounded-lg shadow-md">
                <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">10+</div>
                <div className="text-muted-foreground font-medium">Years of Excellence</div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-md">
                <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">50K+</div>
                <div className="text-muted-foreground font-medium">Happy Customers</div>
              </div>
            </div>
          </div>

          {/* Right: Background Image */}
          <div className="order-1 lg:order-2 relative h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden shadow-2xl group">
            <img
              src="/photography-studio-professional-equipment.jpg"
              alt="About us"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
