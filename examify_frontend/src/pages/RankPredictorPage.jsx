import React, { useState, useEffect } from "react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";
import { Target, Trophy, AlertTriangle, ChevronRight, Activity, Zap } from "lucide-react";

const EXAM_CONFIGS = {
  upsc: { name: "UPSC CSE Prelims", max_marks: 200, cutoff_range: [90, 115], total_candidates: 1000000 },
  jee: { name: "JEE Mains", max_marks: 300, cutoff_range: [80, 100], total_candidates: 1200000 },
  neet: { name: "NEET UG", max_marks: 720, cutoff_range: [550, 650], total_candidates: 2000000 },
  ssc_cgl: { name: "SSC CGL Tier 1", max_marks: 200, cutoff_range: [140, 170], total_candidates: 3000000 },
};

export default function RankPredictorPage() {
  const { apiFetch } = useApiClient();
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLatestMockAndPredict();
  }, []);

  const fetchLatestMockAndPredict = async () => {
    setLoading(true);
    try {
      const examMap = { "UPSC_CSE": "upsc", "JEE_Mains": "jee", "NEET": "neet", "SSC_CGL": "ssc_cgl" };
      const userRes = await apiFetch("/api/users/me/");
      const userData = await userRes.json();
      const target = userData.exam_target || "UPSC_CSE";
      const currentExamKey = examMap[target] || "upsc";
      
      const dnaRes = await apiFetch(`/api/analytics/dna-full/`);
      const dnaData = await dnaRes.json();
      if (!dnaData.sessions?.length) throw new Error("No tests found");

      const latest = dnaData.sessions[0];
      const config = EXAM_CONFIGS[currentExamKey] || EXAM_CONFIGS["upsc"];
      const scorePct = latest.score || 0;
      const marks = (scorePct / 100) * config.max_marks;
      const rank = Math.round(config.total_candidates * (1 - scorePct / 100) * 0.7);

      const aiRes = await apiFetch(`/api/predict-rank/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam: target, marks, percentage: scorePct, estimatedRank: rank }),
      });
      const aiData = await aiRes.json();
      setPrediction({ ...aiData, exam_name: config.name, marks, rank, scorePct });
    } catch (err) {
      setError("Please complete a mock test first to see your predicted rank!");
    }
    setLoading(false);
  };

  if (loading) return <AppShell activePath="/rank-predictor"><div className="p-20 text-center animate-pulse">Calculating rank...</div></AppShell>;

  return (
    <AppShell activePath="/rank-predictor">
      <div className="p-6 lg:p-12 max-w-5xl mx-auto space-y-12">
        <div className="flex justify-between items-end pb-8 border-b border-[var(--border)]">
          <div>
            <h1 className="text-4xl font-black mb-2">Rank Projection</h1>
            <p className="text-[var(--text-muted)]">Based on your recent {prediction?.exam_name} session</p>
          </div>
          <button onClick={fetchLatestMockAndPredict} className="btn-primary flex items-center gap-2">
            <Activity size={16} /> Recalculate
          </button>
        </div>

        {error ? (
          <div className="card-simple p-20 text-center flex flex-col items-center">
            <AlertTriangle className="text-yellow-500 mb-6" size={48} />
            <p className="text-[var(--text-muted)] mb-8">{error}</p>
            <button onClick={() => window.location.href='/mock-test'} className="btn-primary">Attempt Simulation</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="card-simple p-10 bg-[var(--surface-hover)]">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Estimated AIR</p>
                <h2 className="text-7xl font-black mb-8">#{prediction.rank?.toLocaleString()}</h2>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Score</p>
                    <p className="text-xl font-bold">{Math.round(prediction.marks)}</p>
                  </div>
                  <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Accuracy</p>
                    <p className="text-xl font-bold">{prediction.scorePct}%</p>
                  </div>
                  <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Verdict</p>
                    <p className="text-xl font-bold text-[var(--accent)]">{prediction.verdict}</p>
                  </div>
                </div>

                <div className="p-6 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                  <h4 className="text-xs font-bold uppercase mb-3 flex items-center gap-2"><Zap size={14} className="text-[var(--accent)]" /> AI Insight</h4>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{prediction.analysis}</p>
                </div>
              </div>

              <div className="card-simple space-y-6">
                <h3 className="text-lg font-bold">Actionable Strategy</h3>
                <ul className="space-y-4">
                  {prediction.suggestions?.map((s, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <span className="w-5 h-5 rounded bg-[var(--surface-hover)] text-[var(--text-muted)] flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">{i+1}</span>
                      <p className="text-sm font-medium">{s}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
               <div className="card-simple bg-[var(--accent)] text-black border-none">
                  <Trophy size={32} className="mb-4" />
                  <h3 className="text-xl font-black mb-2">Next Steps</h3>
                  <p className="text-sm font-bold opacity-80 mb-6">{prediction.next_steps}</p>
                  <button onClick={() => window.location.href='/study-plan'} className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm">Update Roadmap</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}