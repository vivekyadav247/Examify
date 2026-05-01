import React, { useState, useEffect, useRef } from "react";
import { Bot, Cross, Settings, ClipboardList, Landmark } from "lucide-react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";



const EXAM_PERSONAS = {
  upsc: { name: "IAS Mentor", icon: <Landmark size={24} />, color: "text-amber-400", hint: "Ask about Indian Polity, History, Economy, Current Affairs..." },
  jee: { name: "JEE Guru", icon: <Settings size={24} />, color: "text-blue-400", hint: "Ask problems in Physics, Chemistry, Maths..." },
  neet: { name: "NEET Expert", icon: <Cross size={24} />, color: "text-green-400", hint: "Ask about Biology, Chemistry, Physics for NEET..." },
  ssc_cgl: { name: "SSC Coach", icon: <ClipboardList size={24} />, color: "text-purple-400", hint: "Ask about reasoning, quant, English, GK..." },
  banking: { name: "Banking Tutor", icon: <Landmark size={24} />, color: "text-cyan-400", hint: "Ask about banking awareness, puzzles, DI..." },
  general: { name: "ExamBot", icon: <Bot size={24} />, color: "text-[var(--accent)]", hint: "Ask anything about competitive exams..." },
};

const EXAM_MAP = {
  "UPSC_CSE": "upsc", "UPSC_IFS": "upsc",
  "JEE_Mains": "jee", "JEE_Advanced": "jee",
  "NEET": "neet",
  "SSC_CGL": "ssc_cgl", "SSC_CHSL": "ssc_cgl",
};

const QUICK_PROMPTS = {
  upsc: [
    "Explain Indian federalism with recent examples",
    "What is DPSP vs Fundamental Rights?",
    "Climate change policies for UPSC",
    "Give me MCQs on Indian History",
  ],
  jee: [
    "Explain work-energy theorem with problem",
    "Solve: integration of sin²x dx",
    "SN1 vs SN2 reactions difference",
    "10 important JEE formulas for Electrostatics",
  ],
  neet: [
    "Explain Krebs cycle step by step",
    "Difference between mitosis and meiosis",
    "NEET important chapters in Biology",
    "Numericals on concentration of solutions",
  ],
  ssc_cgl: [
    "Tricks for time and work problems",
    "Common English error spotting rules",
    "Top 50 GK facts for SSC",
    "Syllogism shortcuts",
  ],
  banking: [
    "Explain Data Interpretation tricks",
    "Latest banking current affairs",
    "Circular seating arrangement tips",
    "Important banking terms to know",
  ],
};

export default function AIChatPage() {
  const { apiFetch } = useApiClient();
  const [exam, setExam] = useState("general");
  const [userExamTarget, setUserExamTarget] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await apiFetch("/api/users/me/");
        if (res.ok) {
          const data = await res.json();
          setUserExamTarget(data.exam_target || "General");
          setExam(EXAM_MAP[data.exam_target] || "general");
        }
      } catch (e) {}
    }
    async function loadHistory() {
      try {
        const res = await apiFetch("/api/chat/");
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (e) {}
    }
    loadUser();
    loadHistory();
  }, [apiFetch]);

  const persona = EXAM_PERSONAS[exam] || EXAM_PERSONAS["general"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text = input) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          exam, 
          message: text 
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "I'm having trouble connecting to my brain. Try again?" }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Signal lost. Let me reconnect." }]);
    }
    setLoading(false);
  };

  const clearChat = () => setMessages([]);

  return (
    <AppShell activePath={window.location.pathname}>
      <div className="h-[calc(100vh-64px)] md:h-screen flex flex-col bg-[var(--bg)] font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-900 bg-black shrink-0 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-gray-950 border border-gray-900 ${persona.color}`}>
              {persona.icon}
            </div>
            <div>
              <h1 className="font-black text-xl text-white tracking-tight">{persona.name}</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Mentorship</p>
              </div>
            </div>
          </div>
          <button onClick={clearChat} className="px-4 py-2 border border-gray-800 rounded-xl text-xs font-bold text-gray-500 hover:text-white transition-all">
            Reset Session
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 scroll-smooth custom-scrollbar">
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto py-10 text-center">
              <div className="mb-10 relative inline-block">
                <div className="w-24 h-24 bg-yellow-500/10 rounded-3xl flex items-center justify-center border border-yellow-500/20 mx-auto">
                   {persona.icon}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">PRO</div>
              </div>
              <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
                Namaste! I'm your {persona.name}
              </h2>
              <p className="text-gray-500 font-medium mb-12">How can I help you dominate {userExamTarget} today?</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(QUICK_PROMPTS[exam] || []).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => send(q)}
                    className="text-left p-6 bg-gray-950 border border-gray-900 rounded-[1.5rem] hover:border-yellow-500/30 hover:bg-gray-900/50 transition-all group"
                  >
                    <p className="text-sm font-bold text-gray-300 group-hover:text-white">{q}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-2xl px-6 py-4 rounded-[1.5rem] text-sm leading-relaxed shadow-xl ${
                  msg.role === "user"
                    ? "bg-yellow-500 text-black font-bold rounded-br-sm"
                    : "bg-gray-950 border border-gray-900 text-gray-300 rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-3 opacity-50">
                    <span className="p-1 bg-gray-900 rounded-md">{persona.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{persona.name}</span>
                  </div>
                )}
                <div 
                  className="prose prose-invert prose-sm"
                  dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") }} 
                />
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-950 border border-gray-900 rounded-[1.5rem] rounded-bl-sm px-6 py-4 shadow-xl">
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Mentor is typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-black border-t border-gray-900 shrink-0">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              rows={1}
              className="w-full bg-gray-950 border border-gray-800 rounded-[1.5rem] px-8 py-5 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all pr-32 resize-none font-medium shadow-2xl"
              placeholder={`Ask your ${persona.name} anything...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="absolute right-3 top-3 bottom-3 px-8 bg-yellow-500 text-black hover:bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              Ask Mentor
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-4 font-bold uppercase tracking-widest">Powered by Examify AI · Precise Hinglish Guidance</p>
        </div>
      </div>
    </AppShell>
  );
}