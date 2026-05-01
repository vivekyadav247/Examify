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
    loadUser();
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
        body: JSON.stringify({ exam, message: text, history: messages }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "I couldn't respond right now." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Connection error. Check if backend is running." }]);
    }
    setLoading(false);
  };

  const clearChat = () => setMessages([]);

  return (
    <AppShell activePath={window.location.pathname}>
      <div className="h-[calc(100vh-60px)] md:h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center p-2 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">{persona.icon}</span>
          <div>
            <h1 className={`font-bold text-lg ${persona.color}`}>{persona.name}</h1>
            <p className="text-xs text-[var(--text-muted)]">{userExamTarget} Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={clearChat} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors border border-[var(--border)] px-3 py-2 rounded-xl">
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 mt-8">
              <span className="flex items-center justify-center mx-auto w-20 h-20 bg-[var(--surface-2)] rounded-2xl border border-[var(--border)] text-[var(--accent)]">{persona.icon}</span>
              <h2 className={`text-2xl font-bold mt-3 mb-1 ${persona.color}`}>
                Hi! I'm your {persona.name}
              </h2>
              <p className="text-[var(--text-muted)] text-sm">{persona.hint}</p>
            </div>
            <p className="text-xs text-gray-600 uppercase tracking-widest text-center mb-3">Quick Prompts</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(QUICK_PROMPTS[exam] || []).map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="text-left text-sm p-3 bg-[var(--surface-2)] hover:bg-gray-700 border border-[var(--border)] hover:border-[var(--accent)] rounded-xl text-gray-300 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--accent)] text-[var(--bg)] text-[var(--text)] rounded-br-sm"
                  : "bg-[var(--surface-2)] border border-[var(--border)] text-gray-200 rounded-bl-sm"
              }`}
              style={{ whiteSpace: "pre-wrap" }}
            >
              {msg.role === "assistant" && (
                <span className="text-xs font-semibold opacity-60 block mb-1">{persona.icon} {persona.name}</span>
              )}
              <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") }} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="text-xs text-[var(--text-muted)] mr-2">{persona.name} is thinking</span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-[var(--border)] bg-[var(--surface)] shrink-0">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            rows={1}
            className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl px-4 py-3 text-[var(--text)] placeholder-gray-500 focus:outline-none focus:border-[var(--accent)] resize-none text-sm"
            placeholder={`Ask your ${persona.name} anything...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-2)] text-[var(--bg)] disabled:bg-gray-700 text-[var(--text)] px-5 py-3 rounded-2xl font-medium transition-colors shrink-0"
          >
            Send
          </button>
        </div>
        <p className="text-center text-xs text-gray-700 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
    </AppShell>
  );
}