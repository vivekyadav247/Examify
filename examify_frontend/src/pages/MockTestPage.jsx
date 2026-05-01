import React, { useState, useEffect, useCallback } from "react";
import { ClipboardList, Clock, AlertCircle, CheckCircle2, ChevronRight, Dna, Trophy, BarChart2, Zap } from "lucide-react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";

const EXAM_CONFIGS = {
  "UPSC_CSE": { name: "UPSC CSE", num_questions: 100, time_minutes: 120, exam: "upsc" },
  "JEE_Mains": { name: "JEE Mains", num_questions: 75, time_minutes: 180, exam: "jee" },
  "NEET": { name: "NEET UG", num_questions: 180, time_minutes: 200, exam: "neet" },
  "SSC_CGL": { name: "SSC CGL", num_questions: 100, time_minutes: 60, exam: "ssc_cgl" },
  "NDA": { name: "NDA", num_questions: 120, time_minutes: 150, exam: "nda" },
};

const EXAM_MAP = {
  "UPSC_CSE": "UPSC_CSE", "UPSC_IFS": "UPSC_CSE",
  "JEE_Mains": "JEE_Mains", "JEE_Advanced": "JEE_Mains",
  "NEET": "NEET",
  "SSC_CGL": "SSC_CGL", "SSC_CHSL": "SSC_CGL",
  "NDA": "NDA",
};

