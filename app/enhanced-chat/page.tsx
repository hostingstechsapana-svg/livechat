"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@/lib/hooks/use-chat";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Wifi, WifiOff, Loader2 } from "lucide-react";
import { formatMessageTime } from "@/lib/utils";

/**
 * Example Next.js Chat Page using the Enhanced Chat Module
 *
 * This page demonstrates:
 * - Automatic user type detection (PUBLIC, USER, ADMIN)
 * - Session management
 * - Real-time messaging
 * - Typing indicators
 * - Message status (seen/delivered)
 * - Connection handling
 */
export default function EnhancedChatPage() {
  const {
    messages,
    sendMessage,
    isConnected,
    isLoading,
    error,
    sessionKey,
    userType,
    typing,
    sendTyping,
    startNewChat,
    markMessageSeen,
    markMessageDelivered,
  } = useChat();

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Mark messages as seen when they come into view
  useEffect(() => {
    const messageElements = document.querySelectorAll('[data-message-id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = parseInt(entry.target.getAttribute('data-message-id') || '0');
            if (messageId) {
              markMessageSeen(messageId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    messageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [messages, markMessageSeen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const success = await sendMessage(inputValue);
    if (success) {
      setInputValue("");
      sendTyping(false);
      inputRef.current?.focus();
    }
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

  if (!sessionKey || !userType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-red-600" />
          <p className="text-muted-foreground">Initializing chat session...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Enhanced Chat System
            </h1>
            <p className="text-muted-foreground mb-4">
              Real-time chat with automatic user type detection
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <Badge variant="outline">
                User Type: {userType}
              </Badge>
              <Badge variant="outline">
                Session: {sessionKey.slice(-8)}
              </Badge>
              <Badge className={isConnected ? "bg-green-500" : "bg-red-500"}>
                {isConnected ? <><Wifi className="w-3 h-3 mr-1" /> Connected</> : <><WifiOff className="w-3 h-3 mr-1" /> Disconnected</>}
              </Badge>
            </div>
          </div>

          {/* Chat Interface */}
          <Card className="shadow-2xl border-2 overflow-hidden">
            <CardHeader className="bg-red-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-white">
                    <AvatarFallback className="bg-white text-red-600 font-bold">
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">Support Team</h3>
                    <p className="text-sm opacity-90">
                      {userType === 'PUBLIC' ? 'Public Chat' :
                       userType === 'USER' ? 'Authenticated User' : 'Admin Support'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={startNewChat}
                  size="sm"
                  className="bg-white text-red-600 hover:bg-gray-100"
                >
                  New Chat
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {error && (
                <div className="bg-red-50 border-b border-red-200 p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Messages */}
              <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-white">
                {isLoading && messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    <p className="text-sm">Loading messages...</p>
                  </div>
                )}

                {messages.length === 0 && !isLoading && (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Start a conversation with our support team!</p>
                    <p className="text-xs mt-2 text-gray-500">
                      User Type: {userType} | Session: {sessionKey}
                    </p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    data-message-id={msg.id}
                    className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "admin" && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-red-100 text-red-600">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`flex flex-col max-w-[75%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                        msg.sender === "user"
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-black"
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>

                      <div className="flex items-center gap-2 mt-1 px-2">
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(msg.timestamp)}
                        </span>
                        {msg.sender === "user" && (
                          <div className="flex gap-1">
                            {msg.delivered && (
                              <span className="text-xs text-muted-foreground">✓</span>
                            )}
                            {msg.seen && (
                              <span className="text-xs text-blue-500">✓✓</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {msg.sender === "user" && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-gray-200 text-gray-600">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {typing && (
                  <div className="flex gap-3 justify-start animate-in fade-in duration-300">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-red-100 text-red-600">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-gray-50 border-t flex gap-3 items-end">
                <Input
                  ref={inputRef}
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="flex-1 h-12 border border-gray-200 rounded-2xl focus:border-red-500 text-sm"
                  disabled={!isConnected}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || !isConnected}
                  className="bg-red-600 hover:bg-red-700 text-white h-12 w-12 rounded-full disabled:bg-gray-400"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Debug Info */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <div className="text-sm space-y-1">
              <p><strong>User Type:</strong> {userType}</p>
              <p><strong>Session Key:</strong> {sessionKey}</p>
              <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Messages:</strong> {messages.length}</p>
              <p><strong>WebSocket URL:</strong> {process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8090/ws'}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}