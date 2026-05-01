import React, { useState, useEffect } from "react";
import { Star, Lock, Play, FileText, CheckCircle, Flag, Zap, Trophy, ChevronRight } from "lucide-react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";

export default function StudyPlanPage() {
  const { apiFetch } = useApiClient();
  const [persona, setPersona] = useState(null); 
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userExam, setUserExam] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await apiFetch("/api/users/me/");
        if (res.ok) {
          const data = await res.json();
          setUserExam(data.exam_target || "UPSC_CSE");
        }
      } catch (e) {}
    }
    loadUser();
  }, [apiFetch]);

  const generatePlan = async (type) => {
    setPersona(type);
    setLoading(true);
    try {
      const res = await apiFetch(`/api/plan/generate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam: userExam, persona: type }),
      });
      const data = await res.json();
      setPlan(data);
    } catch (e) {}
    setLoading(false);
  };

  if (!persona && !plan) {
    return (
      <AppShell activePath="/study-plan">
        <div className="p-6 lg:p-12 max-w-4xl mx-auto flex flex-col justify-center min-h-[80vh]">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black mb-4">Choose Your Path</h1>
            <p className="text-[var(--text-muted)] text-lg">AI-tailored curriculum for {userExam}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={() => generatePlan('scholar')} className="card-simple p-10 text-center hover:scale-105">
              <Star size={40} className="text-yellow-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">The Scholar</h3>
              <p className="text-sm text-[var(--text-muted)]">Consistent, deep-dive conceptual mastery.</p>
            </button>
            <button onClick={() => generatePlan('dropout')} className="card-simple p-10 text-center hover:scale-105">
              <Flag size={40} className="text-red-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">The Dropout</h3>
              <p className="text-sm text-[var(--text-muted)]">High-intensity recovery and comeback logic.</p>
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell activePath="/study-plan">
        <div className="p-6 lg:p-12 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="w-12 h-12 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">Building Roadmap...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activePath="/study-plan">
      <div className="p-4 lg:p-8 w-full mx-auto">
        <div className="flex justify-between items-end mb-16 pb-8 border-b border-[var(--border)]">
          <div>
            <p className="text-[var(--accent)] font-bold text-xs uppercase tracking-widest mb-1">Strategic Path</p>
            <h1 className="text-4xl font-black">{plan?.estimated_exam} Objective</h1>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold px-3 py-1 bg-[var(--surface-hover)] rounded-lg text-[var(--text-muted)] uppercase tracking-widest">{persona} Mode</span>
          </div>
        </div>

        <div className="relative max-w-2xl mx-auto py-10">
          {/* SVG Path */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
            <path
              d={plan?.nodes?.reduce((acc, _, i) => {
                const x = i % 2 === 0 ? "20%" : "80%";
                const y = (i * 180) + 90;
                return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
              }, "")}
              stroke="var(--accent)"
              strokeWidth="8"
              fill="none"
              strokeDasharray="16 12"
            />
          </svg>

          <div className="space-y-12">
            {plan?.nodes?.map((node, i) => {
              const isRight = i % 2 !== 0;
              const flagColor = {
                'dark': '#1a1a1a',
                'gold': '#fbbf24',
                'silver': '#94a3b8'
              }[node.flag] || 'var(--accent)';

              return (
                <div key={node.id} className={`flex ${isRight ? 'flex-row-reverse' : 'flex-row'} items-center gap-4 relative z-10`}>
                  {/* The Level Node */}
                  <div className="relative">
                    <button 
                      className={`w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-xl border-4 transition-all hover:scale-110 active:scale-95 ${
                        i === 0 ? "bg-[var(--accent)] border-white animate-bounce" : "bg-[var(--surface-2)] border-[var(--border)]"
                      }`}
                    >
                      <Flag size={24} style={{ color: flagColor }} fill={flagColor} />
                      <span className={`text-[10px] font-black mt-1 ${i === 0 ? 'text-black' : 'text-[var(--text-muted)]'}`}>
                        {i + 1}
                      </span>
                    </button>
                    {i === 0 && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                        START HERE!
                      </div>
                    )}
                  </div>

                  {/* Task Info Card */}
                  <div className={`flex-1 ${isRight ? 'text-right' : 'text-left'}`}>
                    <div className="card-simple p-4 inline-block max-w-[280px]">
                      <h4 className="text-sm font-black mb-1 flex items-center gap-2 justify-between">
                         {!isRight && <span className="text-[10px] text-[var(--text-muted)]">LVL {i+1}</span>}
                         {node.label}
                         {isRight && <span className="text-[10px] text-[var(--text-muted)]">LVL {i+1}</span>}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        {node.description}
                      </p>
                      {i === 0 && (
                         <button className="mt-3 w-full bg-[var(--accent)] text-black font-bold py-2 rounded-xl text-[10px] uppercase">
                           Start Lesson
                         </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-20 text-center">
             <Trophy size={48} className="mx-auto text-yellow-500 mb-4" />
             <h3 className="text-2xl font-black">THE {userExam} SUMMIT</h3>
             <p className="text-sm text-[var(--text-muted)]">Complete all 25 levels to master the syllabus.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}