export default function MockTestPage() {
  const { apiFetch } = useApiClient();
  const [phase, setPhase] = useState("setup"); 
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [userExamTarget, setUserExamTarget] = useState("");

  const mappedExam = EXAM_MAP[userExamTarget] || "UPSC_CSE";
  const config = EXAM_CONFIGS[mappedExam] || EXAM_CONFIGS["UPSC_CSE"];

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await apiFetch("/api/users/me/");
        if (res.ok) {
          const data = await res.json();
          setUserExamTarget(data.exam_target || "UPSC_CSE");
        }
      } catch (e) {}
    }
    loadUser();
  }, [apiFetch]);

  useEffect(() => {
    if (phase !== "test" || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    if (timeLeft === 0) submitTest();
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const startTest = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/mock-test/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, exam: mappedExam }),
      });
      const data = await res.json();
      if (!data.questions || data.questions.length === 0) throw new Error("No questions returned");
      setQuestions(data.questions);
      setAnswers({});
      setMarkedForReview(new Set());
      setCurrentQ(0);
      setTimeLeft(config.time_minutes * 60);
      setPhase("test");
    } catch (e) {
      alert("Failed to generate test: " + e.message);
    }
    setLoading(false);
  };

  const submitTest = useCallback(async () => {
    setLoading(true);
    let correct = 0, incorrect = 0, unattempted = 0;
    const details = questions.map((q, i) => {
      const userAns = answers[i];
      if (!userAns) { unattempted++; return { ...q, userAns: null, status: "skipped", question_id: q.id }; }
      if (userAns === q.correct_option) { correct++; return { ...q, userAns, status: "correct", question_id: q.id }; }
      incorrect++;
      return { ...q, userAns, status: "wrong", question_id: q.id, failure_type: "conceptual" };
    });
    
    const scorePct = (correct / questions.length) * 100;
    
    // Preliminary Rank Calculation
    const totalCandidates = { "UPSC_CSE": 1000000, "JEE_Mains": 1200000, "NEET": 2000000, "NDA": 500000 }[mappedExam] || 1000000;
    const estRank = Math.round(totalCandidates * (1 - (scorePct / 100)) * 0.75);

    setResult({ correct, incorrect, unattempted, total: questions.length, details, scorePct, estRank });
    setPhase("review");

    try {
      await apiFetch(`/api/mock-test/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam: mappedExam,
          percentage: scorePct,
          results: details.map(d => ({
            question_id: d.question_id,
            userAns: d.userAns,
            status: d.status,
            failure_type: "conceptual"
          }))
        }),
      });
    } catch (e) {}
    setLoading(false);
  }, [questions, answers, mappedExam, apiFetch]);

  if (phase === "setup") {
    return (
      <AppShell activePath="/mock-test">
        <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto flex flex-col justify-center min-h-[85vh]">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black mb-2">Simulation Engine</h1>
            <p className="text-[var(--text-muted)]">Official Pattern Calibration for {config.name}</p>
          </div>
          
          <div className="card-simple max-w-2xl mx-auto w-full space-y-8 p-10">
            <div className="flex justify-between items-center p-4 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)]">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Target Exam</span>
              <span className="font-bold text-lg">{config.name}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)]">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Standard Questions</p>
                <p className="text-4xl font-black">{config.num_questions}</p>
                {mappedExam === 'JEE_Mains' && <p className="text-[10px] text-[var(--text-muted)] mt-1">25 Physics · 25 Chemistry · 25 Maths</p>}
              </div>
              <div className="p-6 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)]">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Time Allotted</p>
                <p className="text-4xl font-black">{config.time_minutes}<span className="text-sm">min</span></p>
              </div>
            </div>

            <button onClick={startTest} disabled={loading} className="w-full btn-primary py-6 text-base">
              {loading ? "Generating Unique Test ID..." : "Begin Live Simulation"}
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (phase === "test") {
    const q = questions[currentQ];
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
        <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)] px-6 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold px-3 py-1 bg-[var(--surface-hover)] rounded-lg">{config.name}</span>
            <div className="h-4 w-[1px] bg-[var(--border)]"></div>
            <span className="text-xs font-bold text-[var(--text-muted)]">Q {currentQ + 1} of {questions.length}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[var(--accent)]" />
              <span className="font-mono font-bold text-lg">
                {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,"0")}
              </span>
            </div>
            <button onClick={submitTest} className="btn-primary py-2 px-6">Submit Test</button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 lg:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="card-simple p-8">
                <p className="text-xl font-medium leading-relaxed">{q.question}</p>
              </div>

              <div className="grid gap-4">
                {Object.entries(q.options).map(([key, text]) => (
                  <button
                    key={key}
                    onClick={() => setAnswers({ ...answers, [currentQ]: key })}
                    className={`text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                      answers[currentQ] === key ? "border-[var(--accent)] bg-[var(--accent-glow)]" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]"
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      answers[currentQ] === key ? "bg-[var(--accent)] text-black" : "bg-[var(--surface-hover)] text-[var(--text-muted)]"
                    }`}>{key}</span>
                    <span className="text-lg font-medium">{text}</span>
                  </button>
                ))}
              </div>
            </div>
          </main>

          <aside className="w-80 border-l border-[var(--border)] bg-[var(--surface)] flex flex-col hidden lg:flex overflow-y-auto p-6">
             <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-6">Candidate Navigation</p>
             <div className="grid grid-cols-5 gap-2">
               {questions.map((_, i) => (
                 <button
                   key={i}
                   onClick={() => setCurrentQ(i)}
                   className={`h-10 rounded-lg text-xs font-bold transition-all border ${
                     currentQ === i ? "border-[var(--accent)] text-[var(--accent)]" :
                     answers[i] ? "bg-green-500/10 text-green-500 border-green-500/20" :
                     markedForReview.has(i) ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                     "border-[var(--border)] text-[var(--text-muted)]"
                   }`}
                 >
                   {i + 1}
                 </button>
               ))}
             </div>
          </aside>
        </div>

        <footer className="h-20 border-t border-[var(--border)] bg-[var(--surface)] px-6 flex items-center justify-between">
           <button 
             onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
             disabled={currentQ === 0}
             className="px-6 py-2 rounded-xl text-sm font-bold text-[var(--text-muted)] disabled:opacity-30"
           >
             Previous
           </button>
           <div className="flex gap-4">
             <button 
               onClick={() => {
                 const newSet = new Set(markedForReview);
                 newSet.has(currentQ) ? newSet.delete(currentQ) : newSet.add(currentQ);
                 setMarkedForReview(newSet);
               }}
               className={`px-6 py-2 rounded-xl text-sm font-bold border ${markedForReview.has(currentQ) ? 'bg-purple-500/10 border-purple-500 text-purple-500' : 'border-[var(--border)] text-[var(--text-muted)]'}`}
             >
               {markedForReview.has(currentQ) ? 'Unmark' : 'Mark for Review'}
             </button>
             <button 
                onClick={() => {
                  if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
                  else submitTest();
                }}
                className="btn-primary px-10"
              >
                {currentQ === questions.length - 1 ? 'Finish Simulation' : 'Save & Continue'}
              </button>
           </div>
        </footer>
      </div>
    );
  }

  if (phase === "review" && result) {
    return (
      <AppShell activePath="/mock-test">
        <div className="p-4 lg:p-10 w-full max-w-7xl mx-auto space-y-10">
          <div className="text-center">
            <h1 className="text-4xl font-black mb-2">Performance Summary</h1>
            <p className="text-[var(--text-muted)]">Simulation outcome for {config.name}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="card-simple text-center">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">Accuracy</p>
                    <p className="text-3xl font-black text-[var(--accent)]">{Math.round(result.scorePct)}%</p>
                  </div>
                  <div className="card-simple text-center">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">Correct</p>
                    <p className="text-3xl font-black text-green-500">{result.correct}</p>
                  </div>
                  <div className="card-simple text-center">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">Incorrect</p>
                    <p className="text-3xl font-black text-red-500">{result.incorrect}</p>
                  </div>
                  <div className="card-simple text-center">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">Skipped</p>
                    <p className="text-3xl font-black text-gray-500">{result.unattempted}</p>
                  </div>
                </div>

                <div className="card-simple space-y-6">
                  <h3 className="text-lg font-bold border-b border-[var(--border)] pb-4">Detailed Question Review</h3>
                  <div className="space-y-6">
                    {result.details.map((d, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex gap-4">
                          <span className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${d.status === 'correct' ? 'bg-green-500 text-white' : d.status === 'wrong' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'}`}>
                            {i + 1}
                          </span>
                          <p className="font-medium text-sm leading-relaxed">{d.question}</p>
                        </div>
                        <div className="ml-12 p-5 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)] text-xs text-[var(--text-muted)] leading-relaxed">
                          <span className="font-bold text-[var(--accent)] block mb-1">Expert Explanation:</span>
                          {d.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="card-simple bg-[var(--surface-hover)] border-2 border-[var(--accent)] relative overflow-hidden">
                   <Zap size={60} className="absolute -top-6 -right-6 text-[var(--accent)] opacity-10" />
                   <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-4 tracking-widest">Predicted AIR</p>
                   <p className="text-6xl font-black mb-2 text-[var(--accent)]">#{result.estRank.toLocaleString()}</p>
                   <p className="text-xs font-bold text-[var(--text-muted)] mb-8">Estimated based on current competitive percentile.</p>
                   <button onClick={() => window.location.href='/rank-predictor'} className="w-full btn-primary py-3 rounded-xl">View Detailed Analysis</button>
                </div>

                <div className="card-simple">
                   <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-6">Next Steps</h3>
                   <div className="space-y-3">
                     <button onClick={() => setPhase("setup")} className="w-full py-4 px-5 bg-[var(--surface-hover)] rounded-xl text-sm font-bold text-left flex items-center justify-between group border border-[var(--border)] hover:border-[var(--accent)]">
                       Retake Simulation <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                     <button onClick={() => window.location.href='/dna-report'} className="w-full py-4 px-5 bg-[var(--surface-hover)] rounded-xl text-sm font-bold text-left flex items-center justify-between group border border-[var(--border)] hover:border-[var(--accent)]">
                       Analyze Failure DNA <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return null;
}
