import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";

export default function Home() {
  const { apiFetch } = useApiClient();
  const [tab, setTab] = useState("topic"); // topic | upload | url
  const [topic, setTopic] = useState("");
  const [chapter, setChapter] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [urlAnalysisState, setUrlAnalysisState] = useState("");
  const fileRef = useRef(null);

  const isContentTab = tab === "upload" || tab === "url";
  const subjectRequired =
    tab === "topic" && (user?.plan === "free" || user?.plan === "pro");
  const topicRequired = tab === "topic";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [ur, hr, tr, sr] = await Promise.all([
          apiFetch("/api/users/me/"),
          apiFetch("/api/quiz/history/"),
          apiFetch("/api/analytics/topic-graph/"),
          apiFetch("/api/users/stats/"),
        ]);
        if (ur.ok) {
          const d = await ur.json();
          if (active) setUser(d);
        }
        if (hr.ok) {
          const d = await hr.json();
          if (active) setHistory(d.sessions || d || []);
        }
        if (sr.ok) {
          const d = await sr.json();
          if (active) setStats(d);
        }
        if (tr.ok) {
          const d = await tr.json();
          const uniqSubjects = Array.from(
            new Set((d.nodes || []).map((n) => n.subject).filter(Boolean)),
          );
          if (active) setSubjects(uniqSubjects);
          if (!subject && uniqSubjects.length && active)
            setSubject(uniqSubjects[0]);
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, [apiFetch, subject]);

  useEffect(() => {
    if (!user?.exam_target) return;
    let active = true;
    (async () => {
      try {
        const r = await apiFetch(
          `/api/users/leaderboard/${encodeURIComponent(user.exam_target)}/?limit=5`,
        );
        if (!r.ok) return;
        const d = await r.json();
        if (!active) return;
        setLeaderboard(d.entries || []);
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, [apiFetch, user?.exam_target]);

  const generateQuiz = useCallback(async () => {
    setGenerating(true);
    setError("");
    try {
      if (subjectRequired && !subject) {
        throw new Error("Please select a subject first.");
      }
      if (topicRequired && !topic.trim()) {
        throw new Error("Please enter a topic first.");
      }
      let contentId = null;

      if (tab === "upload" && file) {
        const form = new FormData();
        const ext = file.name.split(".").pop().toLowerCase();
        const typeMap = {
          pdf: "pdf",
          docx: "docx",
          doc: "docx",
          pptx: "ppt",
          ppt: "ppt",
        };
        form.append("content_type", typeMap[ext] || "pdf");
        form.append("file", file);
        if (topic) form.append("topic_name", topic);
        const uploadRes = await apiFetch("/api/content/upload/", {
          method: "POST",
          body: form,
        });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        contentId = uploadData.content_id;
      }

      if (tab === "url" && url) {
        setUrlAnalysisState("Analyzing public video/content...");
        const form = new FormData();
        form.append("content_type", "video");
        form.append("video_url", url);
        if (topic) form.append("topic_name", topic);
        const uploadRes = await apiFetch("/api/content/upload/", {
          method: "POST",
          body: form,
        });
        if (!uploadRes.ok) throw new Error("URL processing failed");
        const uploadData = await uploadRes.json();
        contentId = uploadData.content_id;
        setUrlAnalysisState("Analysis complete. Generating quiz...");
      }

      const trimmedTopic = topic.trim();
      const trimmedChapter = chapter.trim();
      const baseTopic =
        trimmedTopic ||
        trimmedChapter ||
        (contentId ? "From content" : "General");
      const baseSubject = subject || (contentId ? "Content" : "General");
      const body = { topic: baseTopic, subject: baseSubject, count: 10 };
      if (contentId) body.content_id = contentId;
      if (description) body.description = description;
      if (trimmedChapter && trimmedTopic)
        body.topic = `${trimmedChapter} - ${trimmedTopic}`;
      else if (trimmedChapter && !trimmedTopic) body.topic = trimmedChapter;

      const res = await apiFetch("/api/quiz/start/content/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || d.detail || "Quiz generation failed");
      }
      const data = await res.json();
      window.sessionStorage.setItem(
        "preloaded_quiz_session",
        JSON.stringify(data),
      );
      window.location.href = "/quiz";
    } catch (e) {
      setError(e?.message || "Could not generate quiz");
    } finally {
      setGenerating(false);
      setUrlAnalysisState("");
    }
  }, [
    apiFetch,
    tab,
    file,
    url,
    topic,
    chapter,
    subject,
    description,
    user?.plan,
    subjectRequired,
    topicRequired,
  ]);

  const canGenerateBase =
    tab === "topic"
      ? Boolean(topic.trim())
      : tab === "upload"
        ? Boolean(file)
        : Boolean(url.trim());
  const canGenerate = canGenerateBase && (!subjectRequired || Boolean(subject));

  const profileSummary = useMemo(() => {
    if (!user) return "";
    return `${user.full_name || "Student"} · ${user.exam_target} · ${user.plan} plan`;
  }, [user]);
  const subjectLabel = subjectRequired ? "Subject *" : "Subject (optional)";
  const topicLabel = topicRequired ? "Topic *" : "Topic (optional)";
  const modeCards = [
    {
      key: "topic",
      title: "Topic Quiz",
      desc: "Type a topic and generate instantly.",
      badge: "Fast",
    },
    {
      key: "upload",
      title: "Upload Notes",
      desc: "PDF, DOCX, or PPT files.",
      badge: "Notes",
    },
    {
      key: "url",
      title: "Video / URL",
      desc: "Public YouTube or article links.",
      badge: "Video",
    },
  ];
  const activeMode = modeCards.find((m) => m.key === tab);

  return (
    <AppShell activePath="/home">
      <div className="flex min-h-screen">
        <aside
          className="hidden w-[280px] flex-shrink-0 border-r overflow-y-auto lg:block"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <div className="p-4">
            <h3 className="mb-3 font-display text-lg">Quiz History</h3>
            {history.length === 0 && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                No quizzes yet. Generate your first one!
              </p>
            )}
            <div className="space-y-2">
              {history.slice(0, 30).map((s, i) => {
                const sid = s.session_id || s.id;
                return (
                  <a
                    key={sid || i}
                    href={`/dna-report?session_id=${sid}`}
                    className="block rounded-xl border p-3 transition hover:border-[var(--accent)]"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--surface-2)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ maxWidth: 160 }}
                      >
                        {s.session_type?.replace(/_/g, " ") || "Quiz"}
                      </p>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          backgroundColor:
                            (s.score_pct || 0) >= 70
                              ? "var(--dna-correct)"
                              : (s.score_pct || 0) >= 50
                                ? "var(--dna-silly)"
                                : "var(--dna-conceptual)",
                          color: "#111",
                        }}
                      >
                        {s.score_pct != null
                          ? `${Math.round(s.score_pct)}%`
                          : "—"}
                      </span>
                    </div>
                    <p
                      className="mt-1 text-[10px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {s.started_at
                        ? new Date(s.started_at).toLocaleDateString()
                        : ""}{" "}
                      · {s.questions_count || 0}Q · +{s.xp_earned || 0}XP
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-8 md:px-8">
          <div className="mx-auto max-w-[980px]">
            <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
              <section
                className="rounded-3xl border p-6 study-grid"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                }}
              >
                <p
                  className="text-xs uppercase tracking-[0.2em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Study Desk
                </p>
                <h1 className="mt-2 font-display text-3xl md:text-4xl">
                  Quiz Studio
                </h1>
                <p
                  className="mt-2 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Upload notes, paste a YouTube link, or type a topic. We will
                  generate exam-level questions in minutes.
                </p>
                {user && (
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span
                      className="rounded-full border px-3 py-1"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {user.exam_target}
                    </span>
                    <span
                      className="rounded-full border px-3 py-1 capitalize"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {user.plan} plan
                    </span>
                    <span
                      className="rounded-full border px-3 py-1"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {user.credits_remaining === -1
                        ? "∞"
                        : user.credits_remaining}{" "}
                      credits
                    </span>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href="/plan"
                    className="rounded-full px-5 py-2 text-sm font-semibold"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--bg)",
                    }}
                  >
                    {user?.plan === "premium" ? "Open Plan Map" : "See Plan"}
                  </a>
                  <a
                    href="/dashboard"
                    className="rounded-full border px-5 py-2 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  >
                    View Stats
                  </a>
                </div>
              </section>

              <aside className="grid gap-3">
                <a
                  href="/profile"
                  className="rounded-2xl border p-4 transition hover:border-[var(--accent)]"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface)",
                  }}
                >
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Profile
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {profileSummary || "Open profile"}
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    XP, streak, readiness, weak topics
                  </p>
                </a>
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface)",
                  }}
                >
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Leaderboard
                  </p>
                  <div className="mt-2 space-y-1">
                    {leaderboard.slice(0, 3).map((entry) => (
                      <p
                        key={`${entry.rank}-${entry.user_id}`}
                        className="text-xs"
                      >
                        #{entry.rank} {entry.name}
                        {entry.is_you ? " (You)" : ""} -{" "}
                        {entry.xp_this_week ?? entry.xp_all_time} XP
                      </p>
                    ))}
                    {leaderboard.length === 0 && (
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        No leaderboard entries yet.
                      </p>
                    )}
                  </div>
                </div>
              </aside>
            </div>

            <section
              className="rounded-3xl border p-6 space-y-5"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p
                    className="text-xs uppercase tracking-[0.2em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Quiz Builder
                  </p>
                  <h2 className="mt-2 font-display text-2xl">
                    Build a quiz in 60 seconds
                  </h2>
                  <p
                    className="mt-2 text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Choose a mode, then add focus tags if you want tighter
                    questions.
                  </p>
                </div>
                {activeMode && (
                  <span
                    className="rounded-full border px-3 py-1 text-xs font-semibold"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--surface-2)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {activeMode.badge}
                  </span>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {modeCards.map((mode) => {
                  const active = tab === mode.key;
                  return (
                    <button
                      key={mode.key}
                      onClick={() => setTab(mode.key)}
                      className="rounded-2xl border p-4 text-left transition"
                      style={{
                        borderColor: active ? "var(--accent)" : "var(--border)",
                        backgroundColor: active
                          ? "var(--surface-2)"
                          : "var(--surface)",
                      }}
                    >
                      <p
                        className="text-xs uppercase tracking-[0.15em]"
                        style={{
                          color: active
                            ? "var(--accent-2)"
                            : "var(--text-muted)",
                        }}
                      >
                        {mode.badge}
                      </p>
                      <p className="mt-2 text-sm font-semibold">{mode.title}</p>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {mode.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div
                  className="rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--dna-conceptual)",
                    color: "var(--dna-conceptual)",
                  }}
                >
                  {error}
                </div>
              )}
              {urlAnalysisState && (
                <div
                  className="rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  {urlAnalysisState}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  {tab === "topic" && (
                    <>
                      <div>
                        <label
                          className="mb-1 block text-xs font-medium"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {topicLabel}
                        </label>
                        <input
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g. Laws of Motion, Cell Division..."
                          className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: "var(--surface-2)",
                            color: "var(--text)",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          className="mb-1 block text-xs font-medium"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Description (optional)
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                          placeholder="Add any specific context or subtopics you want covered..."
                          className="w-full rounded-xl border px-4 py-3 outline-none resize-none transition focus:border-[var(--accent)]"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: "var(--surface-2)",
                            color: "var(--text)",
                          }}
                        />
                      </div>
                    </>
                  )}

                  {tab === "upload" && (
                    <div>
                      <label
                        className="mb-1 block text-xs font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Upload PDF, DOCX, or PPT
                      </label>
                      <div
                        onClick={() => fileRef.current?.click()}
                        className="cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition hover:border-[var(--accent)]"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <input
                          ref={fileRef}
                          type="file"
                          accept=".pdf,.docx,.doc,.pptx,.ppt"
                          className="hidden"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        {file ? (
                          <div>
                            <p className="text-sm font-semibold">{file.name}</p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {(file.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p
                              className="text-sm"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Click to select file
                            </p>
                          </div>
                        )}
                      </div>
                      <p
                        className="mt-2 text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        We auto-extract key concepts. Add focus tags if you want
                        tighter questions.
                      </p>
                    </div>
                  )}

                  {tab === "url" && (
                    <div>
                      <label
                        className="mb-1 block text-xs font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Public URL (YouTube, article, etc.)
                      </label>
                      <input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: "var(--surface-2)",
                          color: "var(--text)",
                        }}
                      />
                      <p
                        className="mt-2 text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Works best with public YouTube or Vimeo videos.
                      </p>
                    </div>
                  )}
                </div>

                <div
                  className="rounded-2xl border p-4 space-y-4"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface-2)",
                  }}
                >
                  <div>
                    <p
                      className="text-xs uppercase tracking-[0.2em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Focus Tags
                    </p>
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-xs font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {subjectLabel}
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)",
                        color: "var(--text)",
                      }}
                    >
                      <option value="">Select a subject...</option>
                      {subjects.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                    {isContentTab && (
                      <p
                        className="mt-1 text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Optional. We can tag your quiz from the content.
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-xs font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Chapter (optional)
                    </label>
                    <input
                      value={chapter}
                      onChange={(e) => setChapter(e.target.value)}
                      placeholder="e.g. Thermodynamics, Genetics..."
                      className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)",
                        color: "var(--text)",
                      }}
                    />
                  </div>
                  {tab !== "topic" && (
                    <div>
                      <label
                        className="mb-1 block text-xs font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {topicLabel}
                      </label>
                      <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Optional focus topic"
                        className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: "var(--surface)",
                          color: "var(--text)",
                        }}
                      />
                      <p
                        className="mt-1 text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Optional. Add a topic if you want the quiz to focus.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={generateQuiz}
                disabled={generating || !canGenerate}
                className="w-full rounded-xl px-6 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.01] disabled:opacity-50"
                style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
              >
                {generating ? "Generating quiz..." : "Generate Quiz"}
              </button>
            </section>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <a
                href="/plan"
                className="rounded-2xl border p-4 text-center transition hover:border-[var(--accent)]"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                }}
              >
                <p className="text-sm font-medium">
                  {stats?.plan === "premium" ? "Topic Map" : "Unlock Plan"}
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stats?.plan === "premium"
                    ? "Practice by topic"
                    : "Premium plan path"}
                </p>
              </a>
              <a
                href="/dashboard"
                className="rounded-2xl border p-4 text-center transition hover:border-[var(--accent)]"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                }}
              >
                <p className="text-sm font-medium">Performance</p>
                <p
                  className="text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Accuracy, streak, and readiness
                </p>
              </a>
              <a
                href="/dna-report"
                className="rounded-2xl border p-4 text-center transition hover:border-[var(--accent)]"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                }}
              >
                <p className="text-sm font-medium">Failure DNA</p>
                <p
                  className="text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  See why you fail and fix it
                </p>
              </a>
            </div>

            <div className="mt-8 lg:hidden">
              <h3 className="mb-3 font-display text-lg">Recent Quizzes</h3>
              <div className="space-y-2">
                {history.slice(0, 5).map((s, i) => {
                  const sid = s.session_id || s.id;
                  return (
                    <a
                      key={sid || i}
                      href={`/dna-report?session_id=${sid}`}
                      className="flex items-center justify-between rounded-xl border p-3"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)",
                      }}
                    >
                      <div>
                        <p className="text-sm">
                          {s.session_type?.replace(/_/g, " ") || "Quiz"}
                        </p>
                        <p
                          className="text-[10px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {s.started_at
                            ? new Date(s.started_at).toLocaleDateString()
                            : ""}
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{
                          backgroundColor:
                            (s.score_pct || 0) >= 70
                              ? "var(--dna-correct)"
                              : "var(--dna-conceptual)",
                          color: "#111",
                        }}
                      >
                        {s.score_pct != null
                          ? `${Math.round(s.score_pct)}%`
                          : "—"}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
