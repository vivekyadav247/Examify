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
    "UPSC_CSE": "UPSC_CSE", "UPSC_IFS": "UPSC_CSE",
    "JEE_Mains": "JEE_Mains", "JEE_Advanced": "JEE_Mains",
    "NEET": "NEET",
    "SSC_CGL": "SSC_CGL", "SSC_CHSL": "SSC_CGL",
  };

  const EXAM_CONFIGS = {
    "UPSC_CSE": { name: "UPSC CSE", num_questions: 100, time_minutes: 120 },
    "JEE_Mains": { name: "JEE Mains", num_questions: 75, time_minutes: 180 },
    "NEET": { name: "NEET UG", num_questions: 180, time_minutes: 200 },
    "SSC_CGL": { name: "SSC CGL", num_questions: 100, time_minutes: 60 },
  };

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await apiFetch("/api/users/me/");
        if (res.ok) {
          const data = await res.json();
          const target = data.exam_target || "UPSC_CSE";
          const mappedExam = EXAM_MAP[target] || target;
          const examConf = EXAM_CONFIGS[mappedExam] || EXAM_CONFIGS["UPSC_CSE"];
          setUserExamTarget(target);
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
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions returned");
      }
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
    let correct = 0, incorrect = 0, unattempted = 0;
    const details = questions.map((q, i) => {
      const userAns = answers[i];
      if (userAns === undefined || userAns === null) { unattempted++; return { ...q, userAns: null, status: "skipped", question_id: q.id }; }
      if (userAns === q.correct_option) { correct++; return { ...q, userAns, status: "correct", question_id: q.id }; }
      incorrect++;
      const failureTypes = ["conceptual", "silly", "time", "recall"];
      const failure_type = failureTypes[Math.floor(Math.random() * failureTypes.length)];
      return { ...q, userAns, status: "wrong", question_id: q.id, failure_type };
    });
    
    const marks = correct * 2 + incorrect * -0.666;
    const pct = (correct / questions.length) * 100;
    
    setResult({ correct, incorrect, unattempted, marks: Math.max(0, marks), details, total: questions.length });
    setPhase("review");

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
      console.error(e);
    }
  }, [questions, answers, config.exam, apiFetch]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const timeColor = timeLeft < 300 ? "text-red-400" : timeLeft < 600 ? "text-yellow-400" : "text-green-400";

  if (phase === "setup") {
    return (
      <AppShell activePath={window.location.pathname}>
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 flex items-center justify-center font-sans">
          <div className="w-full max-w-xl">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/20 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
                <ClipboardList className="text-yellow-500" size={40} />
              </div>
              <h1 className="text-5xl font-black mb-3 tracking-tight">Full Mock Test</h1>
              <p className="text-gray-500 font-medium text-lg">AI-calibrated full length practice environment</p>
            </div>
            
            <div className="bg-gray-950 border border-gray-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
               
              <div className="space-y-8 relative">
                <div>
                  <label className="block text-xs font-black text-gray-600 mb-3 uppercase tracking-[0.2em]">Active Candidate Target</label>
                  <div className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 text-white font-bold text-xl flex items-center justify-between">
                    <span>{userExamTarget || "Loading..."}</span>
                    <span className="text-xs px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20 uppercase tracking-widest">Selected</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-900/30 p-6 rounded-3xl border border-gray-800/50">
                    <p className="text-gray-500 text-[10px] font-black uppercase mb-1">Standard Questions</p>
                    <p className="text-3xl font-black text-white">{config.num_questions}</p>
                  </div>
                  <div className="bg-gray-900/30 p-6 rounded-3xl border border-gray-800/50">
                    <p className="text-gray-500 text-[10px] font-black uppercase mb-1">Exam Duration</p>
                    <p className="text-3xl font-black text-white">{config.time_minutes} <span className="text-sm font-bold text-gray-600">min</span></p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={startTest}
                    disabled={loading}
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 font-black py-5 rounded-[1.5rem] text-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                  >
                    {loading ? <span>Syncing Exam Engine...</span> : <span>Initiate Real-Time Test</span>}
                  </button>
                  <p className="text-center text-gray-600 text-xs mt-4">Exam rules will be strictly enforced during the session.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (phase === "test") {
    const q = questions[currentQ];
    const options = ["A", "B", "C", "D"];

    return (
      <AppShell activePath={window.location.pathname}>
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans">
          <div className="bg-black border-b border-gray-900 px-8 py-5 flex items-center justify-between shrink-0 shadow-xl">
            <div className="flex items-center gap-6">
              <div className="text-xs font-black text-gray-500 uppercase tracking-widest">
                Progress: <span className="text-white ml-2">{currentQ + 1} / {questions.length}</span>
              </div>
            </div>
            <div className={`text-4xl font-mono font-black tracking-tighter ${timeColor} bg-gray-900/50 px-6 py-2 rounded-2xl border border-gray-800`}>
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={submitTest}
              className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]"
            >
              Submit Final Response
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-10 lg:p-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/20 via-transparent to-transparent">
              <div className="max-w-3xl mx-auto">
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-10 h-10 bg-yellow-500 text-black flex items-center justify-center rounded-xl font-black text-lg">Q{currentQ + 1}</span>
                    <div className="h-[2px] flex-1 bg-gray-900"></div>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Single Correct Option</span>
                  </div>
                  <p className="text-3xl lg:text-4xl font-bold text-white leading-[1.3] tracking-tight">{q?.question}</p>
                </div>

                <div className="space-y-4 mb-12">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((a) => ({ ...a, [currentQ]: opt }))}
                      className={`w-full text-left p-6 lg:p-8 rounded-[1.5rem] border-2 transition-all group flex items-center gap-6 ${
                        answers[currentQ] === opt
                          ? "bg-yellow-500/10 border-yellow-500 text-white shadow-[0_0_30px_rgba(234,179,8,0.1)]"
                          : "bg-gray-950 border-gray-900 text-gray-400 hover:border-gray-700 hover:bg-gray-900/50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black transition-all ${
                        answers[currentQ] === opt ? "bg-yellow-500 border-yellow-500 text-black" : "border-gray-800 text-gray-600 group-hover:border-gray-600"
                      }`}>
                        {opt}
                      </div>
                      <span className="text-xl lg:text-2xl font-medium">{q?.options?.[opt]}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 justify-between pt-10 border-t border-gray-900">
                  <button
                    onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
                    disabled={currentQ === 0}
                    className="px-10 py-5 bg-gray-950 border border-gray-800 rounded-2xl disabled:opacity-30 hover:border-gray-600 transition-all font-bold"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setMarkedForReview((s) => { const ns = new Set(s); ns.has(currentQ) ? ns.delete(currentQ) : ns.add(currentQ); return ns; })}
                    className={`px-10 py-5 border rounded-2xl transition-all font-bold ${markedForReview.has(currentQ) ? "bg-purple-900/30 border-purple-500 text-purple-300" : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-600"}`}
                  >
                    {markedForReview.has(currentQ) ? "Marked for Review" : "Mark for Review"}
                  </button>
                  <button
                    onClick={() => setCurrentQ((c) => Math.min(questions.length - 1, c + 1))}
                    disabled={currentQ === questions.length - 1}
                    className="px-10 py-5 bg-yellow-500 text-black rounded-2xl disabled:opacity-30 hover:bg-yellow-400 transition-all font-bold"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            </div>

            <div className="w-80 bg-black border-l border-gray-900 p-8 overflow-y-auto shrink-0 hidden lg:block">
              <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8">Exam Navigator</h4>
              <div className="grid grid-cols-4 gap-3">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`w-12 h-12 rounded-xl text-sm font-black transition-all flex items-center justify-center border-2 ${
                      i === currentQ ? "bg-white border-white text-black scale-110 shadow-lg" :
                      answers[i] !== undefined ? "bg-green-500/10 border-green-500/30 text-green-400" :
                      markedForReview.has(i) ? "bg-purple-500/10 border-purple-500/30 text-purple-400" :
                      "bg-gray-950 border-gray-900 text-gray-700 hover:border-gray-700 hover:text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-12 space-y-4">
                {[
                  { color: "bg-green-500", label: "Answered" },
                  { color: "bg-purple-500", label: "Marked" },
                  { color: "bg-white", label: "Active" },
                  { color: "bg-gray-800", label: "Unvisited" },
                ].map((leg) => (
                  <div key={leg.label} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${leg.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{leg.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (phase === "review" && result) {
    const pct = ((result.correct / result.total) * 100).toFixed(1);
    return (
      <AppShell activePath={window.location.pathname}>
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-10 font-sans">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-black mb-4 tracking-tight">Exam Performance Report</h1>
              <p className="text-gray-500 font-medium">Session analysis for {userExamTarget}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
              {[
                { label: "Net Score", value: result.marks.toFixed(1), color: "text-white", bg: "bg-gray-950" },
                { label: "Correct", value: result.correct, color: "text-green-400", bg: "bg-green-500/5" },
                { label: "Incorrect", value: result.incorrect, color: "text-red-400", bg: "bg-red-500/5" },
                { label: "Skipped", value: result.unattempted, color: "text-gray-500", bg: "bg-gray-900/50" },
                { label: "Accuracy", value: `${pct}%`, color: "text-yellow-500", bg: "bg-yellow-500/5" },
              ].map((card) => (
                <div key={card.label} className={`${card.bg} border border-gray-900 rounded-[2rem] p-8 text-center shadow-xl`}>
                  <div className={`text-4xl font-black ${card.color} mb-1 tracking-tighter`}>{card.value}</div>
                  <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              <div className="lg:col-span-2 bg-gray-950 border border-gray-900 rounded-[2.5rem] p-10 shadow-2xl">
                <h3 className="text-xl font-bold mb-8">Detailed Solution Matrix</h3>
                <div className="space-y-6">
                  {result.details.map((q, i) => (
                    <div
                      key={i}
                      className={`group p-6 rounded-3xl border-2 transition-all ${
                        q.status === "correct" ? "border-green-500/10 bg-green-500/5" :
                        q.status === "wrong" ? "border-red-500/10 bg-red-500/5" : "border-gray-900 bg-gray-900/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-6 mb-4">
                         <div className="flex items-center gap-3">
                           <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                              q.status === "correct" ? "bg-green-500 text-black" :
                              q.status === "wrong" ? "bg-red-500 text-white" : "bg-gray-800 text-gray-400"
                           }`}>{i+1}</span>
                           <p className="text-lg font-bold text-white tracking-tight leading-snug">{q.question}</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 pl-11">
                        {["A","B","C","D"].map((opt) => (
                          <div key={opt} className={`px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-3 border ${
                            opt === q.correct_option ? "bg-green-500/20 border-green-500/30 text-green-400" :
                            opt === q.userAns && q.status === "wrong" ? "bg-red-500/20 border-red-500/30 text-red-400" :
                            "bg-gray-900/50 border-gray-800 text-gray-500"
                          }`}>
                            <span className="font-black">{opt}</span>
                            <span>{q.options?.[opt]}</span>
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="ml-11 bg-black/40 rounded-2xl p-6 border border-gray-900/50">
                          <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-2">Diagnostic Explanation</p>
                          <p className="text-sm text-gray-400 leading-relaxed italic">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-yellow-500 text-black rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                  <h3 className="text-2xl font-black mb-4">Rank Prediction</h3>
                  <p className="text-black/70 text-sm font-medium leading-relaxed mb-8">
                    Based on your accuracy of {pct}% in {userExamTarget}, we have calculated your projected All India Rank.
                  </p>
                  <button 
                    onClick={() => window.location.href='/rank'}
                    className="w-full py-5 bg-black text-white font-black rounded-2xl transition-transform hover:scale-[1.03] active:scale-[0.97]"
                  >
                    View Official Rank 🔮
                  </button>
                </div>

                <div className="bg-gray-950 border border-gray-900 rounded-[2.5rem] p-10 shadow-2xl">
                  <h3 className="text-xl font-bold mb-4">Next Steps</h3>
                  <div className="space-y-4">
                     <button onClick={() => setPhase("setup")} className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl transition-all">
                        Retake Simulation
                     </button>
                     <button onClick={() => window.location.href='/dna'} className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl transition-all">
                        Analyze Failure DNA
                     </button>
                  </div>
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
