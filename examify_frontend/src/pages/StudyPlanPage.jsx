import React, { useState, useEffect } from "react";
import { Calendar, Star, Lock, Play, FileText, CheckCircle, Flag } from "lucide-react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";

export default function StudyPlanPage() {
  const { apiFetch } = useApiClient();
  const [persona, setPersona] = useState(null); // 'scholar' or 'dropout'
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
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!persona && !plan) {
    return (
      <AppShell activePath="/study-plan">
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full text-center">
            <h1 className="text-5xl font-black mb-4 tracking-tight">Personalize Your Path</h1>
            <p className="text-gray-400 text-lg mb-12">Are you a focused scholar or a comeback dropout? We'll tailor the map for you.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button 
                onClick={() => generatePlan('scholar')}
                className="bg-gray-950 border border-gray-900 p-10 rounded-[2.5rem] hover:border-yellow-500/50 transition-all group"
              >
                <Star size={48} className="text-yellow-500 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-2">The Scholar</h3>
                <p className="text-gray-500 text-sm">Consistent, structured, and deep-dive learning path.</p>
              </button>

              <button 
                onClick={() => generatePlan('dropout')}
                className="bg-gray-950 border border-gray-900 p-10 rounded-[2.5rem] hover:border-red-500/50 transition-all group"
              >
                <Flag size={48} className="text-red-500 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-2">The Dropout</h3>
                <p className="text-gray-500 text-sm">High-intensity, recovery-focused, comeback strategy.</p>
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell activePath="/study-plan">
        <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold text-white">Carving Your Roadmap...</h2>
          <p className="text-gray-500 mt-2">Placing milestones for your {persona} journey.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activePath="/study-plan">
      <div className="min-h-screen bg-[var(--bg)] p-6 lg:p-12 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <p className="text-yellow-500 font-black text-xs uppercase tracking-[0.2em] mb-2">Personalized Roadmap</p>
              <h1 className="text-5xl font-black text-white tracking-tight">{plan?.estimated_exam} Strategy</h1>
            </div>
            <div className="text-right">
              <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                persona === 'scholar' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
              }`}>
                Mode: {persona}
              </span>
            </div>
          </div>

          {/* Candy Crush Vertical Map */}
          <div className="relative flex flex-col items-center">
             {/* Path Line */}
            <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500/50 via-gray-800 to-transparent z-0"></div>

            <div className="space-y-24 w-full relative z-10">
              {plan?.nodes?.map((node, i) => (
                <div key={node.id} className={`flex items-center w-full ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* The Node Bubble */}
                  <div className="w-1/2 flex justify-center">
                    <div className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-2xl transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                      i === 0 ? 'bg-yellow-500 border-white text-black animate-pulse' : 'bg-gray-900 border-gray-800 text-gray-500'
                    }`}>
                      {node.type === 'video' ? <Play size={32} /> : node.type === 'quiz' ? <Star size={32} /> : <FileText size={32} />}
                      
                      {/* Flag - Dark/Gold/Silver */}
                      <div className={`absolute -top-4 -right-4 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transform rotate-12 border-2 ${
                        node.flag === 'dark' ? 'bg-black border-gray-800 text-gray-400' :
                        node.flag === 'gold' ? 'bg-yellow-500 border-yellow-300 text-black' : 'bg-gray-400 border-gray-200 text-black'
                      }`}>
                        <Flag size={20} fill="currentColor" />
                      </div>

                      {/* Connector Line to Label */}
                      <div className={`absolute top-1/2 w-12 h-0.5 bg-gray-800 -z-10 ${i % 2 === 0 ? 'left-full' : 'right-full'}`}></div>
                    </div>
                  </div>

                  {/* Node Description Label */}
                  <div className={`w-1/2 ${i % 2 === 0 ? 'pl-12' : 'pr-12 text-right'}`}>
                    <div className="bg-gray-950 border border-gray-900 p-6 rounded-[2rem] shadow-xl inline-block max-w-sm">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">{node.subject}</p>
                      <h4 className="text-lg font-bold text-white mb-2">{node.label}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{node.description}</p>
                      
                      <div className="mt-4 flex items-center gap-2">
                        {i === 0 ? (
                          <button className="bg-yellow-500 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Start Mission</button>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-700 text-[10px] font-black uppercase">
                            <Lock size={12} /> Locked
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-32 pb-20 text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
                <CheckCircle className="text-gray-700" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-600 tracking-tight">End of Strategy</h3>
              <p className="text-gray-700 text-sm mt-2">More levels unlock as you complete current missions.</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}