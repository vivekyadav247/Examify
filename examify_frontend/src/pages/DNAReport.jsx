import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";

function dnaColor(t) {
  return (
    {
      conceptual: "var(--dna-conceptual)",
      silly: "var(--dna-silly)",
      time: "var(--dna-time)",
      recall: "var(--dna-recall)",
    }[t] || "var(--text-muted)"
  );
}
function dnaInsight(t) {
  return (
    {
      conceptual:
        "Core understanding gaps are the biggest drag. Rebuild fundamentals.",
      silly: "Execution slips cost marks. Add verification before locking.",
      time: "Pacing breaks accuracy. Prioritize skip strategy and timer discipline.",
      recall: "Retention weak under pressure. Tighter spaced revision loops.",
    }[t] || "Balanced profile. Keep consistent daily practice."
  );
}
function abilityLabel(v) {
  return v < 0.25
    ? "beginner"
    : v < 0.45
      ? "weak"
      : v < 0.65
        ? "developing"
        : v < 0.8
          ? "strong"
          : "mastered";
}
function toTitle(v) {
  return String(v || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (s) => s.toUpperCase());
}

export default function DNAReport() {
  const { apiFetch } = useApiClient();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});
  const [recentSessions, setRecentSessions] = useState([]);
  const sessionId = new URLSearchParams(window.location.search).get(
    "session_id",
  );

  useEffect(() => {
    let a = true;
    (async () => {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        try {
          const hr = await apiFetch("/api/quiz/history/");
          if (hr.ok) {
            const hd = await hr.json();
            const sessions = hd.sessions || [];
            if (!a) return;
            setRecentSessions(sessions);
            if (sessions.length > 0) {
              activeSessionId = sessions[0].session_id;
              window.history.replaceState(
                {},
                "",
                `/dna-report?session_id=${encodeURIComponent(activeSessionId)}`,
              );
            }
          }
        } catch {}
      }
      if (!activeSessionId) {
        if (a)
          setError(
            "No quiz report found yet. Complete one quiz to see your DNA report.",
          );
        return;
      }
      try {
        const [sr, str] = await Promise.all([
          apiFetch(`/api/quiz/sessions/${activeSessionId}/dna-report/`),
          apiFetch("/api/users/stats/"),
        ]);
        if (!sr.ok) throw new Error();
        const sd = await sr.json(),
          std = str.ok ? await str.json() : null;
        if (!a) return;
        setData(sd);
        setStats(std);
      } catch {
        if (a) setError("Could not load report.");
      }
    })();
    return () => {
      a = false;
    };
  }, [sessionId, apiFetch]);

  const chartData = useMemo(() => {
    const b = data?.dna_breakdown || {};
    return [
      { key: "conceptual", label: "Conceptual", value: b.conceptual || 0 },
      { key: "silly", label: "Silly", value: b.silly || 0 },
      { key: "time", label: "Time", value: b.time || 0 },
      { key: "recall", label: "Recall", value: b.recall || 0 },
    ];
  }, [data]);

  if (error)
    return (
      <AppShell activePath="/dna-report">
        <div className="p-8">
          <p>{error}</p>
          {recentSessions.length > 0 && (
            <a
              href={`/dna-report?session_id=${encodeURIComponent(recentSessions[0].session_id)}`}
              className="mt-3 inline-block rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
            >
              Open latest report
            </a>
          )}
          <div className="mt-3">
            <a
              href="/quiz"
              className="text-sm underline"
              style={{ color: "var(--text-muted)" }}
            >
              Start a quiz
            </a>
          </div>
        </div>
      </AppShell>
    );
  if (!data)
    return (
      <AppShell activePath="/dna-report">
        <div className="p-8">Loading report...</div>
      </AppShell>
    );

  const score = data.session_summary?.correct || 0;
  const total = data.session_summary?.total_questions || 10;
  const accuracy = total ? Math.round((score / total) * 100) : 0;
  const simpleSummary = data.simple_summary || null;

  return (
    <AppShell activePath="/dna-report">
      <div className="mx-auto max-w-[800px] space-y-6 px-4 py-8">
        {/* Summary */}
        <section
          className="rounded-3xl border p-6"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <p
            className="text-xs uppercase tracking-[0.15em]"
            style={{ color: "var(--text-muted)" }}
          >
            Session Summary
          </p>
          <h1 className="mt-2 font-display text-5xl md:text-6xl">
            {score} / {total}
          </h1>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Accuracy
              </p>
              <p className="text-xl font-semibold">{accuracy}%</p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                XP Earned
              </p>
              <p className="text-xl font-semibold">
                {data.session_summary?.xp_earned ?? 0}
              </p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Level / Streak
              </p>
              <p className="text-xl font-semibold">
                Lv.{stats?.level ?? "—"} · Streak {stats?.streak ?? 0}
              </p>
            </div>
          </div>
        </section>

        {simpleSummary && (
          <section
            className="rounded-3xl border p-6"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <h2 className="font-display text-2xl">Simple Report</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              {simpleSummary.headline}
            </p>
            <p className="mt-2 text-sm">{simpleSummary.next_step}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div
                className="rounded-xl p-3 text-sm"
                style={{ backgroundColor: "var(--surface-2)" }}
              >
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Focus Topics
                </p>
                <p>{(simpleSummary.focus_topics || []).join(", ") || "-"}</p>
              </div>
              <div
                className="rounded-xl p-3 text-sm"
                style={{ backgroundColor: "var(--surface-2)" }}
              >
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Stable Topics
                </p>
                <p>{(simpleSummary.stable_topics || []).join(", ") || "-"}</p>
              </div>
            </div>
          </section>
        )}

        {/* Failure DNA Chart */}
        <section
          className="rounded-3xl border p-6"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <h2 className="font-display text-2xl">Failure DNA Breakdown</h2>
          <div className="mt-4 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="label" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((i) => (
                    <Cell key={i.key} fill={dnaColor(i.key)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p
            className="mt-3 rounded-xl p-3 text-sm"
            style={{
              backgroundColor: "var(--surface-2)",
              color: "var(--text-secondary)",
            }}
          >
            {data.ai_report?.one_line_diagnosis ||
              dnaInsight(data.dominant_failure)}
          </p>
        </section>

        {/* AI Guidance */}
        {data.ai_report && (
          <section
            className="rounded-3xl border p-6"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <h2 className="font-display text-2xl">AI Study Guidance</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: "var(--surface-2)" }}
              >
                <p className="mb-2 text-sm font-semibold">Strengths</p>
                <ul
                  className="space-y-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {(data.ai_report.strengths || []).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: "var(--surface-2)" }}
              >
                <p className="mb-2 text-sm font-semibold">Priority Fixes</p>
                <ul
                  className="space-y-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {(data.ai_report.priority_fixes || []).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: "var(--surface-2)" }}
              >
                <p className="mb-2 text-sm font-semibold">Next 3 Sessions</p>
                <ul
                  className="space-y-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {(data.ai_report.next_3_sessions || []).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: "var(--surface-2)" }}
              >
                <p className="mb-2 text-sm font-semibold">7-Day Protocol</p>
                <ul
                  className="space-y-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {(data.ai_report.study_protocol_7d || []).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {data.ai_report.motivation && (
              <p
                className="mt-4 rounded-xl p-3 text-sm"
                style={{
                  backgroundColor: "var(--surface-2)",
                  color: "var(--text-secondary)",
                }}
              >
                {data.ai_report.motivation}
              </p>
            )}
          </section>
        )}

        {/* Topic Breakdown */}
        <section
          className="rounded-3xl border p-6"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <h2 className="font-display text-2xl">Topic Breakdown</h2>
          <div className="mt-4 space-y-3">
            {(data.topic_breakdown || []).map((ans, idx) => {
              const isOpen = expanded[idx];
              const brief = `${ans.topic || ""}`.slice(0, 60);
              return (
                <article
                  key={`${ans.question_id}-${idx}`}
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface-2)",
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm">
                      #{idx + 1} ·{" "}
                      <span style={{ color: "var(--text-muted)" }}>
                        {ans.topic}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span>{Math.round(Number(ans.accuracy_pct || 0))}%</span>
                      <span>{toTitle(ans.dominant_failure)}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">
                    {brief}
                    {brief.length >= 60 ? "..." : ""}
                  </p>
                  {ans.dominant_failure !== "none" && (
                    <div className="mt-2">
                      <span
                        className="rounded-full px-2 py-1 text-[10px] font-semibold"
                        style={{
                          backgroundColor: dnaColor(ans.dominant_failure),
                          color: "#111",
                        }}
                      >
                        {toTitle(ans.dominant_failure)}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() =>
                      setExpanded((p) => ({ ...p, [idx]: !isOpen }))
                    }
                    className="mt-2 text-xs underline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {isOpen ? "Hide" : "Show details"}
                  </button>
                  {isOpen && (
                    <p
                      className="mt-2 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Subject: {ans.subject} · Ability:{" "}
                      {Number(ans.ability_score || 0).toFixed(2)}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* Ability Changes */}
        <section
          className="rounded-3xl border p-6"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <h2 className="font-display text-2xl">Ability Changes</h2>
          <div className="mt-4 space-y-3">
            {(data.topic_breakdown || []).map((item) => {
              const v = Number(item.ability_score || 0);
              return (
                <article
                  key={item.topic}
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface-2)",
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{item.topic}</p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {abilityLabel(v)}
                    </p>
                  </div>
                  <div
                    className="mt-2 h-2 rounded-full"
                    style={{ backgroundColor: "var(--border)" }}
                  >
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.max(2, v * 100)}%`,
                        backgroundColor: "var(--accent)",
                      }}
                    />
                  </div>
                  <p
                    className="mt-2 text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Stars: {Number(item.stars || 0)}/3
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-wrap gap-3 pb-4">
          <a
            href="/quiz"
            className="rounded-full px-5 py-2 text-sm font-semibold"
            style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
          >
            Start Another Session
          </a>
          <a
            href="/dashboard"
            className="rounded-full border px-5 py-2 text-sm"
            style={{ borderColor: "var(--border)" }}
          >
            Dashboard
          </a>
        </section>
      </div>
    </AppShell>
  );
}
