import React, { useState, useEffect } from "react";
import { Calendar, Edit2, Frown, BarChart2, Activity, AlertTriangle, Bot, HelpCircle, Dna, Clock, Puzzle, Target, Brain } from "lucide-react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";



const DNA_LABELS = {
  conceptual: { label: "Conceptual", color: "#818cf8", icon: <Puzzle size={24} />, desc: "Wrong because of wrong concept" },
  silly: { label: "Silly Mistakes", color: "#f59e0b", icon: <Frown size={24} />, desc: "Knew it but made errors" },
  time: { label: "Time Pressure", color: "#34d399", icon: <Clock size={24} />, desc: "Ran out of time" },
  recall: { label: "Recall Failure", color: "#f87171", icon: <Brain size={24} />, desc: "Forgot the content" },
};

export default function DNAReportPage() {
  const { apiFetch } = useApiClient();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/analytics/dna-full/`);
      const data = await res.json();
      setReport(data);
      setSessions(data.sessions || []);
      if (data.sessions?.length > 0) setActiveSession(data.sessions[0].id);
    } catch {
      setReport({ error: "Could not load DNA report." });
    }
    setLoading(false);
  };

  if (loading) {
    return (
    <AppShell activePath={window.location.pathname}>
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Analyzing your failure DNA...</p>
        </div>
      </div>
    </AppShell>
    );
  }

  if (report?.error) {
    return (
      <AppShell activePath={window.location.pathname}>
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">{report.error}</p>
          <p className="text-gray-500 text-sm mt-2">Make sure backend is running and you have completed some quizzes.</p>
        </div>
      </div>
      </AppShell>
    );
  }

  const dnaData = report?.overall_dna || { conceptual: 35, silly: 25, time: 20, recall: 20 };
  const radarData = Object.entries(dnaData).map(([k, v]) => ({
    subject: DNA_LABELS[k]?.label || k,
    value: v,
  }));
  const barData = report?.topic_wise || [];

  return (
    <AppShell activePath={window.location.pathname}>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Dna className="text-[var(--accent)]" size={32} /> Failure DNA Report
          </h1>
          <p className="text-gray-400">Deep analysis of why you're losing marks</p>
        </div>

        {/* DNA Breakdown Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(dnaData).map(([key, value]) => {
            const meta = DNA_LABELS[key] || { label: key, color: "#6b7280", icon: <HelpCircle size={24} />, desc: "" };
            return (
              <div key={key} className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]" style={{color: meta.color}}>{meta.icon}</span>
                  <span className="text-sm font-semibold text-gray-300">{meta.label}</span>
                </div>
                <div className="text-4xl font-black" style={{ color: meta.color }}>{value}%</div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${value}%`, backgroundColor: meta.color }} />
                </div>
                <p className="text-xs text-gray-500 mt-2">{meta.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Radar Chart */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4">DNA Radar</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Radar name="DNA" dataKey="value" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-white mb-2">Overall Stats</h3>
            {[
              { label: "Total Sessions", value: report?.total_sessions || 0, icon: <Calendar size={16} /> },
              { label: "Questions Attempted", value: report?.total_questions || 0, icon: <Edit2 size={16} /> },
              { label: "Accuracy", value: `${report?.accuracy || 0}%`, icon: <Target size={16} /> },
              { label: "Avg Session Score", value: report?.avg_score || 0, icon: <BarChart2 size={16} /> },
              { label: "Strongest Topic", value: report?.strongest_topic || "–", icon: <Activity size={16} /> },
              { label: "Weakest Topic", value: report?.weakest_topic || "–", icon: <AlertTriangle size={16} /> },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-400 flex gap-2 items-center">
                  <span>{stat.icon}</span>{stat.label}
                </span>
                <span className="text-sm font-semibold text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topic-wise Bar */}
        {barData.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-8">
            <h3 className="font-semibold text-white mb-4">Topic-wise Accuracy</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ bottom: 20 }}>
                <XAxis dataKey="topic" tick={{ fill: "#9ca3af", fontSize: 10 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", color: "#fff" }} />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.accuracy >= 70 ? "#34d399" : entry.accuracy >= 40 ? "#f59e0b" : "#f87171"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* AI Recommendations */}
        {report?.recommendations && (
          <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-700 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Bot size={24} className="text-indigo-400" /> AI Recommendations
            </h3>
            <div className="space-y-3">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                  <p className="text-gray-200 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session History */}
        {sessions.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-white mb-4">Session History</h3>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center justify-between hover:border-indigo-500 transition-colors cursor-pointer"
                  onClick={() => setActiveSession(session.id === activeSession ? null : session.id)}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{session.subject} · {session.exam}</p>
                    <p className="text-xs text-gray-500">{session.date} · {session.questions} questions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-400">{session.score}%</p>
                    <div className="flex gap-1">
                      {Object.entries(session.dna || {}).slice(0, 3).map(([k, v]) => (
                        <span key={k} className="text-xs bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">
                          {DNA_LABELS[k]?.icon} {v}%
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </AppShell>
  );
}