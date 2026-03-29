import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Send, Volume2, Bot, User, TrendingUp, BarChart2, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  card?: {
    type: string;
    metrics: { label: string; value: string; color: string }[];
    recommendation: string;
    chartData?: { label: string; value: number }[];
  };
};

// ─── Predefined AI Responses ──────────────────────────────────────────────────
const aiResponses: Record<string, Message["card"]> = {
  "Can I retire at 45?": {
    type: "retirement",
    metrics: [
      { label: "Success Probability", value: "68%", color: "#F59E0B" },
      { label: "Required Corpus", value: "₹8.5 Cr", color: "#3B82F6" },
      { label: "Current Trajectory", value: "₹5.2 Cr", color: "#EF4444" },
      { label: "Gap to Close", value: "₹3.3 Cr", color: "#E21B23" },
    ],
    recommendation: "To retire at 45, increase your monthly SIP by ₹15,000 (to ₹40,000 total) and maintain 12%+ CAGR. Consider adding NPS for additional tax-free corpus.",
    chartData: [
      { label: "30", value: 0 }, { label: "33", value: 1200000 }, { label: "36", value: 2800000 },
      { label: "39", value: 4200000 }, { label: "42", value: 6100000 }, { label: "45", value: 8500000 },
    ],
  },
  "Can I afford a ₹20L car?": { /* your original data */ },
  "How much should I invest monthly?": { /* your original data */ },
  "Optimize my tax savings": { /* your original data */ },
};

const quickPrompts = [
  "Can I retire at 45?",
  "Can I afford a ₹20L car?",
  "How much should I invest monthly?",
  "Optimize my tax savings",
];

// ─── Waveform Animation ───────────────────────────────────────────────────────
function Waveform({ active }: { active: boolean }) {
  const heights = [6, 16, 24, 10, 20, 8, 24, 14, 6, 22, 12, 18, 8, 16, 24, 10, 20, 24, 6, 18, 14, 24, 8, 16];
  return (
    <div className="flex items-center gap-0.5 h-8">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ background: active ? "#E21B23" : "#9CA3AF" }}
          animate={active ? { height: [4, h, 4] } : { height: 4 }}
          transition={active ? { repeat: Infinity, duration: 0.4 + (i % 5) * 0.08, delay: i * 0.03, ease: "easeInOut" } : { duration: 0.2 }}
        />
      ))}
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center p-3 rounded-xl" style={{ background: "#F3F4F6", width: "fit-content" }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: "#9CA3AF" }}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// ─── AI Response Card (SAFE VERSION) ─────────────────────────────────────────
function AIResponseCard({ card, msgId }: { card: NonNullable<Message["card"]>; msgId: string }) {
  if (!card || !card.metrics) return null;   // ← This prevents the crash

  const gradId = `chartGrad-${msgId}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(59,130,246,0.2)", background: "#EFF6FF" }}
    >
      <div className="grid grid-cols-2 gap-2 p-3">
        {card.metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-lg p-2.5"
          >
            <p className="text-xs text-gray-400">{m.label}</p>
            <p className="font-bold mt-0.5" style={{ color: m.color, fontSize: "1rem" }}>{m.value}</p>
          </motion.div>
        ))}
      </div>

      {card.chartData && card.chartData.length > 0 && (
        <div className="px-3 pb-1" style={{ height: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={card.chartData}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v: number) => [`₹${(v / 100000).toFixed(1)}L`, ""]} />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" fill={`url(#${gradId})`} strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="px-3 pb-3">
        <div className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: "white" }}>
          <Zap size={13} className="shrink-0 mt-0.5" style={{ color: "#E21B23" }} />
          <p className="text-xs text-gray-700 leading-relaxed">{card.recommendation}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main AIMentor Component ──────────────────────────────────────────────────
