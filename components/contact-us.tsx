"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Thank you! Your message has been sent.")
    setFormData({ name: "", email: "", message: "" })
  }

  return (
    <section
      id="contact"
      className="relative py-20 bg-white overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Have questions? We'd love to hear from you. Send us a message and we’ll respond shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          
          {/* Contact Form */}
          <Card className="shadow-xl border border-gray-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Send us a message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message
                  </label>
                  <Textarea
                    required
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base font-medium"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-5">
            {[
              {
                icon: <MapPin />,
                title: "Visit Our Store",
                text: "View on Google Maps",
                link: "https://maps.app.goo.gl/SMLyF3ebFBEA21ap6",
              },
              {
                icon: <Phone />,
                title: "Call Us",
                text: "9819492655 (9AM – 6PM)",
              },
              {
                icon: <Mail />,
                title: "Email Us",
                text: "info@camerakinn.com",
              },
              {
                icon: <Clock />,
                title: "Business Hours",
                text: "Sun–Fri: 9AM–6PM | Sat: 10AM–5PM",
              },
            ].map((item, i) => (
              <Card key={i} className="border border-gray-200 shadow-sm">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {item.title}
                    </h4>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        className="text-red-600 hover:underline"
                      >
                        {item.text}
                      </a>
                    ) : (
                      <p className="text-gray-600">{item.text}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
