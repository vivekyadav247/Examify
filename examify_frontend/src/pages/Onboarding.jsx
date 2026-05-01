import React, { useEffect, useMemo, useState } from "react";
import { useApiClient } from "../lib/useApiClient";
import { useTheme } from "../lib/ThemeContext";

const EXAMS = [
  { key: "JEE_Mains", name: "JEE Mains", desc: "Engineering entrance" },
  { key: "JEE_Advanced", name: "JEE Advanced", desc: "IIT entrance" },
  {
    key: "NEET",
    name: "NEET",
    desc: "Medical entrance, 4 subjects, 180 marks",
  },
  { key: "UPSC_CSE", name: "UPSC CSE", desc: "Civil services" },
  { key: "CAT", name: "CAT", desc: "MBA entrance" },
  { key: "GATE", name: "GATE", desc: "PG engineering" },
  { key: "GRE", name: "GRE", desc: "Graduate studies" },
  { key: "GMAT", name: "GMAT", desc: "Business school" },
  { key: "SAT", name: "SAT", desc: "Undergraduate" },
  { key: "LSAT", name: "LSAT", desc: "Law school" },
  { key: "MCAT", name: "MCAT", desc: "Medical school" },
  { key: "SSC_CGL", name: "SSC CGL", desc: "Staff selection" },
  { key: "NDA", name: "NDA", desc: "Defence services" },
  { key: "CLAT", name: "CLAT", desc: "Law entrance" },
  { key: "CUET", name: "CUET", desc: "Central universities" },
  {
    key: "CA_Foundation",
    name: "CA Foundation",
    desc: "Chartered accountancy",
  },
  { key: "CFA_L1", name: "CFA Level 1", desc: "Finance" },
  { key: "IELTS", name: "IELTS", desc: "English proficiency" },
  { key: "TOEFL", name: "TOEFL", desc: "English proficiency" },
  { key: "ACCA", name: "ACCA", desc: "Accounting" },
];

// Must match backend engines/topic_graph.py EXAM_SUBJECTS exactly
const SUBJECTS = {
  JEE_Mains: ["Physics", "Chemistry", "Mathematics"],
  JEE_Advanced: ["Physics", "Chemistry", "Mathematics"],
  NEET: ["Physics", "Chemistry", "Botany", "Zoology"], // 4 subjects, 180 marks
  UPSC_CSE: [
    "General Studies 1",
    "General Studies 2",
    "General Studies 3",
    "General Studies 4",
    "CSAT",
  ],
  CAT: ["Verbal Ability", "DILR", "Quantitative Ability"],
  GATE: ["Engineering Mathematics", "Core CS"],
  GRE: ["Verbal Reasoning", "Quantitative Reasoning", "Analytical Writing"],
  GMAT: [
    "Quantitative",
    "Verbal",
    "Integrated Reasoning",
    "Analytical Writing",
  ],
  SAT: ["Reading", "Writing and Language", "Math"],
  SSC_CGL: [
    "General Intelligence",
    "Quantitative Aptitude",
    "English Comprehension",
    "General Awareness",
  ],
  NDA: ["Mathematics", "General Ability Test"],
};

const LANGUAGES = [
  { key: "english", name: "English Medium" },
  { key: "hindi", name: "Hindi Medium" },
  { key: "hinglish", name: "Hinglish Mix" },
];

const PLANS = [
  {
    key: "free",
    title: "Free",
    sub: "Try the core loop",
    pts: [
      "3 quizzes total",
      "7-day access",
      "Content upload + basic analytics",
    ],
  },
  {
    key: "pro",
    title: "Pro",
    sub: "The daily driver",
    pts: ["150 quizzes/month", "5 quizzes/day", "Failure DNA + leaderboard"],
  },
  {
    key: "premium",
    title: "Premium",
    sub: "Serious aspirants",
    pts: ["Unlimited quizzes", "6 quizzes/day", "Diagnostic + full topic map"],
  },
];

async function ensureOk(r, f) {
  if (r.ok) return r;
  try {
    const p = await r.json();
    throw new Error(p?.detail || p?.message || f);
  } catch {
    throw new Error(f);
  }
}

