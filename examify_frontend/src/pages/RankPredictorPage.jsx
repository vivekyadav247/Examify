import React, { useState, useEffect } from "react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";



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
  jee_mains: {
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
  const [exam, setExam] = useState("upsc");
  const [scores, setScores] = useState({ correct: "", incorrect: "", unattempted: "" });
  const [category, setCategory] = useState("general");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("calculator"); // calculator | ai

  const config = EXAM_CONFIGS[exam];

  const calculateLocally = () => {
    const correct = parseInt(scores.correct) || 0;
    const incorrect = parseInt(scores.incorrect) || 0;
    const marks = correct * (config.max_marks / config.total_questions) + incorrect * config.negative;
    const percentage = (marks / config.max_marks) * 100;
    const estimatedRank = Math.round(
      config.total_candidates * (1 - percentage / 100) * 0.7
    );
    const passed = marks >= config.cutoff_range[0];
    return { marks: Math.max(0, marks), percentage, estimatedRank, passed };
  };

  const predict = async () => {
    setLoading(true);
    setPrediction(null);
    const localCalc = calculateLocally();
    if (mode === "calculator") {
      setPrediction({ ...localCalc, source: "local", exam_name: config.name });
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch(`/api/predict-rank/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam, scores, category, ...localCalc }),
      });
      const data = await res.json();
      setPrediction({ ...localCalc, ...data, source: "ai" });
    } catch {
      setPrediction({ ...localCalc, source: "local", exam_name: config.name });
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
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <span className="text-4xl">🏆</span> Rank Predictor
          </h1>
          <p className="text-[var(--text-muted)]">Estimate your rank based on attempted questions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
            {/* Mode Toggle */}
            <div className="flex gap-2 bg-[var(--surface-2)] rounded-xl p-1">
              <button
                onClick={() => setMode("calculator")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "calculator" ? "bg-[var(--accent)] text-[var(--bg)] text-[var(--text)]" : "text-[var(--text-muted)]"}`}
              >
                📊 Calculator
              </button>
              <button
                onClick={() => setMode("ai")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "ai" ? "bg-[var(--accent)] text-[var(--bg)] text-[var(--text)]" : "text-[var(--text-muted)]"}`}
              >
                🤖 AI Predict
              </button>
            </div>

            {/* Exam */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Exam</label>
              <select
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                value={exam}
                onChange={(e) => setExam(e.target.value)}
              >
                {Object.entries(EXAM_CONFIGS).map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Exam Info */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Max Marks", value: config.max_marks },
                { label: "Questions", value: config.total_questions },
                { label: "Negative", value: config.negative },
              ].map((info) => (
                <div key={info.label} className="bg-[var(--surface-2)] rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-[var(--text)]">{info.value}</div>
                  <div className="text-xs text-[var(--text-muted)]">{info.label}</div>
                </div>
              ))}
            </div>

            {/* Score Inputs */}
            <div className="space-y-3">
              {[
                { key: "correct", label: "Correct Answers", color: "border-green-600 focus:border-green-400" },
                { key: "incorrect", label: "Incorrect Answers", color: "border-red-600 focus:border-red-400" },
                { key: "unattempted", label: "Unattempted", color: "border-gray-600 focus:border-gray-400" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase">{field.label}</label>
                  <input
                    type="number"
                    min="0"
                    max={config.total_questions}
                    className={`w-full bg-[var(--surface-2)] border rounded-xl px-4 py-3 text-[var(--text)] focus:outline-none transition-colors ${field.color}`}
                    placeholder="0"
                    value={scores[field.key]}
                    onChange={(e) => setScores((s) => ({ ...s, [field.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Category</label>
              <div className="flex flex-wrap gap-2">
                {["general", "obc", "sc", "st", "ews"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs uppercase font-semibold border transition-colors ${
                      category === cat ? "bg-[var(--accent)] text-[var(--bg)] border-indigo-400 text-[var(--text)]" : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-muted)]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={predict}
              disabled={loading || !scores.correct}
              className="w-full bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-2)] text-[var(--bg)] disabled:bg-gray-700 text-[var(--text)] font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? "Predicting..." : "🔮 Predict My Rank"}
            </button>
          </div>

          {/* Result */}
          <div>
            {prediction ? (
              <div className="space-y-4">
                {/* Main Result */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 text-center">
                  <p className="text-[var(--text-muted)] text-sm mb-2">{prediction.exam_name || config.name}</p>
                  <div className="text-6xl font-black text-[var(--text)] mb-1">
                    {Math.round(prediction.marks)}
                  </div>
                  <p className="text-[var(--text-muted)] text-sm">out of {config.max_marks} marks</p>
                  <div className="mt-4 w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${
                        prediction.percentage >= 60 ? "bg-green-500" :
                        prediction.percentage >= 40 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, prediction.percentage)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{prediction.percentage?.toFixed(1)}% score</p>
                </div>

                {/* Rank Card */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Estimated Rank</p>
                  <p className={`text-4xl font-black ${getRankColor(prediction.estimatedRank, config.seats)}`}>
                    #{(prediction.rank || prediction.estimatedRank)?.toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Out of {config.total_candidates.toLocaleString()} candidates
                  </p>
                </div>

                {/* Status */}
                <div className={`rounded-2xl border p-4 text-center ${
                  prediction.passed
                    ? "bg-green-900/30 border-green-700"
                    : "bg-red-900/30 border-red-700"
                }`}>
                  <p className={`text-xl font-bold ${prediction.passed ? "text-green-400" : "text-red-400"}`}>
                    {prediction.passed ? "✅ Likely to Clear Cutoff" : "❌ Below Expected Cutoff"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Expected cutoff: {config.cutoff_range[0]}–{config.cutoff_range[1]} · {category.toUpperCase()} category
                  </p>
                </div>

                {/* AI Analysis */}
                {prediction.analysis && (
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">AI Analysis</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{prediction.analysis}</p>
                  </div>
                )}

                {prediction.suggestions && (
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Suggestions</p>
                    <ul className="space-y-1">
                      {prediction.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-gray-300 flex gap-2">
                          <span className="text-[var(--accent)] shrink-0">→</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl p-8 min-h-96 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl">🎯</span>
                  <p className="text-[var(--text-muted)] mt-3">Enter your answers and predict rank</p>
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