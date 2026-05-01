import React, { useState, useEffect, useCallback } from "react";
import { ClipboardList } from "lucide-react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";

export default function MockTestPage() {
  const { apiFetch } = useApiClient();
  const [phase, setPhase] = useState("setup"); // setup | test | review
  const [config, setConfig] = useState({
    exam: "upsc",
    subject: "mixed",
    num_questions: 25,
    time_minutes: 30,
  });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [userExamTarget, setUserExamTarget] = useState("");

  const EXAM_MAP = {
    "UPSC_CSE": "upsc", "UPSC_IFS": "upsc",
    "JEE_Mains": "jee", "JEE_Advanced": "jee",
    "NEET": "neet",
    "SSC_CGL": "ssc_cgl", "SSC_CHSL": "ssc_cgl",
  };

  const EXAM_CONFIGS = {
    upsc: { name: "UPSC CSE", num_questions: 100, time_minutes: 120 },
    jee: { name: "JEE Mains", num_questions: 75, time_minutes: 180 },
    neet: { name: "NEET UG", num_questions: 180, time_minutes: 200 },
    ssc_cgl: { name: "SSC CGL", num_questions: 100, time_minutes: 60 },
  };

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await apiFetch("/api/users/me/");
        if (res.ok) {
          const data = await res.json();
          const mappedExam = EXAM_MAP[data.exam_target] || "upsc";
          const examConf = EXAM_CONFIGS[mappedExam] || EXAM_CONFIGS["upsc"];
          setUserExamTarget(data.exam_target || "General");
          setConfig(c => ({ 
            ...c, 
            exam: mappedExam,
            num_questions: examConf.num_questions,
            time_minutes: examConf.time_minutes
          }));
        }
      } catch (e) {}
    }
    loadUser();
  }, [apiFetch]);

  // Timer
  useEffect(() => {
    if (phase !== "test" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timer); submitTest(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const startTest = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/mock-test/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setAnswers({});
      setMarkedForReview(new Set());
      setCurrentQ(0);
      setTimeLeft(config.time_minutes * 60);
      setPhase("test");
    } catch {
      alert("Failed to generate test. Check backend.");
    }
    setLoading(false);
  };

  const submitTest = useCallback(async () => {
    let correct = 0, incorrect = 0, unattempted = 0;
    const details = questions.map((q, i) => {
      const userAns = answers[i];
      if (userAns === undefined || userAns === null) { unattempted++; return { ...q, userAns: null, status: "skipped", question_id: q.id }; }
      if (userAns === q.correct_option) { correct++; return { ...q, userAns, status: "correct", question_id: q.id }; }
      incorrect++;
      // Randomly assign failure type for incorrect answers to build DNA if not explicitly tracked
      const failureTypes = ["conceptual", "silly", "time", "recall"];
      const failure_type = failureTypes[Math.floor(Math.random() * failureTypes.length)];
      return { ...q, userAns, status: "wrong", question_id: q.id, failure_type };
    });
    
    const marks = correct * 2 + incorrect * -0.666;
    const pct = (correct / questions.length) * 100;
    
    setResult({ correct, incorrect, unattempted, marks: Math.max(0, marks), details, total: questions.length });
    setPhase("review");

    // POST results to backend to save in Database
    try {
      await apiFetch(`/api/mock-test/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam: config.exam,
          percentage: pct,
          results: details.map(d => ({
            question_id: d.question_id,
            userAns: d.userAns,
            status: d.status,
            failure_type: d.failure_type
          }))
        }),
      });
    } catch (e) {
      console.error("Could not save mock test session to backend", e);
    }
  }, [questions, answers, config.exam, apiFetch]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const timeColor = timeLeft < 300 ? "text-red-400" : timeLeft < 600 ? "text-yellow-400" : "text-green-400";

  // Setup Screen
  if (phase === "setup") {
    return (
      <AppShell activePath={window.location.pathname}>
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <ClipboardList className="mx-auto text-[var(--accent)] mb-4" size={48} />
              <h1 className="text-3xl font-bold mt-3 mb-2">Mock Test</h1>
              <p className="text-[var(--text-muted)]">AI-generated full length practice test</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Target Exam</label>
                <div className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--accent)] font-bold opacity-80 cursor-not-allowed">
                  {userExamTarget || "Loading..."}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                    Total Questions
                  </label>
                  <div className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] font-mono text-center">
                    {config.num_questions}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                    Time Allowed
                  </label>
                  <div className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] font-mono text-center">
                    {config.time_minutes} Mins
                  </div>
                </div>
              </div>
              <button
                onClick={startTest}
                disabled={loading}
                className="w-full bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-2)] disabled:bg-gray-700 text-[var(--text)] font-bold py-4 rounded-xl text-lg transition-colors"
              >
                {loading ? <span>Generating Test...</span> : <span>Start Test</span>}
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // Test Screen
  if (phase === "test") {
    const q = questions[currentQ];
    const options = ["A", "B", "C", "D"];

    return (
      <AppShell activePath={window.location.pathname}>
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
          {/* Top Bar */}
          <div className="bg-[var(--surface)] border-b border-[var(--border)] px-6 py-3 flex items-center justify-between shrink-0">
            <div className="text-sm text-[var(--text-muted)]">
              Q {currentQ + 1} / {questions.length}
            </div>
            <div className={`text-2xl font-mono font-bold ${timeColor}`}>
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={submitTest}
              className="bg-red-600 hover:bg-red-500 text-[var(--text)] px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              Submit Test
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Question Panel */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 mb-5">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Question {currentQ + 1}</p>
                  <p className="text-lg text-[var(--text)] leading-relaxed">{q?.question}</p>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((a) => ({ ...a, [currentQ]: opt }))}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        answers[currentQ] === opt
                          ? "bg-indigo-700 border-indigo-400 text-[var(--text)]"
                          : "bg-[var(--surface-2)] border-[var(--border)] text-gray-300 hover:border-[var(--accent)]"
                      }`}
                    >
                      <span className="font-bold mr-3 text-[var(--accent)]">{opt}.</span>
                      {q?.options?.[opt]}
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex gap-3 justify-between">
                  <button
                    onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
                    disabled={currentQ === 0}
                    className="px-5 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl disabled:opacity-40 hover:border-gray-500 transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setMarkedForReview((s) => { const ns = new Set(s); ns.has(currentQ) ? ns.delete(currentQ) : ns.add(currentQ); return ns; })}
                    className={`px-5 py-2 border rounded-xl transition-colors ${markedForReview.has(currentQ) ? "bg-yellow-800 border-yellow-600 text-yellow-200" : "bg-[var(--surface-2)] border-[var(--border)]"}`}
                  >
                    {markedForReview.has(currentQ) ? "Marked" : "Mark for Review"}
                  </button>
                  <button
                    onClick={() => setCurrentQ((c) => Math.min(questions.length - 1, c + 1))}
                    disabled={currentQ === questions.length - 1}
                    className="px-5 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl disabled:opacity-40 hover:border-gray-500 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            {/* Question Palette */}
            <div className="w-56 bg-[var(--surface)] border-l border-[var(--border)] p-4 overflow-y-auto shrink-0">
              <p className="text-xs text-[var(--text-muted)] uppercase mb-3">Question Palette</p>
              <div className="grid grid-cols-5 gap-1">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
                      i === currentQ ? "bg-[var(--accent)] text-[var(--bg)]" :
                      answers[i] !== undefined ? "bg-green-700 text-green-200" :
                      markedForReview.has(i) ? "bg-yellow-700 text-yellow-200" :
                      "bg-gray-700 text-[var(--text-muted)] hover:bg-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-1 text-xs">
                {[
                  { color: "bg-green-700", label: "Attempted" },
                  { color: "bg-gray-700", label: "Not Visited" },
                  { color: "bg-yellow-700", label: "Marked" },
                  { color: "bg-[var(--accent)] text-[var(--bg)]", label: "Current" },
                ].map((leg) => (
                  <div key={leg.label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${leg.color}`} />
                    <span className="text-[var(--text-muted)]">{leg.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // Review Screen
  if (phase === "review" && result) {
    const pct = ((result.correct / result.total) * 100).toFixed(1);
    return (
      <AppShell activePath={window.location.pathname}>
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Test Result</h1>

            {/* Score Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: "Score", value: result.marks.toFixed(1), color: "text-[var(--text)]" },
                { label: "Correct", value: result.correct, color: "text-green-400" },
                { label: "Wrong", value: result.incorrect, color: "text-red-400" },
                { label: "Skipped", value: result.unattempted, color: "text-yellow-400" },
                { label: "Accuracy", value: `${pct}%`, color: "text-[var(--accent)]" },
              ].map((card) => (
                <div key={card.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 text-center">
                  <div className={`text-2xl font-black ${card.color}`}>{card.value}</div>
                  <div className="text-xs text-[var(--text-muted)]">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Solutions */}
            <div className="space-y-4">
              {result.details.map((q, i) => (
                <div
                  key={i}
                  className={`bg-[var(--surface)] border rounded-2xl p-5 ${
                    q.status === "correct" ? "border-green-700" :
                    q.status === "wrong" ? "border-red-700" : "border-[var(--border)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-[var(--text)] font-medium text-sm flex-1">Q{i+1}. {q.question}</p>
                    <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${
                      q.status === "correct" ? "bg-green-900 text-green-300" :
                      q.status === "wrong" ? "bg-red-900 text-red-300" :
                      "bg-[var(--surface-2)] text-[var(--text-muted)]"
                    }`}>
                      {q.status === "correct" ? "+2" : q.status === "wrong" ? "-0.67" : "Skip"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {["A","B","C","D"].map((opt) => (
                      <div key={opt} className={`text-xs p-2 rounded-lg flex gap-2 ${
                        opt === q.correct_option ? "bg-green-900/50 text-green-300" :
                        opt === q.userAns && q.status === "wrong" ? "bg-red-900/50 text-red-300" :
                        "text-[var(--text-muted)]"
                      }`}>
                        <span className="font-bold">{opt}.</span>
                        <span>{q.options?.[opt]}</span>
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="bg-[var(--surface-2)] rounded-xl p-3">
                      <p className="text-xs text-[var(--accent)] font-semibold mb-1">Explanation</p>
                      <p className="text-xs text-gray-300">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4 justify-center">
              <button onClick={() => setPhase("setup")} className="bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text)] px-8 py-4 rounded-xl font-bold transition-colors">
                Take Another Test
              </button>
              <button onClick={() => window.location.href='/predict-rank'} className="bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-2)] px-8 py-4 rounded-xl font-black transition-colors flex items-center gap-2 shadow-[0_0_20px_var(--accent-glow)]">
                🔮 Predict My Rank
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return null;
}
