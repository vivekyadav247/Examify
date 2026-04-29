import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 3000, 4500, 7000];

function abilityColor(v) {
  return v < 0.4
    ? "var(--dna-conceptual)"
    : v < 0.65
      ? "var(--dna-silly)"
      : "var(--dna-correct)";
}
function scoreColor(s) {
  return s >= 70
    ? "var(--dna-correct)"
    : s < 50
      ? "var(--dna-conceptual)"
      : "var(--dna-silly)";
}
function rankTone(r) {
  return r === 1
    ? "var(--rank-gold)"
    : r === 2
      ? "var(--rank-silver)"
      : r === 3
        ? "var(--rank-bronze)"
        : "var(--text-muted)";
}
function nextLevelProgress(xp) {
  const s = Number(xp || 0);
  let cs = 0,
    nt = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (s >= LEVEL_THRESHOLDS[i]) {
      cs = LEVEL_THRESHOLDS[i];
      nt = LEVEL_THRESHOLDS[i + 1] ?? cs;
    }
  }
  return {
    progress: Math.max(
      0,
      Math.min(100, ((s - cs) / Math.max(1, nt - cs)) * 100),
    ),
    nextTarget: nt,
  };
}
function planLabel(p) {
  const v = String(p || "")
    .trim()
    .toLowerCase();
  return !v ? "Free" : v[0].toUpperCase() + v.slice(1);
}

