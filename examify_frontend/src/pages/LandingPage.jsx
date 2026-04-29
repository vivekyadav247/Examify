import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useApiClient } from "../lib/useApiClient";
import { useTheme } from "../lib/ThemeContext";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

const monthlyPricing = { free: 0, pro: 299, premium: 599 };
const yearlyPricing = { free: 0, pro: 249, premium: 499 };

const testimonials = [
  {
    initials: "AK",
    name: "Ananya Kapoor",
    exam: "JEE Mains",
    quote: "Finally understood why I kept failing electrostatics.",
    before: "42% accuracy",
    after: "67% accuracy",
    gain: "+25% in 6 weeks",
    habit: "45 min plan",
  },
  {
    initials: "RM",
    name: "Rohan Menon",
    exam: "CAT",
    quote: "My daily plan stopped random studying and gave me direction.",
    before: "VARC 38%",
    after: "VARC 61%",
    gain: "+23% in 5 weeks",
    habit: "2 sprints/day",
  },
  {
    initials: "SF",
    name: "Sara Fatima",
    exam: "NEET",
    quote: "The mistake DNA was blunt and exactly what I needed.",
    before: "Mock rank 18,400",
    after: "Mock rank 9,200",
    gain: "9,200 ranks up",
    habit: "DNA review",
  },
];

const dnaCards = [
  {
    title: "Conceptual Gap",
    color: "var(--dna-conceptual)",
    pct: "38%",
    summary: "Core concept not understood. Requires foundational review.",
    details:
      "Pattern: slower wrong answers on foundational concepts. Fix: 2 concept rebuild sets + 1 untimed revision set.",
  },
  {
    title: "Silly Mistake",
    color: "var(--dna-silly)",
    pct: "27%",
    summary: "Knew it but rushed. Slow down.",
    details:
      "Pattern: quick wrong attempts on easy-medium questions. Fix: force a 5-second sanity pass before final submission.",
  },
  {
    title: "Time Pressure",
    color: "var(--dna-time)",
    pct: "21%",
    summary: "Ran out of time. Practice timed sets.",
    details:
      "Pattern: late-session accuracy crash. Fix: mixed timed sets with strict per-question cutoffs and skip discipline.",
  },
  {
    title: "Recall Failure",
    color: "var(--dna-recall)",
    pct: "14%",
    summary: "Knew it before. Memory faded. Needs re-review.",
    details:
      "Pattern: delayed attempts with near-miss options. Fix: spaced flash sessions + compressed formula sprint drills.",
  },
];

const howSteps = [
  {
    step: "01",
    title: "Baseline sprint",
    desc: "A short diagnostic plus exam target seeds your plan and topic map.",
    meta: ["Baseline score", "Weak topics tagged"],
  },
  {
    step: "02",
    title: "Daily plan blocks",
    desc: "We queue focused blocks and a review block from your weak areas.",
    meta: ["45 to 60 min/day", "Auto reminders"],
  },
  {
    step: "03",
    title: "Adaptive practice",
    desc: "Each quiz shifts difficulty and timing using IRT and your history.",
    meta: ["Smart batches", "Time pressure"],
  },
  {
    step: "04",
    title: "DNA review + unlocks",
    desc: "Failure DNA explains why you miss and unlocks the next node.",
    meta: ["Mistake pattern", "Map unlocks"],
  },
];

const topicNodes = [
  { x: 60, y: 70, stars: 3, status: "gold" },
  { x: 170, y: 50, stars: 2, status: "complete" },
  { x: 290, y: 70, stars: 1, status: "complete" },
  { x: 410, y: 90, stars: 0, status: "active" },
  { x: 520, y: 130, stars: 0, status: "locked" },
  { x: 470, y: 210, stars: 0, status: "locked" },
  { x: 340, y: 220, stars: 1, status: "locked" },
  { x: 210, y: 200, stars: 2, status: "complete" },
  { x: 100, y: 180, stars: 3, status: "gold" },
  { x: 80, y: 260, stars: 0, status: "locked" },
  { x: 200, y: 260, stars: 0, status: "locked" },
];
const topicNames = [
  "Units",
  "Kinematics",
  "Newton's Laws",
  "Work & Energy",
  "Rotation",
  "Gravitation",
  "Thermo",
  "Waves",
  "Electrostatics",
  "Electricity",
  "Magnetism",
];

function fmt(v) {
  return v === 0 ? "Free" : `₹${v}`;
}

