import { Award, Zap, Shield, DollarSign, CheckCircle, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Award,
    title: "Premium Quality",
    description: "Hand-picked cameras from the world's leading manufacturers",
  },
  {
    icon: Zap,
    title: "Latest Technology",
    description: "Cutting-edge features and innovations in every product",
  },
  {
    icon: Shield,
    title: "Trusted Brand",
    description: "Years of excellence serving photography enthusiasts",
  },
  {
    icon: DollarSign,
    title: "Best Pricing",
    description: "Competitive prices with unmatched value and quality",
  },
  {
    icon: Users,
    title: "Trusted by Professionals",
    description: "Preferred choice of photographers and filmmakers worldwide",
  },
  {
    icon: DollarSign,
    title: "Competitive Pricing",
    description: "Best prices without compromising on quality or service",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Industry-leading security for safe and protected payments",
  },
  {
    icon: CheckCircle,
    title: "Quality Assurance",
    description: "Rigorous testing and inspection for every product",
  },
]

export default function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 text-balance">
            Why <span className="text-red-600">Choose</span> Us
          </h2>
          <p className="text-black text-base md:text-lg max-w-2xl mx-auto text-pretty font-bold">
            Experience the difference with our commitment to quality and service
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 border-gray-300 hover:border-red-600 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2 group bg-gradient-to-br from-white to-gray-50"
            >
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4 group-hover:bg-red-600 group-hover:text-white group-hover:shadow-lg transition-all duration-300">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-black text-pretty leading-relaxed font-bold">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
