import React, { useState, useEffect } from "react";
import { Calendar, CreditCard, RefreshCw, BarChart2, TrendingUp, Zap, Brain } from "lucide-react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";



const REVISION_TYPES = [
  { id: "flashcards", label: "Flashcards", icon: <CreditCard size={20} />, desc: "Q&A cards for quick recall" },
  { id: "mnemonics", label: "Mnemonics", icon: <Brain size={20} />, desc: "Memory tricks & shortcuts" },
  { id: "previous_year", label: "PYQ Highlights", icon: <Calendar size={20} />, desc: "Previous year question patterns" },
  { id: "one_liners", label: "One Liners", icon: <Zap size={20} />, desc: "Key facts in one line" },
  { id: "comparison_tables", label: "Comparison Tables", icon: <BarChart2 size={20} />, desc: "Comparative analysis" },
  { id: "timeline", label: "Timeline", icon: <TrendingUp size={20} />, desc: "Chronological events" },
];

export default function RevisionPage() {
  const { apiFetch } = useApiClient();
  const [exam, setExam] = useState("upsc");
  const [topic, setTopic] = useState("");
  const [revType, setRevType] = useState("flashcards");
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [userExamTarget, setUserExamTarget] = useState("");

  const EXAM_MAP = {
    "UPSC_CSE": "upsc", "UPSC_IFS": "upsc",
    "JEE_Mains": "jee", "JEE_Advanced": "jee",
    "NEET": "neet",
    "SSC_CGL": "ssc_cgl", "SSC_CHSL": "ssc_cgl",
  };

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await apiFetch("/api/users/me/");
        if (res.ok) {
          const data = await res.json();
          setUserExamTarget(data.exam_target || "General");
          setExam(EXAM_MAP[data.exam_target] || "upsc");
        }
      } catch (e) {}
    }
    loadUser();
  }, [apiFetch]);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setMaterial(null);
    setFlippedCards(new Set());
    try {
      const res = await apiFetch(`/api/revision/generate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam, topic, revision_type: revType }),
      });
      const data = await res.json();
      setMaterial(data);
    } catch {
      setMaterial({ error: "Failed to generate." });
    }
    setLoading(false);
  };

  const toggleFlip = (i) => {
    setFlippedCards((s) => {
      const ns = new Set(s);
      ns.has(i) ? ns.delete(i) : ns.add(i);
      return ns;
    });
  };

  return (
    <AppShell activePath={window.location.pathname}>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <RefreshCw className="text-[var(--accent)]" size={32} /> Revision Material Generator
          </h1>
          <p className="text-[var(--text-muted)]">Generate flashcards, mnemonics, PYQ patterns, and more with AI</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <div>
            <label className="block text-xs text-[var(--text-muted)] uppercase mb-1">Target Exam</label>
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] text-sm opacity-80 cursor-not-allowed">
              {userExamTarget || "Loading..."}
            </div>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-[var(--text-muted)] uppercase mb-1">Topic</label>
            <input
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] text-sm focus:outline-none focus:border-[var(--accent)]"
              placeholder="e.g. Indian Constitution, Newton's Laws..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <button
            onClick={generate}
            disabled={loading || !topic.trim()}
            className="bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-2)] text-[var(--bg)] disabled:bg-gray-700 text-[var(--text)] px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {/* Revision Type Selector */}
        <div className="flex flex-wrap gap-3 mb-8">
          {REVISION_TYPES.map((rt) => (
            <button
              key={rt.id}
              onClick={() => setRevType(rt.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
                revType === rt.id
                  ? "bg-[var(--accent)] text-[var(--bg)] border-indigo-400 text-[var(--text)]"
                  : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-muted)] hover:border-gray-600"
              }`}
            >
              <span>{rt.icon}</span>
              <span className="font-medium">{rt.label}</span>
            </button>
          ))}
        </div>

        {/* Output */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--text-muted)]">AI is generating {REVISION_TYPES.find((r) => r.id === revType)?.label} for <span className="text-[var(--accent)]">{topic}</span>...</p>
          </div>
        )}

        {material && !loading && (
          <>
            {material.error && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300">{material.error}</div>
            )}

            {/* Flashcards */}
            {revType === "flashcards" && material.flashcards && (
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-4">{material.flashcards.length} cards · Click to flip</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {material.flashcards.map((card, i) => (
                    <div
                      key={i}
                      onClick={() => toggleFlip(i)}
                      className="cursor-pointer"
                      style={{ perspective: "1000px", height: "160px" }}
                    >
                      <div
                        style={{
                          transition: "transform 0.5s",
                          transformStyle: "preserve-3d",
                          transform: flippedCards.has(i) ? "rotateY(180deg)" : "rotateY(0)",
                          position: "relative",
                          height: "100%",
                        }}
                      >
                        {/* Front */}
                        <div
                          style={{ backfaceVisibility: "hidden", position: "absolute", inset: 0 }}
                          className="bg-indigo-900/50 border border-indigo-700 rounded-2xl p-4 flex items-center justify-center"
                        >
                          <p className="text-center text-[var(--text)] font-medium text-sm">{card.question}</p>
                        </div>
                        {/* Back */}
                        <div
                          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", inset: 0 }}
                          className="bg-green-900/40 border border-green-700 rounded-2xl p-4 flex items-center justify-center"
                        >
                          <p className="text-center text-green-200 text-sm">{card.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* One Liners */}
            {revType === "one_liners" && material.items && (
              <div className="space-y-2">
                {material.items.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                    <span className="text-[var(--accent)] font-bold shrink-0 text-sm">{i + 1}.</span>
                    <p className="text-gray-200 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Mnemonics */}
            {revType === "mnemonics" && material.mnemonics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {material.mnemonics.map((m, i) => (
                  <div key={i} className="bg-[var(--surface)] border border-amber-700/50 rounded-2xl p-5">
                    <p className="text-amber-300 text-xs uppercase tracking-wider mb-1">To remember</p>
                    <p className="text-[var(--text)] font-semibold mb-2">{m.topic}</p>
                    <div className="bg-amber-900/30 rounded-xl px-4 py-2 mb-2">
                      <p className="text-amber-200 font-bold text-lg">{m.mnemonic}</p>
                    </div>
                    <p className="text-[var(--text-muted)] text-xs">{m.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Raw/Fallback */}
            {material.raw_content && !material.flashcards && !material.items && !material.mnemonics && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                <pre className="text-gray-200 text-sm whitespace-pre-wrap">{material.raw_content}</pre>
              </div>
            )}
          </>
        )}

        {!material && !loading && (
          <div className="text-center py-20 text-gray-600">
            <RefreshCw className="mx-auto text-[var(--text-muted)] mb-4" size={48} />
            <p className="mt-3">Enter a topic and click Generate</p>
          </div>
        )}
      </div>
    </div>
    </AppShell>
  );
}