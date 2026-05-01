import React, { useState, useEffect } from "react";
import { Calendar, RefreshCw, BookOpen, Clock } from "lucide-react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";



export default function StudyPlanPage() {
  const { apiFetch } = useApiClient();
  const [form, setForm] = useState({
    exam: "upsc",
    exam_date: "",
    daily_hours: 6,
    weak_subjects: [],
    current_level: "beginner",
  });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeWeek, setActiveWeek] = useState(0);
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
          setForm(f => ({ ...f, exam: EXAM_MAP[data.exam_target] || "upsc", weak_subjects: [] }));
        }
      } catch (e) {}
    }
    loadUser();
  }, [apiFetch]);

  const SUBJECTS_BY_EXAM = {
    upsc: ["History", "Polity", "Geography", "Economy", "Environment", "Science & Tech", "Ethics", "Essay", "Current Affairs", "CSAT"],
    jee: ["Physics", "Chemistry", "Maths"],
    neet: ["Physics", "Chemistry", "Biology (Botany)", "Biology (Zoology)"],
    ssc_cgl: ["Quant", "English", "Reasoning", "GK"],
    banking: ["Quant", "Reasoning", "English", "GA", "Computer"],
  };

  const toggleWeak = (subj) => {
    setForm((f) => ({
      ...f,
      weak_subjects: f.weak_subjects.includes(subj)
        ? f.weak_subjects.filter((s) => s !== subj)
        : [...f.weak_subjects, subj],
    }));
  };

  const generate = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const res = await apiFetch(`/api/plan/generate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setPlan(data);
    } catch {
      setPlan({ error: "Failed to generate plan." });
    }
    setLoading(false);
  };

  const subjectColors = {
    History: "bg-amber-900/40 text-amber-300 border-amber-700",
    Polity: "bg-blue-900/40 text-blue-300 border-blue-700",
    Geography: "bg-green-900/40 text-green-300 border-green-700",
    Economy: "bg-purple-900/40 text-purple-300 border-purple-700",
    Physics: "bg-cyan-900/40 text-cyan-300 border-cyan-700",
    Chemistry: "bg-red-900/40 text-red-300 border-red-700",
    Maths: "bg-indigo-900/40 text-indigo-300 border-indigo-700",
    Biology: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
  };

  return (
    <AppShell activePath={window.location.pathname}>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Calendar className="text-[var(--accent)]" size={32} /> Study Plan Generator
          </h1>
          <p className="text-[var(--text-muted)]">AI creates a personalised schedule based on your exam date</p>
        </div>

        {!plan ? (
          <div className="max-w-2xl">
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 space-y-6">
              {/* Exam */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Target Exam</label>
                <div className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] opacity-80 cursor-not-allowed">
                  {userExamTarget || "Loading..."}
                </div>
              </div>

              {/* Exam Date */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Exam Date</label>
                <input
                  type="date"
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  value={form.exam_date}
                  onChange={(e) => setForm((f) => ({ ...f, exam_date: e.target.value }))}
                />
              </div>

              {/* Daily Hours */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  Daily Study Hours — <span className="text-[var(--accent)]">{form.daily_hours} hrs</span>
                </label>
                <input
                  type="range" min="2" max="14" step="1"
                  value={form.daily_hours}
                  onChange={(e) => setForm((f) => ({ ...f, daily_hours: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>2 hrs</span><span>14 hrs</span>
                </div>
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Current Level</label>
                <div className="flex gap-3">
                  {["beginner", "intermediate", "advanced"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setForm((f) => ({ ...f, current_level: lvl }))}
                      className={`flex-1 py-2 rounded-xl capitalize text-sm font-medium border transition-colors ${
                        form.current_level === lvl
                          ? "bg-[var(--accent)] text-[var(--bg)] border-indigo-400 text-[var(--text)]"
                          : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-muted)]"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weak Subjects */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Weak Subjects (select all)</label>
                <div className="flex flex-wrap gap-2">
                  {(SUBJECTS_BY_EXAM[form.exam] || []).map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleWeak(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        form.weak_subjects.includes(s)
                          ? "bg-red-900/60 border-red-500 text-red-200"
                          : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
                      }`}
                    >
                      {form.weak_subjects.includes(s) ? "!" : ""}{s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generate}
                disabled={loading}
                className="w-full bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-2)] text-[var(--bg)] disabled:bg-gray-700 text-[var(--text)] font-bold py-4 rounded-xl transition-colors text-lg"
              >
                {loading ? <span>Creating your plan...</span> : <span>Generate My Study Plan</span>}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {plan.error ? (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300">{plan.error}</div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Total Weeks", value: plan.total_weeks, icon: <Calendar size={24} /> },
                    { label: "Daily Hours", value: `${form.daily_hours}h`, icon: <Clock size={24} /> },
                    { label: "Subjects", value: (SUBJECTS_BY_EXAM[form.exam] || []).length, icon: <BookOpen size={24} /> },
                    { label: "Revision Rounds", value: plan.revision_rounds || 2, icon: <RefreshCw size={24} /> },
                  ].map((card) => (
                    <div key={card.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
                      <div className="text-2xl mb-1">{card.icon}</div>
                      <div className="text-2xl font-bold text-[var(--text)]">{card.value}</div>
                      <div className="text-xs text-[var(--text-muted)]">{card.label}</div>
                    </div>
                  ))}
                </div>

                {/* Candy Crush Style Map */}
                {plan.weeks && (
                  <div className="relative pl-6 md:pl-10 border-l-4 border-indigo-900/40 ml-4 my-10 space-y-16">
                    {plan.weeks.map((week, i) => (
                      <div key={i} className="relative group">
                        {/* Week Level Node */}
                        <div className="absolute -left-[45px] md:-left-[61px] top-0 w-12 h-12 rounded-full bg-[var(--bg)] border-4 border-[var(--accent)] shadow-[0_0_20px_var(--accent-glow)] flex items-center justify-center font-bold text-lg text-[var(--text)] z-10 transition-transform group-hover:scale-110">
                          {i + 1}
                        </div>
                        
                        <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-6 md:p-8 shadow-xl transition-all group-hover:border-indigo-500/30 group-hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] relative overflow-hidden">
                          {/* Decorative Background gradient */}
                          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                          <h3 className="font-bold text-2xl text-[var(--text)] mb-2 flex items-center gap-3">
                            <span className="text-[var(--accent)]">Level {i + 1}:</span> {week.theme}
                          </h3>
                          <p className="text-[var(--text-muted)] mb-8">{week.description}</p>
                          
                          <div className="space-y-6 pl-4 border-l-2 border-dashed border-indigo-800/30 relative">
                            {week.days?.map((day, j) => (
                              <div key={j} className="relative">
                                {/* Small day dot */}
                                <div className="absolute -left-[23px] top-4 w-3 h-3 rounded-full bg-[var(--accent-2)] border-2 border-[var(--bg)] shadow-[0_0_10px_var(--accent-2)]" />
                                
                                <div className="flex flex-col lg:flex-row gap-4 items-start bg-[var(--surface-2)]/50 rounded-2xl p-4 border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors">
                                  <div className="shrink-0 w-28 text-sm font-bold text-indigo-300 pt-1 uppercase tracking-wider">{day.day}</div>
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                    {day.tasks?.map((task, k) => (
                                      <div
                                        key={k}
                                        className={`px-4 py-3 rounded-xl border flex flex-col gap-1.5 transition-transform hover:-translate-y-1 ${subjectColors[task.subject] || "bg-gray-800/50 text-gray-200 border-gray-700"}`}
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="font-bold text-sm opacity-90">{task.subject}</span>
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 font-mono">{task.duration}</span>
                                        </div>
                                        <span className="text-xs opacity-80 leading-relaxed">{task.activity}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {plan.raw_plan && !plan.weeks && (
                  <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
                    <pre className="text-gray-200 text-sm whitespace-pre-wrap">{plan.raw_plan}</pre>
                  </div>
                )}

                <button
                  onClick={() => setPlan(null)}
                  className="mt-4 text-[var(--accent)] hover:text-indigo-300 text-sm transition-colors"
                >
                  ← Generate New Plan
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
    </AppShell>
  );
}