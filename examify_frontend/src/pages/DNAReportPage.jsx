import React, { useState, useEffect } from "react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip 
} from "recharts";
import { Dna, Shield, Zap, Clock, Search, AlertCircle } from "lucide-react";

const DNA_METRICS = {
  conceptual: { label: "Conceptual Foundation", icon: <Shield size={20} />, color: "text-blue-400", desc: "Understanding of core theories and logic." },
  silly: { label: "Execution Precision", icon: <Zap size={20} />, color: "text-yellow-400", desc: "Avoidance of minor mistakes and calculation errors." },
  time: { label: "Pressure Management", icon: <Clock size={20} />, color: "text-red-400", desc: "Performance efficiency under strict time constraints." },
  recall: { label: "Information Retrieval", icon: <Search size={20} />, color: "text-purple-400", desc: "Ability to remember specific facts and formulas." },
};

export default function DNAReportPage() {
  const { apiFetch } = useApiClient();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDNA() {
      setLoading(true);
      try {
        const res = await apiFetch("/api/analytics/dna-full/");
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    loadDNA();
  }, [apiFetch]);

  if (loading) {
    return (
      <AppShell activePath="/dna-report">
        <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-black text-white">Sequencing Your DNA...</h2>
        </div>
      </AppShell>
    );
  }

  const radarData = data ? Object.entries(data.overall_dna).map(([key, value]) => ({
    subject: DNA_METRICS[key]?.label || key,
    value: value,
    fullMark: 100,
  })) : [];

  return (
    <AppShell activePath="/dna-report">
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 lg:p-12 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-black mb-3 tracking-tight flex items-center gap-4">
              <Dna className="text-yellow-500" size={48} /> Failure DNA Report
            </h1>
            <p className="text-gray-400 font-medium text-lg">AI Diagnostic of your exam-taking behavior</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Radar Analysis */}
            <div className="lg:col-span-2 bg-gray-950 border border-gray-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
               <h3 className="text-xl font-bold text-white mb-8">Performance Blueprint</h3>
               <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#1f2937" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 10, fontWeight: "bold" }} />
                    <Radar
                      name="Accuracy"
                      dataKey="value"
                      stroke="#eab308"
                      fill="#eab308"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
               </div>
            </div>

            {/* Diagnostic Summary */}
            <div className="bg-yellow-500 text-black rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(234,179,8,0.2)] flex flex-col">
              <h3 className="text-2xl font-black mb-6">Expert Verdict</h3>
              <div className="bg-black/10 rounded-2xl p-6 mb-8 border border-black/5">
                <p className="text-sm font-bold leading-relaxed">
                  {data?.simple_report?.headline || "Your performance shows high conceptual strength but needs better time management."}
                </p>
              </div>
              
              <div className="space-y-6 flex-1">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Primary Weakness</p>
                  <p className="font-bold text-lg">{data?.simple_report?.weakness || "Time Pressure"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Critical Action Item</p>
                  <p className="font-bold text-lg">{data?.simple_report?.action || "Attempt 10 timed quizzes this week."}</p>
                </div>
              </div>

              <button 
                onClick={() => window.location.href='/ai-chat'}
                className="w-full py-4 bg-black text-white font-black rounded-2xl mt-8 transition-transform hover:scale-105"
              >
                Discuss with Mentor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Object.entries(DNA_METRICS).map(([key, meta]) => (
              <div key={key} className="bg-gray-950 border border-gray-900 rounded-[2rem] p-8 shadow-xl">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gray-900 border border-gray-800 ${meta.color}`}>
                  {meta.icon}
                </div>
                <h4 className="text-white font-bold mb-2">{meta.label}</h4>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-black text-white">{data?.overall_dna?.[key] || 0}%</span>
                  <span className="text-gray-600 text-xs font-bold uppercase mb-1">Impact</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{meta.desc}</p>
              </div>
            ))}
          </div>

          {/* Session History */}
          <div className="bg-gray-950 border border-gray-900 rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-8">Clinical Session History</h3>
            <div className="space-y-4">
              {data?.sessions?.map((session, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-gray-600 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center font-black text-yellow-500 border border-gray-800">
                      {session.score}%
                    </div>
                    <div>
                      <p className="text-white font-bold">{session.exam || "Mock Test"}</p>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{session.date}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex gap-2">
                    {Object.entries(session.dna || {}).map(([key, val]) => (
                      <div key={key} className="px-3 py-1 bg-gray-800 rounded-lg text-[10px] font-black text-gray-400 uppercase">
                        {key}: {val}%
                      </div>
                    ))}
                  </div>
                  <button className="text-xs font-black text-yellow-500 hover:text-yellow-400 uppercase tracking-widest">
                    Details
                  </button>
                </div>
              ))}
              {(!data?.sessions || data.sessions.length === 0) && (
                 <div className="text-center py-20 bg-gray-900/20 rounded-[2rem] border border-dashed border-gray-800">
                    <AlertCircle size={48} className="text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No sequence data available yet</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}