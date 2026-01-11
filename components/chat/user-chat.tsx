"use client";

import { useState, useEffect, useRef } from "react";
import { useWebSocketChat, useTypingIndicator } from "@/lib/hooks/chat";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Bot, User, Wifi, WifiOff, Paperclip, Smile, Plus, X } from "lucide-react";

interface ChatSession {
  id: string;
  name: string;
}

export default function UserChat() {
  const [sessionId, setSessionId] = useState<string>("");

  const { messages, sendMessage, isConnected, loadMessages } = useWebSocketChat(sessionId);
  const { typing: adminTyping, sendTyping } = useTypingIndicator(sessionId);

  // Fetch sessionId for authenticated users
  useEffect(() => {
    const fetchSessionId = async () => {
      try {
        const res = await fetch('/api/chat/room');
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.data.sessionId);
        } else {
          // Fallback to default for anonymous
          setSessionId("default-user-session");
        }
      } catch (err) {
        console.error("Failed to fetch sessionId:", err);
        setSessionId("default-user-session");
      }
    };
    fetchSessionId();
  }, []);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldAutoScrollRef = useRef(true);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    shouldAutoScrollRef.current = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    if (shouldAutoScrollRef.current) scrollToBottom();
  }, [messages, adminTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
    sendTyping(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    sendTyping(!!value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Load historical messages when session is available
  useEffect(() => {
    if (sessionId) {
      loadMessages();
    }
  }, [sessionId, loadMessages]);

  if (!sessionId) return null;

  return (
    <Card className="shadow-2xl border-2 overflow-hidden">
      <CardHeader className="bg-red-600 text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 border border-white">
              <AvatarFallback className="bg-white text-red-600 font-bold text-sm">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-sm">Support Team</h3>
              <Badge className={`text-xs ${isConnected ? "bg-green-500" : "bg-gray-500"} text-white`}>
                {isConnected ? <><Wifi className="w-3 h-3 mr-1" /> Online</> : <><WifiOff className="w-3 h-3 mr-1" /> Offline</>}
              </Badge>
            </div>
          </div>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            className="bg-white text-red-600 hover:bg-gray-100 h-8 px-2"
          >
            <Plus className="w-3 h-3 mr-1" />
            <span className="text-xs">New Chat</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-[400px] sm:h-[450px] md:h-[500px] overflow-y-auto p-3 space-y-2 bg-gray-50" ref={messagesContainerRef}>
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-6">
              <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Start a conversation with our support team!</p>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "admin" && (
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarFallback className="bg-red-100 text-red-600 text-xs">
                    <Bot className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[95%] xs:max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] rounded-2xl px-3 py-2 text-sm shadow-sm ${msg.sender === "user" ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-black"}`}>
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-xs text-muted-foreground">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
              {msg.sender === "user" && (
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                    <User className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {adminTyping && (
            <div className="flex gap-2 justify-start animate-in fade-in duration-300">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-red-100 text-red-600 text-xs">
                  <Bot className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t flex gap-2 items-end">
          <Button size="icon" variant="ghost" className="text-gray-500 hover:text-red-600 h-8 w-8">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 h-10 border border-gray-200 rounded-2xl focus:border-red-500 text-sm"
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim()} className="bg-red-600 hover:bg-red-700 text-white h-10 w-10 rounded-full">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}