export default function Onboarding() {
  const { apiFetch, isLoaded, isSignedIn } = useApiClient();
  const { dark, toggle } = useTheme();
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedExam, setSelectedExam] = useState(null);
  const [weakSubjects, setWeakSubjects] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("hinglish");
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let a = true;
    (async () => {
      try {
        const r = await apiFetch("/api/users/me/");
        const p = r.ok ? await r.json() : null;
        if (!a) return;
        if (p?.onboarding_completed) {
          window.location.href = "/dashboard";
          return;
        }
      } catch {
      } finally {
        if (a) setCheckingUser(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [apiFetch, isLoaded, isSignedIn]);

  const filteredExams = useMemo(() => {
    const q = search.trim().toLowerCase();
    return !q
      ? EXAMS
      : EXAMS.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.desc.toLowerCase().includes(q),
        );
  }, [search]);

  const subjects = selectedExam ? SUBJECTS[selectedExam.key] || [] : [];
  const toggleSub = (s) =>
    setWeakSubjects((p) =>
      p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
    );

  const complete = async () => {
    if (!selectedExam) {
      setError("Choose an exam target.");
      setStep(0);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await ensureOk(
        await apiFetch("/api/analytics/set-exam/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exam_target: selectedExam.key,
            weak_subjects: weakSubjects,
          }),
        }),
        "Could not save exam target.",
      );
      if (selectedPlan !== "free") {
        await ensureOk(
          await apiFetch("/api/plans/activate/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              plan: selectedPlan,
              duration_months: 1,
              payment_id: `mock_${selectedPlan}_${Date.now()}`,
            }),
          }),
          "Could not activate plan.",
        );
      }
      await ensureOk(
        await apiFetch("/api/users/me/update/", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exam_target: selectedExam.key,
            language: selectedLanguage,
            onboarding_completed: true,
          }),
        }),
        "Could not finalize setup.",
      );
      if (selectedPlan === "premium") {
        window.location.href = "/quiz?session_type=diagnostic";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (e) {
      setError(e?.message || "Unable to complete onboarding.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingUser || !isLoaded)
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
      >
        Loading setup...
      </div>
    );

  const accentText = dark ? "#111" : "#fff";

  return (
    <div style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-md font-display text-lg"
            style={{ backgroundColor: "var(--accent)", color: accentText }}
          >
            E
          </span>
          <div>
            <p className="font-display text-xl">EXAMIFY</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Setup
            </p>
          </div>
        </div>
        <button
          onClick={toggle}
          className="rounded-full border px-3 py-1 text-xs"
          style={{ borderColor: "var(--border)" }}
        >
          {dark ? "Light" : "Dark"}
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-14 md:px-8">
        <div className="mb-8 flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((d) => (
            <span
              key={d}
              className="h-2.5 flex-1 rounded-full transition-colors"
              style={{
                backgroundColor: d <= step ? "var(--accent)" : "var(--border)",
                opacity: d <= step ? 1 : 0.45,
              }}
            />
          ))}
        </div>

        {error && (
          <div
            className="mb-4 rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: "var(--accent-2)", color: "var(--accent-2)" }}
          >
            {error}
          </div>
        )}

        {/* Step 0: Exam */}
        {step === 0 && (
          <section className="anim-pop-in">
            <h1 className="font-display text-3xl md:text-5xl">
              What Are You Preparing For?
            </h1>
            <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
              Pick your exam. This customizes your topic graph and quiz
              difficulty.
            </p>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exam..."
              className="mt-6 w-full rounded-2xl border px-4 py-3 outline-none"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
              }}
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredExams.map((e) => {
                const active = selectedExam?.key === e.key;
                return (
                  <button
                    key={e.key}
                    onClick={() => setSelectedExam(e)}
                    className="rounded-2xl border p-4 text-left transition"
                    style={{
                      borderColor: active ? "var(--accent)" : "var(--border)",
                      backgroundColor: active
                        ? "var(--surface-2)"
                        : "var(--surface)",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-display text-lg">{e.name}</p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {e.desc}
                        </p>
                      </div>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {e.key}
                      </span>
                    </div>
                    {active && (
                      <p
                        className="mt-2 text-xs"
                        style={{ color: "var(--accent)" }}
                      >
                        Selected
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                disabled={!selectedExam}
                onClick={() => setStep(1)}
                className="rounded-full px-6 py-3 font-semibold disabled:opacity-40"
                style={{ backgroundColor: "var(--accent)", color: accentText }}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* Step 1: Weak Subjects */}
        {step === 1 && (
          <section className="anim-pop-in">
            <h2 className="font-display text-3xl md:text-4xl">
              What Subjects Feel Weakest?
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Optional. We start these at lower ability for better targeting.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {subjects.map((s) => {
                const active = weakSubjects.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSub(s)}
                    className="rounded-xl border px-4 py-3 text-left transition"
                    style={{
                      borderColor: active ? "var(--accent)" : "var(--border)",
                      backgroundColor: active
                        ? "var(--surface-2)"
                        : "var(--surface)",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex flex-wrap justify-between gap-3">
              <button
                onClick={() => setStep(0)}
                className="rounded-full border px-5 py-2"
                style={{ borderColor: "var(--border)" }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="rounded-full px-5 py-2 font-semibold"
                style={{ backgroundColor: "var(--accent)", color: accentText }}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* Step 2: Language */}
        {step === 2 && (
          <section className="anim-pop-in">
            <h2 className="font-display text-3xl md:text-4xl">
              Preferred Medium?
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Choose the language for your notes and AI mentorship.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {LANGUAGES.map((l) => {
                const active = selectedLanguage === l.key;
                return (
                  <button
                    key={l.key}
                    onClick={() => setSelectedLanguage(l.key)}
                    className="rounded-xl border px-4 py-4 text-center transition"
                    style={{
                      borderColor: active ? "var(--accent)" : "var(--border)",
                      backgroundColor: active
                        ? "var(--surface-2)"
                        : "var(--surface)",
                    }}
                  >
                    <p className="font-bold">{l.name}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex flex-wrap justify-between gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-full border px-5 py-2"
                style={{ borderColor: "var(--border)" }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="rounded-full px-5 py-2 font-semibold"
                style={{ backgroundColor: "var(--accent)", color: accentText }}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Plan */}
        {step === 3 && (
          <section className="anim-pop-in">
            <h2 className="font-display text-3xl md:text-4xl">
              Choose Your Plan
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {PLANS.map((p) => {
                const active = selectedPlan === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setSelectedPlan(p.key)}
                    className="rounded-2xl border p-5 text-left transition"
                    style={{
                      borderColor: active ? "var(--accent)" : "var(--border)",
                      backgroundColor: active
                        ? "var(--surface-2)"
                        : "var(--surface)",
                    }}
                  >
                    <p className="font-display text-2xl">{p.title}</p>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {p.sub}
                    </p>
                    <ul
                      className="mt-4 space-y-1 text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {p.pts.map((pt) => (
                        <li key={pt}>• {pt}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex flex-wrap justify-between gap-3">
              <button
                onClick={() => setStep(2)}
                className="rounded-full border px-5 py-2"
                style={{ borderColor: "var(--border)" }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="rounded-full px-6 py-3 font-semibold"
                style={{ backgroundColor: "var(--accent)", color: accentText }}
              >
                {selectedPlan === "free"
                  ? "Continue with Free"
                  : `Continue with ${selectedPlan === "pro" ? "Pro" : "Premium"}`}
              </button>
            </div>
          </section>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <section className="anim-pop-in text-center">
            <div
              className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full text-sm font-semibold"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              Ready
            </div>
            <h2 className="font-display text-3xl md:text-5xl">You're Ready.</h2>
            <p className="mt-3 text-base">
              0 XP · Level 1 · {selectedExam?.name || "Exam"} · {selectedPlan}{" "}
              plan
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              {selectedPlan === "free"
                ? "Your 7-day trial starts now."
                : "Plan activation in progress."}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={() => complete()}
                disabled={loading}
                className="rounded-full px-8 py-3 font-semibold disabled:opacity-60"
                style={{ backgroundColor: "var(--accent)", color: accentText }}
              >
                {loading
                  ? "Setting up..."
                  : selectedPlan === "premium"
                    ? "Start mandatory diagnostic"
                    : "Go to dashboard"}
              </button>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {selectedPlan === "premium"
                  ? "Premium users must take an initial quiz before dashboard access."
                  : "You can start quizzes after selecting subject/topic/content."}
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
