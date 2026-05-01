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

                {/* Week Tabs */}
                {plan.weeks && (
                  <div>
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                      {plan.weeks.map((week, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveWeek(i)}
                          className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            activeWeek === i ? "bg-[var(--accent)] text-[var(--bg)] text-[var(--text)]" : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]"
                          }`}
                        >
                          Week {i + 1}
                        </button>
                      ))}
                    </div>

                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
                      <h3 className="font-bold text-[var(--text)] mb-1">{plan.weeks[activeWeek]?.theme}</h3>
                      <p className="text-sm text-[var(--text-muted)] mb-4">{plan.weeks[activeWeek]?.description}</p>
                      <div className="space-y-2">
                        {plan.weeks[activeWeek]?.days?.map((day, j) => (
                          <div key={j} className="flex gap-3 items-start bg-[var(--surface-2)] rounded-xl p-3">
                            <div className="shrink-0 w-16 text-xs font-semibold text-[var(--accent)] pt-0.5">{day.day}</div>
                            <div className="flex-1 flex flex-wrap gap-2">
                              {day.tasks?.map((task, k) => (
                                <span
                                  key={k}
                                  className={`text-xs px-2 py-1 rounded-lg border ${subjectColors[task.subject] || "bg-gray-700 text-gray-300 border-gray-600"}`}
                                >
                                  {task.subject} · {task.duration}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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