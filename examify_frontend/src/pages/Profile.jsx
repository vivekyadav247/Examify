import React, { useEffect, useMemo, useState } from "react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";

function avgAccuracy(rows) {
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) return 0;
  const total = list.reduce(
    (sum, row) => sum + Number(row.accuracy_pct || 0),
    0,
  );
  return Math.round(total / list.length);
}

function toTitle(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (s) => s.toUpperCase());
}

export default function Profile() {
  const { apiFetch, setToken } = useApiClient();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [overallDna, setOverallDna] = useState(null);
  const [premiumPlan, setPremiumPlan] = useState(null);
  const [refreshingPlan, setRefreshingPlan] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [ur, sr, dr, dnar] = await Promise.all([
          apiFetch("/api/users/me/"),
          apiFetch("/api/users/stats/"),
          apiFetch("/api/analytics/dashboard/"),
          apiFetch("/api/quiz/dna/profile/"),
        ]);
        const u = ur.ok ? await ur.json() : null;
        const s = sr.ok ? await sr.json() : null;
        const d = dr.ok ? await dr.json() : null;
        const dna = dnar.ok ? await dnar.json() : null;
        if (!active) return;
        setUser(u);
        setStats(s);
        setDashboard(d);
        setOverallDna(dna);

        if (u?.plan === "premium") {
          const pr = await apiFetch("/api/analytics/premium-plan/");
          if (!active) return;
          const pd = pr.ok ? await pr.json() : null;
          setPremiumPlan(pd);
        } else {
          setPremiumPlan(null);
        }

        if (d?.exam_target) {
          const lr = await apiFetch(
            `/api/users/leaderboard/${encodeURIComponent(d.exam_target)}/?limit=10`,
          );
          if (!active) return;
          const ld = lr.ok ? await lr.json() : null;
          setLeaderboard(ld?.entries || []);
        }
      } catch {
        if (active) setError("Could not load profile.");
      }
    })();
    return () => {
      active = false;
    };
  }, [apiFetch]);

  const accuracy = useMemo(
    () => avgAccuracy(dashboard?.accuracy_7d),
    [dashboard?.accuracy_7d],
  );
  const bestTopic = useMemo(() => {
    const weak = dashboard?.weak_topics || [];
    if (!weak.length) return "No attempts yet";
    const sorted = [...weak].sort(
      (a, b) => Number(b.accuracy_pct || 0) - Number(a.accuracy_pct || 0),
    );
    return `${sorted[0].topic} (${Math.round(Number(sorted[0].accuracy_pct || 0))}%)`;
  }, [dashboard?.weak_topics]);

  const totalDnaFailures = useMemo(() => {
    const breakdown = overallDna?.dna_breakdown || {};
    return ["conceptual", "silly", "time", "recall"].reduce(
      (sum, key) => sum + Number(breakdown[key] || 0),
      0,
    );
  }, [overallDna?.dna_breakdown]);

  const refreshPremiumPlan = async () => {
    if (!user || user.plan !== "premium" || refreshingPlan) return;
    setRefreshingPlan(true);
    try {
      const response = await apiFetch("/api/analytics/premium-plan/?refresh=1");
      const payload = response.ok ? await response.json() : null;
      setPremiumPlan(payload);
    } finally {
      setRefreshingPlan(false);
    }
  };

  if (error)
    return (
      <AppShell activePath="/profile">
        <div className="p-6">{error}</div>
      </AppShell>
    );
  if (!user || !stats || !dashboard)
    return (
      <AppShell activePath="/profile">
        <div className="p-6">Loading profile...</div>
      </AppShell>
    );

  return (
    <AppShell activePath="/profile">
      <div className="mx-auto max-w-[960px] px-4 py-6 md:px-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              className="text-xs uppercase tracking-[0.15em]"
              style={{ color: "var(--text-muted)" }}
            >
              Profile
            </p>
            <h1 className="font-display text-3xl">
              {user.full_name || "Student"}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {user.email}
            </p>
          </div>
          <button
            onClick={() => {
              setToken(null);
              window.location.href = "/";
            }}
            className="rounded-full border px-4 py-2 text-sm transition"
            style={{ borderColor: "var(--border)" }}
          >
            Log out
          </button>
        </header>

        <section className="mb-6 grid gap-3 grid-cols-2 md:grid-cols-4">
          <article
            className="rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Exam
            </p>
            <p className="mt-2 text-xl font-semibold">{stats.exam_target}</p>
          </article>
          <article
            className="rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Accuracy (7d)
            </p>
            <p className="mt-2 text-xl font-semibold">{accuracy}%</p>
          </article>
          <article
            className="rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Level / XP
            </p>
            <p className="mt-2 text-xl font-semibold">
              Lv.{stats.level} · {stats.xp}
            </p>
          </article>
          <article
            className="rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Weekly Rank
            </p>
            <p className="mt-2 text-xl font-semibold">
              {stats.weekly_rank ? `#${stats.weekly_rank}` : "-"}
            </p>
          </article>
        </section>

        <section
          className="mb-6 rounded-2xl border p-4"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl">Cumulative DNA Report</h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Updated from all completed quizzes for this student profile.
              </p>
            </div>
            <a
              href="/dna-report"
              className="rounded-full border px-4 py-2 text-xs font-semibold"
              style={{ borderColor: "var(--border)" }}
            >
              Open Last Session Report
            </a>
          </div>

          <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-4">
            <article
              className="rounded-xl p-3"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Sessions
              </p>
              <p className="mt-1 text-lg font-semibold">
                {overallDna?.sessions_count ?? 0}
              </p>
            </article>
            <article
              className="rounded-xl p-3"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Overall Score
              </p>
              <p className="mt-1 text-lg font-semibold">
                {Math.round(Number(overallDna?.overall_summary?.score_pct || 0))}
                %
              </p>
            </article>
            <article
              className="rounded-xl p-3"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Dominant Failure
              </p>
              <p className="mt-1 text-lg font-semibold">
                {toTitle(overallDna?.dominant_failure || "none")}
              </p>
            </article>
            <article
              className="rounded-xl p-3"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Total Failures
              </p>
              <p className="mt-1 text-lg font-semibold">{totalDnaFailures}</p>
            </article>
          </div>

          <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            {overallDna?.simple_summary?.headline || "No DNA signal yet."}{" "}
            {overallDna?.simple_summary?.next_step || ""}
          </p>

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {["conceptual", "silly", "time", "recall"].map((key) => {
              const value = Number(overallDna?.dna_breakdown?.[key] || 0);
              const pct = Number(overallDna?.failure_percentages?.[key] || 0);
              return (
                <div
                  key={key}
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface-2)",
                  }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span>{toTitle(key)}</span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {value} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article
            className="rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <h2 className="font-display text-xl">Your Progress Accuracy</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Best tracked topic: {bestTopic}
            </p>
            <div className="mt-4 space-y-2">
              {(dashboard.weak_topics || []).slice(0, 6).map((topic) => (
                <div
                  key={topic.topic}
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface-2)",
                  }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span>{topic.topic}</span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {Math.round(Number(topic.accuracy_pct || 0))}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article
            className="rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <h2 className="font-display text-xl">Leaderboard</h2>
            <div className="mt-4 space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={`${entry.rank}-${entry.user_id}`}
                  className="flex items-center justify-between rounded-xl border p-3"
                  style={{
                    borderColor: entry.is_you
                      ? "var(--accent)"
                      : "var(--border)",
                    backgroundColor: "var(--surface-2)",
                  }}
                >
                  <p className="text-sm">
                    #{entry.rank} {entry.name}
                    {entry.is_you ? " (You)" : ""}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {entry.xp_this_week ?? entry.xp_all_time} XP
                  </p>
                </div>
              ))}
              {!leaderboard.length && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No leaderboard data yet.
                </p>
              )}
            </div>
          </article>
        </section>

        {user.plan === "premium" && (
          <section
            className="mt-6 rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-xl">AI Plan Engine</h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  One active premium plan. It refreshes after each completed quiz.
                </p>
              </div>
              <button
                onClick={refreshPremiumPlan}
                disabled={refreshingPlan}
                className="rounded-full px-4 py-2 text-xs font-semibold"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--bg)",
                  opacity: refreshingPlan ? 0.7 : 1,
                }}
              >
                {refreshingPlan ? "Refreshing..." : "Refresh Plan"}
              </button>
            </div>

            <p className="mt-3 text-sm">
              {premiumPlan?.plan?.one_line_focus || "Plan will appear after your first completed quiz."}
            </p>

            {!!premiumPlan?.plan?.today_plan?.length && (
              <div className="mt-3 space-y-2">
                {(premiumPlan.plan.today_plan || []).slice(0, 4).map((task, idx) => (
                  <article
                    key={`${task.task}-${idx}`}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--surface-2)",
                    }}
                  >
                    <p className="text-sm font-semibold">
                      {idx + 1}. {task.task} ({task.duration_min} min)
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {task.topic}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
