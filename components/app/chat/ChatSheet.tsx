"use client";

import { useState, useRef, useEffect } from "react";

// Simple helper to generate IDs for local messages
function makeId(prefix = "msg") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
}

// Helper to convert plain text to UI message shape
function textToUIMessage(role: "user" | "assistant", text: string) {
  return {
    id: makeId(role),
    role,
    parts: [{ type: "text", text }],
  };
}
import { useAuth } from "@clerk/nextjs";
import { Sparkles, Send, Loader2, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useIsChatOpen,
  useChatActions,
  usePendingMessage,
} from "@/lib/store/chat-store-provider";

import { getMessageText, getToolParts } from "./utils";
import { WelcomeScreen } from "./WelcomeScreen";
import { MessageBubble } from "./MessageBubble";
import { ToolCallUI } from "./ToolCallUI";

export function ChatSheet() {
  const isOpen = useIsChatOpen();
  const { closeChat, clearPendingMessage } = useChatActions();
  const pendingMessage = usePendingMessage();
  const { isSignedIn } = useAuth();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local simple chat state (replaces useChat integration for now)
  const [messages, setMessages] = useState<Array<any>>([]);
  const [status, setStatus] = useState<"ready" | "submitted" | "streaming">("ready");
  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom when new messages arrive or streaming updates
  // biome-ignore lint/correctness/useExhaustiveDependencies: trigger scroll on message/loading changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle pending message - send it when chat opens
  useEffect(() => {
    if (isOpen && pendingMessage && !isLoading) {
      void sendMessage({ text: pendingMessage });
      clearPendingMessage();
    }
  }, [isOpen, pendingMessage, isLoading, clearPendingMessage]);

  const sendMessage = async (payload: { text: string } | string) => {
    const text = typeof payload === "string" ? payload : payload.text;

    // Append user message
    const userMsg = textToUIMessage("user", text);
    setMessages((m) => [...m, userMsg]);
    setStatus("submitted");

    try {
      setStatus("streaming");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
      });

      if (!res.ok) {
        throw new Error(`AI error: ${res.status}`);
      }

      const json = await res.json();
      const assistantText = (json && json.text) || "(no response)";

      const assistantMsg = textToUIMessage("assistant", assistantText);
      setMessages((m) => [...m, assistantMsg]);
      setStatus("ready");
    } catch (err) {
      console.error("Chat sendMessage error:", err);
      setStatus("ready");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    void sendMessage(input);
    setInput("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - only visible on mobile/tablet (< xl) */}
      <div
        className="fixed inset-0 z-40 bg-black/50 xl:hidden"
        onClick={closeChat}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full flex-col overscroll-contain border-l border-border bg-background duration-300 animate-in slide-in-from-right sm:w-md">
        {/* Header */}
        <header className="shrink-0 border-b border-border">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-5 w-5 text-primary" />
              Fitness Assistant
            </div>
            <Button variant="ghost" size="icon" onClick={closeChat}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {messages.length === 0 ? (
            <WelcomeScreen
              onSuggestionClick={(payload: { text: string }) => void sendMessage(payload)}
              isSignedIn={isSignedIn ?? false}
            />
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const content = getMessageText(message);
                const toolParts = getToolParts(message);
                const hasContent = content.length > 0;
                const hasTools = toolParts.length > 0;

                if (!hasContent && !hasTools) return null;

                return (
                  <div key={message.id} className="space-y-3">
                    {/* Tool call indicators */}
                    {hasTools &&
                      toolParts.map((toolPart) => (
                        <ToolCallUI
                          key={`tool-${message.id}-${toolPart.toolCallId}`}
                          toolPart={toolPart}
                          closeChat={closeChat}
                        />
                      ))}

                    {/* Message content */}
                    {hasContent && (
                      <MessageBubble
                        role={message.role}
                        content={content}
                        closeChat={closeChat}
                      />
                    )}
                  </div>
                );
              })}

              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about classes or bookings..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
