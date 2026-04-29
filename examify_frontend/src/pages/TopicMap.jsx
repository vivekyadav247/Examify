import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";

function abilityColor(v) {
  return v < 0.4
    ? "var(--dna-conceptual)"
    : v < 0.65
      ? "var(--dna-silly)"
      : "var(--dna-correct)";
}

export default function TopicMap() {
  const { apiFetch } = useApiClient();
  const [payload, setPayload] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [user, setUser] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [activeSubject, setActiveSubject] = useState("");
  const [error, setError] = useState("");
  const [upgradeDuration, setUpgradeDuration] = useState(1);
  const [upgradeState, setUpgradeState] = useState({
    loading: false,
    error: "",
    success: false,
  });
  const [viewMode, setViewMode] = useState("map");
  const mapRef = useRef(null);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const [gr, dr, ur] = await Promise.all([
          apiFetch("/api/analytics/topic-graph/"),
          apiFetch("/api/analytics/dashboard/"),
          apiFetch("/api/users/me/"),
        ]);
        const ud = ur.ok ? await ur.json() : null;
        if (a) setUser(ud);

        // Premium check
        if (!ud || ud.plan !== "premium") {
          if (a) setError("premium_required");
          return;
        }

        if (!gr.ok) throw new Error();
        const gd = await gr.json(),
          dd = dr.ok ? await dr.json() : null;
        if (!a) return;
        setPayload(gd);
        setDashboard(dd);
        setActiveSubject(gd?.nodes?.[0]?.subject || "");
      } catch {
        if (a) setError("Could not load plan.");
      }
    })();
    return () => {
      a = false;
    };
  }, [apiFetch]);

  const nodes = payload?.nodes || [];
  const vertical = payload?.vertical_graph || null;
  const subjects = useMemo(
    () => Array.from(new Set(nodes.map((n) => n.subject).filter(Boolean))),
    [nodes],
  );
  const nodeById = useMemo(() => {
    const m = {};
    nodes.forEach((n) => {
      m[n.id] = n;
    });
    return m;
  }, [nodes]);
  const canvasW = useMemo(
    () =>
      Math.max(
        1200,
        nodes.reduce((m, n) => Math.max(m, Number(n.x || 0)), 0) * 180 + 400,
      ),
    [nodes],
  );
  const canvasH = useMemo(
    () =>
      Math.max(
        760,
        nodes.reduce((m, n) => Math.max(m, Number(n.y || 0)), 0) * 140 + 220,
      ),
    [nodes],
  );
  const subFirst = useMemo(() => {
    const m = {};
    nodes.forEach((n) => {
      if (!m[n.subject] || Number(n.x || 0) < Number(m[n.subject].x || 0))
        m[n.subject] = n;
    });
    return m;
  }, [nodes]);
  const rootNode = {
    x: 90,
    y: canvasH / 2,
    name: user?.full_name || "Student",
  };

  const scrollTo = (s) => {
    setActiveSubject(s);
    const n = subFirst[s];
    if (!n || !mapRef.current) return;
    mapRef.current.scrollTo({
      left: Math.max(0, (Number(n.x || 0) + 1) * 180 - 90),
      behavior: "smooth",
    });
  };

  const showList = viewMode === "list" && Boolean(vertical);

  const buildCurve = (fx, fy, tx, ty) => {
    const mx = (fx + tx) / 2;
    const bend = Math.max(18, Math.min(60, Math.abs(tx - fx) / 2));
    const my = (fy + ty) / 2 - bend;
    return `M ${fx} ${fy} Q ${mx} ${my} ${tx} ${ty}`;
  };

  const upgradeToPremium = async () => {
    if (upgradeState.loading) return;
    setUpgradeState({ loading: true, error: "", success: false });
    try {
      const res = await apiFetch("/api/plans/activate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "premium",
          duration_months: upgradeDuration,
          payment_id: `mock_premium_${Date.now()}`,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Upgrade failed.");
      }
      setUpgradeState({ loading: false, error: "", success: true });
      setTimeout(() => window.location.reload(), 400);
    } catch (e) {
      setUpgradeState({
        loading: false,
        error: e?.message || "Upgrade failed.",
        success: false,
      });
    }
  };

  if (error === "premium_required")
    return (
      <AppShell activePath="/plan">
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <p
            className="text-xs uppercase tracking-[0.2em]"
            style={{ color: "var(--text-muted)" }}
          >
            Study Plan
          </p>
          <h1 className="mt-3 font-display text-3xl">Premium Only</h1>
          <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
            The full topic map and daily plan unlock with Premium.
          </p>
          <div
            className="mt-6 rounded-2xl border p-5 text-left"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p
              className="text-xs uppercase tracking-[0.15em]"
              style={{ color: "var(--accent-2)" }}
            >
              Upgrade to Premium
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Unlock full map, diagnostic quiz, and daily plan guidance.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <select
                value={upgradeDuration}
                onChange={(e) =>
                  setUpgradeDuration(Number(e.target.value) || 1)
                }
                className="rounded-xl border px-3 py-2 text-sm"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface-2)",
                  color: "var(--text)",
                }}
              >
                <option value={1}>1 month</option>
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
              </select>
              <button
                onClick={upgradeToPremium}
                disabled={upgradeState.loading}
                className="rounded-full px-5 py-2 text-sm font-semibold transition"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--bg)",
                  opacity: upgradeState.loading ? 0.7 : 1,
                }}
              >
                {upgradeState.loading ? "Upgrading..." : "Upgrade"}
              </button>
            </div>
            {upgradeState.error && (
              <p
                className="mt-3 text-xs"
                style={{ color: "var(--dna-conceptual)" }}
              >
                {upgradeState.error}
              </p>
            )}
            {upgradeState.success && (
              <p
                className="mt-3 text-xs"
                style={{ color: "var(--dna-correct)" }}
              >
                Premium activated. Loading your plan...
              </p>
            )}
            <p
              className="mt-2 text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              Current plan: {user?.plan || "free"}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <a
              href="/home"
              className="rounded-full px-6 py-3 font-semibold"
              style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
            >
              Back to Home
            </a>
            <a
              href="/dashboard"
              className="rounded-full border px-6 py-3 text-sm font-semibold"
              style={{ borderColor: "var(--border)" }}
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </AppShell>
    );
  if (error)
    return (
      <AppShell activePath="/plan">
        <div className="p-6">{error}</div>
      </AppShell>
    );
  if (!payload)
    return (
      <AppShell activePath="/plan">
        <div className="p-6">Loading plan...</div>
      </AppShell>
    );

  return (
    <AppShell activePath="/plan">
      <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-6">
        <header
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <div>
            <p
              className="text-xs uppercase tracking-[0.15em]"
              style={{ color: "var(--text-muted)" }}
            >
              Study Plan
            </p>
            <h1 className="font-display text-3xl">
              {user?.full_name || "Student"}'s Plan
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {payload.exam_target} · Readiness: {dashboard?.readiness_pct ?? 0}
              %
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-full border p-1"
              style={{ borderColor: "var(--border)" }}
            >
              <button
                onClick={() => setViewMode("map")}
                className="rounded-full px-3 py-1 text-xs font-semibold transition"
                style={{
                  backgroundColor:
                    viewMode === "map" ? "var(--accent)" : "transparent",
                  color: viewMode === "map" ? "var(--bg)" : "var(--text-muted)",
                }}
              >
                Map
              </button>
              {vertical && (
                <button
                  onClick={() => setViewMode("list")}
                  className="rounded-full px-3 py-1 text-xs font-semibold transition"
                  style={{
                    backgroundColor:
                      viewMode === "list" ? "var(--accent)" : "transparent",
                    color:
                      viewMode === "list" ? "var(--bg)" : "var(--text-muted)",
                  }}
                >
                  List
                </button>
              )}
            </div>
            <a
              href="/home"
              className="rounded-full px-5 py-2 text-sm font-semibold"
              style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
            >
              Create Quiz
            </a>
          </div>
        </header>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => scrollTo(s)}
              className="whitespace-nowrap rounded-full border px-4 py-2 text-sm transition"
              style={{
                borderColor:
                  activeSubject === s ? "var(--accent)" : "var(--border)",
                color:
                  activeSubject === s ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {showList ? (
          <div
            ref={mapRef}
            className="overflow-x-auto rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <div className="flex min-w-[980px] items-start gap-4">
              {(vertical.subjects || []).map((subjectNode) => {
                const chapters = (vertical.chapters || []).filter(
                  (c) => c.subject === subjectNode.name,
                );
                return (
                  <section
                    key={subjectNode.id}
                    className="w-[300px] flex-shrink-0 rounded-2xl border p-3"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--surface-2)",
                    }}
                  >
                    <h3 className="mb-3 font-display text-lg">
                      {subjectNode.name}
                    </h3>
                    <div className="space-y-3">
                      {chapters.map((chapter) => {
                        const chapterTopics = (vertical.topics || []).filter(
                          (t) => t.chapter === chapter.id,
                        );
                        return (
                          <article
                            key={chapter.id}
                            className="rounded-xl border p-3"
                            style={{
                              borderColor: "var(--border)",
                              backgroundColor: "var(--surface)",
                            }}
                          >
                            <p
                              className="mb-2 text-xs font-semibold uppercase tracking-[0.1em]"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {chapter.name}
                            </p>
                            <div className="space-y-2">
                              {chapterTopics.map((topic) => (
                                <a
                                  key={topic.id}
                                  href={`/quiz?topic=${encodeURIComponent(topic.name)}&session_type=topic_practice`}
                                  className="block rounded-xl border px-3 py-2 text-sm transition hover:border-[var(--accent)]"
                                  style={{
                                    borderColor: topic.is_unlocked
                                      ? "var(--border)"
                                      : "var(--surface-3)",
                                    backgroundColor: topic.is_unlocked
                                      ? "var(--surface-2)"
                                      : "var(--surface-3)",
                                    color: topic.is_unlocked
                                      ? "var(--text)"
                                      : "var(--text-muted)",
                                    pointerEvents: topic.is_unlocked
                                      ? "auto"
                                      : "none",
                                    opacity: topic.is_unlocked ? 1 : 0.7,
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="truncate">
                                      {topic.name}
                                    </span>
                                    <span
                                      className="text-[10px]"
                                      style={{ color: "var(--text-muted)" }}
                                    >
                                      {Math.round(
                                        Number(topic.ability_score || 0) * 100,
                                      )}
                                      %
                                    </span>
                                  </div>
                                  <div
                                    className="mt-1 h-1.5 rounded-full"
                                    style={{ backgroundColor: "var(--border)" }}
                                  >
                                    <div
                                      className="h-1.5 rounded-full"
                                      style={{
                                        width: `${Math.max(2, Number(topic.ability_score || 0) * 100)}%`,
                                        backgroundColor: abilityColor(
                                          Number(topic.ability_score || 0),
                                        ),
                                      }}
                                    />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            ref={mapRef}
            className="relative overflow-x-auto rounded-2xl border plan-map-bg"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
              minHeight: 760,
            }}
          >
            <svg width={canvasW} height={canvasH}>
              <defs>
                <filter
                  id="nodeShadow"
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
                    floodOpacity="0.35"
                  />
                </filter>
                <filter
                  id="nodeGlow"
                  x="-40%"
                  y="-40%"
                  width="180%"
                  height="180%"
                >
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="8"
                    floodColor="#E8FF47"
                    floodOpacity="0.35"
                  />
                </filter>
              </defs>
              {/* Root node connections */}
              {subjects.map((s) => {
                const f = subFirst[s];
                if (!f) return null;
                const tx = (Number(f.x || 0) + 1) * 180 + 90,
                  ty = Number(f.y || 0) * 140 + 70;
                return (
                  <path
                    key={`root->${s}`}
                    d={buildCurve(rootNode.x, rootNode.y, tx, ty)}
                    fill="none"
                    stroke="var(--plan-line)"
                    strokeWidth="4"
                    strokeDasharray="14 8"
                    strokeLinecap="round"
                    opacity="0.65"
                  />
                );
              })}
              {/* Topic Lines */}
              {nodes.map((n) =>
                (n.prerequisites || []).map((pid) => {
                  const f = nodeById[pid];
                  if (!f) return null;
                  const fx = (Number(f.x || 0) + 1) * 180 + 90,
                    fy = Number(f.y || 0) * 140 + 70;
                  const tx = (Number(n.x || 0) + 1) * 180 + 90,
                    ty = Number(n.y || 0) * 140 + 70;
                  const unlocked = n.is_unlocked && f.is_unlocked;
                  return (
                    <path
                      key={`${pid}->${n.id}`}
                      d={buildCurve(fx, fy, tx, ty)}
                      fill="none"
                      stroke={
                        unlocked ? "var(--plan-line)" : "var(--plan-line-muted)"
                      }
                      strokeWidth={unlocked ? "3" : "2"}
                      strokeDasharray={unlocked ? "0" : "12 8"}
                      strokeLinecap="round"
                      opacity={unlocked ? "0.7" : "0.45"}
                    />
                  );
                }),
              )}

              {/* Root Node */}
              <g>
                <circle
                  cx={rootNode.x}
                  cy={rootNode.y}
                  r="52"
                  fill="var(--plan-node-active)"
                  stroke="var(--plan-node-active)"
                  strokeWidth="4"
                  filter="url(#nodeGlow)"
                />
                <text
                  x={rootNode.x}
                  y={rootNode.y + 6}
                  textAnchor="middle"
                  fontSize="26"
                  fontWeight="bold"
                  fill="var(--bg)"
                >
                  E
                </text>
                <text
                  x={rootNode.x}
                  y={rootNode.y + 68}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="var(--text)"
                >
                  {rootNode.name}
                </text>
                <text
                  x={rootNode.x}
                  y={rootNode.y + 84}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--text-muted)"
                >
                  Start Here
                </text>
              </g>

              {/* Topic Nodes */}
              {nodes.map((n) => {
                const x = (Number(n.x || 0) + 1) * 180 + 90,
                  y = Number(n.y || 0) * 140 + 70;
                const ab = Number(n.ability_score || 0);
                const ringR = 40,
                  ringL = 2 * Math.PI * ringR,
                  ringO = ringL * (1 - ab);
                const stars = Math.max(0, Math.min(3, Number(n.stars || 0)));
                const isPerfect = n.is_flagged && stars === 3;
                const isComplete = n.is_flagged;
                const isUnlocked = n.is_unlocked;
                let fill = "var(--plan-node-locked)",
                  stroke = "var(--plan-line-muted)";
                if (isPerfect) {
                  fill = "var(--star-filled)";
                  stroke = "#ffe47b";
                } else if (isComplete) {
                  fill = "var(--plan-node-complete)";
                  stroke = "var(--plan-node-complete)";
                } else if (isUnlocked) {
                  fill = "var(--plan-node-active)";
                  stroke = "var(--plan-node-active)";
                }
                const nodeFilter = isUnlocked
                  ? "url(#nodeGlow)"
                  : "url(#nodeShadow)";
                return (
                  <g
                    key={n.id}
                    onMouseEnter={() => setHovered({ ...n, px: x, py: y })}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: isUnlocked ? "pointer" : "default" }}
                  >
                    {isUnlocked && (
                      <circle
                        cx={x}
                        cy={y}
                        r={ringR}
                        fill="none"
                        stroke="var(--plan-line-muted)"
                        strokeWidth="5"
                      />
                    )}
                    {isUnlocked && (
                      <circle
                        cx={x}
                        cy={y}
                        r={ringR}
                        fill="none"
                        stroke={abilityColor(ab)}
                        strokeWidth="5"
                        strokeDasharray={ringL}
                        strokeDashoffset={ringO}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${x} ${y})`}
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r="32"
                      fill={fill}
                      stroke={stroke}
                      strokeWidth="2"
                      filter={nodeFilter}
                    />
                    {isUnlocked && !isComplete && (
                      <circle
                        cx={x}
                        cy={y}
                        r="18"
                        fill="var(--surface)"
                        opacity="0.6"
                      />
                    )}
                    {[0, 1, 2].map((i) => (
                      <circle
                        key={`${n.id}-star-${i}`}
                        cx={x + (i - 1) * 12}
                        cy={y - 48}
                        r="4"
                        fill={
                          i < stars
                            ? "var(--star-filled)"
                            : "var(--plan-node-locked)"
                        }
                        stroke="var(--plan-line-muted)"
                        strokeWidth="1"
                      />
                    ))}
                    {!isUnlocked && (
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fill="var(--text-muted)"
                      >
                        LOCKED
                      </text>
                    )}
                    <text
                      x={x}
                      y={y + 56}
                      textAnchor="middle"
                      fontSize="12"
                      fill="var(--text-muted)"
                    >{`${stars}/3`}</text>
                    <text
                      x={x}
                      y={y + 74}
                      textAnchor="middle"
                      fontSize="11"
                      fill="var(--text-secondary)"
                    >
                      {String(n.name || "").length > 14
                        ? `${String(n.name).slice(0, 14)}…`
                        : n.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hovered && (
              <div
                className="pointer-events-none absolute z-20 w-64 rounded-xl border p-3 text-sm"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                  boxShadow: "var(--card-shadow)",
                  left: Math.min(canvasW - 300, hovered.px + 18),
                  top: Math.max(8, hovered.py - 10),
                }}
              >
                <p className="font-semibold">{hovered.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {hovered.subject}
                </p>
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Ability:{" "}
                  {Math.round(Number(hovered.ability_score || 0) * 100)}%
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Stars: {Number(hovered.stars || 0)}/3
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Att: {Number(hovered.attempts || 0)} · Acc:{" "}
                  {Math.round(Number(hovered.accuracy_pct || 0))}%
                </p>
                {!hovered.is_unlocked ? (
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Complete prerequisite to unlock.
                  </p>
                ) : (
                  <a
                    href={`/quiz?topic=${encodeURIComponent(hovered.name)}`}
                    className="pointer-events-auto mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--bg)",
                    }}
                  >
                    Start Quiz
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
