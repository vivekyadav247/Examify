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

  const generate = async () => {
    const finalTopic = customTopic || topic;
    if (!finalTopic) return;
    setLoading(true);
    setNotes(null);
    try {
      const res = await apiFetch(`/api/notes/generate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam, topic: finalTopic, note_type: noteType }),
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
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <FileText className="text-[var(--accent)]" size={32} /> Short Notes Generator
          </h1>
          <p className="text-[var(--text-muted)]">AI-generated notes tailored to your exam</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-5">
            {/* Exam Select */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Target Exam</label>
              <div className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] opacity-80 cursor-not-allowed">
                {userExamTarget || "Loading..."}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Topic</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {(TOPICS_BY_EXAM[exam] || []).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTopic(t); setCustomTopic(""); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      topic === t ? "bg-[var(--accent)] text-[var(--bg)] text-[var(--text)]" : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-gray-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder-gray-500 focus:outline-none focus:border-[var(--accent)]"
                placeholder="Or type any topic..."
                value={customTopic}
                onChange={(e) => { setCustomTopic(e.target.value); setTopic(""); }}
              />
            </div>

            {/* Note Type */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Note Style</label>
              <div className="space-y-2">
                {NOTE_TYPES.map((nt) => (
                  <button
                    key={nt.id}
                    onClick={() => setNoteType(nt.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      noteType === nt.id
                        ? "bg-indigo-900/50 border-[var(--accent)] text-[var(--text)]"
                        : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-muted)] hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{nt.icon}</span>
                      <div>
                        <div className="text-sm font-semibold">{nt.label}</div>
                        <div className="text-xs text-[var(--text-muted)]">{nt.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading || (!topic && !customTopic)}
              className="w-full bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-2)] text-[var(--bg)] disabled:bg-gray-700 disabled:text-[var(--text-muted)] text-[var(--text)] font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? "Generating..." : "✨ Generate Notes"}
            </button>
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