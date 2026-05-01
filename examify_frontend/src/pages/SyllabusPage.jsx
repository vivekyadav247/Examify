import React, { useState, useEffect } from "react";
import { Microscope, BarChart2, Scale, GraduationCap, Cross, Settings, Train, BookOpen, ClipboardList, Star, Landmark } from "lucide-react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";

const EXAMS = [
  { id: "upsc", name: "UPSC CSE", icon: <Landmark size={24} />, category: "Civil Services" },
  { id: "jee", name: "JEE Advanced", icon: <Settings size={24} />, category: "Engineering" },
  { id: "neet", name: "NEET UG", icon: <Cross size={24} />, category: "Medical" },
  { id: "ssc_cgl", name: "SSC CGL", icon: <ClipboardList size={24} />, category: "SSC" },
  { id: "cat", name: "CAT", icon: <BarChart2 size={24} />, category: "MBA" },
  { id: "gate", name: "GATE", icon: <Microscope size={24} />, category: "PG Engineering" },
  { id: "banking", name: "IBPS PO/Clerk", icon: <Landmark size={24} />, category: "Banking" },
  { id: "nda", name: "NDA", icon: <Star size={24} />, category: "Defence" },
  { id: "clat", name: "CLAT", icon: <Scale size={24} />, category: "Law" },
  { id: "rrb", name: "RRB NTPC", icon: <Train size={24} />, category: "Railways" },
  { id: "cuet", name: "CUET UG", icon: <GraduationCap size={24} />, category: "University" },
  { id: "ctet", name: "CTET", icon: <BookOpen size={24} />, category: "Teaching" },
];



export default function SyllabusPage() {
  const { apiFetch } = useApiClient();
  const [selectedExam, setSelectedExam] = useState(null);
  const [syllabus, setSyllabus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null);

  const EXAM_MAP = {
    "UPSC_CSE": "upsc", "UPSC_IFS": "upsc",
    "JEE_Mains": "jee", "JEE_Advanced": "jee",
    "NEET": "neet",
    "SSC_CGL": "ssc_cgl", "SSC_CHSL": "ssc_cgl",
  };

  useEffect(() => {
    async function loadUserSyllabus() {
      try {
        const res = await apiFetch("/api/users/me/");
        if (res.ok) {
          const data = await res.json();
          const targetId = EXAM_MAP[data.exam_target] || "upsc";
          const examObj = EXAMS.find(e => e.id === targetId) || EXAMS[0];
          fetchSyllabus(examObj);
        }
      } catch (e) {}
    }
    loadUserSyllabus();
  }, [apiFetch]);

  const fetchSyllabus = async (exam) => {
    setSelectedExam(exam);
    setLoading(true);
    setSyllabus(null);
    try {
      const res = await apiFetch(`/api/syllabus/?exam=${exam.id}`);
      const data = await res.json();
      setSyllabus(data);
    } catch {
      setSyllabus({ error: "Could not load syllabus." });
    }
    setLoading(false);
  };

  return (
    <AppShell activePath={window.location.pathname}>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <BookOpen className="text-[var(--accent)]" size={32} /> Syllabus Explorer
          </h1>
          <p className="text-[var(--text-muted)]">Select any exam to see complete official syllabus</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Syllabus Detail */}
          <div className="col-span-1">
            {!selectedExam && (
              <div className="h-full flex items-center justify-center text-gray-600 bg-[var(--surface)] rounded-2xl border border-dashed border-[var(--border)] min-h-96">
                <div className="text-center">
                  <ClipboardList className="mx-auto mb-3 text-[var(--text-muted)]" size={48} />
                  <p className="text-lg">Select an exam to view its syllabus</p>
                </div>
              </div>
            )}
            {loading && (
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 min-h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-[var(--text-muted)]">Loading syllabus...</p>
                </div>
              </div>
            )}
            {syllabus && !loading && (
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-5 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedExam.icon}</span>
                    <div>
                      <h2 className="text-xl font-bold text-[var(--text)]">{selectedExam.name}</h2>
                      <p className="text-indigo-300 text-sm">{selectedExam.category} · Official Syllabus</p>
                    </div>
                  </div>
                  {syllabus.exam_info && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {Object.entries(syllabus.exam_info).map(([k, v]) => (
                        <span key={k} className="text-xs bg-white/10 rounded-lg px-3 py-1 text-indigo-100">
                          <span className="text-indigo-300">{k}: </span>{v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                  {syllabus.subjects?.map((subject, i) => (
                    <div key={i} className="border border-[var(--border)] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedSubject(expandedSubject === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 bg-[var(--surface-2)] hover:bg-gray-750 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{subject.icon || <BookOpen size={20} />}</span>
                          <div>
                            <div className="font-semibold text-[var(--text)]">{subject.name}</div>
                            <div className="text-xs text-[var(--text-muted)]">{subject.topics?.length || 0} topics</div>
                          </div>
                        </div>
                        <span className="text-[var(--text-muted)] text-lg">{expandedSubject === i ? "▲" : "▼"}</span>
                      </button>
                      {expandedSubject === i && (
                        <div className="p-4 bg-[var(--surface)]">
                          {subject.topics?.map((topic, j) => (
                            <div key={j} className="mb-3">
                              <div className="text-sm font-medium text-indigo-300 mb-1">• {topic.name}</div>
                              {topic.subtopics && (
                                <div className="ml-4 space-y-0.5">
                                  {topic.subtopics.map((st, k) => (
                                    <div key={k} className="text-xs text-[var(--text-muted)]">– {st}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          {subject.weightage && (
                            <div className="mt-3 pt-3 border-t border-[var(--border)]">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[var(--text-muted)]">Weightage:</span>
                                <div className="flex-1 bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-[var(--accent-2)] text-[var(--bg)] h-2 rounded-full"
                                    style={{ width: `${subject.weightage}%` }}
                                  />
                                </div>
                                <span className="text-xs text-[var(--accent)]">{subject.weightage}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {syllabus.error && (
                    <p className="text-red-400 text-center py-8">{syllabus.error}</p>
                  )}
                  {syllabus.raw_text && (
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap">{syllabus.raw_text}</pre>
                  )}
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