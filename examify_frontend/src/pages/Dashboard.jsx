import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";
import { Zap, Clock, Trophy, Target, TrendingUp, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const { apiFetch } = useApiClient();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const r = await apiFetch("/api/analytics/dashboard/");
        if (r.ok) setData(await r.json());
        else setError("Failed to load dashboard.");
      } catch {
        setError("Network error.");
      }
    }
    load();
  }, [apiFetch]);

  if (error) return <AppShell activePath="/dashboard"><div className="p-12 text-center text-red-500">{error}</div></AppShell>;
  if (!data) return <AppShell activePath="/dashboard"><div className="p-12 text-center text-[var(--text-muted)] animate-pulse">Loading analysis...</div></AppShell>;

  return (
    <AppShell activePath="/dashboard">
      <div className="p-4 lg:p-8 w-full mx-auto space-y-8">
        
        {/* Simple Header */}
        <div className="flex justify-between items-end pb-8 border-b border-[var(--border)]">
          <div>
            <h1 className="text-4xl font-black mb-2">{data.exam_target || "Exam Dashboard"}</h1>
            <p className="text-[var(--text-muted)]">Targeting {data.estimated_exam_month || "Next Cycle"}</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => window.location.href='/mock-test'} className="btn-primary">New Mock Test</button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-simple">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">Readiness</p>
            <p className="text-3xl font-black text-[var(--accent)]">{data.readiness_pct || 0}%</p>
          </div>
          <div className="card-simple">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">Streak</p>
            <p className="text-3xl font-black">{data.streak || 0} Days</p>
          </div>
          <div className="card-simple">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">XP Rank</p>
            <p className="text-3xl font-black">Lv.{data.level || 1}</p>
          </div>
          <div className="card-simple">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">Credits</p>
            <p className="text-3xl font-black">{data.credits_remaining || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Progress Chart */}
          <div className="lg:col-span-2 card-simple h-80">
            <h3 className="text-sm font-bold mb-6">Accuracy Trend</h3>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={data.accuracy_7d || []}>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--accent)' }}
                />
                <Line type="monotone" dataKey="accuracy_pct" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weak Topics */}
          <div className="card-simple">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">Weak Topics</h3>
              <TrendingUp size={16} className="text-red-500" />
            </div>
            <div className="space-y-4">
              {(data.weak_topics || []).slice(0, 5).map((t, i) => (
                <div key={i} className="flex justify-between items-center pb-2 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="text-xs font-bold">{t.topic}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{t.subject}</p>
                  </div>
                  <span className="text-[10px] font-black text-red-400">{(t.ability_score * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Recent Activity */}
        <div className="card-simple">
          <h3 className="text-sm font-bold mb-6">Recent Sessions</h3>
          <div className="space-y-2">
            {(data.recent_sessions || []).slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[var(--surface-hover)] rounded-xl">
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs ${s.score_pct > 70 ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                     {Math.round(s.score_pct)}%
                   </div>
                   <div>
                     <p className="text-xs font-bold">{s.session_type || "Mock Test"}</p>
                     <p className="text-[10px] text-[var(--text-muted)]">{new Date(s.started_at).toLocaleDateString()}</p>
                   </div>
                </div>
                <button className="p-2 hover:bg-[var(--bg)] rounded-lg transition-all">
                  <ChevronRight size={16} className="text-[var(--text-muted)]" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
