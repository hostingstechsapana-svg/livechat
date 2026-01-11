"use client";

import { useState, useRef, useEffect } from "react";
import { useWebSocketChat, useTypingIndicator } from "@/lib/hooks/chat";
import { ChatMessage } from "@/lib/types/chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User, Bot } from "lucide-react";

interface AdminChatRoomProps {
  sessionId: string;
  userName?: string;
}

export default function AdminChatRoom({ sessionId, userName }: AdminChatRoomProps) {
  const { messages, isConnected, sendMessage, loadMessages } = useWebSocketChat(sessionId, true);
  const { typing, sendTyping } = useTypingIndicator(sessionId, true);

  // Load historical messages
  useEffect(() => {
    if (sessionId) {
      loadMessages();
    }
  }, [sessionId, loadMessages]);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  // Auto-scroll
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Track scroll
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const threshold = 100;
    shouldAutoScrollRef.current = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
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
  }, [messages, typing]);


  // Filter displayed messages: hide invalid messages
  const displayedMessages = messages
    .filter(msg => msg.text && msg.text.trim());

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
    sendTyping(false);
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

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-3 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8 border border-white">
            <AvatarFallback className="bg-white text-red-600">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{userName || "Anonymous User"}</p>
            <p className="text-xs opacity-90">
              {isConnected ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {displayedMessages.length === 0 && (
          <div className="text-center text-muted-foreground py-6">
            <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}

        {displayedMessages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "user" && (
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
            )}
            <div className={`flex flex-col ${msg.sender === "admin" ? "items-end" : "items-start"} max-w-[75%]`}>
              <div className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${msg.sender === "admin" ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-black"}`}>
                <p>{msg.text}</p>
              </div>
              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-xs text-muted-foreground">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
            {msg.sender === "admin" && (
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarFallback className="bg-red-100 text-red-600 text-xs">
                  <Bot className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex gap-2 justify-start">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                <User className="w-3 h-3" />
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
        <Input
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
    </div>
  );
}