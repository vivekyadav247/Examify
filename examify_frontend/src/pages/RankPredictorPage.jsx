import React, { useState, useEffect } from "react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";
import { Target, Trophy, TrendingUp, AlertTriangle } from "lucide-react";

const EXAM_CONFIGS = {
  upsc: {
    name: "UPSC CSE Prelims",
    max_marks: 200,
    negative: -0.666,
    total_questions: 100,
    cutoff_range: [90, 115],
    total_candidates: 1000000,
    seats: 1000,
  },
  jee: {
    name: "JEE Mains",
    max_marks: 300,
    negative: -1,
    total_questions: 75,
    cutoff_range: [80, 100],
    total_candidates: 1200000,
    seats: 31000,
  },
  neet: {
    name: "NEET UG",
    max_marks: 720,
    negative: -1,
    total_questions: 180,
    cutoff_range: [550, 650],
    total_candidates: 2000000,
    seats: 100000,
  },
  ssc_cgl: {
    name: "SSC CGL Tier 1",
    max_marks: 200,
    negative: -0.5,
    total_questions: 100,
    cutoff_range: [140, 170],
    total_candidates: 3000000,
    seats: 8000,
  },
};

export default function RankPredictorPage() {
  const { apiFetch } = useApiClient();
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");
  const [userExam, setUserExam] = useState("upsc");

  useEffect(() => {
    fetchLatestMockAndPredict();
  }, []);

  const fetchLatestMockAndPredict = async () => {
    setLoading(true);
    try {
      // 1. Get user profile for exam target
      const userRes = await apiFetch("/api/users/me/");
      if (userRes.ok) {
        const userData = await userRes.json();
        const examMap = {
          "UPSC_CSE": "upsc", "UPSC_IFS": "upsc",
          "JEE_Mains": "jee", "JEE_Advanced": "jee",
          "NEET": "neet",
          "SSC_CGL": "ssc_cgl", "SSC_CHSL": "ssc_cgl",
        };
        setUserExam(examMap[userData.exam_target] || "upsc");
      }

      // 2. Get latest mock test results from DNA report
      const dnaRes = await apiFetch(`/api/analytics/dna-full/`);
      const dnaData = await dnaRes.json();

      if (!dnaData.sessions || dnaData.sessions.length === 0) {
        setError("You haven't taken any mock tests yet. Complete a mock test first to predict your rank!");
        setLoading(false);
        return;
      }

      const latestSession = dnaData.sessions[0]; // the most recent session
      
      // Calculate scores based on the session accuracy and questions
      const config = EXAM_CONFIGS[userExam] || EXAM_CONFIGS["upsc"];
      
      // If the session didn't have full questions, we extrapolate the percentage to the full exam
      const sessionScorePct = latestSession.score || 0; 
      const estimatedMarks = (sessionScorePct / 100) * config.max_marks;
      
      const estimatedRank = Math.round(
        config.total_candidates * (1 - sessionScorePct / 100) * 0.7
      );
      
      const passed = estimatedMarks >= config.cutoff_range[0];

      // 3. Ask AI for deeper analysis
      const aiRes = await apiFetch(`/api/predict-rank/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          exam: userExam, 
          marks: estimatedMarks, 
          percentage: sessionScorePct, 
          category: "general", // We can default to general or fetch from profile
          estimatedRank 
        }),
      });
      const aiData = await aiRes.json();

      setPrediction({
        exam_name: config.name,
        marks: estimatedMarks,
        max_marks: config.max_marks,
        percentage: sessionScorePct,
        estimatedRank,
        passed,
        cutoff_range: config.cutoff_range,
        total_candidates: config.total_candidates,
        seats: config.seats,
        ...aiData
      });
    } catch (err) {
      console.error(err);
      setError("Failed to generate rank prediction. Please try again later.");
    }
    setLoading(false);
  };

  const getRankColor = (rank, seats) => {
    const ratio = rank / seats;
    if (ratio < 0.5) return "text-green-400";
    if (ratio < 2) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <AppShell activePath={window.location.pathname}>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
                <Trophy className="text-yellow-400" size={32} /> Rank Predictor
              </h1>
              <p className="text-[var(--text-muted)]">Automatic AI prediction based on your latest Mock Test</p>
            </div>
            {prediction && (
              <button onClick={fetchLatestMockAndPredict} className="px-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl hover:bg-[var(--surface)] text-sm font-semibold transition-colors">
                Refresh Prediction
              </button>
            )}
          </div>

          {loading ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">Analyzing your Mock Test Data</h3>
              <p className="text-[var(--text-muted)]">Running your performance against {EXAM_CONFIGS[userExam]?.total_candidates?.toLocaleString() || "millions of"} candidates...</p>
            </div>
          ) : error ? (
            <div className="bg-[var(--surface)] border border-red-900/50 rounded-2xl p-8 text-center flex flex-col items-center">
              <AlertTriangle className="text-red-500 mb-4" size={48} />
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">No Mock Test Found</h3>
              <p className="text-[var(--text-muted)] mb-6">{error}</p>
              <button 
                onClick={() => window.location.href='/mock-test'}
                className="bg-[var(--accent)] text-[var(--bg)] font-bold py-3 px-6 rounded-xl transition-colors hover:scale-105"
              >
                Take a Mock Test Now
              </button>
            </div>
          ) : prediction && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Main Result Card */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 text-center relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-5 blur-3xl rounded-full"></div>
                  
                  <p className="text-[var(--accent)] font-bold text-sm tracking-wider uppercase mb-4">{prediction.exam_name}</p>
                  <div className="text-7xl font-black text-[var(--text)] mb-2 tracking-tighter">
                    {Math.round(prediction.marks)}
                  </div>
                  <p className="text-[var(--text-muted)] font-medium">Estimated marks out of {prediction.max_marks}</p>
                  
                  <div className="mt-8 w-full bg-[var(--surface-2)] rounded-full h-4 overflow-hidden border border-[var(--border)]">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        prediction.percentage >= 60 ? "bg-green-500" :
                        prediction.percentage >= 40 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, prediction.percentage)}%` }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-muted)] mt-3">Accuracy Match: {prediction.percentage?.toFixed(1)}%</p>
                </div>

                {/* Status Card */}
                <div className={`rounded-3xl border p-6 flex items-center gap-4 ${
                  prediction.passed
                    ? "bg-green-900/10 border-green-500/30"
                    : "bg-red-900/10 border-red-500/30"
                }`}>
                  <div className={`p-3 rounded-xl ${prediction.passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    <Target size={28} />
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${prediction.passed ? "text-green-400" : "text-red-400"}`}>
                      {prediction.passed ? "Likely to Clear Cutoff" : "Below Expected Cutoff"}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      Expected cutoff range: {prediction.cutoff_range[0]}–{prediction.cutoff_range[1]} marks
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Rank Card */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="text-[var(--accent)]" size={24} />
                    <h3 className="font-bold text-lg text-[var(--text)]">Estimated Rank</h3>
                  </div>
                  <p className={`text-5xl font-black mb-2 tracking-tight ${getRankColor(prediction.estimatedRank, prediction.seats)}`}>
                    #{(prediction.rank || prediction.estimatedRank)?.toLocaleString()}
                  </p>
                  <p className="text-sm text-[var(--text-muted)] font-medium">
                    Out of {prediction.total_candidates.toLocaleString()} competing candidates
                  </p>
                </div>

                {/* AI Analysis */}
                {prediction.analysis && (
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-lg">
                    <h3 className="font-bold text-lg text-[var(--text)] mb-3 flex items-center gap-2">
                      <span className="text-[var(--accent)]">🤖</span> AI Performance DNA
                    </h3>
                    <p className="text-[var(--text-muted)] leading-relaxed">{prediction.analysis}</p>
                  </div>
                )}

                {/* Suggestions */}
                {prediction.suggestions && prediction.suggestions.length > 0 && (
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-lg">
                    <h3 className="font-bold text-lg text-[var(--text)] mb-4">Action Plan</h3>
                    <ul className="space-y-3">
                      {prediction.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-3 text-[var(--text-muted)]">
                          <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                            {i + 1}
                          </div>
                          <span className="leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}