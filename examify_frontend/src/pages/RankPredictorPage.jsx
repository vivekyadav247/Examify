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
      const examMap = {
        "UPSC_CSE": "upsc", "UPSC_IFS": "upsc",
        "JEE_Mains": "jee", "JEE_Advanced": "jee",
        "NEET": "neet",
        "SSC_CGL": "ssc_cgl", "SSC_CHSL": "ssc_cgl",
      };

      // 1. Get user profile for exam target
      let target = "UPSC_CSE";
      const userRes = await apiFetch("/api/users/me/");
      if (userRes.ok) {
        const userData = await userRes.json();
        target = userData.exam_target || "UPSC_CSE";
        setUserExam(examMap[target] || "upsc");
      }

      const currentExamKey = examMap[target] || "upsc";

      // 2. Get latest mock test results from DNA report
      const dnaRes = await apiFetch(`/api/analytics/dna-full/`);
      const dnaData = await dnaRes.json();

      if (!dnaData.sessions || dnaData.sessions.length === 0) {
        setError("You haven't taken any mock tests yet. Complete a mock test first to predict your rank!");
        setLoading(false);
        return;
      }

      const latestSession = dnaData.sessions[0]; 
      const config = EXAM_CONFIGS[currentExamKey] || EXAM_CONFIGS["upsc"];
      
      const sessionScorePct = latestSession.score || latestSession.percentage || 0; 
      const estimatedMarks = (sessionScorePct / 100) * config.max_marks;
      const estimatedRank = Math.round(config.total_candidates * (1 - sessionScorePct / 100) * 0.7);
      const passed = estimatedMarks >= config.cutoff_range[0];

      // 3. Ask AI for deeper analysis
      const aiRes = await apiFetch(`/api/predict-rank/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          exam: target, // Send the real exam target to backend
          marks: estimatedMarks, 
          percentage: sessionScorePct, 
          category: "general",
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
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 flex flex-col items-center font-sans">
        <div className="w-full max-w-5xl">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black flex items-center gap-3 mb-2 tracking-tight">
                <Trophy className="text-yellow-400" size={40} /> Rank Predictor
              </h1>
              <p className="text-gray-400 font-medium">Professional AI analysis of your {prediction?.exam_name || "exam"} performance</p>
            </div>
            {prediction && (
              <button onClick={fetchLatestMockAndPredict} className="px-5 py-2 bg-gray-900 border border-gray-800 rounded-2xl hover:border-gray-600 text-sm font-bold transition-all">
                Recalculate
              </button>
            )}
          </div>

          {loading ? (
            <div className="bg-gray-950 border border-gray-900 rounded-[2.5rem] p-20 text-center flex flex-col items-center shadow-2xl">
              <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-2xl font-bold text-white mb-2">Analyzing Performance Matrix</h3>
              <p className="text-gray-500 max-w-sm">Comparing your mock test signatures against millions of past data points...</p>
            </div>
          ) : error ? (
            <div className="bg-gray-950 border border-red-900/30 rounded-[2.5rem] p-12 text-center flex flex-col items-center">
              <AlertTriangle className="text-red-500 mb-6" size={64} />
              <h3 className="text-2xl font-bold text-white mb-3">Analysis Not Available</h3>
              <p className="text-gray-400 mb-8 max-w-md">{error}</p>
              <button 
                onClick={() => window.location.href='/mock-test'}
                className="bg-yellow-500 text-black font-black py-4 px-10 rounded-2xl transition-transform hover:scale-105 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
              >
                Start Mock Test
              </button>
            </div>
          ) : prediction && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Score & Prediction Table Card */}
                <div className="bg-gray-950 border border-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <div className="bg-gradient-to-r from-yellow-500/10 to-transparent p-8 border-b border-gray-900">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-yellow-500 font-bold text-xs tracking-widest uppercase mb-1">Current Score</p>
                        <h2 className="text-6xl font-black text-white tracking-tighter">
                          {Math.round(prediction.marks)}<span className="text-2xl text-gray-600 font-medium ml-2">/ {prediction.max_marks}</span>
                        </h2>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">Verdict</p>
                        <div className={`text-xl font-black px-4 py-1 rounded-full ${
                          prediction.verdict === "Scholar" ? "bg-green-500/20 text-green-400" :
                          prediction.verdict === "Borderline" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {prediction.verdict}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <TrendingUp size={20} className="text-yellow-500" /> Analytical Metrics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {prediction.table_data?.map((row, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                          <span className="text-gray-400 text-sm font-medium">{row.label}</span>
                          <span className="text-white font-bold">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-900/30 rounded-3xl p-6 border border-gray-800/50">
                      <h4 className="text-gray-300 font-bold text-sm mb-3">AI Case Study</h4>
                      <p className="text-gray-400 leading-relaxed italic text-sm">"{prediction.analysis}"</p>
                    </div>
                  </div>
                </div>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-950 border border-gray-900 rounded-[2.5rem] p-8 shadow-xl">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                      <Target className="text-red-500" size={24} /> High-Priority Fixes
                    </h3>
                    <ul className="space-y-4">
                      {prediction.suggestions?.map((s, i) => (
                        <li key={i} className="flex gap-4">
                          <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 font-black text-sm">
                            {i + 1}
                          </div>
                          <span className="text-gray-400 text-sm leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-950 border border-gray-900 rounded-[2.5rem] p-8 shadow-xl border-l-4 border-l-yellow-500">
                    <h3 className="text-white font-bold mb-4">Immediate Strategy</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                      {prediction.next_steps}
                    </p>
                    <button 
                      onClick={() => window.location.href='/dna'}
                      className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      View Failure DNA
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar: Rank & Percentile */}
              <div className="space-y-8">
                <div className="bg-gray-950 border border-gray-900 rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-2xl group border-t-4 border-t-yellow-500">
                  <div className="absolute top-0 left-0 w-full h-full bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">Estimated All India Rank</p>
                  <div className={`text-7xl font-black mb-4 tracking-tighter ${getRankColor(prediction.estimatedRank, prediction.seats)}`}>
                    #{prediction.estimatedRank?.toLocaleString()}
                  </div>
                  <div className="inline-block px-4 py-2 bg-gray-900 rounded-2xl border border-gray-800 text-gray-300 text-xs font-bold">
                    TOP {((prediction.estimatedRank / prediction.total_candidates) * 100).toFixed(2)}% of aspirants
                  </div>
                  
                  <div className="mt-10 pt-10 border-t border-gray-900 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm font-bold">Total Candidates</span>
                      <span className="text-white font-black">{prediction.total_candidates?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm font-bold">Available Seats</span>
                      <span className="text-white font-black">{prediction.seats?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm font-bold">Accuracy</span>
                      <span className="text-yellow-500 font-black">{prediction.percentage?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className={`rounded-[2.5rem] border p-8 ${
                  prediction.passed ? "bg-green-950/20 border-green-500/30" : "bg-red-950/20 border-red-500/30"
                }`}>
                  <h4 className={`font-bold mb-2 ${prediction.passed ? "text-green-400" : "text-red-400"}`}>
                    {prediction.passed ? "Selection Probability: High" : "Selection Probability: Low"}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Based on current performance trends and historically expected cutoffs. Continuous practice required to maintain rank.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}