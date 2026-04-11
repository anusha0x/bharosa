import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { sendChatMessage } from "../../api/chatbot";
import { useAuth } from "../../context/AuthContext";

interface Message { id: number; text: string; sender: "bot" | "user"; time: string; }

const QUICK_RESPONSES = ["Check eligibility", "Required documents", "Application status", "Help with form"];

const LOCAL_FALLBACKS: Record<string, string> = {
  "Check eligibility": "To check your eligibility, please complete the student details form. Fill in your state, category, income and academic year — our AI will match you to the best scholarships!",
  "Required documents": "📄 Common documents needed:\n• Aadhaar Card (both sides)\n• Income Certificate (within 6 months)\n• Caste Certificate (SC/ST/OBC)\n• 12th Marksheet (attested)\n• Bank Passbook (first page)\n• Passport Photo (recent)",
  "Application status": "You can track all your applications in the 'My Applications' section. Each application shows real-time status with a progress timeline.",
  "Help with form": "I'm here to help! The student details form has 6 steps: Personal Info → Location → Academic Level → Category → Income → Parent's Occupation. Complete all to get matched scholarships.",
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm BHAROSA Assistant. How can I help you today?", sender: "bot", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const addMessage = (text: string, sender: "bot" | "user") => {
    setMessages(prev => [...prev, { id: Date.now(), text, sender, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    addMessage(text, "user");
    setInputMessage(""); setLoading(true);
    try {
      if (isAuthenticated) {
        const data = await sendChatMessage(text);
        addMessage(data.reply || data.message || "I understand. Let me help you with that.", "bot");
      } else {
        const fallback = LOCAL_FALLBACKS[text] || "I can help you with eligibility checks, required documents, application status, and more. Please login for personalized assistance!";
        setTimeout(() => { addMessage(fallback, "bot"); setLoading(false); }, 700);
        return;
      }
    } catch {
      const fallback = LOCAL_FALLBACKS[text] || "I'm having trouble connecting right now. Please try again in a moment, or browse our scholarship listings directly.";
      addMessage(fallback, "bot");
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* Toggle button — always on top */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
        style={{ zIndex: 9999 }}
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      {/* Chat window — above everything including hero */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          style={{ zIndex: 9998 }}
        >
          {/* Header with working close button */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">BHAROSA Assistant</h3>
              <p className="text-xs text-white/80">{isAuthenticated ? "Connected to AI" : "Always here to help"}</p>
            </div>
            {/* Fixed close button */}
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Close chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${message.sender === "user" ? "bg-gradient-to-r from-primary to-secondary text-white" : "bg-white border border-border"} rounded-2xl px-4 py-3 shadow-sm`}>
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-muted-foreground"}`}>{message.time}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-border rounded-2xl px-4 py-3 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 2 && (
            <div className="p-4 bg-white border-t border-border flex-shrink-0">
              <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_RESPONSES.map((r) => (
                  <button key={r} onClick={() => handleSend(r)}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors">
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-border flex-shrink-0">
            <div className="flex gap-2">
              <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(inputMessage)}
                placeholder="Type your message..." disabled={loading}
                className="flex-1 px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm disabled:opacity-50" />
              <button onClick={() => handleSend(inputMessage)} disabled={loading || !inputMessage.trim()}
                className="w-10 h-10 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}