import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import { Send, Image, Loader2, X, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  timestamp: Date;
  suggestedActions?: string[];
}

export default function AIChat() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const processMessage = trpc.chat.processMessage.useMutation();
  const getInsights = trpc.chat.getInsights.useQuery(
    {
      conversationHistory: messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({
          role: m.role,
          content: m.content
        }))
    },
    {
      enabled: messages.length > 0,
      refetchInterval: false,
      staleTime: Infinity
    }
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedImage) {
      toast.error("Please enter a message or select an image");
      return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      image: selectedImage || undefined,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // Send to AI for processing with conversation history
      const response = await processMessage.mutateAsync({
        message: input,
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        imageBase64: selectedImage || undefined
      });

      // Add AI response to chat
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        suggestedActions: response.suggestedActions
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Show success if transaction was created
      if (response.transactionCreated) {
        toast.success("✅ Transaction created successfully!");
      }
    } catch (error) {
      toast.error("Failed to process message");
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedAction = (action: string) => {
    setInput(action);
  };

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Financial Assistant</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Chat naturally about your finances. I understand savings goals, investments, expenses, and more.
            </p>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 bg-card rounded-lg border border-border p-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Start a conversation about your finances
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>💬 "I earn $5000 a month and want to save $1000"</p>
                  <p>📸 "Upload a receipt and I'll help categorize it"</p>
                  <p>📊 "Tell me about my spending patterns"</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Transaction"
                          className="max-w-full h-auto rounded mb-2"
                        />
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Suggested Actions */}
                  {message.suggestedActions && message.suggestedActions.length > 0 && (
                    <div className="flex justify-start mt-2 ml-0">
                      <div className="space-y-2 max-w-md">
                        {message.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestedAction(action)}
                            className="block w-full text-left px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            💡 {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground px-4 py-3 rounded-lg flex items-center gap-2 border border-border">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Image Preview */}
        {selectedImage && (
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start gap-4">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Receipt photo selected</p>
                <p className="text-xs text-muted-foreground">Describe what you're uploading</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-all flex items-center gap-2"
              title="Upload receipt photo"
            >
              <Image className="w-4 h-4" />
              Photo
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
              placeholder="Tell me about your finances, savings goals, or upload a receipt..."
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Tip: Be specific about amounts, goals, and timeframes. I understand complex financial conversations!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