export function AIMentor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      text: "Hello Rajesh! 👋 I'm your ET AI Money Mentor. I've analysed your complete financial profile. Ask me anything.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const profile = JSON.parse(localStorage.getItem("userProfile") || '{"income":1200000,"savings":300000,"investments":450000,"debt":150000}');

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // Voice Input
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "en-IN";
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript, true);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Backend Connected + Safe Reply Extraction
    const sendMessage = async (text: string, isVoice = false) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", text }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          income: profile.income,
          savings: profile.savings,
          investments: profile.investments,
          debt: profile.debt,
        }),
      });

      const data = await response.json();

      let aiText = "I'm here to help!";
      if (data.reply) {
        if (typeof data.reply === "string") aiText = data.reply;
        else if (data.reply.raw) aiText = data.reply.raw;
        else aiText = String(data.reply).slice(0, 280);   // limit length
      }

      const card = aiResponses[text];   // beautiful card for quick prompts

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "ai", text: aiText, card }]);
      speak(aiText);   // AI speaks the short reply
    } catch (err) {
      const card = aiResponses[text];
      const aiText = card ? "Great question! Here's my analysis:" : "Sorry, I'm having trouble connecting right now.";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "ai", text: aiText, card }]);
      speak(aiText);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div style={{ minHeight: "calc(100vh - 120px)", background: "#F2F2F2", display: "flex", flexDirection: "column" }}>
      {/* ET Page Header */}
      <div style={{ background: "#E21B23", padding: "8px 16px" }} className="flex items-center justify-between shrink-0">
        <div>
          <p className="text-white font-bold" style={{ fontSize: "11px", letterSpacing: "0.06em", fontFamily: "'IBM Plex Sans',sans-serif" }}>
            AI MONEY MENTOR
          </p>
          <p className="text-white opacity-70" style={{ fontSize: "10px" }}>Voice-first · GPT-4 Financial Engine · Real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="text-white font-bold" style={{ fontSize: "10px" }}>AI ACTIVE</span>
        </div>
      </div>

      <div className="p-4 flex gap-4 flex-1 overflow-hidden">
        {/* Chat panel */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden" style={{ border: "1px solid #E0E0E0", borderRadius: 2 }}>
          {/* Chat header */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between shrink-0" style={{ borderBottom: "2px solid #E21B23" }}>
            <div>
              <p className="font-bold uppercase tracking-wide" style={{ fontSize: "11px", color: "#1A1A1A", letterSpacing: "0.06em", fontFamily: "'IBM Plex Sans',sans-serif" }}>
                AI CHAT CONSOLE
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#AAA" }}>Ask anything about your money</p>
            </div>
            <div className="flex items-center gap-2 px-2 py-1" style={{ background: "#FFF0F0", border: "1px solid #FECACA", borderRadius: 1 }}>
              <BarChart2 size={11} style={{ color: "#E21B23" }} />
              <span style={{ fontSize: "9px", color: "#E21B23", fontWeight: 700 }}>GPT-4 ENGINE</span>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className="w-7 h-7 flex items-center justify-center shrink-0 mt-1" style={{ background: msg.role === "ai" ? "#E21B23" : "#1A1A1A", borderRadius: 2 }}>
                    {msg.role === "ai" ? <Bot size={14} color="white" /> : <User size={14} color="white" />}
                  </div>
                  <div className={`max-w-[75%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className="px-3 py-2.5 text-sm" style={{ background: msg.role === "ai" ? "#F5F5F5" : "#E21B23", color: msg.role === "ai" ? "#1A1A1A" : "white", border: msg.role === "ai" ? "1px solid #E8E8E8" : "none", borderRadius: 2, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                      {msg.text}
                    </div>
                    {msg.card && <AIResponseCard card={msg.card} msgId={msg.id} />}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-7 h-7 flex items-center justify-center shrink-0" style={{ background: "#E21B23", borderRadius: 2 }}>
                  <Bot size={14} color="white" />
                </div>
                <TypingIndicator />
              </motion.div>
            )}
          </div>

          {/* Input with Voice */}
          <div className="shrink-0 p-3 space-y-2" style={{ borderTop: "1px solid #F0F0F0", background: "#FAFAFA" }}>
            <AnimatePresence>
              {isListening && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 px-3 py-2" style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderLeft: "3px solid #E21B23", borderRadius: 1 }}>
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 rounded-full" style={{ background: "#E21B23" }} />
                  <span style={{ fontSize: "11px", color: "#E21B23", fontWeight: 700 }}>LISTENING...</span>
                  <Waveform active={isListening} />
                  <span className="ml-auto" style={{ fontSize: "10px", color: "#AAA" }}>Hold the mic to speak</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <motion.button type="button" whileTap={{ scale: 0.95 }} onMouseDown={startListening} onMouseUp={stopListening} onTouchStart={startListening} onTouchEnd={stopListening} className="w-9 h-9 flex items-center justify-center shrink-0 transition-colors" style={{ background: isListening ? "#E21B23" : "#F0F0F0", border: "1px solid #E0E0E0", borderRadius: 2 }}>
                {isListening ? <MicOff size={15} color="white" /> : <Mic size={15} style={{ color: "#666" }} />}
              </motion.button>

              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your financial question..." className="flex-1 px-3 py-2 text-sm outline-none" style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 2, fontFamily: "'IBM Plex Sans',sans-serif" }} />

              <motion.button type="submit" whileTap={{ scale: 0.95 }} className="w-9 h-9 flex items-center justify-center shrink-0" style={{ background: "#E21B23", borderRadius: 2 }}>
                <Send size={15} color="white" />
              </motion.button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE PANEL - FULLY RESTORED */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="w-60 shrink-0 space-y-3">
          {/* Quick Prompts */}
          <div className="bg-white" style={{ border: "1px solid #E0E0E0", borderRadius: 2 }}>
            <div className="px-3 pt-3 pb-2" style={{ borderBottom: "2px solid #E21B23" }}>
              <p className="font-bold uppercase tracking-wide" style={{ fontSize: "10px", color: "#1A1A1A", letterSpacing: "0.06em" }}>QUICK PROMPTS</p>
            </div>
            <div className="p-2 space-y-1">
              {quickPrompts.map(prompt => (
                <motion.button key={prompt} whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }} onClick={() => sendMessage(prompt)} className="w-full text-left px-3 py-2.5 text-xs font-medium transition-colors" style={{ background: "#F8F8F8", border: "1px solid #EEEEEE", borderRadius: 1, color: "#333", fontFamily: "'IBM Plex Sans',sans-serif" }}>
                  {prompt}
                </motion.button>
              ))}
            </div>
          </div>

          {/* AI Context */}
          <div className="bg-white" style={{ border: "1px solid #E0E0E0", borderRadius: 2 }}>
            <div className="px-3 pt-3 pb-2" style={{ borderBottom: "2px solid #E21B23" }}>
              <p className="font-bold uppercase tracking-wide" style={{ fontSize: "10px", color: "#1A1A1A", letterSpacing: "0.06em" }}>AI CONTEXT</p>
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold mb-2" style={{ color: "#888" }}>AI knows your profile:</p>
              {[
                { label: "Net Worth", value: "₹47.2L" },
                { label: "Monthly SIP", value: "₹25,000" },
                { label: "Risk Profile", value: "Moderate" },
                { label: "Goal", value: "Retire @ 55" },
                { label: "Tax Bracket", value: "30%" },
              ].map((item, i, arr) => (
                <div key={item.label} className="flex justify-between py-1.5" style={{ borderBottom: i < arr.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                  <span style={{ fontSize: "11px", color: "#888" }}>{item.label}</span>
                  <span className="font-bold" style={{ fontSize: "11px", color: "#1A1A1A" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Voice response */}
          <div className="p-3" style={{ background: "#1A1A1A", borderRadius: 2 }}>
            <div className="flex items-center gap-2 mb-1">
              <Volume2 size={13} style={{ color: "#E21B23" }} />
              <p className="font-bold text-white" style={{ fontSize: "11px" }}>Voice Response</p>
            </div>
            <p className="text-gray-400" style={{ fontSize: "10px" }}>AI can read answers aloud in Hindi or English</p>
            <div className="mt-2 flex gap-1">
              {["EN", "HI"].map(lang => (
                <button key={lang} className="px-2 py-1 font-bold transition-colors" style={{ background: lang === "EN" ? "#E21B23" : "rgba(255,255,255,0.1)", color: "white", fontSize: "10px", borderRadius: 1 }}>
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}