export default function Dashboard() {
  const { apiFetch } = useApiClient();
  const [data, setData] = useState(null);
  const [lb, setLb] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const r = await apiFetch("/api/analytics/dashboard/");
        if (!r.ok) throw new Error();
        const d = await r.json();
        if (!a) return;
        setData(d);
        if (d.exam_target) {
          const lr = await apiFetch(
            `/api/users/leaderboard/${encodeURIComponent(d.exam_target)}/?limit=5`,
          );
          const ld = lr.ok ? await lr.json() : null;
          if (a) setLb(ld?.entries || d.leaderboard_top5 || []);
        }
      } catch {
        if (a) setError("Could not load dashboard.");
      }
    })();
    return () => {
      a = false;
    };
  }, [apiFetch]);

  const readiness = Number(data?.readiness_pct || 0);
  const rR = 34,
    rC = 2 * Math.PI * rR,
    rO = rC * (1 - readiness / 100);
  const xpM = useMemo(() => nextLevelProgress(data?.xp), [data?.xp]);
  const pL = useMemo(() => planLabel(data?.plan), [data?.plan]);
  const cL = useMemo(
    () =>
      (data?.plan || "").toLowerCase() === "premium"
        ? "Unlimited"
        : String(data?.credits_remaining ?? 0),
    [data?.credits_remaining, data?.plan],
  );
  const failCards = useMemo(() => {
    const s = data?.failure_dna_week || {};
    return [
      {
        key: "conceptual",
        label: "Conceptual",
        value: s.conceptual || 0,
        color: "var(--dna-conceptual)",
      },
      {
        key: "silly",
        label: "Silly",
        value: s.silly || 0,
        color: "var(--dna-silly)",
      },
      {
        key: "time",
        label: "Time",
        value: s.time || 0,
        color: "var(--dna-time)",
      },
      {
        key: "recall",
        label: "Recall",
        value: s.recall || 0,
        color: "var(--dna-recall)",
      },
    ];
  }, [data?.failure_dna_week]);
  const domFail = useMemo(() => {
    let w = "",
      m = -1;
    failCards.forEach((c) => {
      if (c.value > m) {
        m = c.value;
        w = c.key;
      }
    });
    return w;
  }, [failCards]);

  if (error)
    return (
      <AppShell activePath="/dashboard">
        <div className="p-6">{error}</div>
      </AppShell>
    );
  if (!data)
    return (
      <AppShell activePath="/dashboard">
        <div className="p-6">Loading dashboard...</div>
      </AppShell>
    );

  return (
    <AppShell activePath="/dashboard">
      <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-6">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p
              className="text-xs uppercase tracking-[0.15em]"
              style={{ color: "var(--text-muted)" }}
            >
              Dashboard
            </p>
            <h1 className="font-display text-3xl">{data.exam_target}</h1>
            <div className="mt-2 flex items-end gap-1">
              <span
                className="h-4 w-2 rounded-sm"
                style={{ backgroundColor: "var(--accent)" }}
              />
              <span
                className="h-5 w-2 rounded-sm"
                style={{ backgroundColor: "var(--accent-2)" }}
              />
              <span
                className="h-6 w-2 rounded-sm"
                style={{ backgroundColor: "var(--dna-time)" }}
              />
              <span
                className="ml-2 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Study Shelf
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(data.plan || "").toLowerCase() === "premium" ? (
              <a
                href="/plan"
                className="rounded-full px-5 py-2 text-sm font-semibold transition-transform hover:scale-105"
                style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
              >
                Open Plan
              </a>
            ) : (
              <a
                href="/home"
                className="rounded-full px-5 py-2 text-sm font-semibold transition-transform hover:scale-105"
                style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
              >
                Generate Quiz
              </a>
            )}
            <a
              href="/profile"
              className="rounded-full border px-4 py-2 text-sm transition"
              style={{ borderColor: "var(--border)" }}
            >
              Profile
            </a>
          </div>
        </header>

        {/* Stats Row */}
        <section className="mb-6 grid gap-3 grid-cols-2 md:grid-cols-5">
          {/* Readiness */}
          <article
            className="anim-pop-in rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Readiness
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="relative h-[78px] w-[78px]">
                <svg width="78" height="78" className="-rotate-90">
                  <circle
                    cx="39"
                    cy="39"
                    r={rR}
                    stroke="var(--border)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="39"
                    cy="39"
                    r={rR}
                    stroke="var(--accent)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={rC}
                    strokeDashoffset={rO}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                  {readiness}%
                </span>
              </div>
            </div>
          </article>
          <article
            className="anim-pop-in rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Days Left
            </p>
            <p className="mt-2 text-3xl font-semibold">{data.days_left}</p>
          </article>
          <article
            className="anim-pop-in rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Streak
            </p>
            <p className="mt-2 text-3xl font-semibold">{data.streak}</p>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      i < Math.min(7, data.streak)
                        ? "var(--accent)"
                        : "var(--border)",
                  }}
                />
              ))}
            </div>
          </article>
          <article
            className="anim-pop-in rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Level & XP
            </p>
            <p className="mt-2 text-3xl font-semibold">Lv.{data.level}</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {data.xp} XP
            </p>
            <div
              className="mt-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--border)" }}
            >
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${xpM.progress}%`,
                  backgroundColor: "var(--accent)",
                }}
              />
            </div>
          </article>
          <article
            className="anim-pop-in rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Plan
            </p>
            <p className="mt-2 text-2xl font-semibold">{pL}</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Credits: {cL}
            </p>
          </article>
        </section>

        {/* Main Grid */}
        <section className="grid gap-4 md:grid-cols-3">
          {/* Topics */}
          <div className="space-y-4">
            <article
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl">Weak Topics</h2>
                <a
                  href="/topic-map"
                  className="text-xs underline"
                  style={{ color: "var(--text-muted)" }}
                >
                  View map
                </a>
              </div>
              <div className="space-y-3">
                {(data.weak_topics || []).slice(0, 8).map((t) => (
                  <div
                    key={t.topic}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--surface-2)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{t.topic}</p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {t.subject}
                        </p>
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {t.attempts} att.
                      </p>
                    </div>
                    <div
                      className="mt-2 h-2 rounded-full"
                      style={{ backgroundColor: "var(--border)" }}
                    >
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.max(2, Number(t.ability_score || 0) * 100)}%`,
                          backgroundColor: abilityColor(
                            Number(t.ability_score || 0),
                          ),
                        }}
                      />
                    </div>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Stars: {t.stars}/3
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
          {/* Charts */}
          <div className="space-y-4">
            <article
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <h2 className="font-display text-xl">Accuracy — 7 days</h2>
              <div className="mt-3 h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.accuracy_7d || []}>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 100]} stroke="var(--text-muted)" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="accuracy_pct"
                      stroke="none"
                      fill="var(--accent-glow)"
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy_pct"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      dot={{ fill: "var(--accent)", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
            <article
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <h3 className="mb-3 text-lg font-semibold">Failure DNA — week</h3>
              <div className="grid grid-cols-2 gap-2">
                {failCards.map((c) => (
                  <div
                    key={c.key}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor:
                        domFail === c.key ? "var(--accent)" : "var(--border)",
                      backgroundColor: "var(--surface-2)",
                    }}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {c.label}
                      </p>
                    </div>
                    <p className="text-xl font-semibold">{c.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 h-[110px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={failCards}>
                    <XAxis dataKey="label" hide />
                    <YAxis hide />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                      {failCards.map((c) => (
                        <Cell key={c.key} fill={c.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>
          {/* Leaderboard */}
          <div className="space-y-4">
            <article
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <h2 className="font-display text-xl">Top 5 this week</h2>
              <div className="mt-4 space-y-2">
                {lb.map((e) => (
                  <div
                    key={`${e.rank}-${e.user_id || e.name}`}
                    className="flex items-center justify-between rounded-xl border p-3"
                    style={{
                      borderColor: e.is_you ? "var(--accent)" : "var(--border)",
                      backgroundColor: e.is_you
                        ? "var(--accent-glow)"
                        : "var(--surface-2)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ color: rankTone(Number(e.rank)) }}>
                        #{e.rank}
                      </span>
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs"
                        style={{ backgroundColor: "var(--surface-3)" }}
                      >
                        {String(e.name || "U")
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <p className="text-sm">
                        {e.name}
                        {e.is_you ? " (You)" : ""}
                      </p>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {e.xp_this_week ?? e.xp_all_time} XP
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        {/* Recent Sessions */}
        <section
          className="mt-6 rounded-2xl border p-4"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <h2 className="font-display text-xl">Recent Sessions</h2>
          <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-5">
            {(data.recent_sessions || []).slice(0, 5).map((s) => (
              <article
                key={s.id}
                className="rounded-xl border p-3"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface-2)",
                }}
              >
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {new Date(s.started_at).toLocaleDateString()}
                </p>
                <p
                  className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs"
                  style={{
                    backgroundColor: scoreColor(Number(s.score_pct || 0)),
                    color: "#111",
                  }}
                >
                  {Math.round(Number(s.score_pct || 0))}%
                </p>
                <p
                  className="mt-2 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  +{s.xp_earned || 0} XP · {s.questions_count || 0}Q
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
