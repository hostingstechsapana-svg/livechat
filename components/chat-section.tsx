"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface Message {
  id: number
  text: string
  sender: "user" | "admin"
  timestamp: Date
}

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can we help you today?",
      sender: "admin",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputValue,
        sender: "user",
        timestamp: new Date(),
      }
      setMessages([...messages, newMessage])
      setInputValue("")

      // Simulate admin response
      setTimeout(() => {
        const adminResponse: Message = {
          id: messages.length + 2,
          text: "Thank you for your message. Our team will respond shortly!",
          sender: "admin",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, adminResponse])
      }, 1000)
    }
  }

  return (
    <section id="chat" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 text-balance">
              Chat <span className="text-red-600">With</span> Us
            </h2>
            <p className="text-black text-base md:text-lg text-pretty font-bold">
              Have questions? Our team is here to help
            </p>
          </div>

          <Card className="shadow-2xl border-2 border-gray-200 hover:border-red-300 transition-all duration-300">
            <CardHeader className="bg-red-600 text-white rounded-t-xl">
              <CardTitle className="text-xl font-bold">Live Chat Support</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 bg-white">
              {/* Messages */}
              <div className="h-[350px] md:h-[450px] overflow-y-auto mb-6 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-[75%] rounded-xl px-4 py-3 shadow-md ${
                        message.sender === "user"
                          ? "bg-red-600 text-white border border-red-700"
                          : "bg-white text-gray-900 border border-gray-300"
                      }`}
                    >
                      <p className="text-sm md:text-base font-medium">{message.text}</p>
                      <span className={`text-xs ${message.sender === "user" ? "text-red-100" : "text-gray-500"}`} suppressHydrationWarning={true}>
                        {message.timestamp.toLocaleTimeString('en-US', {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-3">
                <Input
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage()
                  }}
                  className="flex-1 border-2 border-gray-300 focus:border-red-500 text-black font-medium"
                />
                <Button onClick={handleSendMessage} className="bg-red-600 hover:bg-red-700 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Send size={20} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