function mapCurve(a, b) {
  const mx = (a.x + b.x) / 2;
  const bend = Math.max(14, Math.min(46, Math.abs(b.x - a.x) / 2));
  const my = (a.y + b.y) / 2 - bend;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useApiClient();
  const { dark, toggle } = useTheme();
  const [yearly, setYearly] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authModal, setAuthModal] = useState(null); // 'signin' | 'signup' | null
  const pricing = useMemo(
    () => (yearly ? yearlyPricing : monthlyPricing),
    [yearly],
  );
  const openSignIn = () => setAuthModal("signin");
  const openSignUp = () => setAuthModal("signup");

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });

    // Check URL for auth modal trigger
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    if (auth === "signin" || auth === "signup") {
      setAuthModal(auth);
      window.history.replaceState({}, "", "/");
    }

    return () => window.removeEventListener("scroll", h);
  }, []);

  if (isLoaded && isSignedIn) return <Navigate to="/app" replace />;

  const accentText = dark ? "#0d0d0f" : "#fff";

  return (
    <div style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      {/* ===== NAV ===== */}
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-xl transition-all"
        style={{
          borderColor: scrolled ? "var(--border)" : "transparent",
          backgroundColor: scrolled ? "var(--nav-bg)" : "transparent",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <button
            className="flex items-center gap-2"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-md font-display text-lg"
              style={{ backgroundColor: "var(--accent)", color: accentText }}
            >
              E
            </span>
            <span className="font-display text-xl tracking-wide">EXAMIFY</span>
          </button>
          <div
            className="hidden items-center gap-6 text-sm md:flex"
            style={{ color: "var(--text-muted)" }}
          >
            <a href="#features" className="transition hover:text-[var(--text)]">
              Features
            </a>
            <a href="#dna" className="transition hover:text-[var(--text)]">
              Failure DNA
            </a>
            <a href="#pricing" className="transition hover:text-[var(--text)]">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="rounded-full border px-3 py-1 text-xs font-medium transition"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              {dark ? "Light" : "Dark"}
            </button>
            <button
              onClick={openSignUp}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--accent)", color: accentText }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section
        className="hero-mesh border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div className="space-y-6 anim-fade-up">
            <p
              className="font-mono text-xs uppercase tracking-[0.25em]"
              style={{ color: "var(--accent-2)" }}
            >
              Study OS for competitive exams
            </p>
            <h1 className="font-display text-4xl leading-tight md:text-[3.4rem] md:leading-[1.1]">
              Your daily plan, adaptive quizzes,
              <br />
              and topic map in one study desk.
            </h1>
            <p
              className="max-w-xl text-lg leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              EXAMIFY builds your plan, tracks progress, and explains mistakes
              with Failure DNA for JEE, UPSC, CAT, GRE and 40+ exams.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={openSignUp}
                className="rounded-full px-6 py-3 font-semibold transition-transform hover:scale-105"
                style={{ backgroundColor: "var(--accent)", color: accentText }}
              >
                Start Free — 7 Days
              </button>
              <a
                href="#features"
                className="rounded-full border px-6 py-3 font-semibold transition hover:border-[var(--text-muted)]"
                style={{ borderColor: "var(--border)" }}
              >
                See How It Works
              </a>
            </div>
            <div
              className="flex flex-wrap gap-4 pt-2 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <span>10,000+ students</span>
              <span>·</span>
              <span>40+ exams</span>
              <span>·</span>
              <span>Failure DNA™</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Study Plan Mock */}
            <div
              className="rounded-3xl border p-5 shadow-2xl study-grid"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <span
                  className="rounded-full px-3 py-1 font-mono"
                  style={{
                    backgroundColor: "var(--surface-2)",
                    color: "var(--text-muted)",
                  }}
                >
                  Today Plan
                </span>
                <span
                  className="rounded-full px-3 py-1 font-mono"
                  style={{ backgroundColor: "var(--accent)", color: "#111" }}
                >
                  45 min
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  "Physics: Kinematics set",
                  "Math: Functions sprint",
                  "Chemistry: 20 min recap",
                ].map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--surface-2)",
                    }}
                  >
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        backgroundColor:
                          i === 0 ? "var(--dna-correct)" : "var(--bg)",
                        color: i === 0 ? "#111" : "var(--text-muted)",
                      }}
                    >
                      {i === 0 ? "OK" : "--"}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: "var(--surface-2)" }}
                >
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: "40%",
                      backgroundColor: "var(--accent)",
                    }}
                  />
                </div>
                <p
                  className="mt-2 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  2 of 5 tasks complete
                </p>
              </div>
            </div>

            {/* Quiz Mock */}
            <div
              className="anim-float rounded-3xl border p-5 shadow-2xl"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div className="mb-4 flex items-center justify-between text-xs">
                <span
                  className="rounded-full px-3 py-1 font-mono"
                  style={{
                    backgroundColor: "var(--surface-2)",
                    color: "var(--text-muted)",
                  }}
                >
                  Q 4 / 10
                </span>
                <span
                  className="anim-pulse rounded-full px-3 py-1 font-mono"
                  style={{ backgroundColor: "var(--accent-2)", color: "#111" }}
                >
                  00:18
                </span>
              </div>
              <p
                className="mb-2 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Topic: Kinematics
              </p>
              <h3 className="mb-5 text-lg leading-relaxed">
                A particle moves 20m in 4s and then 30m in 6s. Average velocity?
              </h3>
              <div className="space-y-2.5">
                {["3 m/s", "5 m/s", "8.3 m/s", "10 m/s"].map((opt, i) => (
                  <div
                    key={opt}
                    className="flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm"
                    style={{
                      borderColor:
                        i === 1 ? "var(--dna-correct)" : "var(--border)",
                      backgroundColor:
                        i === 1 ? "rgba(16,185,129,0.12)" : "var(--surface-2)",
                    }}
                  >
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: "var(--bg)" }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {i === 1 && (
                      <span
                        className="ml-auto text-xs"
                        style={{ color: "var(--dna-correct)" }}
                      >
                        Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-bold"
                  style={{ backgroundColor: "var(--dna-silly)", color: "#111" }}
                >
                  SILLY MISTAKE
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  You knew this - rushed it.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES / HOW IT WORKS ===== */}
      <section
        id="features"
        className="border-b"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--surface)",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <h2 className="font-display text-3xl md:text-4xl">How It Works</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                s: "01",
                t: "Set your exam and baseline",
                b: "Pick exam and weak subjects. We seed your topic map and plan.",
              },
              {
                s: "02",
                t: "Run focused practice sprints",
                b: "Adaptive quizzes shift difficulty using IRT and your last results.",
              },
              {
                s: "03",
                t: "Review with Failure DNA",
                b: "Turn mistakes into action steps across concepts, time, and recall.",
              },
            ].map((item) => (
              <div
                key={item.s}
                className="rounded-2xl border p-6 transition hover:border-[var(--text-muted)]"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface-2)",
                }}
              >
                <p
                  className="font-mono text-xs"
                  style={{ color: "var(--accent-2)" }}
                >
                  STEP {item.s}
                </p>
                <h3 className="mt-2 font-display text-xl">{item.t}</h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.b}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAILURE DNA ===== */}
      <section id="dna" className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <h2 className="font-display text-3xl md:text-4xl">Failure DNA™</h2>
        <p
          className="mt-3 max-w-2xl text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Every wrong answer is classified. Hover each card to see the action
          plan.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {dnaCards.map((card) => (
            <div
              key={card.title}
              className="group rounded-2xl border p-5 transition-all hover:shadow-lg"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <div className="mb-2 flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: card.color }}
                />
                <h3 className="font-display text-xl">{card.title}</h3>
                <span
                  className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-mono"
                  style={{
                    backgroundColor: "var(--surface-2)",
                    color: card.color,
                  }}
                >
                  {card.pct}
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {card.summary}
              </p>
              <div className="max-h-0 overflow-hidden pt-0 transition-all duration-500 group-hover:max-h-40 group-hover:pt-4">
                <p
                  className="rounded-xl p-3 text-sm leading-relaxed"
                  style={{
                    backgroundColor: "var(--surface-2)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {card.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TOPIC MAP PREVIEW ===== */}
      <section
        className="border-y"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--surface)",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-center">
            <div>
              <p
                className="text-xs uppercase tracking-[0.25em]"
                style={{ color: "var(--accent-2)" }}
              >
                Plan Engine
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">
                A plan tree that feels like a game map.
              </h2>
              <p
                className="mt-3 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Premium users unlock a guided topic path, daily targets, and
                adaptive map nodes that open as your accuracy improves.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    t: "Daily Targets",
                    b: "Auto-built from your weak areas.",
                  },
                  {
                    t: "Adaptive Unlocks",
                    b: "New topics open when you master prerequisites.",
                  },
                  {
                    t: "Topic Strength",
                    b: "Ring progress shows your accuracy in each node.",
                  },
                  {
                    t: "DNA Reminders",
                    b: "Every node tracks your most common mistake.",
                  },
                ].map((card) => (
                  <div
                    key={card.t}
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--surface-2)",
                    }}
                  >
                    <p className="text-sm font-semibold">{card.t}</p>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {card.b}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="overflow-x-auto rounded-3xl border p-6 plan-map-bg"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface-2)",
              }}
            >
              <svg width="620" height="300" viewBox="0 0 620 300">
                <defs>
                  <filter
                    id="previewShadow"
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="160%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="6"
                      stdDeviation="6"
                      floodColor="#000"
                      floodOpacity="0.3"
                    />
                  </filter>
                </defs>
                {topicNodes.map((n, i) => {
                  if (i === 0) return null;
                  const prev = topicNodes[i - 1];
                  return (
                    <path
                      key={`l${i}`}
                      d={mapCurve(prev, n)}
                      fill="none"
                      stroke="var(--plan-line-muted)"
                      strokeWidth="3"
                      strokeDasharray="12 8"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                  );
                })}
                {topicNodes.map((n, i) => {
                  const stars = Math.max(0, Math.min(3, n.stars || 0));
                  const isActive = n.status === "active";
                  const isLocked = n.status === "locked";
                  let fill = "var(--plan-node-locked)";
                  let stroke = "var(--plan-line-muted)";
                  if (n.status === "gold") {
                    fill = "var(--plan-node-complete)";
                    stroke = "#ffe47b";
                  } else if (n.status === "complete") {
                    fill = "var(--plan-node-complete)";
                    stroke = "var(--plan-node-complete)";
                  } else if (isActive) {
                    fill = "var(--plan-node-active)";
                    stroke = "var(--plan-node-active)";
                  }
                  return (
                    <g key={i}>
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r="26"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="2"
                        filter="url(#previewShadow)"
                        opacity={isLocked ? "0.7" : "1"}
                      />
                      {isActive && (
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r="14"
                          fill="var(--surface)"
                          opacity="0.5"
                        />
                      )}
                      {[0, 1, 2].map((idx) => (
                        <circle
                          key={`${i}-s-${idx}`}
                          cx={n.x + (idx - 1) * 10}
                          cy={n.y - 36}
                          r="3.5"
                          fill={
                            idx < stars
                              ? "var(--star-filled)"
                              : "var(--plan-node-locked)"
                          }
                          stroke="var(--plan-line-muted)"
                          strokeWidth="1"
                        />
                      ))}
                      {isLocked && (
                        <text
                          x={n.x}
                          y={n.y + 4}
                          textAnchor="middle"
                          fontSize="10"
                          fill="var(--text-muted)"
                        >
                          LOCKED
                        </text>
                      )}
                      <text
                        x={n.x}
                        y={n.y + 46}
                        textAnchor="middle"
                        fontSize="10"
                        fill="var(--text-muted)"
                      >
                        {`${stars}/3`}
                      </text>
                      <text
                        x={n.x}
                        y={n.y + 60}
                        textAnchor="middle"
                        fontSize="10"
                        fill="var(--text-muted)"
                      >
                        {topicNames[i]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-3xl md:text-4xl">
            Start free. Scale as you grow.
          </h2>
          <div
            className="inline-flex rounded-full border p-1"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              onClick={() => setYearly(false)}
              className="rounded-full px-4 py-2 text-sm transition"
              style={{
                backgroundColor: yearly ? "transparent" : "var(--accent)",
                color: yearly ? "var(--text-muted)" : accentText,
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className="rounded-full px-4 py-2 text-sm transition"
              style={{
                backgroundColor: yearly ? "var(--accent)" : "transparent",
                color: yearly ? accentText : "var(--text-muted)",
              }}
            >
              Yearly
            </button>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {/* FREE */}
          <article
            className="rounded-3xl border p-6"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p
              className="font-mono text-xs uppercase tracking-[0.15em]"
              style={{ color: "var(--text-muted)" }}
            >
              FREE
            </p>
            <h3 className="mt-3 font-display text-4xl">{fmt(pricing.free)}</h3>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              7 days to try everything
            </p>
            <ul
              className="mt-5 space-y-2 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <li>• 3 quizzes total</li>
              <li>• Upload PDF / DOCX / PPT</li>
              <li>• Failure DNA diagnosis</li>
              <li>• Basic analytics</li>
            </ul>
            <button
              onClick={openSignUp}
              className="mt-6 w-full rounded-xl border px-4 py-2.5 transition hover:border-[var(--text-muted)]"
              style={{ borderColor: "var(--border)" }}
            >
              Start Free
            </button>
          </article>
          {/* PRO */}
          <article
            className="relative rounded-3xl border-2 p-6 shadow-lg"
            style={{
              borderColor: "var(--accent)",
              backgroundColor: "var(--surface)",
            }}
          >
            <span
              className="absolute -top-3 left-6 rounded-full px-3 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: "var(--accent)", color: accentText }}
            >
              MOST POPULAR
            </span>
            <p
              className="font-mono text-xs uppercase tracking-[0.15em]"
              style={{ color: "var(--accent-2)" }}
            >
              PRO
            </p>
            <div className="mt-3 flex items-end gap-2">
              <h3 className="font-display text-4xl">{fmt(pricing.pro)}</h3>
              <span
                className="pb-1 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                /month
              </span>
            </div>
            {yearly && (
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="line-through">₹299</span> billed yearly
              </p>
            )}
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              The daily driver
            </p>
            <ul
              className="mt-5 space-y-2 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <li>• 150 quizzes / month</li>
              <li>• 5 quizzes / day</li>
              <li>• Failure DNA + profile optimization</li>
              <li>• Leaderboard access</li>
            </ul>
            <button
              onClick={openSignUp}
              className="mt-6 w-full rounded-xl px-4 py-2.5 font-semibold transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: "var(--accent)", color: accentText }}
            >
              Get Pro
            </button>
          </article>
          {/* PREMIUM */}
          <article
            className="rounded-3xl border p-6"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p
              className="font-mono text-xs uppercase tracking-[0.15em]"
              style={{ color: "var(--text-muted)" }}
            >
              PREMIUM
            </p>
            <div className="mt-3 flex items-end gap-2">
              <h3 className="font-display text-4xl">{fmt(pricing.premium)}</h3>
              <span
                className="pb-1 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                /month
              </span>
            </div>
            {yearly && (
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="line-through">₹599</span> billed yearly
              </p>
            )}
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              For serious aspirants
            </p>
            <ul
              className="mt-5 space-y-2 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <li>• Unlimited quizzes</li>
              <li>• 6 quizzes / day</li>
              <li>• Diagnostic 30-Q test</li>
              <li>• Full topic map + daily plan</li>
            </ul>
            <button
              onClick={openSignUp}
              className="mt-6 w-full rounded-xl border px-4 py-2.5 transition hover:border-[var(--text-muted)]"
              style={{ borderColor: "var(--border)" }}
            >
              Get Premium
            </button>
          </article>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section
        className="border-t"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--surface)",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <h2 className="font-display text-3xl md:text-4xl">
            Students Who Switched Strategy
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border p-5 transition hover:shadow-lg"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface-2)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full font-semibold"
                    style={{ backgroundColor: "var(--surface-3)" }}
                  >
                    {item.initials}
                  </span>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.exam}
                    </p>
                  </div>
                </div>
                <p
                  className="mt-4 text-sm leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  "{item.quote}"
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="border-t"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
          <div>
            <p className="font-display text-2xl">EXAMIFY</p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Intelligence over effort.
            </p>
          </div>
          <div
            className="grid grid-cols-3 gap-4 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <div>
              <p
                className="mb-2 font-semibold"
                style={{ color: "var(--text)" }}
              >
                Product
              </p>
              <p>Features</p>
              <p>Plans</p>
            </div>
            <div>
              <p
                className="mb-2 font-semibold"
                style={{ color: "var(--text)" }}
              >
                Company
              </p>
              <p>About</p>
              <p>Contact</p>
            </div>
            <div>
              <p
                className="mb-2 font-semibold"
                style={{ color: "var(--text)" }}
              >
                Legal
              </p>
              <p>Privacy</p>
              <p>Terms</p>
            </div>
          </div>
          <div className="text-sm" style={{ color: "var(--text-muted)" }}>
            Built for students, by students.
          </div>
        </div>
        <div
          className="border-t px-4 py-4 text-center text-xs"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          © 2025 EXAMIFY · Privacy · Terms
        </div>
      </footer>

      {authModal === "signin" && (
        <SignIn
          onClose={() => setAuthModal(null)}
          onSwitchToSignUp={() => setAuthModal("signup")}
        />
      )}
      {authModal === "signup" && (
        <SignUp
          onClose={() => setAuthModal(null)}
          onSwitchToSignIn={() => setAuthModal("signin")}
        />
      )}
    </div>
  );
}
