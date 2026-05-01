import React, { useState, useEffect } from "react";
import { Target, FileText, BookOpen, Hash, Zap, Brain } from "lucide-react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";



const TOPICS_BY_EXAM = {
  upsc: ["Indian History", "Indian Polity", "Indian Economy", "Geography", "Environment", "Science & Tech", "Current Affairs"],
  jee: ["Mechanics", "Electrostatics", "Organic Chemistry", "Inorganic Chemistry", "Calculus", "Algebra", "Coordinate Geometry"],
  neet: ["Cell Biology", "Human Physiology", "Genetics", "Plant Physiology", "Inorganic Chemistry", "Organic Chemistry", "Physics"],
  ssc_cgl: ["Quantitative Aptitude", "English Grammar", "General Awareness", "Reasoning"],
  banking: ["Number Series", "Data Interpretation", "English Comprehension", "Reasoning Puzzles", "Current Affairs"],
};

const NOTE_TYPES = [
  { id: "quick", label: "Quick Revision", desc: "1-2 min read, bullet points", icon: <Zap size={20} /> },
  { id: "detailed", label: "Detailed Notes", desc: "In-depth with examples", icon: <BookOpen size={20} /> },
  { id: "mindmap", label: "Mind Map Style", desc: "Connected concepts", icon: <Brain size={20} /> },
  { id: "formula", label: "Formula Sheet", desc: "Key formulas & shortcuts", icon: <Hash size={20} /> },
  { id: "mcq_focused", label: "MCQ Focused", desc: "Points likely in exams", icon: <Target size={20} /> },
];

export default function NotesPage() {
  const { apiFetch } = useApiClient();
  const [exam, setExam] = useState("upsc");
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [noteType, setNoteType] = useState("quick");
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedNotes, setSavedNotes] = useState([]);
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

  const generate = async (isRevision = false) => {
    const finalTopic = customTopic || topic;
    if (!finalTopic) return;
    setLoading(true);
    setNotes(null);
    try {
      const res = await apiFetch(`/api/notes/generate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          exam, 
          topic: finalTopic, 
          note_type: isRevision ? "quick" : noteType,
          is_revision: isRevision 
        }),
      });
      const data = await res.json();
      setNotes(data);
    } catch {
      setNotes({ error: "Failed to generate notes. Check backend." });
    }
    setLoading(false);
  };

  const saveNote = () => {
    if (notes && notes.content) {
      setSavedNotes((prev) => [
        { id: Date.now(), topic: customTopic || topic, type: noteType, content: notes.content, exam },
        ...prev,
      ]);
    }
  };

  return (
    <AppShell activePath={window.location.pathname}>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 lg:p-12 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 flex justify-between items-end">
            <div>
              <h1 className="text-5xl font-black mb-3 tracking-tight">Smart Study Notes</h1>
              <p className="text-gray-400 font-medium text-lg">AI-distilled knowledge for {userExamTarget}</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => generate(true)}
                className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all"
              >
                Fast Revision ⚡
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Controls */}
            <div className="space-y-8">
              <div className="bg-gray-950 border border-gray-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <div className="space-y-8 relative">
                  {/* Topic Section */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-600 mb-4 uppercase tracking-[0.2em]">Select Exam Topic</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(TOPICS_BY_EXAM[exam] || []).map((t) => (
                        <button
                          key={t}
                          onClick={() => { setTopic(t); setCustomTopic(""); }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            topic === t ? "bg-yellow-500 border-yellow-500 text-black scale-105" : "bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <input
                      className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all font-medium"
                      placeholder="Or specify a custom sub-topic..."
                      value={customTopic}
                      onChange={(e) => { setCustomTopic(e.target.value); setTopic(""); }}
                    />
                  </div>

                  {/* Note Style */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-600 mb-4 uppercase tracking-[0.2em]">Learning Style</label>
                    <div className="grid grid-cols-1 gap-3">
                      {NOTE_TYPES.map((nt) => (
                        <button
                          key={nt.id}
                          onClick={() => setNoteType(nt.id)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                            noteType === nt.id
                              ? "bg-yellow-500/10 border-yellow-500 text-white"
                              : "bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600"
                          }`}
                        >
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${noteType === nt.id ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-600"}`}>
                            {nt.icon}
                          </span>
                          <div className="text-left">
                            <div className="text-sm font-bold">{nt.label}</div>
                            <div className="text-[10px] font-medium opacity-60">{nt.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => generate(false)}
                    disabled={loading || (!topic && !customTopic)}
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 font-black py-5 rounded-2xl text-lg transition-all shadow-[0_0_30px_rgba(234,179,8,0.1)]"
                  >
                    {loading ? "Distilling..." : "Generate Master Notes"}
                  </button>
                </div>
              </div>
            </div>


          {/* Notes Output */}
          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 flex items-center justify-center min-h-64">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-[var(--text-muted)]">AI is generating notes for <span className="text-[var(--accent)]">{customTopic || topic}</span>...</p>
                </div>
              </div>
            )}

            {notes && !loading && (
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--surface-2)]">
                  <div>
                    <h3 className="font-semibold text-[var(--text)]">{customTopic || topic}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{exam.toUpperCase()} · {NOTE_TYPES.find((n) => n.id === noteType)?.label}</p>
                  </div>
                  <button onClick={saveNote} className="text-xs bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-2)] text-[var(--bg)] px-3 py-1.5 rounded-lg transition-colors">
                    💾 Save
                  </button>
                </div>
                <div className="p-5 prose prose-invert prose-sm max-w-none max-h-[60vh] overflow-y-auto">
                  {notes.error ? (
                    <p className="text-red-400">{notes.error}</p>
                  ) : (
                    <div
                      className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm"
                      dangerouslySetInnerHTML={{ __html: (notes.content || "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") }}
                    />
                  )}
                </div>
              </div>
            )}

            {!loading && !notes && (
              <div className="bg-[var(--surface)] rounded-2xl border border-dashed border-[var(--border)] p-8 text-center min-h-64 flex flex-col items-center justify-center">
                <span className="text-5xl mb-3">📄</span>
                <p className="text-[var(--text-muted)]">Select topic and click Generate</p>
              </div>
            )}

            {/* Saved Notes */}
            {savedNotes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Saved Notes</h3>
                <div className="space-y-2">
                  {savedNotes.map((sn) => (
                    <div key={sn.id} className="bg-[var(--surface-2)] rounded-xl p-4 border border-[var(--border)]">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-[var(--text)]">{sn.topic}</span>
                          <span className="ml-2 text-xs text-[var(--text-muted)]">{sn.exam.toUpperCase()} · {sn.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </AppShell>
  );
}