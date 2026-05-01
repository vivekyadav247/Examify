import React, { useState, useEffect } from "react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Dna, Shield, Zap, Clock, Search, AlertCircle } from "lucide-react";

const DNA_METRICS = {
  conceptual: { label: "Conceptual", icon: <Shield size={18} />, color: "text-blue-400" },
  silly: { label: "Precision", icon: <Zap size={18} />, color: "text-yellow-400" },
  time: { label: "Pressure", icon: <Clock size={18} />, color: "text-red-400" },
  recall: { label: "Retrieval", icon: <Search size={18} />, color: "text-purple-400" },
};

export default function DNAReportPage() {
  const { apiFetch } = useApiClient();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDNA() {
      try {
        const res = await apiFetch("/api/analytics/dna-full/");
        if (res.ok) setData(await res.json());
      } catch (e) {}
      setLoading(false);
    }
    loadDNA();
  }, [apiFetch]);

  if (loading) return <AppShell activePath="/dna-report"><div className="p-20 text-center animate-pulse">Sequencing DNA...</div></AppShell>;

  const radarData = data ? Object.entries(data.overall_dna).map(([key, value]) => ({
    subject: DNA_METRICS[key]?.label || key,
    value: value,
    fullMark: 100,
  })) : [];

  return (
    <AppShell activePath="/dna-report">
      <div className="p-4 lg:p-8 w-full mx-auto">
        <div className="flex justify-between items-end pb-6 border-b border-[var(--border)] mb-10">
          <div>
            <h1 className="text-3xl font-black mb-1 flex items-center gap-3"><Dna className="text-yellow-500" size={28} /> Failure DNA Analysis</h1>
            <p className="text-[var(--text-muted)] text-sm">Clear breakdown of your exam behavior</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card-simple">
             <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-[var(--text-muted)]">Subject Weakness Graph</h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                    <Radar name="Accuracy" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="card-simple bg-[var(--surface-hover)] border-2 border-[var(--accent)] flex flex-col justify-center p-8">
             <h3 className="text-xl font-black mb-4">The Verdict</h3>
             <p className="text-base font-medium leading-relaxed mb-6">"{data?.simple_report?.headline || "Start taking more mock tests to see a detailed behavioral analysis."}"</p>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[var(--bg)] rounded-lg">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Strongest</p>
                  <p className="text-sm font-bold">{data?.strongest_topic || "-"}</p>
                </div>
                <div className="p-3 bg-[var(--bg)] rounded-lg">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Weakest</p>
                  <p className="text-sm font-bold text-red-500">{data?.weakest_topic || "-"}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="card-simple mb-8">
           <h3 className="text-sm font-bold mb-6 uppercase tracking-widest text-[var(--text-muted)]">Metric Table</h3>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-[10px] uppercase tracking-widest">
                    <th className="pb-4 font-bold">Metric</th>
                    <th className="pb-4 font-bold text-center">Score %</th>
                    <th className="pb-4 font-bold">What it means</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {Object.entries(DNA_METRICS).map(([key, meta]) => (
                    <tr key={key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-4 flex items-center gap-3 font-bold">{meta.icon} {meta.label}</td>
                      <td className="py-4 text-center font-black text-[var(--accent)]">{data?.overall_dna?.[key] || 0}%</td>
                      <td className="py-4 text-[var(--text-muted)] text-xs">
                        {key === 'conceptual' ? 'Depth of understanding' : key === 'silly' ? 'Calculation accuracy' : key === 'time' ? 'Speed vs Accuracy' : 'Memory recall'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>

        <div className="card-simple">
          <h3 className="text-sm font-bold mb-6 uppercase tracking-widest text-[var(--text-muted)]">Previous Sessions</h3>
          <div className="space-y-3">
             {data?.sessions?.map((s, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-[var(--surface-hover)] rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[var(--bg)] rounded-lg flex items-center justify-center font-bold text-[var(--accent)]">{s.score}%</div>
                    <div>
                      <p className="text-sm font-bold">{s.exam || "Mock Test"}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{s.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(s.dna || {}).map(([dk, dv]) => (
                      <span key={dk} className="px-2 py-0.5 bg-[var(--bg)] rounded text-[8px] font-bold text-[var(--text-muted)] uppercase">{dk}: {dv}%</span>
                    ))}
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}