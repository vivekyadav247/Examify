import React, { useState, useEffect } from "react";
import { FileText, Zap, BookOpen, Search, Sparkles, Save, Download } from "lucide-react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";

const TOPICS_BY_EXAM = {
  upsc: ["Polity", "History", "Economy", "Geography", "Ethics", "IR"],
  jee: ["Mechanics", "Electrostatics", "Organic Chemistry", "Inorganic Chemistry", "Calculus", "Algebra", "Coordinate Geometry"],
  neet: ["Genetics", "Human Physiology", "Plant Physiology", "Organic Chemistry", "Atomic Structure", "Optics"],
  ssc_cgl: ["Quant", "Reasoning", "English", "General Awareness"],
};

export default function NotesPage() {
  const { apiFetch } = useApiClient();
  const [exam, setExam] = useState("jee");
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await apiFetch("/api/users/me/");
        if (res.ok) {
          const data = await res.json();
          const target = (data.exam_target || "JEE_Mains").split("_")[0].toLowerCase();
          setExam(target === "upsc" || target === "jee" || target === "neet" || target === "ssc" ? target : "jee");
        }
      } catch (e) {}
    }
    loadUser();
  }, [apiFetch]);

  const generate = async (isRevision = false) => {
    const finalTopic = customTopic || topic;
    if (!finalTopic) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await apiFetch("/api/notes/generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: finalTopic, exam, is_revision: isRevision }),
      });
      const data = await res.json();
      setOutput(data.notes || "Generation failed.");
    } catch (e) {
      setOutput("Error connecting to AI engine.");
    }
    setLoading(false);
  };

  return (
    <AppShell activePath="/notes">
      <div className="p-4 lg:p-8 w-full mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2">Smart Study Notes</h1>
            <p className="text-[var(--text-muted)]">AI-distilled knowledge for {exam.toUpperCase()}</p>
          </div>
          <button 
            onClick={() => generate(true)}
            disabled={loading || (!topic && !customTopic)}
            className="btn-primary flex items-center gap-2"
          >
            <Zap size={16} /> Fast Revision
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls */}
          <div className="space-y-6">
            <div className="card-simple">
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-4 uppercase tracking-widest">Topic Selection</label>
              <div className="flex flex-wrap gap-2 mb-6">
                {(TOPICS_BY_EXAM[exam] || []).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTopic(t); setCustomTopic(""); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      topic === t ? "bg-[var(--accent)] text-black border-[var(--accent)]" : "bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-muted)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-all"
                placeholder="Or type a custom topic..."
                value={customTopic}
                onChange={(e) => { setCustomTopic(e.target.value); setTopic(""); }}
              />
            </div>

            <div className="card-simple space-y-4">
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Master Controls</label>
              <button
                onClick={() => generate(false)}
                disabled={loading || (!topic && !customTopic)}
                className="w-full bg-[var(--text)] text-[var(--bg)] font-bold py-4 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Generate Master Notes"}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="lg:col-span-2">
            {loading ? (
               <div className="card-simple h-96 flex flex-col items-center justify-center text-center">
                 <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-[var(--text-muted)] text-sm">AI is distilling information...</p>
               </div>
            ) : output ? (
              <div className="card-simple min-h-[500px] prose prose-invert max-w-none">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2 text-[var(--accent)]">
                    <Sparkles size={18} />
                    <span className="font-bold text-sm uppercase tracking-widest">AI Result</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-[var(--surface-hover)] rounded-lg text-[var(--text-muted)]"><Save size={18} /></button>
                    <button className="p-2 hover:bg-[var(--surface-hover)] rounded-lg text-[var(--text-muted)]"><Download size={18} /></button>
                  </div>
                </div>
                <div 
                  className="text-[var(--text)] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: output.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
                />
              </div>
            ) : (
              <div className="card-simple h-96 border-dashed flex flex-col items-center justify-center text-center grayscale opacity-50">
                <FileText size={48} className="mb-4 text-[var(--text-muted)]" />
                <p className="text-[var(--text-muted)] text-sm">Ready to generate your study materials.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}